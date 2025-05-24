"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { findBestMatch } from "@/script/MED";

interface SentenceQuestionProps {
  prompt: string;
  correctAnswers: string[]; // 可接受的正确答案列表
  threshold?: number; // 匹配阈值，默认60%
  onResult?: (
    result: "correct" | "wrong" | null,
    probability?: number,
    bestMatch?: string
  ) => void;
}

// 定义表单数据接口
interface SentenceFormData {
  answer: string;
}

export default function SentenceQuestion({
  prompt,
  correctAnswers,
  threshold = 60, // 默认匹配阈值为60%
  onResult,
}: SentenceQuestionProps) {
  const { register, handleSubmit, reset } = useForm<SentenceFormData>();
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [matchResult, setMatchResult] = useState<{
    probability: number;
    bestMatch: string;
    userAnswer: string;
    isPerfectMatch: boolean;
  } | null>(null);

  const onSubmit = (data: SentenceFormData) => {
    const userAnswer = data.answer.trim();

    if (userAnswer.length === 0) return;

    // 检查是否有完全匹配（忽略空格和标点）
    const normalizedUserAnswer = normalizeText(userAnswer);
    const isPerfectMatch = correctAnswers.some(
      (answer) => normalizeText(answer) === normalizedUserAnswer
    );

    // 使用findBestMatch从所有正确答案中找出最匹配的
    const { bestMatch, probability } = findBestMatch(
      userAnswer,
      correctAnswers
    );

    // 保存匹配结果
    setMatchResult({
      probability,
      bestMatch,
      userAnswer,
      isPerfectMatch,
    });

    // 判断是否达到阈值
    const currentResult = probability >= threshold ? "correct" : "wrong";
    setResult(currentResult);

    if (onResult) {
      onResult(currentResult, probability, bestMatch);
    }
  };

  // 标准化文本，移除标点和多余空格
  const normalizeText = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"()[\]{}]/g, "") // 移除标点
      .replace(/\s+/g, " "); // 多个空格替换为单个
  };

  const tryAgain = () => {
    setResult(null);
    setMatchResult(null);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 space-y-4 max-w-xl mx-auto"
    >
      <h2 className="text-lg font-bold">造句题</h2>
      <p className="text-base">
        请用这个词语造句：<strong>{prompt}</strong>
      </p>

      <textarea
        {...register("answer")}
        placeholder="在这里输入完整句子"
        className={`w-full border rounded px-3 py-2 min-h-[100px] ${
          result === "correct"
            ? "border-green-500 bg-green-50"
            : result === "wrong"
            ? "border-red-500 bg-red-50"
            : ""
        }`}
        required
        disabled={result !== null}
      />

      {result === null ? (
        <Button type="submit">提交</Button>
      ) : (
        <div className="space-y-3">
          {matchResult && (
            <div className="p-3 rounded border">
              <p className="font-medium">
                匹配度:
                <span
                  className={
                    matchResult.probability >= threshold
                      ? "text-green-600 ml-1"
                      : "text-red-600 ml-1"
                  }
                >
                  {matchResult.probability.toFixed(1)}%
                </span>
              </p>

              {/* 只要不是完全匹配，无论正确与否都显示参考答案 */}
              {!matchResult.isPerfectMatch && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    你的答案: {matchResult.userAnswer}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    最接近的正确答案: {matchResult.bestMatch}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={tryAgain}>再试一次</Button>

            {result === "wrong" && (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  // 随机显示一个正确答案作为参考
                  const randomAnswer =
                    correctAnswers[
                      Math.floor(Math.random() * correctAnswers.length)
                    ];
                  alert(`参考答案: ${randomAnswer}`);
                }}
              >
                查看其他参考答案
              </Button>
            )}
          </div>
        </div>
      )}

      {result === "correct" && matchResult?.isPerfectMatch && (
        <p className="text-green-600 font-semibold">✅ 完全正确！</p>
      )}
      {result === "correct" && !matchResult?.isPerfectMatch && (
        <p className="text-green-600 font-semibold">
          ✅ 基本正确，请参考标准答案！
        </p>
      )}
      {result === "wrong" && (
        <p className="text-red-600 font-semibold">
          ❌ 与正确答案相差较大，请再试一次。
        </p>
      )}
    </form>
  );
}
