import React from "react";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Ticket,
  FileText,
  Calendar,
} from "lucide-react";
import ReactApexChart from "react-apexcharts";
import TicketChart from "./TicketChart";
import PriorityDistribution from "./PriorityDistribution";
import RecentTickets from "./RecentTickets";

const Dashboard: React.FC = () => {
  // State for window resize handling
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mock data for technical support metrics
  const metrics = [
    {
      title: "First Response Time",
      value: "1.8 hrs",
      change: "Target: <2 hrs",
      trend: "up",
      icon: MessageSquare,
      color: "bg-green-500",
      chartData: [2.1, 1.9, 2.3, 1.7, 1.8, 1.6, 1.9, 2.0, 1.8, 1.7, 1.9, 1.8],
    },
    {
      title: "Avg. Resolution Time",
      value: "4.2 hrs",
      change: "Industry Standard: 4-6 hrs",
      trend: "down",
      icon: Clock,
      color: "bg-orange-500",
      chartData: [4.5, 4.1, 4.8, 4.0, 4.3, 3.9, 4.2, 4.4, 4.1, 3.8, 4.0, 4.3],
    },
    {
      title: "Resolution Rate",
      value: "94.2%",
      change: "Target: >90%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-purple-500",
      chartData: [92, 93, 94, 95, 94, 96, 95, 94, 95, 96, 94, 95],
    },
    {
      title: "SLA Compliance",
      value: "96.8%",
      change: "Target: >95%",
      trend: "up",
      icon: Users,
      color: "bg-red-500",
      chartData: [95, 96, 97, 96, 97, 98, 97, 96, 97, 98, 97, 96],
    },
  ];

  // Chat state
  const [chatOpen, setChatOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<
    Array<{
      id: string;
      text: string;
      sender: "user" | "support";
      timestamp: Date;
    }>
  >([]);
  const [inputMessage, setInputMessage] = React.useState("");

  // Function to handle sending messages
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputMessage.trim(),
        sender: "user" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");

      // Simulate support response after 2 seconds
      setTimeout(() => {
        const supportResponse = {
          id: (Date.now() + 1).toString(),
          text: `Thank you for your message: "${newMessage.text}". A support agent will respond shortly.`,
          sender: "support" as const,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, supportResponse]);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage support tickets efficiently
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full overflow-hidden">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                <metric.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1.5" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {metric.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
            {/* Chart */}
            <div className="mt-3 h-8 rounded-lg p-2">
              <ReactApexChart
                key={`${metric.title}-${windowWidth}`}
                options={{
                  chart: {
                    type: "area",
                    height: 24,
                    width: "100%",
                    sparkline: { enabled: true },
                    toolbar: { show: false },
                    background: "transparent",
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: "smooth", width: 2, colors: ["#3B82F6"] },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.05,
                      stops: [0, 100],
                      colorStops: [
                        { offset: 0, color: "#3B82F6", opacity: 0.4 },
                        { offset: 100, color: "#3B82F6", opacity: 0.05 },
                      ],
                    },
                  },
                  colors: ["#3B82F6"],
                  tooltip: { enabled: false },
                  grid: { show: false },
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { labels: { show: false } },
                  markers: {
                    size: 0,
                    colors: ["#3B82F6"],
                    strokeColors: "#3B82F6",
                    strokeWidth: 2,
                    hover: { size: 4 },
                  },
                }}
                series={[
                  {
                    name: metric.title,
                    data: metric.chartData,
                  },
                ]}
                type="area"
                height={24}
                width="100%"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 w-full overflow-hidden">
        {/* Monthly Tickets Chart */}
        <div className="xl:col-span-2">
          <div className="card p-6 h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Ticket Volume
              </h3>
            </div>
            <TicketChart />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="xl:col-span-1">
          <div className="card p-6 h-full">
            <PriorityDistribution />
          </div>
        </div>
      </div>

      {/* Monthly Ticket Performance and IT Support Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Monthly Ticket Performance */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Ticket Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Overview of the ticket volume for the current month
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-full">
                Current Month
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Tickets */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Today's Tickets
              </h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                47
              </p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +15.2%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs yesterday
                </span>
              </div>
            </div>

            {/* This Week's Tickets */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                This Week's Tickets
              </h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                312
              </p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +8.7%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs last week
                </span>
              </div>
            </div>

            {/* This Month's Tickets */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                This Month's Tickets
              </h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                1,247
              </p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +12.5%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resolution Rate
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                87.3%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: "87.3%" }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Ticket Status Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Current Month Ticket Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Open Tickets */}
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  156
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Open</p>
              </div>

              {/* In Progress */}
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  89
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
              </div>

              {/* Resolved */}
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  1,089
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Resolved
                </p>
              </div>

              {/* Total */}
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  1,334
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* IT Support Directory */}
        <div className="lg:col-span-1 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            IT Support Directory
          </h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Chat Status
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Row 1 */}
                <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        JS
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          John Smith
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          john.smith@company.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Online
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        MJ
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Maria Johnson
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          maria.johnson@company.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Away
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        DW
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          David Wilson
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          david.wilson@company.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Do Not Disturb
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tickets
          </h3>
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            View All
          </button>
        </div>
        <RecentTickets />
      </div>

      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        {/* Chat Interface */}
        {chatOpen && (
          <div className="absolute bottom-20 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Live Support</h3>
                  <p className="text-blue-100 text-sm">
                    Online • Responds in 2 min
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:text-blue-100 transition-colors p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start a conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.sender === "support" && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                          S
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 max-w-xs ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                          M
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
