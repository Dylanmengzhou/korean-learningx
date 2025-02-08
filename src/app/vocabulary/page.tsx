import Image from "next/image";

import CardVocabMain from "../components/card_vocab";

const Vocabulary = () => {
	return (
		<div className="flex flex-col items-center justify-center text-black">
			<div className="relative w-full h-96">
				{" "}
				{/* 增加高度 */}
				<Image
					src="/vocabulary.jpg"
					alt="vocabulary"
					fill // 在 Next.js 13+，用 fill 代替 layout="fill"
					className="object-cover"
				/>
			</div>
			<div className="relative -mt-20 bg-white lg:w-11/12 w-full text-center text-white shadow-2xl rounded-2xl p-5">
				<div className="flex">
					<div className="w-1 h-8 bg-gray-700 rounded-full mr-3"></div>
					<h4 className=" text-gray-600 block antialiased tracking-normal font-sans text-2xl leading-snug font-bold">
						系统词库
					</h4>
				</div>
                <div className="grid text-black gap-5 my-5 sm:grid-cols-1  justify-items-center lg:flex">
                    <CardVocabMain
						img_url="/word_background.png"
						title="主题单词库"
                        description="30+日常生活实用主题"
                        direct_url="/yonsei_vocab"
					/>
					<CardVocabMain
						img_url="/word_background.png"
						title="延世词汇表"
                        description="《延世韩国语》1-6册"
                        direct_url="/yonsei_vocab"
					/>
					<CardVocabMain
						img_url="/word_background.png"
						title="TOPIK模拟测试"
                        description="《延世韩国语》1-6册"
                        direct_url="/topik"
					/>

                </div>
                <div className="flex">
					<div className="w-1 h-8 bg-gray-700 rounded-full mr-3"></div>
					<h4 className=" text-gray-600 block antialiased tracking-normal font-sans text-2xl leading-snug font-bold">
						生词和错词
					</h4>
                </div>
                <div className="grid text-black gap-5 my-5 sm:grid-cols-1  justify-items-center lg:flex">
					<CardVocabMain
						img_url="/word_background.png"
						title="生词本"
                        description="网站标记“不认识”的单词"
                        direct_url="/yonsei_vocab"
					/>
					<CardVocabMain
						img_url="/word_background.png"
						title="错词本"
                        description="听写出错的单词"
                        direct_url="/yonsei_vocab"
					/>
                </div>
				{/* <h4 className="block antialiased tracking-normal font-sans text-2xl leading-snug text-inherit font-bold text-black">系统词库</h4> */}
			</div>
		</div>
	);
};

export default Vocabulary;
