import { io } from "socket.io-client";

const URL = "http://localhost:3000";

const socket = io(URL);
socket.connect();

export default socket;
