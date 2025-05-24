"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  label: string;
  value: string;
  isCorrect: boolean;
}

interface SingleChoiceQuestionProps {
  question: string;
  options: Option[];
  onSubmit: (selectedAnswer: string, isCorrect: boolean) => void;
}

interface FormValues {
  answer: string;
}

export function SingleChoiceQuestion({
  question,
  options,
  onSubmit,
}: SingleChoiceQuestionProps) {
  const { register, handleSubmit, watch } = useForm<FormValues>();
  const [submitted, setSubmitted] = useState(false);
  const selectedValue = watch("answer");

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    if (!data.answer) return;

    const selectedOption = options.find(
      (option) => option.value === data.answer
    );
    if (selectedOption) {
      setSubmitted(true);
      onSubmit(selectedOption.value, selectedOption.isCorrect);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4 text-center">{question}</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-2 p-3 rounded-md border ${
                submitted && option.isCorrect
                  ? "bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500"
                  : submitted &&
                    selectedValue === option.value &&
                    !option.isCorrect
                  ? "bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                id={option.id}
                value={option.value}
                className="w-4 h-4 text-blue-600"
                disabled={submitted}
                {...register("answer")}
              />
              <Label
                htmlFor={option.id}
                className={`flex-grow cursor-pointer ${
                  submitted && option.isCorrect
                    ? "font-bold text-green-700 dark:text-green-400"
                    : submitted &&
                      selectedValue === option.value &&
                      !option.isCorrect
                    ? "font-bold text-red-700 dark:text-red-400"
                    : ""
                }`}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={submitted || !selectedValue}
            className="px-8"
          >
            제출
          </Button>

          {submitted && (
            <Button
              type="button"
              variant="outline"
              className="ml-2 px-4"
              onClick={() => setSubmitted(false)}
            >
              重试
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
