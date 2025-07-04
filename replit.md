# WebAudit Pro

## Overview

WebAudit Pro is a web application that provides comprehensive website analysis services. Users can submit a URL and receive a detailed audit report covering 9 key areas of website performance, accessibility, and AI readiness for a one-time payment of 50 CZK. The application features a modern React frontend with a Node.js/Express backend, supporting both Czech and English languages with light/dark themes.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Internationalization**: Custom translation system supporting Czech and English

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Security**: Helmet.js for security headers and input sanitization
- **Session Management**: Memory-based storage (development) with planned PostgreSQL persistence

## Key Components

### Core Services
1. **WebsiteAnalyzer**: Performs comprehensive website analysis across 9 domains
2. **PDFGenerator**: Creates detailed PDF reports from analysis results
3. **CSVLogger**: Logs all analysis activities and user consent data
4. **Storage Layer**: Abstracted interface supporting both memory and database storage

### Analysis Domains
1. HTML Structure Analysis
2. Metadata Evaluation
3. Schema.org Validation
4. Content Without JavaScript Assessment
5. Sitemap & Robots.txt Analysis
6. Accessibility Compliance
7. Performance/Speed Analysis
8. Content Readability Assessment
9. Internal Linking Structure

### User Interface Components
- **AnalysisForm**: URL and email input with validation
- **AnalysisResults**: Displays analysis scores and methodologies
- **PaymentSection**: Legal consent collection and payment processing
- **LegalModals**: Terms of service, privacy policy, and data processing agreements
- **ThemeProvider**: Light/dark mode support
- **LanguageProvider**: Czech/English language switching

## Data Flow

1. **User Input**: User enters URL and email address
2. **Analysis Creation**: System creates analysis record with unique ID
3. **Website Analysis**: Backend fetches and analyzes target website
4. **Results Generation**: Analysis results are computed and stored
5. **Payment Process**: User reviews legal agreements and processes payment
6. **Report Delivery**: PDF report is generated and sent via email
7. **Data Logging**: All activities are logged to CSV for compliance

## External Dependencies

### Backend Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **axios**: HTTP client for website fetching
- **cheerio**: Server-side HTML parsing and manipulation
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **helmet**: Security middleware
- **zod**: Runtime type validation

### Frontend Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL for development
- **Build Process**: Vite builds frontend, esbuild bundles backend

### Production Environment
- **Frontend**: Static assets served from `dist/public`
- **Backend**: Node.js server running bundled Express application
- **Database**: PostgreSQL with Drizzle migrations
- **Environment Variables**: `DATABASE_URL` for database connection

### Build Commands
- `npm run dev`: Development server
- `npm run build`: Production build (frontend + backend)
- `npm run start`: Production server
- `npm run db:push`: Database schema updates

## Changelog

```
Changelog:
- July 04, 2025. Initial setup with basic website analysis functionality
- July 04, 2025. Major improvements implemented:
  * Full website crawling - analyzes ALL pages (up to 10 URLs)
  * Simplified results display - just metrics + percentages + payment prompt
  * Real Stripe payment integration with secure processing
  * Actual PDF generation using Puppeteer
  * Enhanced UX with better loading messages
  * Improved design with modern cards and badges
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```