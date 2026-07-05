import { CatalogProductData, SyncResult } from './types';

export interface ICatalogProvider {
  syncCatalog(): Promise<SyncResult>;
  getProductBySku(sku: string): Promise<CatalogProductData | null>;
}
