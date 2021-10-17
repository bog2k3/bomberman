const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});


io.on('connection', (socket) => {
	console.log('a user connected');
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
