import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, width = 80, height = 30 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * stepX;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine trend color
  const first = data[0];
  const last = data[data.length - 1];
  const color = last > first ? '#ef4444' : last < first ? '#0055aa' : '#999999';

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Circle at the end point */}
      <circle
        cx={width}
        cy={height - ((last - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  );
};
