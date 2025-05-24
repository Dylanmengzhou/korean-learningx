"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { matchProbability } from "@/script/MED";

interface FillInBlankProps {
  sentenceParts: [string, string]; // 前后句
  correctAnswer: string;
  threshold?: number; // 匹配阈值，默认60%
  onResult?: (result: "correct" | "wrong" | null, probability?: number) => void;
}

// 定义表单数据类型
interface FillInBlankFormData {
  blank1: string;
}

export default function FillInBlank({
  sentenceParts,
  correctAnswer,
  threshold = 60, // 默认匹配阈值为60%
  onResult,
}: FillInBlankProps) {
  const { register, handleSubmit, reset } = useForm<FillInBlankFormData>();
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [matchProb, setMatchProb] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");

  const onSubmit = (data: FillInBlankFormData) => {
    const input = data.blank1.trim();
    setUserAnswer(input);
    console.log("用户答案:", userAnswer);

    // 计算匹配概率（使用指数衰减模型，更适合短语匹配）
    const probability = matchProbability(input, correctAnswer, {
      useExponentialDecay: true,
    });
    setMatchProb(probability);

    // 判断是否正确（达到或超过阈值）
    const currentResult = probability >= threshold ? "correct" : "wrong";
    setResult(currentResult);

    if (onResult) {
      onResult(currentResult, probability);
    }
  };

  const tryAgain = () => {
    reset();
    setResult(null);
    setMatchProb(null);
    setUserAnswer("");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-3"
    >
      <h2 className="text-lg font-bold">다음 문장을 완성하세요:</h2>
      <p className="text-xl">
        {sentenceParts[0]}
        <input
          {...register("blank1")}
          className={`border-b border-black px-2 outline-none w-24 text-center mx-1 ${
            result === "correct"
              ? "bg-green-100"
              : result === "wrong"
              ? "bg-red-100"
              : ""
          }`}
          disabled={result !== null}
        />
        {sentenceParts[1]}
      </p>

      {result === null ? (
        <Button type="submit">제출</Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {matchProb !== null && (
            <div className="text-sm">
              匹配度:{" "}
              <span
                className={
                  matchProb >= threshold ? "text-green-600" : "text-red-600"
                }
              >
                {matchProb.toFixed(1)}%
              </span>
              {matchProb < threshold && (
                <span className="ml-2 text-gray-600">
                  (正确答案: {correctAnswer})
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={result === "correct" ? "outline" : "default"}
              onClick={tryAgain}
            >
              再试一次
            </Button>
            {result === "wrong" && (
              <Button
                variant="outline"
                type="button"
                onClick={() => console.log("跳过")}
              >
                跳过
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
