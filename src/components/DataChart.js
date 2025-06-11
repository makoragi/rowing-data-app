import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, Brush, ReferenceLine
} from 'recharts';
import { graphOptions } from '../utils/constants';
import { formatYAxis, CustomTooltip } from '../utils/formatters';

const DataChart = ({ data, selectedGraph, onRangeSelect }) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top, setTop] = useState('dataMax+1');
  const [bottom, setBottom] = useState('dataMin-1');
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(400);
  const containerRef = useRef(null);
  const [showReferenceLine1, setShowReferenceLine1] = useState(true);
  const [showReferenceLine2, setShowReferenceLine2] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [limitStrokeRate, setLimitStrokeRate] = useState(false);
  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(data.length - 1);

  useEffect(() => {
    setBrushStart(0);
    setBrushEnd(data.length - 1);
  }, [data]);

  useEffect(() => {
    setBrushStart(0);
    setBrushEnd(data.length - 1);
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      const width = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
      setChartWidth(width);
      setChartHeight(width <= 680 ? 300 : 400);
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCurrentGraphOption = useCallback(() => {
    return graphOptions.find(option => option.value === selectedGraph);
  }, [selectedGraph]);

  const currentOption = getCurrentGraphOption();

  const clampIndex = (idx) => {
    if (Number.isNaN(idx)) return 0;
    return Math.min(Math.max(idx, 0), data.length - 1);
  };

  const getAxisYDomain = (from, to, ref, offset) => {
    const start = clampIndex(Math.min(from, to));
    const end = clampIndex(Math.max(from, to));
    const refData = data.slice(start, end + 1);
    if (refData.length === 0) return [0, 0];
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
      // ブラシ操作時はここで範囲をリセットしない
      return;
    }

    let [leftStroke, rightStroke] = [refAreaLeft, refAreaRight].map(Number).sort((a, b) => a - b);

    const leftIndex = clampIndex(leftStroke - 1);
    const rightIndex = clampIndex(rightStroke - 1);

    setRefAreaLeft('');
    setRefAreaRight('');

    setLeft(data[leftIndex].stroke);
    setRight(data[rightIndex].stroke);
    setBrushStart(leftIndex);
    setBrushEnd(rightIndex);

    const [bottom, top] = getAxisYDomain(leftIndex, rightIndex, currentOption.y1, 1);
    setBottom(bottom);
    setTop(top);

    if (onRangeSelect) {
      onRangeSelect({ start: leftIndex, end: rightIndex });
    }
  };

  const handleBrushChange = useCallback(({ startIndex, endIndex }) => {
    if (startIndex == null || endIndex == null) return;
    const start = clampIndex(Math.min(startIndex, endIndex));
    const end = clampIndex(Math.max(startIndex, endIndex));
    setBrushStart(start);
    setBrushEnd(end);
    setLeft(data[start].stroke);
    setRight(data[end].stroke);
    const [b, t] = getAxisYDomain(start, end, currentOption.y1, 1);
    setBottom(b);
    setTop(t);
    if (onRangeSelect) {
      onRangeSelect({ start, end });
    }
  }, [data, currentOption, onRangeSelect]);

  const zoomOut = () => {
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax+1');
    setBottom('dataMin');
    setBrushStart(0);
    setBrushEnd(data.length - 1);
    if (onRangeSelect) onRangeSelect(null);
  };


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
    const leftData = data.map(item => item[currentOption.y1]);
    const rightData = data.map(item => item[currentOption.y2]);
    const leftMin = Math.min(...leftData);
    let leftMax = Math.max(...leftData);
    const rightMin = Math.min(...rightData);
    let rightMax = Math.max(...rightData);

    if (limitStrokeRate && currentOption.y1 === 'strokeRate') {
      leftMax = Math.min(leftMax, 40);
    }
    if (limitStrokeRate && currentOption.y2 === 'strokeRate') {
      rightMax = Math.min(rightMax, 40);
    }

    return {
      left: [Math.floor(leftMin), Math.ceil(leftMax)],
      right: [Math.floor(rightMin), Math.ceil(rightMax)]
    };
  }, [data, currentOption, limitStrokeRate]);


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

  const isDistancePerStroke = currentOption.y1 === 'distancePerStroke' || currentOption.y2 === 'distancePerStroke';
  const isSpeed = currentOption.y1 === 'speed' || currentOption.y2 === 'speed';

  return (
    <div className="data-chart-container" ref={containerRef}>
      <button className="zoom-out-btn" onClick={zoomOut}>ズームアウト</button>
      <label className="reference-line-label">
        <input
          type="checkbox"
          checked={showReferenceLine1}
          onChange={() => setShowReferenceLine1(!showReferenceLine1)}
          disabled={!isDistancePerStroke}
        />
        DistancePerStroke=10(m)
      </label>
      <label className="reference-line-label">
        <input
          type="checkbox"
          checked={showReferenceLine2}
          onChange={() => setShowReferenceLine2(!showReferenceLine2)}
          disabled={!isSpeed}
        />
        Speed=4(m/s)
      </label>
      <label className="reference-line-label">
        <input
          type="checkbox"
          checked={showTooltip}
          onChange={() => setShowTooltip(!showTooltip)}
        />
        Tooltip表示
      </label>
      <label className="reference-line-label">
        <input
          type="checkbox"
          checked={limitStrokeRate}
          onChange={() => setLimitStrokeRate(!limitStrokeRate)}
        />
        StrokeRate上限40
      </label>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
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
            domain={
              limitStrokeRate && currentOption.y1 === 'strokeRate'
                ? [0, 40]
                : [bottom, top]
            }
            type="number"
            tickFormatter={(value) => formatYAxis(value, currentOption.y1)}
            tick={{fontSize: isSmallScreen ? 10 : 12}}
            width={isSmallScreen ? 30 : 60}
            label={isSmallScreen ? null : { value: `${currentOption.y1} (${currentOption.unit1})`, angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDataOverflow={true}
            domain={
              limitStrokeRate && currentOption.y2 === 'strokeRate'
                ? [0, 40]
                : ['auto', 'auto']
            }
            tickFormatter={(value) => formatYAxis(value, currentOption.y2)}
            tick={{fontSize: isSmallScreen ? 10 : 12}}
            width={isSmallScreen ? 30 : 60}
            label={isSmallScreen ? null : { value: `${currentOption.y2} (${currentOption.unit2})`, angle: 90, position: 'insideRight' }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip data={data} />} />}
          <Legend 
            verticalAlign={isSmallScreen ? "top" : "bottom"}
            height={36}
            wrapperStyle={{fontSize: isSmallScreen ? 10 : 12}}
          />
          <Line yAxisId="left" type="monotone" dataKey={currentOption.y1} stroke="#8884d8" name={currentOption.y1} dot={false} unit={currentOption.unit1} />
          <Line yAxisId="right" type="monotone" dataKey={currentOption.y2} stroke="#82ca9d" name={currentOption.y2} dot={false} unit={currentOption.unit2} />
          {showReferenceLine1 && currentOption.y1 === 'distancePerStroke' && (
            <ReferenceLine yAxisId="left" y={10} label={{ value: "10m", position: 'insideLeft'  }} stroke="#8884d8" strokeDasharray="3 3" strokeWidth={2} />
          )}
          {showReferenceLine1 && currentOption.y2 === 'distancePerStroke' && (
            <ReferenceLine yAxisId="right" y={10} label={{ value: "10m", position: 'insideRight' }} stroke="#82ca9d" strokeDasharray="3 3" strokeWidth={2} />
          )}
          {showReferenceLine2 && currentOption.y1 === 'speed' && (
            <ReferenceLine yAxisId="left" y={4} label={{ value: "4m/s", position: 'insideLeft'  }} stroke="#8884d8" strokeDasharray="3 3" strokeWidth={2} />
          )}
          {showReferenceLine2 && currentOption.y2 === 'speed' && (
            <ReferenceLine yAxisId="right" y={4} label={{ value: "4m/s", position: 'insideRight' }} stroke="#82ca9d" strokeDasharray="3 3" strokeWidth={2} />
          )}
          
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
          ) : null}
          
          <Brush
            dataKey="stroke"
            height={20}
            stroke="#8884d8"
            startIndex={brushStart}
            endIndex={brushEnd}
            onChange={handleBrushChange}
            className={isSmallScreen ? 'small-screen-brush' : ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
