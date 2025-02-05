const express = require('express')
const app = express();
const mongoose = require('mongoose')
const http = require("http")
const cors = require('cors');
const { Server } = require("socket.io");
require("dotenv").config();
const authRoute = require('./routes/userAccount')
const Message = require('./model/messagesSchema')

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
  });

  //middle ware
app.use(express.json())
app.use(express.static("views"))
app.use(express.static("public")); 
app.use("/auth", authRoute)
app.use(cors())

//mongoose connection
mongoose.connect("mongodb+srv://aayanf3942:SyKyjKRCdODnJfGr@cluster0.g0rhw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=> console.log("Mongodb Connected"))
.catch((err)=> console.log(err))


let userInRooms = {}

//socket io connections
io.on("connection", (socket) =>{
    console.log("User connected", socket.id);

    socket.on("joinRoom", (roomName)=>{
        if(!userInRooms[socket.id]){
            userInRooms[socket.id] = roomName
            socket.join(roomName)
            console.log(`${socket.id} joined room: ${roomName}`);
            io.to(roomName).emit("message", `${socket.id} has joined the room ${roomName}`);
        }
    })

    socket.on("sendMessage", async (msg) => {
        const currentRoom = userInRooms[socket.id];
        if (currentRoom) {
            try{
                const newMessage = new Message({
                    room: currentRoom,
                    user: socket.id,
                    message: msg
                })
                await newMessage.save();
                console.log("Message saved")
                io.to(currentRoom).emit("message", msg);
            } catch(e){
                console.log("Error saving message", e)
            }
        }
    });

    socket.on("leaveRoom", () => {
        const currentRoom = userInRooms[socket.id];
        if (currentRoom) {
            socket.leave(currentRoom);
            console.log(`${socket.id} left room: ${currentRoom}`);
            io.to(currentRoom).emit("message", `${socket.id} has left the room`);
            delete userInRooms[socket.id];
        }
    });

    socket.on("disconnect", () => {
        const currentRoom = userInRooms[socket.id];
        if (currentRoom) {
            io.to(currentRoom).emit("message", `${socket.id} has disconnected`);
            delete userInRooms[socket.id];
        }
        console.log("User disconnected:", socket.id);
    });
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

