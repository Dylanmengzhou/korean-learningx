const XLSX = require("xlsx");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 🔹 定义数据结构类型
interface WordRow {
	chapter: any;
	status: null;
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

const volume = 1;
const chapter = 10;
// 🔹 明确 filePath 类型
async function importWordsFromExcel(filePath: string): Promise<void> {
	const fileBuffer = fs.readFileSync(filePath);
	const workbook = XLSX.read(fileBuffer, { type: "buffer" });

	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];

	// 🔹 明确类型：data 是 WordRow 数组
	const data: WordRow[] = XLSX.utils.sheet_to_json(sheet);

	console.log(`📥 读取到 ${data.length} 条数据，正在导入数据库...`);

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
	}));

	await prisma.word.createMany({ data: insertData });

	console.log("✅ 数据导入成功！");
	await prisma.$disconnect();
}

// 🔹 明确 filePath 变量的类型
const filePath: string = `./scripts/data/延世韩国语第${volume}册第${chapter}单元.xlsx`;

// 运行导入函数
importWordsFromExcel(filePath).catch(console.error);
