const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_ORIGIN || true;
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.json());

const connectDB = require('./db/connect');
connectDB();

const io = new Server(server, { cors: { origin: allowedOrigin } });
app.set('io', io);
io.on('connection', (socket) => {
  socket.on('join-community', (communityId) => socket.join(`community:${communityId}`));
});

const { HomeRoute, AuthRouter, CommunityRouter, IncidentRoute } = require('./routes');
const OperationsRouter = require('./routes/OperationsRouter');
app.use('/home', HomeRoute);
app.use('/incident', IncidentRoute);
app.use('/auth', AuthRouter);
app.use('/community', CommunityRouter);
app.use('/api', OperationsRouter);

// Serve the React build when it exists, allowing a single-server deployment.
const clientBuild = path.resolve(__dirname, '../client/build');
app.use(express.static(clientBuild));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/home') || req.path.startsWith('/incident') || req.path.startsWith('/auth') || req.path.startsWith('/community') || req.path.startsWith('/api')) {
    return next();
  }
  return res.sendFile(path.join(clientBuild, 'index.html'), (err) => {
    if (err) next();
  });
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => console.log(`Suraksha Setu server running on port ${PORT}`));
