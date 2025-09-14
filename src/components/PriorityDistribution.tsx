
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../contexts/ThemeContext";

const PriorityDistribution: React.FC = () => {
  const { isDark } = useTheme();
  const [chartData, setChartData] = useState([35.1, 23.5, 2.4, 5.4, 8.2]);
  const [checkedDevices, setCheckedDevices] = useState<string[]>([]);

  const getChartOptions = () => {
    return {
      series: chartData,
      colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694", "#F59E0B"],
    chart: { 
        height: 320,
        width: "100%",
        type: "donut" as const,
      },
      stroke: {
        colors: ["transparent"],
        lineCap: "round" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
                color: isDark ? "#ffffff" : "#1f2937", // White for dark mode, dark for light mode
              },
            total: {
                showAlways: true,
                show: true,
                label: "Total Tickets",
                fontFamily: "Inter, sans-serif",
                color: isDark ? "#ffffff" : "#1f2937", // White for dark mode, dark for light mode
                formatter: function (w: any) {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
                    return a + b
                  }, 0)
                  return Math.round(sum) + ' tickets'
                },
              },
              value: {
              show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                color: isDark ? "#ffffff" : "#1f2937", // White for dark mode, dark for light mode
                formatter: function (val: string) {
                  return Math.round(Number(val)) + " tickets"
                },
              },
            },
            size: "60%",
            },
          },
        },
      grid: {
        padding: {
          top: -2,
        },
      },
      labels: ["High Priority", "Medium Priority", "Low Priority", "Critical", "Urgent"],
        dataLabels: {
        enabled: false,
      },
    legend: {
        position: "bottom" as const,
        fontFamily: "Inter, sans-serif",
        labels: {
          colors: isDark ? "#ffffff" : "#1f2937", // White for dark mode, dark for light mode
        },
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return Math.round(value) + " tickets"
          },
        },
      },
      xaxis: {
          labels: {
          formatter: function (value: string) {
            return Math.round(Number(value)) + " tickets"
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checkbox = event.target;
    if (checkbox.checked) {
      setCheckedDevices(prev => [...prev, checkbox.value]);
      switch(checkbox.value) {
        case 'desktop':
          setChartData([15.1, 22.5, 4.4, 8.4, 12.3]);
          break;
        case 'all-in-one':
          setChartData([25.1, 26.5, 1.4, 3.4, 7.8]);
          break;
        case 'laptop':
          setChartData([45.1, 27.5, 8.4, 2.4, 15.2]);
          break;
        case 'server':
          setChartData([55.1, 28.5, 1.4, 5.4, 9.7]);
          break;
        case 'mobile':
          setChartData([35.1, 23.5, 2.4, 5.4, 8.2]);
          break;
        case 'other':
          setChartData([20.1, 30.5, 3.4, 4.4, 6.9]);
          break;
        default:
          setChartData([35.1, 23.5, 2.4, 5.4, 8.2]);
      }
    } else {
      setCheckedDevices(prev => prev.filter(device => device !== checkbox.value));
      setChartData([35.1, 23.5, 2.4, 5.4, 8.2]);
    }
  };

  return (
    <>
      {/* Chart Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ticket Priority Distribution
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Priority Categories
        </span>
      </div>


      {/* Device Filter Checkboxes */}
      <div>
        <div className="flex flex-wrap gap-2" id="devices">
          <div className="flex items-center">
            <input 
              id="desktop" 
              type="checkbox" 
              value="desktop" 
              checked={checkedDevices.includes('desktop')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="desktop" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Desktop</label>
          </div>
          <div className="flex items-center">
            <input 
              id="all-in-one" 
              type="checkbox" 
              value="all-in-one" 
              checked={checkedDevices.includes('all-in-one')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="all-in-one" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">All in One</label>
          </div>
          <div className="flex items-center">
            <input 
              id="laptop" 
              type="checkbox" 
              value="laptop" 
              checked={checkedDevices.includes('laptop')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="laptop" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Laptop</label>
          </div>
          <div className="flex items-center">
            <input 
              id="server" 
              type="checkbox" 
              value="server" 
              checked={checkedDevices.includes('server')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="server" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Server</label>
          </div>
          <div className="flex items-center">
            <input 
              id="mobile" 
              type="checkbox" 
              value="mobile" 
              checked={checkedDevices.includes('mobile')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="mobile" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mobile</label>
          </div>
          <div className="flex items-center">
            <input 
              id="other" 
              type="checkbox" 
              value="other" 
              checked={checkedDevices.includes('other')}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="other" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Other</label>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="py-6" id="donut-chart">
      <ReactApexChart 
          options={getChartOptions()} 
          series={chartData} 
        type="donut" 
          height={320} 
      />
    </div>
    </>
  );
};

export default PriorityDistribution;
