"use client";

import React, { useState, useRef, useEffect } from "react";
import Xarrow from "react-xarrows";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export interface MatchItem {
  id: string;
  text: string;
  translation?: string;
}

interface MatchAnswer {
  from: string;
  to: string;
}

interface LineMatchingQuestionProps {
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  correctAnswers: MatchAnswer[];
  question?: string;
  onComplete?: (isCorrect: boolean) => void;
}

export function LineMatchingQuestion({
  leftItems,
  rightItems,
  correctAnswers,
  question = "请连接对应的词语",
  onComplete,
}: LineMatchingQuestionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [connections, setConnections] = useState<MatchAnswer[]>([]);
  const [checked, setChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const connectionAreaRef = useRef<HTMLDivElement>(null);
  console.log("isCorrect", isCorrect);
  // 重置连线区域的事件监听
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // 如果已完成检查，不处理点击
      if (checked) return;

      // 如果点击区域不是连线元素或者其子元素，取消左侧选中状态
      if (
        connectionAreaRef.current &&
        e.target instanceof Node &&
        !connectionAreaRef.current.contains(e.target) &&
        // 确保点击的不是左侧或右侧的项目
        !(e.target instanceof Element && e.target.closest("[data-item-side]"))
      ) {
        setSelectedLeft(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [checked]);

  const handleLeftClick = (id: string) => {
    if (checked) return;

    // 如果已经被连接，则移除这个连接
    const existingConnection = connections.find((conn) => conn.from === id);
    if (existingConnection) {
      setConnections(connections.filter((conn) => conn.from !== id));
      return;
    }

    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (checked) return;

    // 如果已经被连接，则移除这个连接
    const existingConnection = connections.find((conn) => conn.to === id);
    if (existingConnection) {
      setConnections(connections.filter((conn) => conn.to !== id));
      return;
    }

    // 如果有左侧选中的项目，则创建连接
    if (selectedLeft) {
      setConnections([...connections, { from: selectedLeft, to: id }]);
      setSelectedLeft(null);
    }
  };

  // 专门用于删除连接的函数
  const handleRemoveConnection = (conn: MatchAnswer) => {
    if (checked) return;
    setConnections(
      connections.filter((c) => !(c.from === conn.from && c.to === conn.to))
    );
  };

  const handleCheck = () => {
    // 所有题目都已回答
    if (connections.length !== leftItems.length) {
      alert("请完成所有连线后再检查");
      return;
    }

    // 检查答案是否正确
    const correctCount = connections.filter((conn) => {
      // 查找对应的正确答案
      return correctAnswers.some(
        (answer) => answer.from === conn.from && answer.to === conn.to
      );
    }).length;

    const allCorrect = correctCount === correctAnswers.length;
    setIsCorrect(allCorrect);
    setChecked(true);

    if (onComplete) {
      onComplete(allCorrect);
    }
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedLeft(null);
    setChecked(false);
    setIsCorrect(false);
  };

  // 判断某个连接是否正确
  const isConnectionCorrect = (conn: MatchAnswer) => {
    return correctAnswers.some(
      (answer) => answer.from === conn.from && answer.to === conn.to
    );
  };

  // 获取连接线的颜色
  const getConnectionColor = (conn: MatchAnswer) => {
    if (!checked) return "#3b82f6"; // 默认蓝色
    return isConnectionCorrect(conn) ? "#22c55e" : "#ef4444"; // 正确绿色，错误红色
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {question && (
        <h2 className="text-base font-medium mb-4 text-center">{question}</h2>
      )}

      <div
        className="flex justify-between gap-16 my-6 relative min-h-[200px]"
        ref={connectionAreaRef}
      >
        <div className="flex flex-col gap-3 z-10 w-5/12">
          {leftItems.map((item) => {
            const isConnected = connections.some(
              (conn) => conn.from === item.id
            );
            return (
              <motion.div
                key={item.id}
                id={item.id}
                data-item-side="left"
                className={`px-2.5 py-1.5 border text-xs rounded-md cursor-pointer transition-colors ${
                  selectedLeft === item.id
                    ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500"
                    : isConnected
                    ? "bg-gray-50 border-gray-300 dark:bg-gray-700/30 dark:border-gray-600"
                    : "bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeftClick(item.id);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <span className="font-medium">{item.text}</span>
                  {item.translation && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {item.translation}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 z-10 w-5/12">
          {rightItems.map((item) => {
            const isConnected = connections.some((conn) => conn.to === item.id);
            return (
              <motion.div
                key={item.id}
                id={item.id}
                data-item-side="right"
                className={`px-2.5 py-1.5 border text-xs rounded-md cursor-pointer transition-colors ${
                  isConnected
                    ? "bg-gray-50 border-gray-300 dark:bg-gray-700/30 dark:border-gray-600"
                    : "bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(item.id);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <span className="font-medium">{item.text}</span>
                  {item.translation && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {item.translation}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 连接线 - 使用绝对定位但让它在元素下方 */}
        <div className="absolute inset-0 pointer-events-none">
          {connections.map((conn, idx) => (
            <div key={idx} className="relative">
              <Xarrow
                start={conn.from}
                end={conn.to}
                color={getConnectionColor(conn)}
                strokeWidth={2}
                path="straight"
                curveness={0.2}
                headSize={5}
                tailSize={1}
                showHead={false}
                zIndex={5}
                dashness={
                  !checked
                    ? false
                    : !isConnectionCorrect(conn)
                    ? { strokeLen: 8, nonStrokeLen: 4, animation: true }
                    : false
                }
              />

              {/* 点击区域 */}
              <div
                className={`absolute top-1/2 left-0 w-full h-6 -mt-3 ${
                  checked ? "" : "cursor-pointer"
                }`}
                style={{ pointerEvents: checked ? "none" : "auto", zIndex: 20 }}
                onClick={(e) => {
                  if (!checked) {
                    e.stopPropagation();
                    handleRemoveConnection(conn);
                  }
                }}
                title={checked ? undefined : "点击删除连线"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        {!checked ? (
          <Button
            onClick={handleCheck}
            disabled={connections.length !== leftItems.length}
            className="px-5 py-0.5 text-xs h-7"
            size="sm"
          >
            检查答案
          </Button>
        ) : (
          <Button
            onClick={handleReset}
            variant="outline"
            className="px-5 py-0.5 text-xs h-7"
            size="sm"
          >
            重新做题
          </Button>
        )}
      </div>
    </div>
  );
}
