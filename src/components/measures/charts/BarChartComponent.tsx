/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Bar } from 'react-chartjs-2';
/* eslint-enable import/no-extraneous-dependencies */
import { ChartComponentProps } from './ChartTypes';

/**
 * Bar Chart Component
 * 
 * Renders a bar chart using Chart.js with the provided data.
 * Supports different data formats: grouped, stacked, or normalized.
 */
export const BarChartComponent: React.FC<ChartComponentProps> = ({ 
  data, 
  dataFormat = 'grouped',
  options = {} 
}) => {
  // Merge default options with provided options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: dataFormat === 'stacked' || dataFormat === 'normalized',
      },
      y: {
        stacked: dataFormat === 'stacked' || dataFormat === 'normalized',
        // For normalized charts, set the max value to 100%
        max: dataFormat === 'normalized' ? 100 : undefined,
      },
    },
    ...options
  };

  // If using normalized format, convert the data to percentages
  let chartData = { ...data };
  if (dataFormat === 'normalized' && data.datasets) {
    // Calculate the total for each data point across all datasets
    const totals = data.datasets[0].data.map((_: any, i: number) => 
      data.datasets.reduce((sum, dataset) => sum + (dataset.data[i] as number), 0)
    );

    // Convert each value to a percentage of the total
    chartData.datasets = data.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.map((value: any, i: number) => 
        totals[i] ? ((value as number) / totals[i]) * 100 : 0
      )
    }));
  }

  return (
    <div className="chart-container">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}; 
