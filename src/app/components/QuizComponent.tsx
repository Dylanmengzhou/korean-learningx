"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import FillInBlank from "./FillInBlank";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { LineMatchingQuestion, MatchItem } from "./LineMatchingQuestion";
import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import SentenceQuestion from "./SentenceQuestion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// 定义题目类型和数据结构
interface MatchingQuizData {
  question: string;
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  correctAnswers: { from: string; to: string }[];
}

interface FillInBlankQuizData {
  sentenceParts: [string, string];
  correctAnswer: string;
}

interface SingleChoiceQuizData {
  question: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
    isCorrect: boolean;
  }>;
}

interface SentenceQuizData {
  prompt: string;
  correctAnswers: string[];
}

// 数据库中的题目数据结构
interface DbPractice {
  id: number;
  type: string;
  data: JSON;
  level: number;
  chapter: number;
  createdAt: string;
}

// 转换后的前端使用的题目数据结构
type QuizData = {
  id: string;
  type: "matching" | "fillInBlank" | "singleChoice" | "sentence";
  level: number;
  lesson: number; // 对应数据库中的chapter字段
  data:
    | MatchingQuizData
    | FillInBlankQuizData
    | SingleChoiceQuizData
    | SentenceQuizData;
};


export default function QuizComponent() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  // 获取URL参数
  const level = searchParams.get("level");
  const lesson = searchParams.get("lesson");

  const [currentQuizId, setCurrentQuizId] = useState<string>(
    (id as string) || "1"
  );
  const [result, setResult] = useState<"perfect" | "partial" | "wrong" | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 使用React Query获取并缓存题目数据
  const {
    data: availableQuizData = [] as QuizData[],
    isLoading,
    refetch,
  } = useQuery<QuizData[]>({
    queryKey: ["quizData", level, lesson],
    queryFn: async () => {
      try {
        // 构建查询参数
        const params = new URLSearchParams();
        if (level && level !== "all") params.append("level", level);
        if (lesson && lesson !== "all") params.append("lesson", lesson);

        const apiUrl = `/api/yonsei-practice?${params.toString()}`;
        console.log("发起API请求:", apiUrl);

        // 发起API请求
        const response = await axios.get(apiUrl);
        console.log("API响应:", response.data);

        if (response.data && Array.isArray(response.data.practices)) {
          // 处理API返回的数据，将数据库格式转换为组件需要的格式
          const formattedData = response.data.practices.map(
            (practice: DbPractice) => {
              return {
                id: practice.id.toString(),
                type: practice.type as
                  | "matching"
                  | "fillInBlank"
                  | "singleChoice"
                  | "sentence",
                level: practice.level,
                lesson: practice.chapter, // 数据库中的chapter对应前端的lesson
                data: practice.data, // 直接使用data字段中的数据
              };
            }
          );

          console.log("处理后的数据:", formattedData.length, "条记录");
          return formattedData;
        } else {
          console.warn("API返回数据格式不正确:", response.data);
          setError("API返回数据格式不正确");
          return [] as QuizData[];
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("获取题目失败:", err);
        console.error("错误详情:", errorMessage);

        // 如果是Axios错误，尝试提取更多信息
        if (axios.isAxiosError(err) && err.response) {
          const responseData = err.response.data;
          console.error("服务器响应:", responseData);

          // 显示服务器返回的具体错误信息
          if (responseData && responseData.details) {
            setError(`获取题目失败: ${responseData.details}`);
          } else {
            setError(
              `获取题目失败: ${err.response.status} ${err.response.statusText}`
            );
          }
        } else {
          setError(`获取题目失败: ${errorMessage}`);
        }
        return [] as QuizData[];
      }
    },
    staleTime: 5 * 60 * 1000, // 数据5分钟内保持新鲜
    gcTime: 30 * 60 * 1000, // 垃圾回收时间，取代旧版的cacheTime
  });

  // 获取用户保存的进度
  const { data: savedProgress } = useQuery({
    queryKey: ["savedProgress", level, lesson],
    queryFn: async () => {
      try {
        // 只有当题目数据加载完成后才获取保存的进度
        if (availableQuizData.length === 0) return null;

        // 构建查询参数
        const params = new URLSearchParams();
        if (level) params.append("level", level);
        if (lesson) params.append("lesson", lesson);

        // 获取用户保存的进度
        const response = await axios.get(
          `/api/user-practice-progress/saved?${params.toString()}`
        );

        if (response.data && response.data.success && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch (error) {
        console.error("获取保存的进度失败:", error);
        return null;
      }
    },
    enabled: !isLoading && availableQuizData.length > 0, // 只有当题目数据加载完成后才执行
  });

  // 当保存的进度加载完成后，自动跳转到上次做到的题目
  useEffect(() => {
    // 只在初始加载时检查是否需要恢复进度
    // 1. 如果是直接访问练习首页(/yonsei_practice)，则id为undefined
    // 2. 如果是访问练习列表页(/yonsei_practice/list)，则应该恢复进度
    // 3. 如果已经指定了题目ID，则不需要恢复
    const shouldRestoreProgress = !id || id === "list";

    if (
      savedProgress &&
      availableQuizData.length > 0 &&
      shouldRestoreProgress
    ) {
      // 找到保存的题目ID
      const savedPracticeId = savedProgress.practiceId.toString();

      // 检查该题目是否在当前筛选的题目列表中
      const isInCurrentList = availableQuizData.some(
        (quiz) => quiz.id === savedPracticeId
      );

      if (isInCurrentList) {
        console.log(`恢复到上次保存的进度: 题目ID ${savedPracticeId}`);

        // 构建URL查询参数
        const queryParams = new URLSearchParams();
        if (level) queryParams.set("level", level);
        if (lesson) queryParams.set("lesson", lesson);
        const queryString = queryParams.toString()
          ? `?${queryParams.toString()}`
          : "";

        // 跳转到保存的题目
        router.push(`/yonsei_practice/${savedPracticeId}${queryString}`);
      }
    }
  }, [savedProgress, availableQuizData, router, level, lesson, id]);

  // 返回选择页面
  const goBackToSelection = () => {
    router.push("/yonsei_practice");
  };

  // 重置当前题目状态
  const resetQuiz = () => {
    setResult(null);
    setShowFeedback(false);
  };

  // 当路由参数id变化时更新当前题目
  useEffect(() => {
    if (id) {
      setCurrentQuizId(id as string);
      resetQuiz();
    }
  }, [id]);

  // 确保ID是合理的值，默认显示第一题
  useEffect(() => {
    // 如果当前ID不在可用题目列表中，重定向到第一题
    if (
      id &&
      availableQuizData.length > 0 &&
      !availableQuizData.find((q: QuizData) => q.id === id)
    ) {
      const firstId = availableQuizData[0].id;

      // 保持查询参数不变
      const queryParams = new URLSearchParams();
      if (level) queryParams.set("level", level);
      if (lesson) queryParams.set("lesson", lesson);
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      router.push(`/yonsei_practice/${firstId}${queryString}`);
    }
  }, [id, availableQuizData, level, lesson, router]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="container p-5 mx-auto min-w-6/12 w-svw">
        <div className="mb-4">
          <Button
            onClick={goBackToSelection}
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-black hover:bg-gray-100 pl-2 pr-3 py-1 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>返回选择页面</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
          <p className="mt-4 text-gray-600">正在加载题目...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container p-5 mx-auto min-w-6/12 w-svw">
        <div className="mb-4">
          <Button
            onClick={goBackToSelection}
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-black hover:bg-gray-100 pl-2 pr-3 py-1 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>返回选择页面</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-700">
              加载题目失败
            </h2>
            <p className="mb-6 text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-black text-white mr-2"
            >
              重试
            </Button>
            <Button
              onClick={goBackToSelection}
              className="bg-gray-200 text-black"
            >
              返回选择页面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有可用题目，只显示空状态
  if (availableQuizData.length === 0) {
    return (
      <div className="container p-5 mx-auto min-w-6/12 w-svw">
        {/* 返回按钮 */}
        <div className="mb-4">
          <Button
            onClick={goBackToSelection}
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-black hover:bg-gray-100 pl-2 pr-3 py-1 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>返回选择页面</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200 max-w-md">
            <h2 className="text-xl font-bold mb-4">未找到匹配的题目</h2>
            <p className="mb-6 text-gray-600">
              当前筛选条件：
              <br />
              {level && level !== "all"
                ? `级别: ${level}级`
                : level === "all"
                ? "全部级别"
                : "未指定级别"}
              <br />
              {lesson && lesson !== "all"
                ? `课程: 第${lesson}课`
                : lesson === "all"
                ? "全部课程"
                : "未指定课程"}
            </p>
            <Button onClick={goBackToSelection} className="bg-black text-white">
              返回修改筛选条件
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 根据ID找到当前题目
  const currentQuiz =
    availableQuizData.find((quiz) => quiz.id === currentQuizId) ||
    availableQuizData[0];
  const currentIndex = availableQuizData.findIndex(
    (quiz) => quiz.id === currentQuizId
  );

  // 处理题目完成
  const handleComplete = (isCorrect: boolean) => {
    const resultStatus = isCorrect ? "perfect" : "wrong";
    setResult(resultStatus);
    setShowFeedback(true);

    // 更新用户练习进度
    updateUserProgress(resultStatus);

    // 如果回答正确且不是最后一题，延迟后自动跳转到下一题
    if (isCorrect && currentIndex < availableQuizData.length - 1) {
      setTimeout(() => {
        goToNext();
      }, 1200); // 1.2秒后自动跳转
    }
  };

  // 处理答案提交
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setResult(isCorrect ? "perfect" : "wrong");
    setShowFeedback(true);

    // 更新用户练习进度
    updateUserProgress(isCorrect ? "perfect" : "wrong");

    // 如果回答正确且不是最后一题，延迟后自动跳转到下一题
    if (isCorrect && currentIndex < availableQuizData.length - 1) {
      setTimeout(() => {
        goToNext();
      }, 1200); // 1.2秒后自动跳转
    }
  };

  // 处理填空和造句题的提交结果
  const handleResult = (
    status: "correct" | "wrong" | null,
    probability?: number,
    bestMatch?: string,
    isPerfectMatch?: boolean
  ) => {
    // 根据是否完全匹配，将correct细分为perfect和partial
    let newStatus: "perfect" | "partial" | "wrong" | null = null;

    if (status === "correct") {
      newStatus = isPerfectMatch ? "perfect" : "partial";
    } else if (status === "wrong") {
      newStatus = "wrong";
    }

    setResult(newStatus);

    if (newStatus) {
      setShowFeedback(true);

      // 更新用户练习进度
      updateUserProgress(newStatus);

      // 仅在完全正确且不是最后一题时，延迟后自动跳转到下一题
      if (
        newStatus === "perfect" &&
        currentIndex < availableQuizData.length - 1
      ) {
        setTimeout(() => {
          goToNext();
        }, 1200); // 1.2秒后自动跳转
      }
    }
  };

  // 更新用户练习进度
  const updateUserProgress = async (
    result: "perfect" | "partial" | "wrong" | null
  ) => {
    if (!result || !currentQuiz) return;

    try {
      // 根据结果设置状态值
      let statusValue = 0;
      switch (result) {
        case "perfect":
          statusValue = 1; // 完全正确
          break;
        case "partial":
          statusValue = 2; // 记忆模糊
          break;
        case "wrong":
          statusValue = -1; // 错误
          break;
      }

      // 发送API请求更新用户进度，同时设置isSave为true表示保存最后做到的题目
      await axios.post("/api/user-practice-progress", {
        practiceId: parseInt(currentQuiz.id),
        status: statusValue,
        isSave: true, // 保存用户进度，下次可以从这里继续
        level: level || "all", // 传递当前级别
        lesson: lesson || "all", // 传递当前课程
      });

      console.log(
        `用户练习进度已更新: 题目ID ${currentQuiz.id}, 状态 ${statusValue}, 已保存进度`
      );
    } catch (error) {
      console.error("更新用户练习进度失败:", error);
      toast({
        title: "更新练习进度失败",
        description: "无法保存您的练习进度，请检查网络连接",
        variant: "destructive",
      });
    }
  };

  // 导航到上一题
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevId = availableQuizData[currentIndex - 1].id;
      setCurrentQuizId(prevId);

      // 保持查询参数不变
      const queryParams = new URLSearchParams();
      if (level) queryParams.set("level", level);
      if (lesson) queryParams.set("lesson", lesson);
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      router.push(`/yonsei_practice/${prevId}${queryString}`);
      resetQuiz();
    }
  };

  // 导航到下一题
  const goToNext = () => {
    if (currentIndex < availableQuizData.length - 1) {
      const nextId = availableQuizData[currentIndex + 1].id;
      setCurrentQuizId(nextId);

      // 保持查询参数不变
      const queryParams = new URLSearchParams();
      if (level) queryParams.set("level", level);
      if (lesson) queryParams.set("lesson", lesson);
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      router.push(`/yonsei_practice/${nextId}${queryString}`);
      resetQuiz();
    }
  };

  // 渲染当前题目组件
  const renderQuizComponent = () => {
    switch (currentQuiz.type) {
      case "matching":
        const matchingData = currentQuiz.data as MatchingQuizData;
        return (
          <LineMatchingQuestion
            question={matchingData.question}
            leftItems={matchingData.leftItems}
            rightItems={matchingData.rightItems}
            correctAnswers={matchingData.correctAnswers}
            onComplete={handleComplete}
          />
        );
      case "fillInBlank":
        const fillInBlankData = currentQuiz.data as FillInBlankQuizData;
        return (
          <FillInBlank
            sentenceParts={fillInBlankData.sentenceParts}
            correctAnswer={fillInBlankData.correctAnswer}
            onResult={(status, probability) => {
              // 判断是否完全匹配，probability === 100 视为完全匹配
              const isPerfectMatch = probability === 100;
              handleResult(status, probability, undefined, isPerfectMatch);
            }}
          />
        );
      case "sentence":
        const sentenceData = currentQuiz.data as SentenceQuizData;
        return (
          <SentenceQuestion
            prompt={sentenceData.prompt}
            correctAnswers={sentenceData.correctAnswers}
            onResult={(status, probability, bestMatch) => {
              // 从SentenceQuestion组件中获取完全匹配状态
              // 这里没法直接获取isPerfectMatch，所以假设probability === 100时为完全匹配
              const isPerfectMatch = probability === 100;
              handleResult(status, probability, bestMatch, isPerfectMatch);
            }}
          />
        );
      case "singleChoice":
        const singleChoiceData = currentQuiz.data as SingleChoiceQuizData;
        return (
          <SingleChoiceQuestion
            question={singleChoiceData.question}
            options={singleChoiceData.options}
            onSubmit={handleAnswer}
          />
        );
      default:
        return <div>未知题型</div>;
    }
  };

  // 显示当前过滤条件
  const renderFilterInfo = () => {
    if (!level && !lesson) return null;

    return (
      <div className="text-sm text-gray-500 mb-2">
        当前筛选:
        {level && level !== "all"
          ? ` 级别${level}级`
          : level === "all"
          ? " 全部级别"
          : ""}
        {lesson && lesson !== "all"
          ? ` 第${lesson}课`
          : lesson === "all"
          ? " 全部课程"
          : ""}{" "}
        (共{availableQuizData.length}题)
      </div>
    );
  };

  return (
    <div className="container p-5 mx-auto min-w-6/12 w-svw">
      {/* 返回按钮 */}
      <div className="flex justify-between">
        <Button
          onClick={goBackToSelection}
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-black hover:bg-gray-100 pl-2 pr-3 py-1 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>返回选择页面</span>
        </Button>

        {/* 添加刷新按钮，允许用户强制刷新数据 */}
        <Button
          onClick={() => refetch()}
          variant="ghost"
          className="ml-2 flex items-center text-gray-600 hover:text-black hover:bg-gray-100 pl-2 pr-3 py-1 rounded-full"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          <span>刷新题库</span>
        </Button>
      </div>

      <div className="mb-4">
        {renderFilterInfo()}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            题目 {currentIndex + 1}/{availableQuizData.length}
          </h2>

          {showFeedback && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                result === "perfect"
                  ? "bg-green-100 text-green-700"
                  : result === "partial"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result === "perfect" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>答案正确</span>
                </>
              ) : result === "partial" ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>记忆模糊</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>答案错误</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-[70vh] w-full items-center justify-between">
        <Button
          className={`border-2 rounded-full w-10 h-10 transition-all ${
            currentIndex === 0
              ? "bg-gray-100 border-gray-300 text-gray-400"
              : "bg-transparent border-black hover:bg-gray-100"
          }`}
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <FaCaretLeft
            className={currentIndex === 0 ? "text-gray-400" : "text-black"}
          />
        </Button>

        <div className="flex justify-center items-center w-8/12 md:w-10/12">
          {renderQuizComponent()}
        </div>

        <Button
          className={`border-2 rounded-full w-10 h-10 transition-all ${
            currentIndex === availableQuizData.length - 1
              ? "bg-gray-100 border-gray-300 text-gray-400"
              : "bg-transparent border-black hover:bg-gray-100"
          }`}
          onClick={goToNext}
          disabled={currentIndex === availableQuizData.length - 1}
        >
          <FaCaretRight
            className={
              currentIndex === availableQuizData.length - 1
                ? "text-gray-400"
                : "text-black"
            }
          />
        </Button>
      </div>
    </div>
  );
}
