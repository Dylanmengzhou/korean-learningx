import { distance, closest } from "fastest-levenshtein";

/**
 * 计算两个字符串的匹配概率（百分比）
 * @param input 输入字符串
 * @param target 目标字符串
 * @param options 配置选项
 * @returns 匹配概率（0-100的数字）
 */
export function matchProbability(
  input: string,
  target: string,
  options: {
    /** 使用指数衰减模型计算概率 */
    useExponentialDecay?: boolean;
    /** 自定义衰减因子，默认为0.5 */
    decayFactor?: number;
  } = {}
): number {
  const dist = distance(input, target);
  const maxLength = Math.max(input.length, target.length);

  if (maxLength === 0) return 100; // 两个空字符串视为完全匹配
  if (dist === 0) return 100; // 完全匹配

  let similarity: number;

  if (options.useExponentialDecay) {
    // 指数衰减模型，对小的编辑距离更"宽容"
    const factor = options.decayFactor || 0.5;
    similarity = Math.exp(-dist / (maxLength * factor));
  } else {
    // 线性模型 - 简单归一化
    similarity = 1 - dist / maxLength;
  }

  // 确保结果在0-100范围内
  return Math.max(0, Math.min(100, similarity * 100));
}

/**
 * 找出最可能匹配的字符串及其概率
 * @param input 输入字符串
 * @param candidates 候选字符串数组
 * @returns 包含最匹配字符串和概率的对象
 */
export function findBestMatch(
  input: string,
  candidates: string[]
): {
  bestMatch: string;
  probability: number;
  allMatches: Array<{ text: string; probability: number }>;
} {
  if (!candidates.length) {
    throw new Error("候选字符串数组不能为空");
  }

  // 计算每个候选项的匹配概率
  const matches = candidates.map((candidate) => ({
    text: candidate,
    probability: matchProbability(input, candidate, {
      useExponentialDecay: true,
    }),
  }));

  // 按概率降序排序
  matches.sort((a, b) => b.probability - a.probability);

  return {
    bestMatch: matches[0].text,
    probability: matches[0].probability,
    allMatches: matches,
  };
}

const wrong = "학교 가다";
const answers = ["학교에 갔어요", "학교 갔다", "집에 갔다"];

// 原来的用法
console.log(distance(wrong, answers[1])); // 4
console.log(closest(wrong, answers)); // '학교 갔다'

// 新功能展示
console.log(matchProbability(wrong, answers[1])); // 匹配概率百分比
const bestMatch = findBestMatch(wrong, answers);
console.log(
  `最佳匹配: ${bestMatch.bestMatch}, 概率: ${bestMatch.probability.toFixed(2)}%`
);

// 显示所有候选项的匹配概率
bestMatch.allMatches.forEach((match) => {
  console.log(`${match.text}: ${match.probability.toFixed(2)}%`);
});
