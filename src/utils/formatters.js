export const formatYAxis = (value, dataKey) => {
  // 整数に丸めて表示
  return Math.round(value).toString();
};

export const formatTooltip = (value, name) => {
  if (typeof value === 'number') {
    // ツールチップでは小数点以下2桁まで表示
    return value.toFixed(2);
  }
  return value;
};