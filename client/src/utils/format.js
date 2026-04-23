/**
 * 格式化月球分显示（小数点后1位）
 * @param {number} points - 月球分数值
 * @returns {string} 格式化后的字符串
 */
export const formatMoonPoints = (points) => {
  const num = parseFloat(points) || 0;
  return num.toFixed(1);
};
