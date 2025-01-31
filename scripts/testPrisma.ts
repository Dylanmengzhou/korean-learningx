const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  const words = await prisma.word.findMany();
  console.log("数据库里的单词：", words);
}

test().catch(console.error);