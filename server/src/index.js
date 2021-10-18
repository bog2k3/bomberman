const express = require('express');
const app = express();
const http = require('http');
const { GameService } = require('./game.service.js');
const { SocketService } = require("./socket/socket.service.js");
const { UserService } = require("./user.service.js");

const PORT = 7075;

const httpServer = http.createServer(app);

const userService = new UserService();
const socketService = new SocketService(httpServer, userService);
const gameService = new GameService();

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});

httpServer.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});
