# Live Polling - Frontend

## Overview

This is the frontend part of the Live Polling application, built with React and Vite. It provides a user interface for both teachers and students to interact with the polling system.

## Features

- **Teacher Features**:

  - Create polls with options and set a timer for voting
  - Mark correct answers for assessment
  - View real-time results as students vote
  - View poll history
  - Kick students out of the room

- **Student Features**:
  - Join a poll room to answer the question created by a teacher
  - Vote in real-time on polls

## Tech Stack

- **React** (with Vite for fast development)
- **Socket.IO** (for real-time communication)
- **React Router** (for navigation)

## Setup and Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. For production build:
   ```bash
   npm run build
   ```

## Project Structure

- `src/components/`: Reusable UI components
- `src/Pages/`: Page components for different routes
- `src/assets/`: Static assets like images and icons
- `src/App.jsx`: Main application component
- `src/main.jsx`: Entry point of the application

## Environment Variables

- `VITE_API_BASE_URL`: URL of the backend API (default: http://localhost:3000)
