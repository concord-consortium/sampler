import { ChartDataset } from './ChartTypes';

// Interface for data items that can be transformed
interface DataItem {
  category?: string;
  label?: string;
  series?: string;
  value?: number;
  x?: number;
  y?: number;
  [key: string]: any;
}

/**
 * Generates a random color with the specified opacity
 * 
 * @param opacity - The opacity value (0-1)
 * @returns A CSS rgba color string
 */
export const getRandomColor = (opacity = 0.5): string => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Transforms data into a format suitable for Chart.js
 * 
 * @param data - Array of data items
 * @returns Formatted data for Chart.js
 */
export const transformDataForChartJs = (data: DataItem[]): ChartDataset => {
  // Extract unique categories and series
  const categories = Array.from(new Set(data.map(item => item.category || '')))
    .filter(category => category !== '');
  
  const seriesNames = Array.from(new Set(data.map(item => item.series || '')))
    .filter(seriesName => seriesName !== '');
  
  // If no series is specified, create a default one
  if (seriesNames.length === 0) {
    // Group by category and calculate values
    const defaultDatasets = [{
      label: 'Values',
      data: categories.map(category => {
        const categoryItems = data.filter(item => item.category === category);
        return categoryItems.reduce((sum, item) => sum + (item.value || 0), 0);
      }),
      backgroundColor: getRandomColor(0.5),
      borderColor: getRandomColor(1),
      borderWidth: 1
    }];
    
    return {
      labels: categories,
      datasets: defaultDatasets
    };
  }
  
  // Create datasets for each series
  const datasets = seriesNames.map(seriesName => {
    return {
      label: seriesName,
      data: categories.map(category => {
        const matchingItems = data.filter(
          item => item.category === category && item.series === seriesName
        );
        return matchingItems.reduce((sum, item) => sum + (item.value || 0), 0);
      }),
      backgroundColor: getRandomColor(0.5),
      borderColor: getRandomColor(1),
      borderWidth: 1
    };
  });
  
  return {
    labels: categories,
    datasets
  };
};

/**
 * Transforms data into a format suitable for scatter plots
 * 
 * @param data - Array of data items with x and y values
 * @returns Formatted data for Chart.js scatter plot
 */
export const transformDataForScatterPlot = (data: DataItem[]): ChartDataset => {
  // Extract unique series
  const seriesNames = Array.from(new Set(data.map(item => item.series || '')))
    .filter(seriesName => seriesName !== '');
  
  // If no series is specified, create a default one
  if (seriesNames.length === 0) {
    const defaultDatasets = [{
      label: 'Points',
      data: data.map(item => ({
        x: item.x || 0,
        y: item.y || 0
      })),
      backgroundColor: getRandomColor(0.5),
      borderColor: getRandomColor(1),
      borderWidth: 1
    }];
    
    return {
      labels: [],
      datasets: defaultDatasets
    };
  }
  
  // Create datasets for each series
  const datasets = seriesNames.map(seriesName => {
    const seriesData = data
      .filter(item => item.series === seriesName)
      .map(item => ({
        x: item.x || 0,
        y: item.y || 0
      }));
    
    return {
      label: seriesName,
      data: seriesData,
      backgroundColor: getRandomColor(0.5),
      borderColor: getRandomColor(1),
      borderWidth: 1
    };
  });
  
  return {
    labels: [],
    datasets
  };
}; 
