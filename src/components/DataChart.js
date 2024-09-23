import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, Brush
} from 'recharts';
import { singleFileGraphOptions, comparisonGraphOptions } from '../utils/constants';
import { formatYAxis, formatTooltip } from '../utils/formatters';

const DataChart = ({ data, data1, data2, selectedGraph, isComparisonView }) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top, setTop] = useState('dataMax+1');
  const [bottom, setBottom] = useState('dataMin-1');
  const [chartWidth, setChartWidth] = useState(window.innerWidth);
  const [chartHeight, setChartHeight] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setChartWidth(width);
      setChartHeight(width <= 680 ? 300 : 400);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('DataChart rendered with:', { isComparisonView, selectedGraph });
    console.log('Data1:', data1);
    console.log('Data2:', data2);
  }, [isComparisonView, selectedGraph, data1, data2]);

  const graphOptions = isComparisonView ? comparisonGraphOptions : singleFileGraphOptions;

  const currentOption = useMemo(() => {
    const option = graphOptions.find(option => option.value === selectedGraph) || graphOptions[0];
    console.log('Current option:', option);
    return option;
  }, [selectedGraph, graphOptions]);

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

  useEffect(() => {
    const handleResize = () => setChartWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = chartWidth <= 680;

  const getIntegerTicks = (dataMin, dataMax, tickCount = 5, isDistance = false) => {
    let range = dataMax - dataMin;
    let step;

    if (isDistance) {
      // Distanceの場合、100または500単位の刻みを設定
      if (range > 2000) {
        step = 500;
      } else {
        step = 100;
      }
    } else {
      step = Math.ceil(range / (tickCount - 1));
    }

    const start = Math.floor(dataMin / step) * step;
    const end = Math.ceil(dataMax / step) * step;
    const ticks = [];

    for (let i = start; i <= end; i += step) {
      ticks.push(i);
    }

    return ticks;
  };

  const yAxisDomains = useMemo(() => {
    const getDataRange = (dataArray, key) => {
      if (!Array.isArray(dataArray) || dataArray.length === 0) return [0, 0];
      const values = dataArray.map(item => item[key]).filter(value => value !== undefined && value !== null);
      return [Math.min(...values), Math.max(...values)];
    };

    let result;
    if (isComparisonView) {
      const [min1, max1] = getDataRange(data1, currentOption.y);
      const [min2, max2] = getDataRange(data2, currentOption.y);
      result = {
        left: [Math.floor(Math.min(min1, min2)), Math.ceil(Math.max(max1, max2))]
      };
    } else {
      const [leftMin, leftMax] = getDataRange(data, currentOption.y1);
      const [rightMin, rightMax] = getDataRange(data, currentOption.y2);
      result = {
        left: [Math.floor(leftMin), Math.ceil(leftMax)],
        right: [Math.floor(rightMin), Math.ceil(rightMax)]
      };
    }
    console.log('Y-axis domains:', result);
    return result;
  }, [isComparisonView, data, data1, data2, currentOption]);

  const getYAxisProps = (isRight = false) => {
    const domain = yAxisDomains[isRight ? 'right' : 'left'];
    const isDistance = !isRight && currentOption.y1 === 'distance';
    const commonProps = {
      allowDataOverflow: true,
      tickFormatter: (value) => Math.round(value).toString(), // 整数のみを表示
      tick: { fontSize: isSmallScreen ? 10 : 12 },
      width: 60,
      domain: domain,
      ticks: getIntegerTicks(domain[0], domain[1], 5, isDistance)
    };
  
    if (isSmallScreen) {
      return {
        ...commonProps,
        tickSize: 8,
        axisLine: false,
        tickLine: false,
        tickMargin: 0,
        mirror: true,
      };
    } else {
      return {
        ...commonProps,
        tickSize: 5,
        axisLine: true,
        tickLine: true,
        tickMargin: 5,
        mirror: false,
      };
    }
  };

  const combinedData = useMemo(() => {
    let result;
    if (!isComparisonView) result = data;
    else if (!Array.isArray(data1) && !Array.isArray(data2)) result = [];
    else if (!Array.isArray(data1)) result = data2;
    else if (!Array.isArray(data2)) result = data1;
    else result = [...data1, ...data2].sort((a, b) => a.stroke - b.stroke);
    
    console.log('Combined data:', result);
    return result;
  }, [isComparisonView, data, data1, data2]);

  // const isComparisonView = data1 !== undefined && data2 !== undefined;

  const renderLines = () => {
    if (isComparisonView) {
      return (
        <>
          {data1 && data1.length > 0 && (
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey={currentOption.y} 
              data={data1}
              stroke="#8884d8" 
              name={`${currentOption.label} (データ1)`} 
              dot={false} 
            />
          )}
          {data2 && data2.length > 0 && (
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey={currentOption.y} 
              data={data2}
              stroke="#82ca9d" 
              name={`${currentOption.label} (データ2)`} 
              dot={false} 
            />
          )}
        </>
      );
    } else {
      return (
        <>
          <Line yAxisId="left" type="monotone" dataKey={currentOption.y1} stroke="#8884d8" name={currentOption.y1} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey={currentOption.y2} stroke="#82ca9d" name={currentOption.y2} dot={false} />
        </>
      );
    }
  };

  return (
    <div className="data-chart-container">
      <button className="zoom-out-btn" onClick={zoomOut}>ズームアウト</button>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={combinedData}
          onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(e.activeLabel)}
          onMouseUp={zoom}
          className="line-chart"
          margin={isSmallScreen ? { top: 5, right: 10, left: -20, bottom: 20 } : { top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="stroke" 
            allowDataOverflow={true}
            domain={[left, right]}
            type="number"
            tick={{fontSize: isSmallScreen ? 10 : 12}}
          />
          <YAxis 
            yAxisId="left"
            allowDataOverflow={true}
            domain={yAxisDomains.left}
            type="number"
            tickFormatter={(value) => formatYAxis(value, isComparisonView ? currentOption.y : currentOption.y1)}
            tick={{fontSize: isSmallScreen ? 10 : 12}}
            width={isSmallScreen ? 30 : 60}
            label={isSmallScreen ? null : { 
              value: isComparisonView ? `${currentOption.label} (${currentOption.unit})` : `${currentOption.y1} (${currentOption.unit1})`, 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <YAxis 
            yAxisId={isComparisonView ? "left" : "right" }
            orientation={isComparisonView ? "left" : "right" }
            allowDataOverflow={true}
            domain={yAxisDomains.right}
            tickFormatter={(value) => formatYAxis(value, currentOption.y2)}
            tick={{fontSize: isSmallScreen ? 10 : 12}}
            width={isSmallScreen ? 30 : 60}
            label={isSmallScreen ? null : { value: `${currentOption.y2} (${currentOption.unit2})`, angle: 90, position: 'insideRight' }}
          />
          <Tooltip formatter={(value, name) => formatTooltip(value, isComparisonView ? currentOption.y : name)} />
          <Legend 
            verticalAlign={isSmallScreen ? "top" : "bottom"}
            height={36}
            wrapperStyle={{fontSize: isSmallScreen ? 10 : 12}}
          />
          {renderLines()}

          {refAreaLeft && refAreaRight ? (
            <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
          ) : null}
          
          <Brush
            dataKey="stroke"
            height={20}
            stroke="#8884d8"
            className={isSmallScreen ? 'small-screen-brush' : ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;