# Replit.md

## Overview

This is a Ranked Clicker Game web application - a competitive clicking game where players compete in real-time matches across different playlists (1v1, 2v2, 3v3). The game features a comprehensive ranking system with seasonal resets, MMR tracking, and both casual and ranked game modes. Players progress through rank tiers from Bronze to Grand Champion while competing against AI opponents in timed clicking battles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme variables and gradient backgrounds
- **State Management**: Zustand for global state with separate stores for game state, player data, and audio
- **3D Graphics**: React Three Fiber with Drei and post-processing for potential 3D elements
- **Data Persistence**: Local storage for player progress, stats, and game state

### Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **Build System**: ESBuild for production bundling
- **Development**: Hot module replacement via Vite middleware in development mode
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **API Structure**: RESTful API with `/api` prefix (routes not yet implemented)

### Game Logic Architecture
- **Game Modes**: Support for 1v1, 2v2, and 3v3 matches
- **Queue System**: Separate casual and ranked queues with estimated wait times
- **AI Opponents**: Simulated opponents with performance based on player MMR
- **Ranking System**: Complex MMR system with rank tiers, divisions, and seasonal resets
- **Statistics Tracking**: Comprehensive win/loss tracking and best rank achievements

### Data Management
- **Database**: Drizzle ORM configured for PostgreSQL with Neon serverless
- **Schema**: User management system with username/password authentication
- **Client Storage**: Zustand persist middleware for player data and game preferences
- **State Synchronization**: Local state management for real-time game updates

### Audio System
- **Sound Management**: Dedicated audio store for background music and sound effects
- **Mute Controls**: User-controllable audio with persistent mute state
- **Sound Effects**: Hit sounds and success notifications for game feedback

## External Dependencies

- **Database**: Neon Database (PostgreSQL serverless) via `@neondatabase/serverless`
- **Authentication**: PostgreSQL session store with `connect-pg-simple`
- **UI Components**: Radix UI primitives for accessible component foundation
- **3D Graphics**: Three.js ecosystem via React Three Fiber
- **State Management**: Zustand with persistence and selector subscriptions
- **Development Tools**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for season and timestamp management
- **Utilities**: clsx and tailwind-merge for conditional styling