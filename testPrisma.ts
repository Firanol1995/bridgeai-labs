import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany(); // Assuming you have a `users` table
  console.log(users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());