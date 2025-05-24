"use client";

import { useState, useEffect } from "react";
import { ScrollSelector } from "@/components/ScrollSelector";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2 } from "lucide-react";

// 定义级别选项
const levelOptions = [
  { value: "1", label: "1级" },
  { value: "2", label: "2级" },
  { value: "3", label: "3级" },
  { value: "4", label: "4级" },
  { value: "5", label: "5级" },
  { value: "6", label: "6级" },
];

// 定义课程选项
const lessonOptions = [
  { value: "1", label: "第1课" },
  { value: "2", label: "第2课" },
  { value: "3", label: "第3课" },
  { value: "4", label: "第4课" },
  { value: "5", label: "第5课" },
  { value: "6", label: "第6课" },
  { value: "7", label: "第7课" },
  { value: "8", label: "第8课" },
  { value: "9", label: "第9课" },
  { value: "10", label: "第10课" },
];

// 模拟问题数据，后期会通过API获取
const mockQuestions = [
  { id: "q1", level: "1", lesson: "1" },
  { id: "q2", level: "1", lesson: "2" },
  { id: "q3", level: "2", lesson: "1" },
  { id: "q4", level: "3", lesson: "5" },
];

export default function YonseiPracticePage() {
  const router = useRouter();
  // 状态管理
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(false);
  const [savedPracticeId, setSavedPracticeId] = useState<string | null>(null);

  // 根据选择的级别和课程，过滤出可用的问题
  const availableQuestions = mockQuestions.filter(
    (q) =>
      (selectedLevel === "all" || q.level === selectedLevel) &&
      (selectedLesson === "all" || q.lesson === selectedLesson)
  );

  // 跳转到问题页面
  const navigateToQuestion = (questionId: string) => {
    router.push(
      `/yonsei_practice/${questionId}?level=${selectedLevel || "all"}&lesson=${
        selectedLesson || "all"
      }`
    );
  };

  // 开始练习（如果有可用的问题，跳转到第一个问题）
  const startPractice = () => {
    if (availableQuestions.length > 0) {
      navigateToQuestion(availableQuestions[0].id);
    } else {
      // 如果没有找到完全匹配的题目，跳转到第一题，但保留筛选条件
      router.push(
        `/yonsei_practice/1?level=${selectedLevel || "all"}&lesson=${
          selectedLesson || "all"
        }`
      );
    }
  };

  // 继续上次练习
  const continuePractice = () => {
    if (savedPracticeId) {
      router.push(
        `/yonsei_practice/${savedPracticeId}?level=${
          selectedLevel || "all"
        }&lesson=${selectedLesson || "all"}`
      );
    }
  };

  // 加载用户保存的进度
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        setIsLoadingProgress(true);

        // 构建查询参数
        const params = new URLSearchParams();
        if (selectedLevel) params.append("level", selectedLevel);
        if (selectedLesson) params.append("lesson", selectedLesson);

        // 发送请求，包含level和lesson参数
        const response = await axios.get(
          `/api/user-practice-progress/saved?${params.toString()}`
        );

        if (response.data && response.data.success && response.data.data) {
          setHasSavedProgress(true);
          setSavedPracticeId(response.data.data.practiceId.toString());
        } else {
          setHasSavedProgress(false);
          setSavedPracticeId(null);
        }
      } catch (error) {
        console.error("获取保存的进度失败:", error);
        setHasSavedProgress(false);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [selectedLevel, selectedLesson]); // 当选择的级别或课程变化时重新加载

  return (
    <div className="container mx-auto p-5 w-full">
      <h1 className="text-3xl font-bold mb-8">延世大学韩语练习</h1>

      <div className="space-y-6">
        {/* 级别选择器 */}
        <ScrollSelector
          title="级别"
          options={levelOptions}
          selectedValue={selectedLevel}
          onChange={(value) => setSelectedLevel(value as string)}
          allOption={{ value: "all", label: "全部级别" }}
        />

        {/* 课程选择器 */}
        <ScrollSelector
          title="课程"
          options={lessonOptions}
          selectedValue={selectedLesson}
          onChange={(value) => setSelectedLesson(value as string)}
          allOption={{ value: "all", label: "全部课程" }}
        />
      </div>

      <div className="mt-10 p-6 border rounded-lg">
        <div className="text-center text-lg mb-6">
          {selectedLevel || selectedLesson ? (
            <div>
              <p>当前选择:</p>
              <p>
                {selectedLevel !== "all" && selectedLevel
                  ? `级别: ${selectedLevel}级`
                  : "全部级别"}{" "}
                |
                {selectedLesson !== "all" && selectedLesson
                  ? `课程: 第${selectedLesson}课`
                  : "全部课程"}
              </p>
            </div>
          ) : (
            <p>请选择练习参数</p>
          )}
        </div>

        {/* 开始练习和继续上次练习按钮 */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
          {isLoadingProgress ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>加载进度...</span>
            </div>
          ) : (
            <>
              <Button
                onClick={startPractice}
                className="bg-black text-white px-8 py-2"
                disabled={!selectedLevel && !selectedLesson}
              >
                开始新练习
              </Button>

              {hasSavedProgress && (
                <Button
                  onClick={continuePractice}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                >
                  继续上次练习
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
