import { ICatalogProvider } from './interface';
import { CatalogProductData, SyncResult } from './types';
import prisma from '../prisma';

export class BetterwareCatalogProvider implements ICatalogProvider {
  private baseUrl = 'https://betterware.com.mx';
  private pageSize = 250;
  private delayMs = 0;

  private async fetchPage(page: number): Promise<any[]> {
    const url = `${this.baseUrl}/products.json?limit=${this.pageSize}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.products || [];
  }

  private mapProduct(raw: any): CatalogProductData | null {
    if (!raw.variants || raw.variants.length === 0) return null;
    const variant = raw.variants[0];
    if (!variant.sku) return null;

    return {
      sku: variant.sku,
      shopifyId: raw.id.toString(),
      title: raw.title,
      handle: raw.handle,
      bodyHtml: raw.body_html || '',
      productType: raw.product_type || '',
      price: parseFloat(variant.price || '0'),
      compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
      available: variant.available === true,
      tags: raw.tags || [],
      images: (raw.images || []).map((img: any) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        position: img.position
      })),
      publishedAt: raw.published_at ? new Date(raw.published_at) : null,
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date()
    };
  }

  async syncCatalog(): Promise<SyncResult> {
    const startTime = Date.now();
    let page = 1;
    let hasMore = true;
    let created = 0;
    let updated = 0;
    let deactivated = 0;
    const newSkus: string[] = [];
    const errors: string[] = [];
    
    const seenSkus = new Set<string>();
    
    const existingActiveProducts = await prisma.catalogProduct.findMany({
      where: { activeBetterware: true },
      select: { sku: true }
    });
    const previouslyActiveSkus = new Set(existingActiveProducts.map(p => p.sku));

    const syncLog = await prisma.syncLog.create({
      data: { status: 'running' }
    });

    try {
      while (hasMore) {
        const rawProducts = await this.fetchPage(page);
        if (rawProducts.length === 0) {
          hasMore = false;
          break;
        }

        // Procesamiento en lotes para evitar 'Connection Pool Exhaustion' en Neon
        const batchSize = 10;
        for (let i = 0; i < rawProducts.length; i += batchSize) {
          const batch = rawProducts.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (raw) => {
            try {
              const mapped = this.mapProduct(raw);
              if (!mapped) return;
              
              seenSkus.add(mapped.sku);

              const isNew = !previouslyActiveSkus.has(mapped.sku);
              if (isNew) {
                const exists = await prisma.catalogProduct.findUnique({ where: { sku: mapped.sku } });
                if (!exists) {
                  newSkus.push(mapped.sku);
                  created++;
                } else {
                  updated++;
                }
              } else {
                updated++;
              }

              await prisma.catalogProduct.upsert({
                where: { sku: mapped.sku },
                update: {
                  title: mapped.title,
                  handle: mapped.handle,
                  bodyHtml: mapped.bodyHtml,
                  productType: mapped.productType,
                  priceBetterware: mapped.price,
                  compareAtPrice: mapped.compareAtPrice,
                  availableBetterware: mapped.available,
                  activeBetterware: true,
                  tags: mapped.tags,
                  images: mapped.images,
                  publishedAt: mapped.publishedAt,
                  betterwareUpdatedAt: mapped.updatedAt,
                  lastSyncAt: new Date()
                },
                create: {
                  sku: mapped.sku,
                  shopifyId: mapped.shopifyId,
                  title: mapped.title,
                  handle: mapped.handle,
                  bodyHtml: mapped.bodyHtml,
                  productType: mapped.productType,
                  priceBetterware: mapped.price,
                  compareAtPrice: mapped.compareAtPrice,
                  activeBetterware: true,
                  availableBetterware: mapped.available,
                  tags: mapped.tags,
                  images: mapped.images,
                  publishedAt: mapped.publishedAt,
                  betterwareUpdatedAt: mapped.updatedAt,
                  lastSyncAt: new Date()
                }
              });
            } catch (err: any) {
              errors.push(`Error processing SKU ${raw?.variants?.[0]?.sku}: ${err.message}`);
            }
          });

          await Promise.all(batchPromises);
        }

        if (rawProducts.length < this.pageSize) {
          hasMore = false;
        } else {
          page++;
          if (this.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
          }
        }
      }

      const missingSkus = [...previouslyActiveSkus].filter(sku => !seenSkus.has(sku));
      if (missingSkus.length > 0) {
        const deactivateResult = await prisma.catalogProduct.updateMany({
          where: { sku: { in: missingSkus } },
          data: { activeBetterware: false, lastSyncAt: new Date() }
        });
        deactivated = deactivateResult.count;
      }

      const durationMs = Date.now() - startTime;

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          finishedAt: new Date(),
          productsCreated: created,
          productsUpdated: updated,
          productsDeactivated: deactivated,
          newProducts: newSkus,
          status: errors.length > 0 ? 'success_with_errors' : 'success',
          errorMessage: errors.length > 0 ? errors.join(' | ') : null
        }
      });

      return {
        created,
        updated,
        deactivated,
        newSkus,
        errors,
        durationMs
      };

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      errors.push(`Fatal sync error: ${err.message}`);
      
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          finishedAt: new Date(),
          status: 'error',
          errorMessage: err.message
        }
      });

      return {
        created,
        updated,
        deactivated,
        newSkus,
        errors,
        durationMs
      };
    }
  }

  async getProductBySku(sku: string): Promise<CatalogProductData | null> {
    const product = await prisma.catalogProduct.findUnique({
      where: { sku }
    });
    
    if (!product) return null;
    
    return {
      sku: product.sku,
      shopifyId: product.shopifyId,
      title: product.title,
      handle: product.handle,
      bodyHtml: product.bodyHtml,
      productType: product.productType,
      price: Number(product.priceBetterware),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      available: product.availableBetterware,
      tags: product.tags as string[],
      images: product.images as any,
      publishedAt: product.publishedAt,
      updatedAt: product.betterwareUpdatedAt || new Date()
    };
  }
}
