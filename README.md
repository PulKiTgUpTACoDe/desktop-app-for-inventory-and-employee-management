# Swaraj Enterprises ERP - Desktop Application

A Windows-only desktop application built with Electron.js, React, TypeScript, and Tailwind CSS for comprehensive inventory and employee management.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Desktop App**: Cross-platform desktop application using Electron
- **Responsive Design**: Clean, professional interface with ShadCN UI components
- **Modular Architecture**: Well-organized component structure for easy maintenance

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron.js
- **Build Tool**: Vite
- **UI Components**: ShadCN UI
- **Database**: PostgreSQL + Prisma (configured but not implemented yet)
- **Package Manager**: npm

## Project Structure

```
├── electron/           # Electron main process code
│   ├── main.ts        # Main process entry point
│   └── preload.js     # Preload script for security
├── src/               # React frontend source code
│   ├── components/    # Reusable UI components
│   ├── pages/        # Application pages
│   ├── lib/          # Utility functions and helpers
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # React entry point
│   └── index.css     # Global styles and Tailwind
├── assets/            # Static assets and icons
├── dist/              # Build output directory
└── dist-electron/     # Electron build output
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows 10/11 (primary target)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd desktop-app-for-inventory-and-employee-management
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will:
- Start the Vite dev server on port 3000
- Launch the Electron app with hot reload
- Open the application window

## Building

To build the application for production:

```bash
npm run build
```

This will:
- Build the React frontend
- Compile the Electron main process
- Create a Windows installer (.exe)

## Usage

### Login
- **Username**: `admin`
- **Password**: `admin123`

### Features
- **Dashboard**: Overview of system modules
- **Inventory**: Manage stock levels and products
- **Purchases**: Track supplier orders and costs
- **Sales**: Monitor revenue and customer orders
- **Payroll**: Employee salary management
- **Reports**: Analytics and insights
- **Settings**: System configuration

## Database Setup

**Note**: Prisma and PostgreSQL are included as dependencies but not yet configured.

The `.env` file contains a placeholder database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/swaraj_erp"
```

Database integration will be implemented in future updates.

## Scripts

- `npm run dev` - Start development server with Electron
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run dist` - Create distributable package

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the GitHub repository.

