# API Puzzle Quest

## Overview

API Puzzle Quest is a gamified educational platform designed to teach developers API skills through interactive challenges and hands-on practice. The application combines learning with game mechanics, featuring XP systems, levels, streaks, and achievements to engage users while they master REST APIs, authentication, GraphQL, and other API-related concepts.

The platform provides a comprehensive learning environment where users can progress through structured challenges, test real API endpoints, and build practical skills through guided tutorials and real-world scenarios.

**Latest Updates (Phase 2 - August 15, 2025):**
- Added AI-powered adaptive challenge engine that personalizes learning paths
- Implemented procedural challenge generator for endless content
- Created progressive skill tree with unlockable learning paths  
- Built comprehensive Postman integration with exportable collections
- Added global leaderboard system with competitive elements
- Enhanced navigation with dedicated pages for skill tree, leaderboard, and collections
- Extended data model with skills tracking, prerequisites, and API provider information

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React** and **TypeScript** using modern development patterns:

- **Component Architecture**: Built with React functional components and hooks
- **Styling System**: Uses **Tailwind CSS** with **shadcn/ui** component library for consistent, modern UI design
- **State Management**: Leverages **TanStack Query** (React Query) for server state management and caching
- **Routing**: Implements **Wouter** as a lightweight client-side routing solution
- **Type Safety**: Full TypeScript implementation for enhanced developer experience and runtime safety

The UI follows a component-driven architecture with reusable components organized in a clear hierarchy. The design system uses CSS custom properties for theming and supports both light and dark modes.

### Backend Architecture

The backend uses **Node.js** with **Express** for the API server:

- **REST API Design**: RESTful endpoints for user management, challenge operations, and progress tracking
- **Modular Route Structure**: Clean separation of concerns with dedicated route handlers
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Tools**: Integrated Vite development server with hot module replacement

### Data Storage Solutions

The application is designed with flexible data persistence:

- **Database ORM**: Uses **Drizzle ORM** for type-safe database operations
- **PostgreSQL Support**: Configured for PostgreSQL with **Neon Database** serverless integration
- **Schema Management**: Database migrations and schema versioning through Drizzle Kit
- **Fallback Storage**: In-memory storage implementation for development and testing

The database schema includes tables for users, challenges, user progress, and achievements with proper relationships and constraints.

### Authentication and User Management

- **User Profiles**: Comprehensive user system with levels, XP, streaks, and achievement tracking
- **Progress Tracking**: Detailed monitoring of challenge completion and learning progression
- **Gamification Elements**: Built-in XP system, level progression, and achievement unlocking

### API Integration Features

- **API Testing Environment**: Built-in tools for testing external APIs directly within challenges
- **Code Examples**: Multi-language code snippets (cURL, JavaScript, Python) for learning
- **Response Validation**: Challenge completion verification through API response checking
- **Postman Integration**: Full Postman collection export and import functionality
- **Procedural Content**: AI-generated challenges using real APIs for endless practice
- **Adaptive Learning**: Personalized recommendations based on user performance and skill level

## External Dependencies

### Core Technologies

- **React Ecosystem**: React 18+ with hooks, TanStack Query for data fetching, Wouter for routing
- **Styling Framework**: Tailwind CSS with Radix UI primitives through shadcn/ui
- **Backend Runtime**: Node.js with Express framework
- **Database**: PostgreSQL with Drizzle ORM and Neon Database serverless platform

### Development Tools

- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript for static type analysis
- **Code Quality**: ESBuild for server bundling, PostCSS for CSS processing

### UI Component Library

- **Design System**: Comprehensive component library based on Radix UI primitives
- **Form Handling**: React Hook Form with Zod schema validation
- **Interactive Elements**: Extensive collection of accessible UI components including dialogs, dropdowns, forms, navigation elements, sliders, avatars, and progress indicators
- **Advanced Visualizations**: Skill tree diagrams, leaderboard tables, and adaptive learning analytics displays

### External Services

- **Database Hosting**: Neon Database for serverless PostgreSQL hosting
- **Session Management**: PostgreSQL-backed session storage with connect-pg-simple
- **API Integration**: Support for external API testing and integration within challenges

The architecture prioritizes developer experience, type safety, and scalability while maintaining a clean separation between frontend presentation, backend logic, and data persistence layers.