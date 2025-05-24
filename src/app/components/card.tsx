"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 输入参数格式
interface CardProps {
	title: string;
	description?: string;
	image_url?: string;
	link?: string;
}

const Card = ({ title, description, image_url,	link }: CardProps) => {
	const router = useRouter();
	return (
		<div className=" relative bg-white rounded-md p-3 py-5 drop-shadow-lg shadow-md border-gray-200" onClick={() => {
			router.push(link || "/");
		}}>
			<div className="items-center flex justify-center">
				<Image
					src={image_url || "/default-image.png"}
					alt="Word background"
					width={320}
					height={200}
					className="max-w-[400px] h-60 rounded-lg object-cover object-center"
				/>
			</div>
			<div className="w-full text-left mt-4">
				<h1 className="text-2xl font-bold text-black">{title}</h1>
				<p className="text-lg text-gray-400">{description}</p>
			</div>
		</div>
	);
};

export default Card;
