import { PrismaClient } from "@prisma/client";

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function main() {
  try {
    console.log("开始插入测试题目数据...");

    // 删除所有现有数据（可选，谨慎使用）
    console.log("清空现有数据...");
    await prisma.practiceYonsei.deleteMany({});
    console.log("现有数据已清空");

    // 1级1课: 匹配题 (matching)
    const matching1_1 = await prisma.practiceYonsei.create({
      data: {
        type: "matching",
        level: 1,
        chapter: 1,
        data: {
          question: "请将韩语数字与对应的阿拉伯数字连接起来",
          leftItems: [
            { id: "num1", text: "하나", translation: "hana" },
            { id: "num2", text: "둘", translation: "dul" },
            { id: "num3", text: "셋", translation: "set" },
            { id: "num4", text: "넷", translation: "net" },
            { id: "num5", text: "다섯", translation: "daseot" },
          ],
          rightItems: [
            { id: "num_1", text: "1", translation: "一" },
            { id: "num_2", text: "2", translation: "二" },
            { id: "num_3", text: "3", translation: "三" },
            { id: "num_4", text: "4", translation: "四" },
            { id: "num_5", text: "5", translation: "五" },
          ],
          correctAnswers: [
            { from: "num1", to: "num_1" },
            { from: "num2", to: "num_2" },
            { from: "num3", to: "num_3" },
            { from: "num4", to: "num_4" },
            { from: "num5", to: "num_5" },
          ],
        },
      },
    });

    // 1级1课: 填空题
    const fillInBlank1_1 = await prisma.practiceYonsei.create({
      data: {
        type: "fillInBlank",
        level: 1,
        chapter: 1,
        data: {
          sentenceParts: ["안녕하세요, 저는 ", "입니다."],
          correctAnswer: "김민수",
        },
      },
    });

    // 1级2课: 填空题
    const fillInBlank1_2 = await prisma.practiceYonsei.create({
      data: {
        type: "fillInBlank",
        level: 1,
        chapter: 2,
        data: {
          sentenceParts: ["나는 ", "에 갑니다."],
          correctAnswer: "학교",
        },
      },
    });

    // 2级1课: 单选题
    const singleChoice2_1 = await prisma.practiceYonsei.create({
      data: {
        type: "singleChoice",
        level: 2,
        chapter: 1,
        data: {
          question: "한국의 수도는 어디입니까?",
          options: [
            { id: "seoul", label: "서울", value: "seoul", isCorrect: true },
            { id: "busan", label: "부산", value: "busan", isCorrect: false },
            {
              id: "incheon",
              label: "인천",
              value: "incheon",
              isCorrect: false,
            },
            { id: "jeju", label: "제주", value: "jeju", isCorrect: false },
          ],
        },
      },
    });

    // 2级2课: 匹配题
    const matching2_2 = await prisma.practiceYonsei.create({
      data: {
        type: "matching",
        level: 2,
        chapter: 2,
        data: {
          question: "请将这些形容词与其反义词匹配",
          leftItems: [
            { id: "adj1", text: "크다", translation: "大" },
            { id: "adj2", text: "길다", translation: "长" },
            { id: "adj3", text: "비싸다", translation: "贵" },
          ],
          rightItems: [
            { id: "adj_1", text: "작다", translation: "小" },
            { id: "adj_2", text: "짧다", translation: "短" },
            { id: "adj_3", text: "싸다", translation: "便宜" },
          ],
          correctAnswers: [
            { from: "adj1", to: "adj_1" },
            { from: "adj2", to: "adj_2" },
            { from: "adj3", to: "adj_3" },
          ],
        },
      },
    });

    // 3级5课: 造句题
    const sentence3_5 = await prisma.practiceYonsei.create({
      data: {
        type: "sentence",
        level: 3,
        chapter: 5,
        data: {
          prompt: "학교에 가다",
          correctAnswers: [
            "저는 학교에 가요",
            "나는 학교에 갑니다",
            "학교에 가요",
          ],
        },
      },
    });

    // 插入结果汇总
    console.log("测试数据插入成功!");
    console.log("1级1课 匹配题 ID:", matching1_1.id);
    console.log("1级1课 填空题 ID:", fillInBlank1_1.id);
    console.log("1级2课 填空题 ID:", fillInBlank1_2.id);
    console.log("2级1课 单选题 ID:", singleChoice2_1.id);
    console.log("2级2课 匹配题 ID:", matching2_2.id);
    console.log("3级5课 造句题 ID:", sentence3_5.id);

    // 打印数据库查询结果确认
    const level1Chapter1 = await prisma.practiceYonsei.findMany({
      where: { level: 1, chapter: 1 },
    });
    console.log(`1级1课题目数量: ${level1Chapter1.length}`);

    const allPractices = await prisma.practiceYonsei.findMany();
    console.log(`总题目数量: ${allPractices.length}`);
  } catch (error) {
    console.error("插入测试数据失败:", error);
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
