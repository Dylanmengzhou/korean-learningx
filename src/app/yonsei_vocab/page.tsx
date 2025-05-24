"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ScrollSelector } from "@/components/ScrollSelector";

const YonseiVocab = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // 存储用户选择
  const [selectedVolume, setSelectedVolume] = useState<number | null>(1); // 册数
  const [selectedLesson, setSelectedLesson] = useState<number | null>(0); // 课数
  const [selectedMark, setSelectedMark] = useState<string | null>("-1"); // 认识程度

  // 构造册数选项
  const volumeOptions = [
    { value: 1, label: "一册" },
    { value: 2, label: "二册" },
    { value: 3, label: "三册" },
    { value: 4, label: "四册" },
    { value: 5, label: "五册" },
    { value: 6, label: "六册" },
  ];

  // 构造课程选项
  const lessonOptions = [
    { value: 1, label: "第一课" },
    { value: 2, label: "第二课" },
    { value: 3, label: "第三课" },
    { value: 4, label: "第四课" },
    { value: 5, label: "第五课" },
    { value: 6, label: "第六课" },
    { value: 7, label: "第七课" },
    { value: 8, label: "第八课" },
    { value: 9, label: "第九课" },
    { value: 10, label: "第十课" },
  ];

  // 构造并跳转到对应链接
  const redirectToStudy = (type: string) => {
    // 基础地址
    let baseUrl = "/yonsei_vocab/study";
    if (type === "study") {
      baseUrl = "/yonsei_vocab/study";
    } else if (type === "vocabulary_list") {
      baseUrl = "/yonsei_vocab/vocabulary_list";
    } else if (type === "test") {
      baseUrl = "/yonsei_vocab/test";
    } else if (type === "summary") {
      baseUrl = "/yonsei_vocab/summary";
    }

    // 构造查询参数
    // http://localhost:3000/yonsei_vocab/study?volume=1&chapter=1&bookSeries=%E5%BB%B6%E4%B8%96%E9%9F%A9%E5%9B%BD%E8%AF%AD
    const query = new URLSearchParams();
    if (session?.user.id) {
      query.set("userid", session.user.id);
    }
    if (selectedVolume !== null) {
      query.set("volume", selectedVolume.toString());
    }
    if (selectedLesson !== null) {
      query.set("chapter", selectedLesson.toString());
    }
    if (selectedMark) {
      query.set("status", selectedMark);
    }
    query.set("bookSeries", "延世韩国语");

    router.push(`${baseUrl}?${query.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center text-black">
      {/* 头部图片 */}
      <div className="relative w-full h-96">
        <Image
          src="/vocabulary.jpg"
          alt="vocabulary"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative -mt-20 bg-white lg:w-11/12 w-full text-center text-black shadow-2xl rounded-2xl p-5">
        <div className="my-5 flex flex-col gap-10 backdrop-blur-3xl">
          {/* 册选择 - 使用ScrollSelector组件 */}
          <ScrollSelector
            title="册数"
            options={volumeOptions}
            selectedValue={selectedVolume}
            onChange={(value) => setSelectedVolume(value as number)}
          />

          {/* 课选择 - 使用ScrollSelector组件 */}
          <ScrollSelector
            title="单元"
            options={lessonOptions}
            selectedValue={selectedLesson}
            onChange={(value) => setSelectedLesson(value as number)}
            allOption={{ value: 0, label: "不限" }}
          />

          {/* 认识程度选择 */}
          <div className="w-full flex justify-between bg-slate-100 p-2 px-4 rounded-lg lg:justify-center lg:gap-4 lg:w-fit md:w-fit md:gap-4">
            <Button
              className={
                selectedMark === "-1"
                  ? "bg-black text-white p-2"
                  : "bg-white text-black p-2"
              }
              onClick={() => setSelectedMark("-1")}
            >
              全部
            </Button>
            <Button
              className={
                selectedMark === "0"
                  ? "bg-black text-white p-2"
                  : "bg-white text-black p-2"
              }
              onClick={() => setSelectedMark("0")}
            >
              未标注
            </Button>
            <Button
              className={
                selectedMark === "1"
                  ? "bg-black text-white p-2"
                  : "bg-white text-black p-2"
              }
              onClick={() => setSelectedMark("1")}
            >
              认识
            </Button>
            <Button
              className={
                selectedMark === "2"
                  ? "bg-black text-white p-2"
                  : "bg-white text-black p-2"
              }
              onClick={() => setSelectedMark("2")}
            >
              不认识
            </Button>
            <Button
              className={
                selectedMark === "3"
                  ? "bg-black text-white p-2"
                  : "bg-white text-black p-2"
              }
              onClick={() => setSelectedMark("3")}
            >
              模糊
            </Button>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex flex-col gap-8 mb-8 mt-10">
          <div className="flex justify-center">
            <Button
              className="w-full rounded-full"
              onClick={() => redirectToStudy("study")}
            >
              开始学习
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              className="w-full rounded-full bg-transparent text-black hover:bg-transparent shadow-md"
              onClick={() => redirectToStudy("vocabulary_list")}
            >
              查看单词列表
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              className="w-full rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white  shadow-md font-bold"
              onClick={() => redirectToStudy("test")}
            >
              测试
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md font-bold"
              onClick={() => redirectToStudy("summary")}
            >
              查看学习进度
            </Button>
          </div>
        </div>
      </div>

      {/* 全局隐藏滚动条样式 */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE, Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default YonseiVocab;
