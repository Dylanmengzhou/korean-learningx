"use client";

import { useState } from "react";

// 题型定义
const questionTypes = [
  { id: "matching", name: "匹配题" },
  { id: "fillInBlank", name: "填空题" },
  { id: "singleChoice", name: "单选题" },
  { id: "sentence", name: "造句题" },
];

// 类型定义
interface LeftRightItem {
  id: string;
  text: string;
  translation: string;
}

interface CorrectAnswer {
  from: string;
  to: string;
}

interface Option {
  id: string;
  label: string;
  value: string;
  isCorrect: boolean;
}

export default function UploadQuestionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 基本信息
  const [selectedType, setSelectedType] = useState("");
  const [level, setLevel] = useState("");
  const [chapter, setChapter] = useState("");

  // 匹配题相关状态
  const [matchingQuestion, setMatchingQuestion] = useState("");
  const [leftItems, setLeftItems] = useState<LeftRightItem[]>([
    { id: "", text: "", translation: "" },
  ]);
  const [rightItems, setRightItems] = useState<LeftRightItem[]>([
    { id: "", text: "", translation: "" },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([
    { from: "", to: "" },
  ]);

  // 填空题相关状态
  const [sentenceParts, setSentenceParts] = useState<string[]>(["", ""]);
  const [blankAnswer, setBlankAnswer] = useState("");

  // 单选题相关状态
  const [singleQuestion, setSingleQuestion] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: "", label: "", value: "", isCorrect: false },
  ]);

  // 造句题相关状态
  const [prompt, setPrompt] = useState("");
  const [correctAnswers2, setCorrectAnswers2] = useState<string[]>([""]);

  // 添加/删除项目函数
  const addLeftItem = () => {
    setLeftItems([...leftItems, { id: "", text: "", translation: "" }]);
  };

  const removeLeftItem = (index: number) => {
    if (leftItems.length > 1) {
      const newItems = [...leftItems];
      newItems.splice(index, 1);
      setLeftItems(newItems);
    }
  };

  const addRightItem = () => {
    setRightItems([...rightItems, { id: "", text: "", translation: "" }]);
  };

  const removeRightItem = (index: number) => {
    if (rightItems.length > 1) {
      const newItems = [...rightItems];
      newItems.splice(index, 1);
      setRightItems(newItems);
    }
  };

  const addCorrectAnswer = () => {
    setCorrectAnswers([...correctAnswers, { from: "", to: "" }]);
  };

  const removeCorrectAnswer = (index: number) => {
    if (correctAnswers.length > 1) {
      const newAnswers = [...correctAnswers];
      newAnswers.splice(index, 1);
      setCorrectAnswers(newAnswers);
    }
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: "", label: "", value: "", isCorrect: false },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const addSentencePart = () => {
    setSentenceParts([...sentenceParts, ""]);
  };

  const removeSentencePart = (index: number) => {
    if (sentenceParts.length > 2) {
      const newParts = [...sentenceParts];
      newParts.splice(index, 1);
      setSentenceParts(newParts);
    }
  };

  const addCorrectAnswer2 = () => {
    setCorrectAnswers2([...correctAnswers2, ""]);
  };

  const removeCorrectAnswer2 = (index: number) => {
    if (correctAnswers2.length > 1) {
      const newAnswers = [...correctAnswers2];
      newAnswers.splice(index, 1);
      setCorrectAnswers2(newAnswers);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // 定义一个具体的类型来替代Record<string, any>
      let data: Record<string, unknown> = {};

      // 根据题型构造不同的数据结构
      switch (selectedType) {
        case "matching":
          data = {
            question: matchingQuestion,
            leftItems,
            rightItems,
            correctAnswers,
          };
          break;

        case "fillInBlank":
          data = {
            sentenceParts,
            correctAnswer: blankAnswer,
          };
          break;

        case "singleChoice":
          data = {
            question: singleQuestion,
            options,
          };
          break;

        case "sentence":
          data = {
            prompt,
            correctAnswers: correctAnswers2,
          };
          break;
      }

      // 构造API请求数据
      const questionData = {
        type: selectedType,
        level: parseInt(level),
        chapter: parseInt(chapter),
        data,
      };

      // 发送请求
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("上传题目失败");
      }

      const result = await response.json();
      setSuccessMessage(`题目上传成功，ID: ${result.id}`);

      // 重置表单
      resetForm();
    } catch (error: unknown) {
      setErrorMessage(
        `上传失败: ${error instanceof Error ? error.message : String(error)}`
      );
      console.error("上传题目错误:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setSelectedType("");
    setLevel("");
    setChapter("");

    setMatchingQuestion("");
    setLeftItems([{ id: "", text: "", translation: "" }]);
    setRightItems([{ id: "", text: "", translation: "" }]);
    setCorrectAnswers([{ from: "", to: "" }]);

    setSentenceParts(["", ""]);
    setBlankAnswer("");

    setSingleQuestion("");
    setOptions([{ id: "", label: "", value: "", isCorrect: false }]);

    setPrompt("");
    setCorrectAnswers2([""]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">上传题目</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题型 *
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">请选择题型</option>
              {questionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              级别 *
            </label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              章节 *
            </label>
            <input
              type="number"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              min="1"
              required
            />
          </div>
        </div>

        {/* 根据选择的题型显示不同表单 */}
        {selectedType === "matching" && (
          <div className="border border-gray-200 p-4 rounded-md space-y-4">
            <h2 className="text-xl font-semibold">匹配题配置</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                题目描述 *
              </label>
              <input
                type="text"
                value={matchingQuestion}
                onChange={(e) => setMatchingQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="例如：请将韩语数字与对应的阿拉伯数字连接起来"
                required
              />
            </div>

            {/* 左侧项目 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  左侧项目 *
                </label>
                <button
                  type="button"
                  onClick={addLeftItem}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加项目
                </button>
              </div>

              {leftItems.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item.id}
                    onChange={(e) => {
                      const newItems = [...leftItems];
                      newItems[index].id = e.target.value;
                      setLeftItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="ID (例如: num1)"
                    required
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...leftItems];
                      newItems[index].text = e.target.value;
                      setLeftItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="文本 (例如: 하나)"
                    required
                  />
                  <input
                    type="text"
                    value={item.translation}
                    onChange={(e) => {
                      const newItems = [...leftItems];
                      newItems[index].translation = e.target.value;
                      setLeftItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="翻译 (例如: hana)"
                  />
                  <button
                    type="button"
                    onClick={() => removeLeftItem(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={leftItems.length <= 1}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            {/* 右侧项目 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  右侧项目 *
                </label>
                <button
                  type="button"
                  onClick={addRightItem}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加项目
                </button>
              </div>

              {rightItems.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item.id}
                    onChange={(e) => {
                      const newItems = [...rightItems];
                      newItems[index].id = e.target.value;
                      setRightItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="ID (例如: num_1)"
                    required
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...rightItems];
                      newItems[index].text = e.target.value;
                      setRightItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="文本 (例如: 1)"
                    required
                  />
                  <input
                    type="text"
                    value={item.translation}
                    onChange={(e) => {
                      const newItems = [...rightItems];
                      newItems[index].translation = e.target.value;
                      setRightItems(newItems);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="翻译 (例如: 一)"
                  />
                  <button
                    type="button"
                    onClick={() => removeRightItem(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={rightItems.length <= 1}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            {/* 正确答案 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  正确答案 *
                </label>
                <button
                  type="button"
                  onClick={addCorrectAnswer}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加答案
                </button>
              </div>

              {correctAnswers.map((answer, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={answer.from}
                    onChange={(e) => {
                      const newAnswers = [...correctAnswers];
                      newAnswers[index].from = e.target.value;
                      setCorrectAnswers(newAnswers);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    required
                  >
                    <option value="">选择左侧项目</option>
                    {leftItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.text}
                      </option>
                    ))}
                  </select>
                  <span className="self-center">→</span>
                  <select
                    value={answer.to}
                    onChange={(e) => {
                      const newAnswers = [...correctAnswers];
                      newAnswers[index].to = e.target.value;
                      setCorrectAnswers(newAnswers);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    required
                  >
                    <option value="">选择右侧项目</option>
                    {rightItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.text}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCorrectAnswer(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={correctAnswers.length <= 1}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedType === "fillInBlank" && (
          <div className="border border-gray-200 p-4 rounded-md space-y-4">
            <h2 className="text-xl font-semibold">填空题配置</h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  句子部分 *
                </label>
                <button
                  type="button"
                  onClick={addSentencePart}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加句子部分
                </button>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-2">
                  填空部分会在句子片段之间，例如：[&quot;안녕하세요, 저는
                  &quot;, &quot;입니다.&quot;] 会在界面显示为 &quot;안녕하세요,
                  저는 ______ 입니다.&quot;
                </p>

                {sentenceParts.map((part, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={part}
                      onChange={(e) => {
                        const newParts = [...sentenceParts];
                        newParts[index] = e.target.value;
                        setSentenceParts(newParts);
                      }}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      placeholder={`句子部分 ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeSentencePart(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                      disabled={sentenceParts.length <= 2}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                正确答案 *
              </label>
              <input
                type="text"
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="填空处的正确答案"
                required
              />
            </div>
          </div>
        )}

        {selectedType === "singleChoice" && (
          <div className="border border-gray-200 p-4 rounded-md space-y-4">
            <h2 className="text-xl font-semibold">单选题配置</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                问题 *
              </label>
              <input
                type="text"
                value={singleQuestion}
                onChange={(e) => setSingleQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="例如：한국의 수도는 어디입니까?"
                required
              />
            </div>

            {/* 选项 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  选项 *
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加选项
                </button>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={option.id}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index].id = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="w-1/6 border border-gray-300 rounded-md p-2"
                    placeholder="ID (例如: seoul)"
                    required
                  />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index].label = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="w-1/3 border border-gray-300 rounded-md p-2"
                    placeholder="标签 (例如: 서울)"
                    required
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index].value = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="w-1/3 border border-gray-300 rounded-md p-2"
                    placeholder="值 (例如: seoul)"
                    required
                  />
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.isCorrect}
                      onChange={() => {
                        const newOptions = [...options].map((opt, i) => ({
                          ...opt,
                          isCorrect: i === index,
                        }));
                        setOptions(newOptions);
                      }}
                      className="mr-1"
                      required
                    />
                    <label className="text-sm mr-2">正确</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={options.length <= 1}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedType === "sentence" && (
          <div className="border border-gray-200 p-4 rounded-md space-y-4">
            <h2 className="text-xl font-semibold">造句题配置</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提示词 *
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="例如：학교에 가다"
                required
              />
            </div>

            {/* 正确答案 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  可接受的正确答案 *
                </label>
                <button
                  type="button"
                  onClick={addCorrectAnswer2}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  添加可能答案
                </button>
              </div>

              {correctAnswers2.map((answer, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...correctAnswers2];
                      newAnswers[index] = e.target.value;
                      setCorrectAnswers2(newAnswers);
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder={`可能的正确答案 ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeCorrectAnswer2(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={correctAnswers2.length <= 1}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            重置
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={isSubmitting || !selectedType}
          >
            {isSubmitting ? "上传中..." : "上传题目"}
          </button>
        </div>
      </form>
    </div>
  );
}
