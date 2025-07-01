# Live Polling - Backend

## Overview

This is the backend server for the Live Polling application. It's built with Node.js, Express and Socket.io, providing API endpoints and real-time communication for the polling system.

## Features

- RESTful API endpoints for poll management
- Real-time communication using Socket.io
- MongoDB integration for data persistence
- Poll creation and management
- Student participation tracking
- Kick-out functionality for teachers

## Tech Stack

- **Node.js** and **Express** (for the server)
- **Socket.IO** (for real-time communication)
- **MongoDB** (for database)

## Setup and Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the following:

   ```
   MONGODB_URL=your_mongodb_connection_string
   PORT=3000
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /teacher-login`: Login as a teacher
- `GET /polls/:teacherUsername`: Get all polls for a specific teacher

## Socket.IO Events

### Client to Server

- `createPoll`: Create a new poll
- `submitAnswer`: Submit an answer to a poll
- `kickOut`: Kick a student out
- `joinChat`: Join the chat room
- `chatMessage`: Send a chat message

### Server to Client

- `pollCreated`: Notify clients of a new poll
- `pollResults`: Send updated poll results
- `studentAnswerSubmitted`: Notify of a student answer
- `kickedOut`: Notify a student they've been kicked out
- `chatMessage`: Broadcast chat messages

## Environment Variables

- `MONGODB_URL`: MongoDB connection string
- `PORT`: Port for the server (default: 3000)
