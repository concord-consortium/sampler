import { ChartData, ChartOptions } from 'chart.js';

// Types of visualizations supported
export type VisualizationType = 'bar' | 'line' | 'scatter';

// Data format options for charts
export type DataFormat = 'grouped' | 'stacked' | 'normalized';

// Props for chart components
export interface ChartComponentProps {
  data: ChartData<any>;
  dataFormat?: DataFormat;
  options?: ChartOptions<any>;
}

// Props for the chart factory component
export interface ChartFactoryProps extends ChartComponentProps {
  type: VisualizationType;
}

// Data point for scatter plots
export interface DataPoint {
  x: number | string;
  y: number;
}

// Dataset for charts
export interface Dataset {
  label: string;
  data: number[] | DataPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Chart dataset structure
export interface ChartDataset {
  labels: string[];
  datasets: Dataset[];
} 
