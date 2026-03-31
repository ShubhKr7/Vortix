# Virtual Office MVP

A persistent virtual workspace prototype with real-time avatar movement and proximity-based audio.

## Architecture

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Zustand, Socket.io-client, Konva.js, LiveKit-client.
- **Backend**: Node.js, Express, Socket.io, MongoDB/Mongoose, LiveKit-server-sdk.
- **Audio**: LiveKit SFU for managed WebRTC audio streams.

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)
- **LiveKit Server** (Local dev instance or Cloud)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/virtual_office
   JWT_SECRET=your_jwt_secret_key
   LIVEKIT_URL=http://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```
4. Seed the database with test users:
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in `frontend/` with the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Auth**: Simple email/password JWT authentication.
- **Workspaces**: Create and join private workspaces via invite codes.
- **Presence**: Real-time position synchronization using Socket.io.
- **Audio**: Proximity-based audio that connects as you approach others (threshold: 200px).
- **Zones**: Visual markers for "Meeting Rooms" and "Private Spaces" on the 2D grid.

## Proximity Logic

The application calculates the Euclidean distance between users every 500ms. If the distance is below the threshold, it automatically subscribes to their audio track and adjusts the volume dynamically.

## Troubleshooting

- **Audio not working?** Ensure your LiveKit server is running and the credentials in `.env` match.
- **Socket connection fails?** Verify the backend server is running on port 5000 and CORS is configured.
