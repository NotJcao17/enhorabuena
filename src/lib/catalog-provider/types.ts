export interface CatalogProductData {
  sku: string;
  shopifyId: string;
  title: string;
  handle: string;
  bodyHtml: string;
  productType: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  tags: string[];
  images: { src: string; width: number; height: number; position: number }[];
  publishedAt: Date | null;
  updatedAt: Date;
}

export interface SyncResult {
  created: number;
  updated: number;
  deactivated: number;
  newSkus: string[];
  errors: string[];
  durationMs: number;
}
