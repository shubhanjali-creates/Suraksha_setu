const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.json());
app.use(express.static('build'));
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection
const connectDB = require('./db/connect');
connectDB();

// socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Routes
const {
    HomeRoute,
    AuthRouter,
    CommunityRouter,
    IncidentRoute
} = require('./routes');

app.use('/home', HomeRoute);
app.use('/incident', IncidentRoute);
app.use('/auth', AuthRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port-${PORT}`);
});