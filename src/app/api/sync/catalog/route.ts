import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { BetterwareCatalogProvider } from '@/lib/catalog-provider/betterware';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const session = await auth();
  
  if (authHeader !== `Bearer ${cronSecret}` && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const provider = new BetterwareCatalogProvider();
    const result = await provider.syncCatalog();
    revalidatePath('/admin', 'layout');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed', details: error.message }, { status: 500 });
  }
}
