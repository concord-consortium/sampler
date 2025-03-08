import React from 'react';
import { ChartFactoryProps } from './ChartTypes';
import { BarChartComponent } from './BarChartComponent';
import { LineChartComponent } from './LineChartComponent';
import { ScatterChartComponent } from './ScatterChartComponent';

/**
 * Chart Factory Component
 * 
 * Renders the appropriate chart type based on the type prop.
 */
export const ChartFactory: React.FC<ChartFactoryProps> = ({ 
  type, 
  data, 
  dataFormat = 'grouped',
  options 
}) => {
  switch (type) {
    case 'bar':
      return <BarChartComponent data={data} dataFormat={dataFormat} options={options} />;
    case 'line':
      return <LineChartComponent data={data} dataFormat={dataFormat} options={options} />;
    case 'scatter':
      return <ScatterChartComponent data={data} options={options} />;
    default:
      // Default to bar chart if type is not recognized
      return <BarChartComponent data={data} dataFormat={dataFormat} options={options} />;
  }
}; 
