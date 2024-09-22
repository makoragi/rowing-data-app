export const formatYAxis = (value, dataKey) => {
  if (dataKey === 'speed') {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
};

export const formatTooltip = (value, name) => {
  if (name === 'speed') {
    return value.toFixed(2);
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value;
};