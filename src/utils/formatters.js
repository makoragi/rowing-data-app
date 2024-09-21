// src/utils/formatters.js
export const formatYAxis = (value, dataKey) => {
  if (dataKey === 'elapsedTime') {
    return value;
  }
  return typeof value === 'number' ? value.toFixed(2) : value;
};

export const formatTooltip = (value, name) => {
  if (name === 'elapsedTime') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value;
};