import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const TicketGallery: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus] = useState("all");
  const [selectedPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // Load Leaflet and initialize Southeast Asia map
  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    document.head.appendChild(script);

    script.onload = () => {
      if (window.L) {
        // Initialize map
        const map = window.L.map('leaflet_map', { zoomControl: true });

        // Use light theme by default (as shown in the image)
        const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OSM & CARTO',
          maxZoom: 20
        });

        tileLayer.addTo(map);

        // Focused bounds for Philippines, Indonesia, Singapore
        const seaBounds = window.L.latLngBounds(
          [-8.0, 95.0],   // southwest corner (focused on the 3 countries)
          [16.0, 125.0]   // northeast corner
        );

        // Fit to Southeast Asia
        map.fitBounds(seaBounds);

        // Add only 3 countries: Philippines, Indonesia, Singapore
        const countries = [
          { name: 'Philippines', capital: 'Manila', latlng: [14.5995, 120.9842] },
          { name: 'Indonesia', capital: 'Jakarta', latlng: [-6.2088, 106.8456] },
          { name: 'Singapore', capital: 'Singapore', latlng: [1.3521, 103.8198] }
        ];

        countries.forEach(country => {
          const marker = window.L.circleMarker(country.latlng, {
            radius: 10,
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
            color: '#f97316', // Orange color as shown in the image
            fillColor: '#f97316'
          }).addTo(map);

          marker.bindPopup(`
            <div style="
              text-align: center; 
              padding: 12px; 
              background: #ffffff; 
              color: #1f2937; 
              border-radius: 8px; 
              border: 1px solid #e5e7eb;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            ">
              <strong style="font-size: 16px; color: #f97316;">${country.name}</strong><br/>
              <small style="color: #6b7280;">Capital: ${country.capital}</small>
            </div>
          `);
        });

        // Store map instance for cleanup
        (window as any).ticketMap = map;
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if ((window as any).ticketMap) {
        (window as any).ticketMap.remove();
        delete (window as any).ticketMap;
      }
    };
  }, [isDark]); // Re-run when theme changes

  // Mock ticket data
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
      lastUpdate: "2 hours ago",
      assignee: "Sarah Johnson",
      description: "User is unable to log into their email account. Getting authentication error.",
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
      lastUpdate: "1 hour ago",
      assignee: "Mike Davis",
      description: "Office 365 installation keeps failing with error code 0x80070005.",
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
      lastUpdate: "30 minutes ago",
      assignee: "Unassigned",
      description: "Complete network outage in the marketing department. No internet access.",
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
      description: "User forgot their password and needs it reset.",
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
      lastUpdate: "3 hours ago",
      assignee: "Tom Wilson",
      description: "HP LaserJet printer in office 205 is not responding to print jobs.",
    },
    {
      id: "TKT-006",
      title: "VPN connection issues",
      customer: "Emma Taylor",
      email: "emma.taylor@company.com",
      severity: "Urgent",
      status: "Open",
      category: "Network",
      created: "2024-01-12",
      lastUpdate: "4 hours ago",
      assignee: "Unassigned",
      description: "Cannot connect to company VPN from home office.",
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


  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesSeverity = selectedPriority === "all" || ticket.severity === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, rowsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ticket Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all support tickets
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {tickets.filter(t => t.status === "Open").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tickets.filter(t => t.status === "In Progress").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tickets.filter(t => t.status === "Resolved").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Southeast Asia Map */}
      <div className="card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Southeast Asia Map (All Countries with Tooltips)
          </h3>
        </div>
        <div id="leaflet_map" style={{ width: '100%', height: '600px', borderRadius: '8px' }}></div>
      </div>

      {/* Enhanced Tickets Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          <div>
            <button 
              id="dropdownRadioButton" 
              data-dropdown-toggle="dropdownRadio" 
              className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" 
              type="button"
            >
              <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
              </svg>
              Last 30 days
              <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            {/* Dropdown menu */}
            <div id="dropdownRadio" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
              <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioButton">
                <li>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input id="filter-radio-example-1" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="filter-radio-example-1" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last day</label>
                  </div>
                </li>
                <li>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input defaultChecked id="filter-radio-example-2" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="filter-radio-example-2" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 7 days</label>
                  </div>
                </li>
                <li>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input id="filter-radio-example-3" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="filter-radio-example-3" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 30 days</label>
                  </div>
                </li>
                <li>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input id="filter-radio-example-4" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="filter-radio-example-4" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last month</label>
                  </div>
                </li>
                <li>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input id="filter-radio-example-5" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="filter-radio-example-5" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last year</label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input 
              type="text" 
              id="table-search" 
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              placeholder="Search for tickets"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
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
              <th scope="col" className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((ticket) => (
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
                <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {ticket.created}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Button */}
                    <button 
                      className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                      title="View Ticket"
                    >
                      <svg width="20" height="20" viewBox="0 0 494.907 494.907" fill="currentColor">
                        <path d="M70.571,459.196c-6.131,0-11.114-4.983-11.114-11.106V105.993c0-6.123,4.983-11.104,11.114-11.104H308.28
                          c6.131,0,11.115,4.98,11.115,11.104v147.911c10.565-3.519,21.644-5.855,33.132-6.844V105.993c0-24.396-19.849-44.236-44.247-44.236
                          H121.157V44.236c0-6.124,4.982-11.104,11.113-11.104h237.711c6.13,0,11.113,4.98,11.113,11.104V247.36
                          c11.517,1.279,22.586,4.013,33.131,7.839V44.236C414.225,19.841,394.378,0,369.981,0H132.27c-24.397,0-44.245,19.841-44.245,44.236
                          v17.521H70.571c-24.397,0-44.246,19.841-44.246,44.236V448.09c0,24.395,19.849,44.238,44.246,44.238h190.666
                          c-9.543-9.811-17.714-20.943-24.203-33.132H70.571z"/>
                        <path d="M126.913,190.86h95.61c9.158,0,16.565-7.418,16.565-16.565c0-9.149-7.407-16.566-16.565-16.566h-95.61
                          c-9.153,0-16.561,7.418-16.561,16.566C110.352,183.442,117.759,190.86,126.913,190.86z"/>
                        <path d="M268.514,247.846c0-9.148-7.407-16.566-16.566-16.566H126.913c-9.153,0-16.561,7.418-16.561,16.566
                          c0,9.149,7.407,16.566,16.561,16.566h125.035C261.107,264.412,268.514,256.995,268.514,247.846z"/>
                        <path d="M249.055,304.808H126.913c-9.153,0-16.561,7.417-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h103.521
                          C235.172,326.022,241.483,314.926,249.055,304.808z"/>
                        <path d="M126.913,378.342c-9.153,0-16.561,7.418-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h94.737
                          c-0.907-6.584-1.552-13.267-1.552-20.103c0-4.4,0.274-8.728,0.664-13.029H126.913z"/>
                        <path d="M365.047,357.148c-28.438,0-53.614,23.563-63.545,34.223c9.931,10.655,35.107,34.209,63.545,34.209
                          c28.553,0,53.658-23.547,63.545-34.199C418.675,380.728,393.504,357.148,365.047,357.148z M365.047,416.22
                          c-13.718,0-24.846-11.128-24.846-24.849c0-13.732,11.128-24.847,24.846-24.847s24.846,11.114,24.846,24.847
                          C389.893,405.092,378.765,416.22,365.047,416.22z"/>
                        <path d="M365.047,287.837c-57.186,0-103.536,46.349-103.536,103.534c0,57.173,46.35,103.536,103.536,103.536
                          c57.186,0,103.535-46.363,103.535-103.536C468.582,334.185,422.233,287.837,365.047,287.837z M365.047,442.143
                          c-44.681,0-79.594-43.791-81.064-45.652c-2.345-3.008-2.345-7.23,0-10.23c1.471-1.868,36.384-45.678,81.064-45.678
                          c44.679,0,79.592,43.809,81.064,45.678c2.345,3,2.345,7.223,0,10.23C444.639,398.353,409.726,442.143,365.047,442.143z"/>
                      </svg>
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                      className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors duration-200"
                      title="Edit Ticket"
                    >
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M12.965,5.462c0,-0 -2.584,0.004 -4.979,0.008c-3.034,0.006 -5.49,2.467 -5.49,5.5l0,13.03c0,1.459 0.579,2.858 1.611,3.889c1.031,1.032 2.43,1.611 3.889,1.611l13.003,0c3.038,-0 5.5,-2.462 5.5,-5.5c0,-2.405 0,-5.004 0,-5.004c0,-0.828 -0.672,-1.5 -1.5,-1.5c-0.827,-0 -1.5,0.672 -1.5,1.5l0,5.004c0,1.381 -1.119,2.5 -2.5,2.5l-13.003,0c-0.663,-0 -1.299,-0.263 -1.768,-0.732c-0.469,-0.469 -0.732,-1.105 -0.732,-1.768l0,-13.03c0,-1.379 1.117,-2.497 2.496,-2.5c2.394,-0.004 4.979,-0.008 4.979,-0.008c0.828,-0.002 1.498,-0.675 1.497,-1.503c-0.001,-0.828 -0.675,-1.499 -1.503,-1.497Z"/>
                        <path d="M20.046,6.411l-6.845,6.846c-0.137,0.137 -0.232,0.311 -0.271,0.501l-1.081,5.152c-0.069,0.329 0.032,0.671 0.268,0.909c0.237,0.239 0.577,0.343 0.907,0.277l5.194,-1.038c0.193,-0.039 0.371,-0.134 0.511,-0.274l6.845,-6.845l-5.528,-5.528Zm1.415,-1.414l5.527,5.528l1.112,-1.111c1.526,-1.527 1.526,-4.001 -0,-5.527c-0.001,-0 -0.001,-0.001 -0.001,-0.001c-1.527,-1.526 -4.001,-1.526 -5.527,-0l-1.111,1.111Z"/>
                      </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                      title="Delete Ticket"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 11V17"/>
                        <path d="M14 11V17"/>
                        <path d="M4 7H20"/>
                        <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z"/>
                        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination and Row Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Row Display Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
        </div>

        {/* Pagination Info */}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} entries
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketGallery;
