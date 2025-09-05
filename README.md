# Technical Support Admin Dashboard

A modern, responsive admin dashboard designed specifically for technical support teams. Built with React, TypeScript, and Tailwind CSS, featuring a clean design inspired by modern dashboard interfaces.

## ✨ Features

### 🎨 Design & Layout

- **Modern UI/UX**: Clean, professional design with excellent visual hierarchy
- **Responsive Design**: Fully responsive layout that works on all device sizes
- **Grid System**: Efficient grid-based layout for optimal information display
- **Card-based Components**: Modular card design for easy content organization

### 🌓 Theme System

- **Dark Mode**: Elegant dark theme for reduced eye strain
- **Light Mode**: Clean light theme for daytime use
- **Theme Persistence**: Remembers user's theme preference
- **System Theme Detection**: Automatically detects and applies system theme

### 🧭 Navigation

- **Collapsible Sidebar**: Minimal and expanded view modes
- **Smart Navigation**: Context-aware navigation with active states
- **Icon-based Design**: Intuitive iconography for easy navigation
- **Smooth Transitions**: Elegant animations and transitions

### 📊 Technical Support Features

- **Ticket Management**: Comprehensive ticket overview and status tracking
- **Performance Metrics**: Real-time performance indicators and KPIs
- **Priority Distribution**: Visual representation of ticket priorities
- **Response Time Tracking**: Monitor and improve support response times
- **Customer Analytics**: Track customer interactions and satisfaction

### 📈 Data Visualization

- **Interactive Charts**: Beautiful charts using Recharts library
- **Real-time Updates**: Live data updates and monitoring
- **Customizable Dashboards**: Flexible dashboard layouts
- **Export Capabilities**: Data export and reporting features

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tech-support-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🌐 Live Deployment

This project is automatically deployed to GitHub Pages whenever changes are pushed to the main branch.

### Live Preview

🔗 **Live Demo**: [View Live Preview](https://yourusername.github.io/NextTrack-Helpdesk-man/)

### Deployment Process

The deployment is handled automatically through GitHub Actions:

1. **Automatic Deployment**: Every push to the `main` branch triggers a deployment
2. **Build Process**: The project is built using Vite and TypeScript
3. **GitHub Pages**: The built files are deployed to GitHub Pages
4. **Live Updates**: Changes are reflected on the live site within minutes

### Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (requires gh-pages package)
npm run deploy
```

### Deployment Configuration

The deployment is configured through:
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `vite.config.ts` - Base path configuration for GitHub Pages
- `public/.nojekyll` - Ensures proper file serving

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── Header.tsx      # Top navigation header
│   ├── Sidebar.tsx     # Left navigation sidebar
│   ├── TicketChart.tsx # Ticket volume chart
│   ├── PriorityDistribution.tsx # Priority pie chart
│   └── RecentTickets.tsx # Recent tickets table
├── contexts/           # React contexts
│   └── ThemeContext.tsx # Theme management
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind CSS
```

## 🎯 Key Components

### Dashboard

- **Metrics Cards**: Display key performance indicators
- **Charts**: Visual representation of ticket data
- **Performance Tracking**: Monitor team performance metrics
- **Recent Activity**: Latest ticket updates and changes

### Sidebar Navigation

- **Dashboard**: Main overview and metrics
- **Tickets**: Ticket management and tracking
- **Customers**: Customer information and history
- **Knowledge Base**: Support documentation and resources
- **Analytics**: Detailed performance analytics
- **Settings**: Configuration and preferences

### Header

- **Search**: Global search functionality
- **Theme Toggle**: Switch between light and dark modes
- **Notifications**: Real-time notification system
- **User Profile**: User account and preferences

## 🎨 Customization

### Colors

The dashboard uses a comprehensive color system that can be easily customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... more shades
  },
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    // ... more shades
  }
}
```

### Components

All components are built with reusability in mind and can be easily modified or extended to meet specific requirements.

## 📱 Responsive Design

The dashboard is fully responsive and includes:

- **Mobile-first approach**: Optimized for mobile devices
- **Breakpoint system**: Responsive breakpoints for all screen sizes
- **Touch-friendly**: Optimized for touch interactions
- **Adaptive layouts**: Layouts that adapt to different screen sizes

## 🔧 Technologies Used

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Beautiful and responsive charts
- **Lucide React**: Modern icon library
- **Vite**: Fast build tool and development server

## 🚀 Performance Features

- **Lazy Loading**: Components load only when needed
- **Optimized Bundles**: Efficient code splitting and bundling
- **Fast Rendering**: Optimized React rendering performance
- **Smooth Animations**: Hardware-accelerated animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for technical support teams**
