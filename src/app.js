const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter=require('bad-words')
const app = express()
const server = http.createServer(app)
 const {generateMessage,genrateLocationmessage} =require('./src/utils/index')
 const {addUser,removeUser,getUser,getUsersInRoom}=require('./src/utils/users')
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '/public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {


    socket.on('join',({username,room},callback)=>
    {
        const {user,error}= addUser({id:socket.id,username,room});
        if(error)
        return callback(error);

         socket.join(user.room)
         socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(room).emit('message',generateMessage('Admin',`${username} has joined`))
        
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
        
    })
    

    socket.on('sendMessage', (message,callback) => {
        const filter=new Filter()
        if(filter.isProfane(message))
        return callback('profanity is not allowed')

        const user=getUser(socket.id)
        if(user)
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })
    socket.on('send-location',(cords,callback)=>
    {
           const user=getUser(socket.id)
        
           if(user)
        io.emit('message-location',genrateLocationmessage(user.username,`https://google.com/maps?q=${cords.latt},${cords.long}`));
        callback()
    })

    socket.on('disconnect',()=>
    {
        const user=removeUser(socket.id)
        if(user)
        {
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
       
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
    })
})

server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})