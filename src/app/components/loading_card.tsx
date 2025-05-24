import { memo } from "react";
import { Card } from "@/components/ui/card"; // 确保路径正确
import { Loader2 } from "lucide-react"; // 确保从正确的库导入

// 颜色映射
const cardColors: { [key: string]: string } = {
  state1: "bg-red-500",
  state2: "bg-blue-500",
  // 你可以添加更多状态
};

interface LoadingCardProps {
  currentState?: keyof typeof cardColors; // 确保 currentState 是 cardColors 的 key
}

// eslint-disable-next-line react/display-name
const LoadingCard = memo(({ currentState = "state1" }: LoadingCardProps) => (
  <Card
    className={`transition-all duration-300
      ${cardColors[currentState] || "bg-white"}
      drop-shadow-lg shadow-md border-none backdrop-blur-3xl`}
  >
    <div className="flex flex-col h-[450px] lg:h-[600px] md:h-[600px] justify-center items-center p-6">
      <Loader2 className="animate-spin w-10 h-10 text-gray-600" />
      <p className="mt-4 text-gray-600">加载中...</p>
    </div>
  </Card>
));

export default LoadingCard;