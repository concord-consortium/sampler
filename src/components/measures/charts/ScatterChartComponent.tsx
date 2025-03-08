/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Scatter } from 'react-chartjs-2';
/* eslint-enable import/no-extraneous-dependencies */
import { ChartComponentProps } from './ChartTypes';

/**
 * Scatter Chart Component
 * 
 * Renders a scatter chart using Chart.js with the provided data.
 * Note: Scatter charts don't support stacked or normalized formats.
 */
export const ScatterChartComponent: React.FC<ChartComponentProps> = ({ 
  data, 
  options = {} 
}) => {
  // Merge default options with provided options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      },
      y: {
        beginAtZero: true
      }
    },
    ...options
  };

  return (
    <div className="chart-container">
      <Scatter data={data} options={chartOptions} />
    </div>
  );
}; 
