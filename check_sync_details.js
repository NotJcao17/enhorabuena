const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.syncLog.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  logs.forEach(log => {
    console.log(`ID: ${log.id}, Status: ${log.status}, Created: ${log.productsCreated}, Updated: ${log.productsUpdated}, Errors: ${log.errorMessage?.substring(0, 100)}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
