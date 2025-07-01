# Live Polling - Frontend

## Overview

This project is a real-time polling system that allows teachers to create live polls and students to participate in them. The frontend is built with **React** (using Vite as the build tool). **Socket.IO** is used for real-time communication between the server and clients.

## Features

- **Teacher Features**:

  - Create polls with options and set a timer for voting.
  - View real-time results as students vote.
  - View poll history.
  - Kick students out of the room.

- **Student Features**:
  - Join a poll room created by a teacher.
  - Vote in real-time on polls.
  - Redirect to a "kicked out" page if removed by the teacher.

## Tech Stack

- **React** (with Vite for fast development)
- **Socket.IO** (for real-time communication)
- **Bootstrap** (for styling)
- **Session Storage** (for session management)

---

## Frontend Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the following:

   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Running the Application

1. The frontend will be available at:
   ```
   http://localhost:5173/
   ```
