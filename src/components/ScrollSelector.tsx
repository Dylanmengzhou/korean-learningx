import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

interface ScrollSelectorProps {
  title: string;
  options: { value: string | number; label: string }[];
  selectedValue: string | number | null;
  onChange: (value: string | number) => void;
  allOption?: { value: string | number; label: string };
}

export const ScrollSelector = ({
  title,
  options,
  selectedValue,
  onChange,
  allOption,
}: ScrollSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 800;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 800;
    }
  };

  return (
    <div className="text-left flex flex-col gap-2">
      <div className="text-base flex items-center font-bold">{title}:</div>
      <div className="flex items-center gap-2">
        {/* 左滚动按钮 */}
        <Button
          onClick={scrollLeft}
          className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
        >
          <ArrowBigLeft />
        </Button>

        {/* 滚动容器 */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
        >
          {/* 如果有"不限"选项 */}
          {allOption && (
            <Button
              onClick={() => onChange(allOption.value)}
              className={
                selectedValue === allOption.value
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }
            >
              {allOption.label}
            </Button>
          )}

          {/* 渲染所有选项 */}
          {options.map((option) => (
            <Button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={
                selectedValue === option.value
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* 右滚动按钮 */}
        <Button
          onClick={scrollRight}
          className="hidden lg:flex rounded-sm p-2 text-black bg-transparent border-2 border-black hover:bg-transparent hover:opacity-60"
        >
          <ArrowBigRight />
        </Button>
      </div>
    </div>
  );
};
