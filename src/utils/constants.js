// src/utils/constants.js
export const graphOptions = [
  { value: 'distance-speed', label: 'Distance vs Speed', y1: 'distance', y2: 'speed', unit1: 'm', unit2: 'm/s' },
  { value: 'distance-strokeRate', label: 'Distance vs Stroke Rate', y1: 'distance', y2: 'strokeRate', unit1: 'm', unit2: 'SPM' },
  { value: 'speed-strokeRate', label: 'Speed vs Stroke Rate', y1: 'speed', y2: 'strokeRate', unit1: 'm/s', unit2: 'SPM' },
  { value: 'speed-distancePerStroke', label: 'Speed vs Distance/Stroke', y1: 'speed', y2: 'distancePerStroke', unit1: 'm/s', unit2: 'm' },
  // { value: 'distance-elapsedTime', label: 'Distance vs Elapsed Time', y1: 'distance', y2: 'elapsedTime', unit1: 'm', unit2: '' },
  // { value: 'speed-elapsedTime', label: 'Speed vs Elapsed Time', y1: 'speed', y2: 'elapsedTime', unit1: 'm/s', unit2: '' },
];
