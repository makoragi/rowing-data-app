// src/utils/constants.js

export const singleFileGraphOptions = [
  { value: 'distance-speed', label: 'Distance vs Speed', y1: 'distance', y2: 'speed', unit1: 'm', unit2: 'm/s' },
  { value: 'distance-strokeRate', label: 'Distance vs Stroke Rate', y1: 'distance', y2: 'strokeRate', unit1: 'm', unit2: 'SPM' },
  { value: 'speed-strokeRate', label: 'Speed vs Stroke Rate', y1: 'speed', y2: 'strokeRate', unit1: 'm/s', unit2: 'SPM' },
  { value: 'speed-distancePerStroke', label: 'Speed vs Distance/Stroke', y1: 'speed', y2: 'distancePerStroke', unit1: 'm/s', unit2: 'm' },
  { value: 'strokeRate-distancePerStroke', label: 'Stroke Rate vs Distance/Stroke', y1: 'strokeRate', y2: 'distancePerStroke', unit1: 'SPM', unit2: 'm' },
];

export const comparisonGraphOptions = [
  { value: 'distance', label: 'Distance', y: 'distance', unit: 'm' },
  { value: 'speed', label: 'Speed', y: 'speed', unit: 'm/s' },
  { value: 'strokeRate', label: 'Stroke Rate', y: 'strokeRate', unit: 'SPM' },
  { value: 'distancePerStroke', label: 'Distance/Stroke', y: 'distancePerStroke', unit: 'm' },
];
