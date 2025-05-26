import React from 'react';
//import { format } from 'date-fns';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsCardProps {
  title: string;
  data: any;
  type: 'doughnut' | 'bar';
  height?: number;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  data, 
  type,
  height = 200
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        {type === 'doughnut' ? (
          <Doughnut data={data} options={{ maintainAspectRatio: false }} />
        ) : (
          <Bar data={data} options={{ maintainAspectRatio: false }} />
        )}
      </div>
    </div>
  );
};

export default AnalyticsCard;