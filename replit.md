# FinanceFlow - Personal Finance Management Platform

## Overview

FinanceFlow is a modern, full-stack personal finance management application built with React, TypeScript, and Express. The platform provides comprehensive financial tracking, goal setting, budgeting tools, and AI-powered insights. It features a responsive design with 3D interactive elements and advanced analytics to help users manage their finances effectively.

The application combines transaction management, goal tracking, budget planning, and predictive analytics in a unified dashboard experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom fintech theme variables and CSS variables for consistent theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with custom query client
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Animations**: Framer Motion for smooth transitions and 3D interactive elements
- **Charts**: Recharts for data visualization (pie charts, bar charts, line charts)

### Backend Architecture
- **Runtime**: Node.js with TypeScript using ESM modules
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas shared between client and server for consistent validation
- **Development**: Development and production build processes with esbuild for server bundling

### Data Storage Design
- **Database Schema**: Structured around users, categories, transactions, goals, and budgets
- **Relationships**: Foreign key relationships between entities with proper referential integrity
- **Data Types**: Decimal precision for financial amounts, timestamps for transaction dates
- **Sample Data**: In-memory storage implementation for development/demo purposes with plans for PostgreSQL integration

### Authentication Strategy
- **JWT Authentication**: Implemented secure JWT-based authentication with access tokens (15min) and refresh tokens (7d)
- **User Management**: Complete signup/login system with bcrypt password hashing and email validation
- **Google OAuth**: Google login integration with OAuth 2.0 flow (placeholder implementation ready for production secrets)
- **Session Management**: Token-based authentication with automatic refresh and secure storage
- **Security Features**: Password requirements, token expiration, refresh token rotation, secure logout

### API Architecture
- **REST Endpoints**: Organized by resource type (categories, transactions, goals, budgets, analytics)
- **Data Flow**: Request validation using Zod schemas, standardized error handling
- **Response Format**: Consistent JSON responses with proper HTTP status codes
- **Pagination**: Implemented for transaction listings with limit/offset parameters

### Component Organization
- **Page Components**: Route-level components for major sections (Dashboard, Transactions, Goals, Analytics)
- **Feature Components**: Specialized components for specific functionality (forms, charts, 3D elements)
- **UI Components**: Reusable Shadcn/ui components with consistent styling
- **Layout Components**: Navigation and structural components

### Real-time Features
- **Interactive 3D Elements**: Floating wallet and piggy bank components with hover/click animations
- **Live Analytics**: Dynamic chart updates based on transaction data
- **Predictive Insights**: AI-powered budget predictions and financial health scoring

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection Management**: PostgreSQL session storage for scalable session handling

### UI and Design System
- **Radix UI**: Comprehensive primitive components for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide Icons**: Modern icon library for consistent iconography
- **Google Fonts**: Inter font family for professional typography

### Data Visualization
- **Recharts**: React charting library for financial data visualization
- **Chart Types**: Pie charts for expense categories, line charts for trends, bar charts for comparisons

### Development Tools
- **Vite**: Fast build tool with React plugin and custom configuration
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production server builds
- **Drizzle Kit**: Database schema management and migration tools

### Form and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: TypeScript-first schema validation shared between client and server
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### Animation and Interaction
- **Framer Motion**: Physics-based animations for smooth user interactions
- **Three.js Types**: Type definitions for potential 3D enhancements

### Utilities and Helpers
- **clsx**: Conditional className utility for dynamic styling
- **class-variance-authority**: Type-safe variant API for component styling
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: URL-safe unique ID generation