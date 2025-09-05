import React from "react";

const RecentTickets: React.FC = () => {
  const tickets = [
    {
      id: "TKT-001",
      title: "Cannot access email account",
      customer: "John Smith",
      email: "john.smith@company.com",
      severity: "High",
      status: "Open",
      category: "Email Issues",
      created: "2024-01-15",
      lastUpdate: "1 hour ago",
      assignee: "Sarah Johnson",
    },
    {
      id: "TKT-002",
      title: "Software installation failed",
      customer: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      severity: "Normal",
      status: "In Progress",
      category: "Software",
      created: "2024-01-14",
      lastUpdate: "2 hours ago",
      assignee: "Mike Davis",
    },
    {
      id: "TKT-003",
      title: "Network connectivity problems",
      customer: "Mike Davis",
      email: "mike.davis@company.com",
      severity: "Critical",
      status: "Open",
      category: "Network",
      created: "2024-01-14",
      lastUpdate: "6 hours ago",
      assignee: "Unassigned",
    },
    {
      id: "TKT-004",
      title: "Password reset request",
      customer: "Lisa Wilson",
      email: "lisa.wilson@company.com",
      severity: "Low",
      status: "Resolved",
      category: "Account Access",
      created: "2024-01-13",
      lastUpdate: "1 day ago",
      assignee: "Alex Chen",
    },
    {
      id: "TKT-005",
      title: "Printer not working",
      customer: "David Brown",
      email: "david.brown@company.com",
      severity: "Normal",
      status: "In Progress",
      category: "Hardware",
      created: "2024-01-13",
      lastUpdate: "12 hours ago",
      assignee: "Tom Wilson",
    },
  ];

  const getSeverityRating = (severity: string) => {
    switch (severity) {
      case "Critical":
        return { 
          value: 5, 
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          tooltip: "🚨 Highest severity, immediate attention"
        };
      case "Urgent":
        return { 
          value: 4, 
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          tooltip: "🔴 Very high priority, near-critical"
        };
      case "High":
        return { 
          value: 3, 
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
          tooltip: "🟠 Important, but not urgent"
        };
      case "Normal":
        return { 
          value: 2, 
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
          tooltip: "🟡 Standard issue, moderate impact"
        };
      case "Low":
        return { 
          value: 1, 
          color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
          tooltip: "🟢 Minor issue, low impact"
        };
      default:
        return { 
          value: 0, 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
          tooltip: "Unknown severity"
        };
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "Open":
        return { 
          progress: 10, 
          color: "bg-orange-500", 
          textColor: "text-orange-600 dark:text-orange-400",
          tooltip: "Ticket created, not yet worked on"
        };
      case "Pending":
        return { 
          progress: 25, 
          color: "bg-yellow-500", 
          textColor: "text-yellow-600 dark:text-yellow-400",
          tooltip: "Waiting for customer or initial review"
        };
      case "In Progress":
        return { 
          progress: 50, 
          color: "bg-blue-500", 
          textColor: "text-blue-600 dark:text-blue-400",
          tooltip: "Actively being worked on"
        };
      case "On Hold":
        return { 
          progress: 60, 
          color: "bg-purple-500", 
          textColor: "text-purple-600 dark:text-purple-400",
          tooltip: "Temporarily paused, waiting for 3rd party or user"
        };
      case "Escalated":
        return { 
          progress: 75, 
          color: "bg-red-500", 
          textColor: "text-red-600 dark:text-red-400",
          tooltip: "Moved to higher support level"
        };
      case "Resolved":
        return { 
          progress: 90, 
          color: "bg-green-500", 
          textColor: "text-green-600 dark:text-green-400",
          tooltip: "Issue fixed, awaiting confirmation"
        };
      case "Closed":
        return { 
          progress: 100, 
          color: "bg-gray-500", 
          textColor: "text-gray-600 dark:text-gray-400",
          tooltip: "Ticket officially completed"
        };
      case "Cancelled":
        return { 
          progress: 0, 
          color: "bg-gray-300", 
          textColor: "text-gray-500 dark:text-gray-500",
          tooltip: "Ticket invalid or withdrawn"
        };
      default:
        return { 
          progress: 0, 
          color: "bg-gray-300", 
          textColor: "text-gray-500 dark:text-gray-500",
          tooltip: "Unknown status"
        };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse border border-gray-300 dark:border-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-300 dark:border-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Ticket
            </th>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Requestor
            </th>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Severity
            </th>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
              Assignee
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Last Update
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white border-r border-gray-300 dark:border-gray-600">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {ticket.id}
                  </div>
                </div>
              </th>
              <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                <div className="group relative flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {ticket.customer.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="text-center">
                      <div className="font-medium">{ticket.customer}</div>
                      <div className="text-gray-300 dark:text-gray-600">{ticket.email}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                <div className="w-full group relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${getStatusProgress(ticket.status).textColor}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-xs font-medium ${getStatusProgress(ticket.status).textColor}`}>
                      {getStatusProgress(ticket.status).progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusProgress(ticket.status).color}`}
                      style={{ width: `${getStatusProgress(ticket.status).progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    {getStatusProgress(ticket.status).tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                <div className="group relative">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, index) => {
                        const severityData = getSeverityRating(ticket.severity);
                        const isFilled = index < severityData.value;
                        let starColor = '';
                        
                        if (isFilled) {
                          // Apply severity-specific colors for filled stars
                          switch (ticket.severity) {
                            case 'Critical':
                              starColor = 'text-red-500 fill-current';
                              break;
                            case 'Urgent':
                              starColor = 'text-red-500 fill-current';
                              break;
                            case 'High':
                              starColor = 'text-orange-500 fill-current';
                              break;
                            case 'Normal':
                              starColor = 'text-yellow-500 fill-current';
                              break;
                            case 'Low':
                              starColor = 'text-green-500 fill-current';
                              break;
                            default:
                              starColor = 'text-gray-500 fill-current';
                          }
                        } else {
                          starColor = 'text-gray-300 dark:text-gray-600';
                        }
                        
                        return (
                          <svg
                            key={index}
                            className={`w-4 h-4 ${starColor}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    {getSeverityRating(ticket.severity).tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                {ticket.category}
              </td>
              <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                <div className="group relative flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {ticket.assignee === "Unassigned" ? "U" : ticket.assignee.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="text-center">
                      <div className="font-medium">{ticket.assignee}</div>
                      <div className="text-gray-300 dark:text-gray-600">
                        {ticket.assignee === "Unassigned" ? "No assignee" : `${ticket.assignee.toLowerCase().replace(' ', '.')}@company.com`}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {ticket.lastUpdate}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTickets;
