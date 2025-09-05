import React from "react";
import ReactApexChart from "react-apexcharts";

const TicketChart: React.FC = () => {
  const options = {
    series: [
      { name: 'Total Tickets', type: 'column', data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30] }, 
      { name: 'Resolved Tickets', type: 'area', data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43] }, 
      { name: 'Pending Tickets', type: 'line', data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39] }
    ],
    chart: { 
      height: 400, 
      type: 'line', 
      stacked: false,
      width: '100%',
      toolbar: { 
        show: true, 
        tools: { 
          download: true, 
          selection: false, 
          zoom: false, 
          zoomin: false, 
          zoomout: false, 
          pan: false, 
          reset: false 
        } 
      } 
    },
    stroke: { width: [0, 2, 5], curve: 'smooth' },
    plotOptions: { bar: { columnWidth: '50%' } },
    fill: { 
      opacity: [0.85, 0.25, 1], 
      gradient: { 
        inverseColors: false, 
        shade: 'light', 
        type: "vertical", 
        opacityFrom: 0.85, 
        opacityTo: 0.55, 
        stops: [0, 100, 100, 100] 
      } 
    },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    markers: { size: 0 },
    xaxis: { 
      type: 'category', 
      labels: { style: { colors: '#6b7280' } } 
    },
    yaxis: { 
      title: { 
        text: 'Number of Tickets', 
        style: { color: '#6b7280' } 
      }, 
      labels: { style: { colors: '#6b7280' } } 
    },
    tooltip: { 
      shared: true, 
      intersect: false, 
      theme: 'light', 
      y: { 
        formatter: function (y: number) { 
          if (typeof y !== "undefined") { 
            return y.toFixed(0) + " tickets"; 
          } 
          return y; 
        } 
      } 
    },
    legend: { 
      position: 'top', 
      horizontalAlign: 'left', 
      labels: { colors: '#6b7280' } 
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b']
  };

  return (
    <div id="chart" className="w-full overflow-hidden">
      <ReactApexChart 
        options={options} 
        series={options.series} 
        type="line" 
        height={400} 
        width="100%"
      />
    </div>
  );
};

export default TicketChart;
