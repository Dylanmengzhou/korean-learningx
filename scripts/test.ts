"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Word {
  id: number;
  korean: string;
  type: string;
  phrase: string | null;
  phraseCn: string | null;
  example: string | null;
  exampleCn: string | null;
  chinese: string;
  status: number;
}

// ------------------ 相关异步操作 ------------------
async function fetchWords(
  volume?: number,
  bookSeries?: string,
  chapter: number = 0,
  status: number = -1
) {
  try {
    const query = new URLSearchParams({
      ...(volume ? { volume: String(volume) } : {}),
      ...(bookSeries ? { bookSeries } : {}),
      ...(chapter ? { chapter: String(chapter) } : {}),
      ...(status !== null && status !== undefined
        ? { status: String(status) }
        : {}),
    }).toString();

    const res = await fetch(`/api/words?${query}`, { method: "GET" });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "获取单词失败");
    }
    return data.data as Word[];
  } catch (error) {
    console.error("Failed to fetch words:", error);
    throw error;
  }
}

async function updateDictationStatus(updates: { id: number; dictationStatus: number }) {
  try {
    await fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update words:", error);
    throw error;
  }
}

// ------------------ 组件主体 ------------------
const TestPage = () => {
  const [index, setIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [correct, setCorrect] = useState(0); // 当前题的对错状态：1正确 -1错误 0尚未判断

  const searchParams = useSearchParams();
  const volume = searchParams.get("volume");
  const bookSeries = searchParams.get("bookSeries");
  const chapter = searchParams.get("chapter");
  const status = searchParams.get("status");

  const [statusTitle, setStatusTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [volumeTitle, setVolumeTitle] = useState("");

  // correctList 用于整体记录每道题的状态
  const [correctList, setCorrectList] = useState<number[]>([]);
  // 用于记录每道题用户输入过的答案（可以回看或默认填充）
  const [inputWordHistory, setInputWordHistory] = useState<string[]>([]);

  const [isStarted, setIsStarted] = useState(false);

  // 弹窗状态
  const [popWindow, setPopWindow] = useState(false);

  // 定义一个 ref 用于存放全局唯一的 Audio 实例
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 是否正在切换题，避免重复点
  const [isNavigating, setIsNavigating] = useState(false);

  // ------------------ 初始化与音频 ref ------------------
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // ------------------ 加载单词数据 ------------------
  useEffect(() => {
    async function loadWords() {
      setLoading(true);
      try {
        const data = await fetchWords(
          Number(volume),
          bookSeries?.toString() || "",
          Number(chapter),
          Number(status)
        );
        setWords(data);

        // 状态文字
        switch (status) {
          case "1":
            setStatusTitle("认识");
            break;
          case "2":
            setStatusTitle("不认识");
            break;
          case "3":
            setStatusTitle("模糊");
            break;
          default:
            setStatusTitle("全部");
            break;
        }

        // 单元文字
        switch (chapter) {
          case "1":
            setChapterTitle("第一单元");
            break;
          case "2":
            setChapterTitle("第二单元");
            break;
          case "3":
            setChapterTitle("第三单元");
            break;
          case "4":
            setChapterTitle("第四单元");
            break;
          case "5":
            setChapterTitle("第五单元");
            break;
          case "6":
            setChapterTitle("第六单元");
            break;
          case "7":
            setChapterTitle("第七单元");
            break;
          case "8":
            setChapterTitle("第八单元");
            break;
          case "9":
            setChapterTitle("第九单元");
            break;
          case "10":
            setChapterTitle("第十单元");
            break;
          default:
            setChapterTitle("全单元");
            break;
        }

        // 册数文字
        switch (volume) {
          case "1":
            setVolumeTitle("第一册");
            break;
          case "2":
            setVolumeTitle("第二册");
            break;
          case "3":
            setVolumeTitle("第三册");
            break;
          case "4":
            setVolumeTitle("第四册");
            break;
          case "5":
            setVolumeTitle("第五册");
            break;
          case "6":
            setVolumeTitle("第六册");
            break;
          default:
            setVolumeTitle("全册");
            break;
        }
      } catch (error) {
        console.error("Failed to load words:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, [volume, bookSeries, chapter, status]);

  // ------------------ 当 index 或 words 改变时，自动播放 ------------------
  useEffect(() => {
    if (isStarted && words.length > 0 && index < words.length) {
      handlePlay();
    }
  }, [index, isStarted, words]);

  // ------------------ 点击开始测试 ------------------
  const handleStart = () => {
    setIsStarted(true);
    // 播放第一个单词
    handlePlay();
  };

  // ------------------ 播放音频 ------------------
  const handlePlay = () => {
    if (!audioRef.current || !words[index]) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
      words[index].korean
    )}&type=1&le=ko`;
    audioRef.current.play().catch((err) => {
      console.error("播放音频出错：", err);
    });
  };

  // ------------------ 通用：切换到下一题 ------------------
  const proceedToNext = (finalCorrectValue: number) => {
    // 更新 correctList 的当前index
    setCorrectList((prev) => {
      const newList = [...prev];
      newList[index] = finalCorrectValue;
      return newList;
    });

    // 更新数据库（你也可以放到 useEffect 里监听 correct 的变化，但这里可以更显式）
    updateDictationStatus({
      id: words[index].id,
      dictationStatus: finalCorrectValue,
    }).catch((err) => console.error(err));

    // 重置本题的对错状态为 0（下一题还要用）
    setCorrect(0);

    // 弹窗关掉
    setPopWindow(false);

    // 进入下一个题目
    if (index < words.length - 1) {
      setIsNavigating(true); // 避免重复点
      setTimeout(() => {
        const newIndex = index + 1;
        setIndex(newIndex);
        // 将用户输入记录下来（可选）
        setInputValue(inputWordHistory[newIndex] ?? "");
        setIsNavigating(false);
      }, 300); // 给个 300ms 做小过渡，随需求
    }
  };

  // ------------------ 点击下一个按钮 ------------------
  const handleNext = () => {
    if (isNavigating) return;

    // 先把当前输入存到历史中
    setInputWordHistory((prev) => {
      const newArr = [...prev];
      newArr[index] = inputValue;
      return newArr;
    });

    // 判断对错
    if (inputValue.trim() === words[index].chinese.trim()) {
      // 如果用户填的和正确答案一样 => 直接进入下一题（对了）
      proceedToNext(1);
    } else {
      // 如果用户填的答案和正确答案不一样 => 弹窗，交给弹窗按钮来决定真正的对错
      setPopWindow(true);
    }
  };

  // ------------------ 点击上一个按钮 ------------------
  const handlePrev = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // 把当前输入存到历史中
    setInputWordHistory((prev) => {
      const newArr = [...prev];
      newArr[index] = inputValue;
      return newArr;
    });

    // 切换到上一题
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      // 从历史记录里拿回用户输入
      setInputValue(inputWordHistory[newIndex] ?? "");
    }

    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  // ------------------ 弹窗按钮的处理 ------------------
  // “我记错了” => 视为答错
  const handlePopWrong = () => {
    proceedToNext(-1);
  };
  // “是一个意思” => 视为答对
  const handlePopSameMeaning = () => {
    proceedToNext(1);
  };

  // ------------------ JSX 渲染部分 ------------------
  return (
    <div className="h-svh w-svw flex flex-col">
      {!isStarted ? (
        // 1. 还没开始
        <button onClick={handleStart} className="h-svh">
          开始测试
        </button>
      ) : loading ? (
        // 2. 正在加载
        <div className="flex flex-col items-center justify-center h-full w-full bg-yellow-50 pt-20 text-right">
          <Loader2 className="animate-spin w-10 h-10 text-gray-600" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        // 3. 测试中
        <>
          <div className="w-full bg-yellow-50 pt-20">
            <div className="pr-8 font-bold lg:text-xl gap-3 flex justify-end">
              <div>
                <Button
                  variant={"outline"}
                  className="bg-gray-900/10 hover:bg-gray-900/10 text-base p-2 border-none font-bold"
                >
                  {statusTitle}
                </Button>
              </div>
              <div className="flex justify-center items-center">
                {volumeTitle}
              </div>
              <div className="flex justify-center items-center text-gray-500 font-light">
                {chapterTitle}
              </div>
            </div>
          </div>

          <div className="h-full w-full flex flex-col items-center justify-center bg-yellow-50">
            {/* 单词 & 答案 */}
            <div className="p-2 pb-10 lg:pb-20 flex flex-col gap-2 items-center justify-center">
              <div
                className={`text-3xl ${
                  correctList[index] === 1
                    ? "text-green-500"
                    : correctList[index] === -1
                    ? "text-red-500"
                    : "text-black"
                } pb-0 font-bold`}
              >
                {words[index]?.korean}
              </div>
              {correctList[index] === -1 ? (
                <div className="flex justify-center items-center text-xl text-red-500">
                  答案：{words[index]?.chinese}
                </div>
              ) : (
                <div className="invisible flex justify-center items-center text-xl text-red-500">
                  ----
                </div>
              )}
            </div>

            {/* 输入框 */}
            <div>
              <div className="p-2 w-svw flex justify-center items-center">
                <label htmlFor="" />
                <input
                  className={`rounded-none w-3/4 lg:w-2/3 text-center border-b-2 border-black bg-inherit focus:outline-none focus:border-b-2 focus:border-black text-3xl ${
                    correctList[index] === 1
                      ? "text-green-500"
                      : correctList[index] === -1
                      ? "text-red-500"
                      : "text-black"
                  }`}
                  type="text"
                  title="shit"
                  value={inputValue}
                  placeholder={isFocused ? "" : "请在这里输入"}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(inputValue !== "")}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNext();
                    }
                  }}
                />
              </div>
              {/* 按钮区 */}
              <div className="flex items-center justify-center gap-5">
                <Button onClick={handlePrev} disabled={isNavigating}>
                  上一个
                </Button>
                <Button onClick={handlePlay}>播放</Button>
                <Button onClick={handleNext} disabled={isNavigating}>
                  下一个
                </Button>
              </div>
            </div>

            {/* 底部进度 */}
            <div className="lg:pt-16 pt-10 w-full flex flex-col items-center justify-center gap-2">
              <Progress value={(index / words.length) * 100} className="w-2/3" />
              <div>
                {index + 1} / {words.length}
              </div>
            </div>
          </div>

          {/* 弹窗（popWindow） */}
          {popWindow && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <div className="bg-white p-6 rounded-xl shadow-inner w-[300px] text-center">
                <h2 className="text-xl font-bold mb-4">确定一下答案</h2>
                <p className="mb-4 text-orange-600">你的答案是：{inputValue}</p>
                <p className="mb-4 text-red-600">
                  正确答案是：{words[index]?.chinese}
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handlePopWrong}
                    className="text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    我记错了
                  </Button>
                  <Button
                    onClick={handlePopSameMeaning}
                    className="text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    是一个意思
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestPage;