import  express from "express";
import  http from "http";

import { SocketService } from "./socket/socket.service.js";
import { UserService } from "./user.service.js";

const app = express();
const PORT = 7075;

const httpServer = http.createServer(app);

const userService = new UserService();
const socketService = new SocketService(httpServer, userService);

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});

httpServer.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});
