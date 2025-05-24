import Image from "next/image";
import Card from "./components/card";

export default function Home() {
  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center text-black">
      <div className="bg-slate-50 rounded-xl  w-full  items-center content-center justify-center">
        <div className="w-full h-96 relative overflow-hidden">
          <Image
            src="/vocabulary.jpg"
            alt="vocabulary"
            fill // 在 Next.js 13+，用 fill 代替 layout="fill"
            className="object-cover"
          />
        </div>
        <div className="relative -mt-20 bg-white lg:w-11/12 sm:w-full mx-auto text-center text-white shadow-2xl rounded-2xl p-5">
          <div className=" py-10  grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto place-items-center ">
            <Card
              title="单词库"
              description="按主题划分的词汇库和 TOPIK 词汇库"
              image_url="/vocabulary.jpg"
              link="/vocabulary"
            />

            <Card
              title="延世练习册"
              description="包含所有延世练习册的练习题，可按主题、难度、题型等筛选"
              image_url="/topik_background.png"
              link="/yonsei_practice"
            />
            <Card
              title="单词库"
              description="按主题划分的词汇库和 TOPIK 词汇库"
              image_url="/topik_background.png"
            />
            <Card
              title="单词库"
              description="按主题划分的词汇库和 TOPIK 词汇库"
              image_url="/topik_background.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
