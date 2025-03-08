/* eslint-disable import/no-extraneous-dependencies */
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ScatterController
} from 'chart.js';
/* eslint-enable import/no-extraneous-dependencies */

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

// Configure global defaults
ChartJS.defaults.font.family = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#666';

// Export the Chart instance for potential future use
export default ChartJS; 

