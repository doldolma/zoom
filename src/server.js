import express from "express";
// import WebSocket from "ws";
import http from "http";
import SocketIO from "socket.io";
// import { instrument } from "@socket.io/admin-ui";


const app = express();

app.set("view engine", "pug");
app.set("views", __dirname+"/views");
app.use("/public", express.static(__dirname+"/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"))

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);


wsServer.on("connection", socket => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    })

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    })

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
})

console.log(process.env.NODE_ENV);


httpServer.listen(3000, () => console.log(`리스닝중 http://localhost:3000`));


// socket.io로 채팅방 만들기 
// const httpServer = http.createServer(app);
// const wsServer = new Server(httpServer, {
//     cors: {
//         origin: ["https://admin.socket.io"],
//         credentials: true
//     }
// });

// instrument(wsServer, {
//     auth: false
// })

// function publicRooms(){
//     const {sockets: {
//         adapter: {sids, rooms}
//     },} = wsServer
//     const publicRooms = [];
//     rooms.forEach((_, key) => {
//         if(sids.get(key) === undefined){
//             publicRooms.push(key);
//         }
//     })
//     return publicRooms;
// }

// function countRoom(roomName){
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size
// }

// wsServer.on("connection", socket => {
//     socket.nickname = "Anony";
//     // wsServer.socketsJoin("announcement")

//     socket.onAny(event => {
//         console.log(wsServer.sockets.adapter);
//         console.log(`socket Event: ${event}`)
//     })

//     socket.on("enter_room", (roomName, showRoom) => {
//         socket.join(roomName);
//         showRoom();
//         socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//         wsServer.sockets.emit("room_change", publicRooms());
//     })

//     socket.on("disconnecting", () => {
//         socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
//     })

//     socket.on("disconnect", () => {
//         wsServer.sockets.emit("room_change", publicRooms());
//     })

//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//         done();
//     })

//     socket.on("nickname", nickname => socket.nickname = nickname);
// })
// httpServer.listen(3000, () => console.log(`리스닝중 http://localhost:3000`));


// Web Socket 사용하기
// const wss = new WebSocket.httpServer({httpServer});
// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket.nickname = "Anony";
//     console.log("Connected to Browser ✅");
//     socket.on("close", () => console.log("Disconnected from client ❌"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach(asocket => {
//                     asocket.send(`${socket.nickname}: ${message.payload.toString("utf8")}`)
//                 })
//                 break;
//             case "nickname":
//                 socket.nickname = message.payload
//                 break;
//         }
//     });
// });
// httpServer.listen(3000, () => console.log(`리스닝중 http://localhost:3000`));