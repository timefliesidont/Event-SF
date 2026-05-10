import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { initOraclePool } from "./db/db.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/eventRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { configDotenv } from 'dotenv';

configDotenv();

const PORT = process.env.PORT || 8001;
const app = express();
const server = http.createServer(app); // Create HTTP server

const io = new Server(server, { // Initialize Socket.IO with the HTTP server
    cors: {
        origin: ["http://localhost:5173","http://localhost:5174"],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected: ', socket.id);
    });
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(
    cors({
        origin: ["http://localhost:5173","http://localhost:5174"],
        credentials: true,
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/feedback", feedbackRoutes);

await initOraclePool(); // Initialize DB pool before starting server

server.listen(PORT, () => { // Make the HTTP server listen
    console.log(`👾 Server is running on http://localhost:${PORT}`);
});