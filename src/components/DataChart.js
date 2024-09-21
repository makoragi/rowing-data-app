// src/components/DataChart.js
import React, { useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { graphOptions } from '../utils/constants';
import { formatYAxis, formatTooltip } from '../utils/formatters';

const DataChart = ({ data, selectedGraph }) => {
  const getCurrentGraphOption = useCallback(() => {
    return graphOptions.find(option => option.value === selectedGraph);
  }, [selectedGraph]);

  const customXAxisTicks = useCallback((value) => {
    if (value % 10 === 0) return value;
    if (value % 5 === 0) return '';
    return undefined;
  }, []);

  const currentOption = getCurrentGraphOption();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="stroke" 
          label={{ value: 'Total Strokes', position: 'insideBottom', offset: -5 }}
          tick={{fontSize: 12}}
          ticks={[...Array(Math.ceil(data[data.length - 1].stroke / 5) + 1)].map((_, i) => i * 5)}
          tickFormatter={customXAxisTicks}
        />
        <YAxis 
          yAxisId="left" 
          label={{ value: `${currentOption.y1} (${currentOption.unit1})`, angle: -90, position: 'insideLeft' }}
          tick={{fontSize: 12}}
          tickFormatter={(value) => formatYAxis(value, currentOption.y1)}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          label={{ value: `${currentOption.y2} (${currentOption.unit2})`, angle: 90, position: 'insideRight' }}
          tick={{fontSize: 12}}
          tickFormatter={(value) => formatYAxis(value, currentOption.y2)}
        />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey={currentOption.y1} stroke="#8884d8" name={currentOption.y1} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey={currentOption.y2} stroke="#82ca9d" name={currentOption.y2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DataChart;
