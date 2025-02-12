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

export const CustomTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const currentData = data.find(item => item.stroke === label);
    const displayedDataKeys = payload.map(entry => entry.name);
    const units = {
      distance: 'm',
      speed: 'm/s',
      strokeRate: 'SPM',
      distancePerStroke: 'm'
    };
    return (
      <div className="custom-tooltip">
        <p className="label">{`Stroke: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${formatTooltip(entry.value, entry.name)} ${units[entry.name] || ''}`}
          </p>
        ))}
        {currentData && (
          <>
            {!displayedDataKeys.includes('distance') && <p>{`Distance: ${currentData.distance} m`}</p>}
            {!displayedDataKeys.includes('speed') && <p>{`Speed: ${currentData.speed} m/s`}</p>}
            {!displayedDataKeys.includes('strokeRate') && <p>{`Stroke Rate: ${currentData.strokeRate} SPM`}</p>}
            {!displayedDataKeys.includes('distancePerStroke') && <p>{`Distance Per Stroke: ${currentData.distancePerStroke} m`}</p>}
          </>
        )}
      </div>
    );
  }

  return null;
};
