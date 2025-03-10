import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BarChartComponent } from './BarChartComponent';
import { LineChartComponent } from './LineChartComponent';
import { ScatterChartComponent } from './ScatterChartComponent';
import { ChartFactory } from './ChartFactory';

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Bar: (props: any) => <div data-testid="bar-chart" data-props={JSON.stringify(props)} />,
  Line: (props: any) => <div data-testid="line-chart" data-props={JSON.stringify(props)} />,
  Scatter: (props: any) => <div data-testid="scatter-chart" data-props={JSON.stringify(props)} />
}));

describe('Chart Components', () => {
  const sampleData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      },
      {
        label: 'Dataset 2',
        data: [7, 11, 5, 8, 3, 7],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }
    ]
  };

  describe('BarChartComponent', () => {
    it('should render a bar chart with provided data', () => {
      render(<BarChartComponent data={sampleData} />);
      
      const chart = screen.getByTestId('bar-chart');
      expect(chart).toBeInTheDocument();
      
      const props = JSON.parse(chart.getAttribute('data-props') || '{}');
      expect(props.data).toEqual(sampleData);
    });

    it('should apply the correct options based on data format', () => {
      render(<BarChartComponent data={sampleData} dataFormat="stacked" />);
      
      const chart = screen.getByTestId('bar-chart');
      const props = JSON.parse(chart.getAttribute('data-props') || '{}');
      
      // Check that stacked option is applied
      expect(props.options.scales.x.stacked).toBe(true);
      expect(props.options.scales.y.stacked).toBe(true);
    });
  });

  describe('LineChartComponent', () => {
    it('should render a line chart with provided data', () => {
      render(<LineChartComponent data={sampleData} />);
      
      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
      
      const props = JSON.parse(chart.getAttribute('data-props') || '{}');
      expect(props.data).toEqual(sampleData);
    });
  });

  describe('ScatterChartComponent', () => {
    it('should render a scatter chart with provided data', () => {
      render(<ScatterChartComponent data={sampleData} />);
      
      const chart = screen.getByTestId('scatter-chart');
      expect(chart).toBeInTheDocument();
      
      const props = JSON.parse(chart.getAttribute('data-props') || '{}');
      expect(props.data).toEqual(sampleData);
    });
  });

  describe('ChartFactory', () => {
    it('should render the correct chart type based on the type prop', () => {
      const { rerender } = render(
        <ChartFactory type="bar" data={sampleData} dataFormat="grouped" />
      );
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      
      rerender(<ChartFactory type="line" data={sampleData} dataFormat="grouped" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      rerender(<ChartFactory type="scatter" data={sampleData} dataFormat="grouped" />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });
}); 
