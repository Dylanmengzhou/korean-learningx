// import { WordYonsei } from "./../node_modules/.prisma/client/index.d";
const XLSX = require("xlsx");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 🔹 定义数据结构类型
interface WordRow {
	chapter: number;
	status: number;
	korean: string;
	type: string;
	phrase?: string;
	phraseCn?: string;
	example?: string;
	exampleCn?: string;
	chinese: string;
	volume: number; // 🔹 书的卷数
	bookSeries: string; // 🔹 书籍系列
}

// 🔹 明确 filePath 类型
async function importWordsFromExcel(
	filePath: string,
	volume: number,
	chapter: number
): Promise<void> {
	const fileBuffer = fs.readFileSync(filePath);
	const workbook = XLSX.read(fileBuffer, { type: "buffer" });

	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];

	// 🔹 明确类型：data 是 WordRow 数组
	const data: WordRow[] = XLSX.utils.sheet_to_json(sheet);

	console.log(`正在读取第${volume}册第${chapter}章节的数据...`);
	console.log(`📥 读取到 ${data.length} 条数据，正在导入数据库...`);
	console.log("----------------分割线------------------");

	// 🔹 使用 map 确保数据符合类型
	const insertData = data.map((row: WordRow) => ({
		korean: row.korean,
		type: row.type,
		phrase: row.phrase || null,
		phraseCn: row.phraseCn || null,
		example: row.example || null,
		exampleCn: row.exampleCn || null,
		chinese: row.chinese,
		volume: volume, // ✅ 添加卷数
		bookSeries: "延世韩国语", // ✅ 添加书籍系列
		status: 0, // ✅ 添加状态
		chapter: chapter, // ✅ 添加章节
		dictationStatus: 0, // ✅ 添加听写状态
	}));

	await prisma.WordYonsei.createMany({ data: insertData });

	console.log("✅ 数据导入成功！");
	await prisma.$disconnect();
}

// 🔹 明确 filePath 变量的类型

// 运行导入函数
for (let i = 1; i < 7; i++) {
	// 这是单元循环
	for (let j = 1; j < 11; j++) {
		importWordsFromExcel(
			`./scripts/data/第${i}册/延世韩国语第${i}册第${j}单元.xlsx`,
			i,
			j
		).catch(console.error);
	}
}
