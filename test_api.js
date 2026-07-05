async function test() {
  let hasMore = true;
  let page = 1;
  let total = 0;
  while(hasMore) {
    console.log("Fetching page", page);
    const res = await fetch(`https://betterware.com.mx/products.json?limit=250&page=${page}`);
    const d = await res.json();
    total += d.products.length;
    console.log(`Page ${page} returned ${d.products.length} products`);
    if(d.products.length < 250) hasMore = false;
    else page++;
  }
  console.log("Total products:", total);
}
test()
