import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");


//socket cod part 

let waitingUser = [];
let rooms = {}

io.on("connection", (socket) => {
    socket.on("joinroom", () => {
        if (waitingUser.length === 0) {
            waitingUser.push(socket);
        } else {
            let partner = waitingUser.shift();
            let room = `${socket.id}#${partner.id}`;
            socket.join(room);
            partner.join(room);
            io.to(room).emit("joined", room);


        }
    })

    socket.on("disconnect", () => {
        let user = waitingUser.findIndex((user) => user.id === socket.id);
        waitingUser.splice(user, 1);
    })

    socket.on("message", (data)=>{
        socket.broadcast.to(data.room).emit("message", data.message);
    })
});

app.get("/", (req, res) => {
    res.render("index");
});
app.get("/chat", (req, res) => {
    res.render("chat");
});


server.listen(3000, () => {
    console.log("listening on *:3000");
});
