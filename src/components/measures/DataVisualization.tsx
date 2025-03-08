import React, { useState, useEffect, useMemo } from "react";
import { ChartFactory } from "./charts/ChartFactory";
import { transformDataForChartJs, transformDataForScatterPlot } from "./charts/ChartDataUtils";
import { VisualizationType, DataFormat, ChartDataset } from "./charts/ChartTypes";
import "./measures.scss";
/* eslint-disable import/no-extraneous-dependencies */
import "./charts/ChartRegistry";
/* eslint-enable import/no-extraneous-dependencies */

interface DataVisualizationProps {
  // This would be replaced with actual data types from your application
  data?: any;
}

/**
 * Component for visualizing data in the Measures tab
 * Provides options for different chart types and data formats
 */
export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>("bar");
  const [dataFormat, setDataFormat] = useState<DataFormat>("grouped");
  const [chartData, setChartData] = useState<ChartDataset | null>(null);

  // Sample data for demonstration, wrapped in useMemo to avoid dependency changes on every render
  const sampleData = useMemo(() => [
    { category: "Category A", series: "Series 1", value: 65 },
    { category: "Category B", series: "Series 1", value: 59 },
    { category: "Category C", series: "Series 1", value: 80 },
    { category: "Category D", series: "Series 1", value: 81 },
    { category: "Category E", series: "Series 1", value: 56 },
    { category: "Category A", series: "Series 2", value: 28 },
    { category: "Category B", series: "Series 2", value: 48 },
    { category: "Category C", series: "Series 2", value: 40 },
    { category: "Category D", series: "Series 2", value: 19 },
    { category: "Category E", series: "Series 2", value: 86 },
    { category: "Category A", series: "Series 3", value: 28 },
    { category: "Category B", series: "Series 3", value: 48 },
    { category: "Category C", series: "Series 3", value: 40 },
    { category: "Category D", series: "Series 3", value: 19 },
    { category: "Category E", series: "Series 3", value: 96 },
  ], []);

  // Sample data for scatter plot, wrapped in useMemo to avoid dependency changes on every render
  const sampleScatterData = useMemo(() => [
    { series: "Series 1", x: 12, y: 19 },
    { series: "Series 1", x: 5, y: 25 },
    { series: "Series 1", x: 8, y: 17 },
    { series: "Series 1", x: 15, y: 14 },
    { series: "Series 1", x: 3, y: 22 },
    { series: "Series 2", x: 7, y: 11 },
    { series: "Series 2", x: 14, y: 8 },
    { series: "Series 2", x: 10, y: 15 },
    { series: "Series 2", x: 6, y: 19 },
    { series: "Series 2", x: 12, y: 5 },
    { series: "Series 3", x: 65, y: 75 },
    { series: "Series 3", x: 59, y: 49 },
    { series: "Series 3", x: 80, y: 90 },
    { series: "Series 3", x: 81, y: 29 },
    { series: "Series 3", x: 56, y: 36 },
    { series: "Series 3", x: 55, y: 25 },
    { series: "Series 3", x: 40, y: 18 },
    { series: "Series 3", x: 45, y: 20 },
    { series: "Series 3", x: 60, y: 15 },
    { series: "Series 3", x: 70, y: 10 },
    { series: "Series 3", x: 10, y: 50 },
    { series: "Series 3", x: 20, y: 40 },
    { series: "Series 3", x: 30, y: 30 },
    { series: "Series 3", x: 40, y: 20 },
    { series: "Series 3", x: 50, y: 10 },
  ], []);

  // Update chart data when visualization type or data changes
  useEffect(() => {
    if (visualizationType === 'scatter') {
      setChartData(transformDataForScatterPlot(data || sampleScatterData));
    } else {
      setChartData(transformDataForChartJs(data || sampleData));
    }
  }, [visualizationType, data, sampleData, sampleScatterData]);

  const handleVisualizationTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizationType(e.target.value as VisualizationType);
  };

  const handleDataFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataFormat(e.target.value as DataFormat);
  };

  const handleApplyFormat = () => {
    // Log the action for demonstration purposes
    console.log(`Formatting data as ${dataFormat} for ${visualizationType} chart`);
    
    // The actual formatting is handled by the chart components
    // This button is mainly for user feedback
  };

  return (
    <div className="data-visualization-section">
      <h3>Data Visualization</h3>
      
      <div className="visualization-controls">
        <div className="control-group">
          <label>Visualization Type:</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="visualizationType" 
                value="bar" 
                checked={visualizationType === "bar"} 
                onChange={handleVisualizationTypeChange} 
              />
              Bar Chart
            </label>
            <label>
              <input 
                type="radio" 
                name="visualizationType" 
                value="line" 
                checked={visualizationType === "line"} 
                onChange={handleVisualizationTypeChange} 
              />
              Line Chart
            </label>
            <label>
              <input 
                type="radio" 
                name="visualizationType" 
                value="scatter" 
                checked={visualizationType === "scatter"} 
                onChange={handleVisualizationTypeChange} 
              />
              Scatter Plot
            </label>
          </div>
        </div>
        
        {visualizationType !== 'scatter' && (
          <div className="control-group">
            <label>Data Format:</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="dataFormat" 
                  value="grouped" 
                  checked={dataFormat === "grouped"} 
                  onChange={handleDataFormatChange} 
                />
                Grouped
              </label>
              <label>
                <input 
                  type="radio" 
                  name="dataFormat" 
                  value="stacked" 
                  checked={dataFormat === "stacked"} 
                  onChange={handleDataFormatChange} 
                />
                Stacked
              </label>
              <label>
                <input 
                  type="radio" 
                  name="dataFormat" 
                  value="normalized" 
                  checked={dataFormat === "normalized"} 
                  onChange={handleDataFormatChange} 
                />
                Normalized (100%)
              </label>
            </div>
            
            <button 
              className="format-button" 
              onClick={handleApplyFormat}
            >
              Apply Format
            </button>
          </div>
        )}
      </div>
      
      <div className="responsive-container" data-testid="visualization-container">
        {chartData ? (
          <ChartFactory 
            type={visualizationType} 
            data={chartData} 
            dataFormat={dataFormat} 
          />
        ) : (
          <div className="visualization-placeholder">
            <div className="placeholder-text">
              Select visualization options and data to display a chart
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
