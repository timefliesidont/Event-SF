# EchoBoard

A comprehensive smart event management platform that enables organizers to create, schedule, and manage events with intelligent conflict resolution and real-time communication.

## Overview

EchoBoard is a modern, full-stack event management application built with cutting-edge technologies. It provides organizers with powerful tools to manage events while offering participants a dynamic, real-time experience.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Express.js
- **Database:** Oracle DB
- **Real-time Communication:** Socket.io
- **Architecture:** Turborepo Monorepo

## Key Features

### Event Management
- Create and schedule events with full CRUD operations
- Intelligent conflict resolution using Interval Trees
- Advanced event filtering and search capabilities
- Comprehensive event scheduling system

### Real-time Communication
- Live dashboard for both organizers and participants
- Socket.io-powered real-time updates and notifications
- Dynamic feedback system for seamless communication

### Security & Access Control
- JWT-based authentication
- Role-based access control (RBAC)
- Secure feedback management
- User authorization for all operations

## Architecture

EchoBoard utilizes a **Turborepo monorepo** structure for efficient package management and development workflow, enabling scalable and maintainable code organization across multiple services.

## Getting Started

### Prerequisites
- Node.js (v14+)
- Oracle Database
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd echoboard

# Install dependencies
npm install

# Run development servers
turbo run dev
```

## Usage

- **Organizers:** Create events, manage scheduling, resolve conflicts, and monitor real-time feedback
- **Participants:** Join events, provide feedback, and receive live updates