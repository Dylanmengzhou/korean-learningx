"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
interface CardVocabProps {
    img_url: string;
    title?: string;
	description?: string;
	direct_url: string;
}
const CardVocabMain = (
    { img_url, title, description,direct_url }: CardVocabProps
) => {
	const router = useRouter();

	const handleClick = () => {
		router.push(direct_url);
	}
	return (
		<div className="flex  w-full lg:max-w-60 flex-row gap-5 p-4 rounded-lg shadow-md bg-white " onClick={handleClick}>


			<Image
				src={img_url}
				alt="word"
				width={100}
				height={100}
				className="max-w-[100px] max-h-[100px] rounded-lg"
			/>
			<div className="flex flex-col gap-2 justify-center">
                <h1 className="text-lg text-left font-bold  text-black texop80">{title}</h1>
				<p className="text-xs text-left text-black text-opacity-60 font-black">
					{description}
				</p>
			</div>
		</div>
	);
};

export default CardVocabMain;
