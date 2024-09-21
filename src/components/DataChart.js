import React, { useState, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, Brush
} from 'recharts';
import { graphOptions } from '../utils/constants';
import { formatYAxis, formatTooltip } from '../utils/formatters';

const DataChart = ({ data, selectedGraph }) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top, setTop] = useState('dataMax+1');
  const [bottom, setBottom] = useState('dataMin-1');

  const getCurrentGraphOption = useCallback(() => {
    return graphOptions.find(option => option.value === selectedGraph);
  }, [selectedGraph]);

  const currentOption = getCurrentGraphOption();

  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = data.slice(from - 1, to);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });
    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    let [leftIndex, rightIndex] = [refAreaLeft, refAreaRight].map(Number).sort((a, b) => a - b);

    setRefAreaLeft('');
    setRefAreaRight('');

    setLeft(data[leftIndex].stroke);
    setRight(data[rightIndex].stroke);

    const [bottom, top] = getAxisYDomain(leftIndex, rightIndex, currentOption.y1, 1);
    setBottom(bottom);
    setTop(top);
  };

  const zoomOut = () => {
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax+1');
    setBottom('dataMin');
  };

  return (
    <div className="data-chart-container">
      <button className="zoom-out-btn" onClick={zoomOut}>ズームアウト</button>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(e.activeLabel)}
          onMouseUp={zoom}
          className="line-chart"
          >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="stroke" 
            allowDataOverflow={true}
            domain={[left, right]}
            type="number"
          />
          <YAxis 
            yAxisId="left"
            allowDataOverflow={true}
            domain={[bottom, top]}
            type="number"
            tickFormatter={(value) => formatYAxis(value, currentOption.y1)}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            allowDataOverflow={true}
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatYAxis(value, currentOption.y2)}
          />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey={currentOption.y1} stroke="#8884d8" name={currentOption.y1} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey={currentOption.y2} stroke="#82ca9d" name={currentOption.y2} dot={false} />
          
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
          ) : null}
          
          <Brush dataKey="stroke" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;