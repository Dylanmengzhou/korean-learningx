import { PrismaClient } from "@prisma/client";

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function main() {
  try {
    console.log("测试数据库连接...");

    // 测试连接
    const databaseName = await prisma.$queryRaw`SELECT current_database()`;
    console.log("当前连接的数据库:", databaseName);

    // 检查PracticeYonsei表中的数据
    const practicesCount = await prisma.practiceYonsei.count();
    console.log(`PracticeYonsei表中有${practicesCount}条记录`);

    if (practicesCount > 0) {
      // 获取一条记录示例
      const samplePractice = await prisma.practiceYonsei.findFirst();
      console.log("示例记录:", samplePractice);

      // 测试特定查询
      const level1Practices = await prisma.practiceYonsei.findMany({
        where: { level: 1 },
      });
      console.log(`级别1的题目数量: ${level1Practices.length}`);

      const level1Chapter1Practices = await prisma.practiceYonsei.findMany({
        where: { level: 1, chapter: 1 },
      });
      console.log(`级别1课程1的题目数量: ${level1Chapter1Practices.length}`);
      console.log("级别1课程1的题目:", level1Chapter1Practices);
    } else {
      console.log("数据库中没有练习题目数据，请先运行插入脚本");
    }
  } catch (error) {
    console.error("测试数据库连接失败:", error);
    console.error("错误详情:", (error as Error).stack);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
