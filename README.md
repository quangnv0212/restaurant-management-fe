# Restaurant Management System

A modern web application for managing restaurant operations, built with Next.js 14, TypeScript, and real-time features.

## 🍽️ Overview

Restaurant Management System is a comprehensive solution for restaurant operations, offering features for both staff management and customer ordering. The system supports multiple user roles and provides real-time updates using WebSocket connections.

## ✨ Key Features

### For Restaurant Staff

- **Dashboard Management**: Monitor and analyze sales data
- **Menu Management**: Add, edit, and manage dishes with rich text descriptions
- **Table Management**: Track table status and QR code generation for each table
- **Order Management**: Real-time order processing and status updates
- **Account Management**: Role-based access control (Owner, Employee)
- **Profile Management**: User profile and settings management

### For Customers

- **Digital Menu**: Browse menu items with detailed descriptions
- **QR Code Ordering**: Scan table QR codes to place orders
- **Real-time Order Status**: Track order status updates
- **Guest Authentication**: Simple authentication for order placement

## 🔑 Role-Based Access

- **Owner**: Full system access including employee management
- **Employee**: System access excluding employee management
- **Guest**: Limited access for placing orders only

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **State Management**: React Query, Zustand
- **Form Handling**: React Hook Form, Zod
- **UI Components**: Shadcn/ui
- **Real-time**: Socket.IO
- **Internationalization**: Next-intl

## 🔒 Security Features

- JWT-based authentication
- Automatic token refresh mechanism
- Role-based middleware protection
- Form validation using Zod
- XSS protection with DOMPurify

## 🌐 Internationalization

The application supports multiple languages with:

- Route-based language switching
- Translated content management
- RTL/LTR support

## 💻 Development Setup

1. Clone the repository

```bash
git clone https://github.com/quangnv0212/restaurant-management-fe
cd restaurant-management-fe
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Run development server

```bash
npm run dev
```

## 🚀 Deployment

The application can be deployed using:

- Vercel (recommended)
- Docker
- Traditional hosting
