import express from 'express'
import http from 'http'
import socket from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = socket(server)
const PORT = process.env.PORT || 3009

const messages: Array<any> = []
const stateUsers = new Map()


app.get('/', (req, res) => {
    res.send('connect to server')
})
io.on('connect', (socketChannel) => {
    stateUsers.set(socketChannel, {name: 'anonymous', id: new Date().getTime().toString()})

    socketChannel.on('client-name-sent', (name: string) => {
        if (name.trim()) {
            const user = stateUsers.get(socketChannel)
            user.name = name
        }

        socketChannel.on('client-typed', () => {
            socketChannel.emit('user-typing', stateUsers.get(socketChannel))
        })
    })

    socketChannel.emit('init-messages-published', messages)
    socketChannel.on('client-message-sent', (message: string) => {
        if (message.trim()) {
            const user = stateUsers.get(socketChannel)
            const newMessage = {message: message, user: {id: user.id, name: user.name}}
            messages.push(newMessage)
            io.emit('new-message-sent', newMessage)
        }

    })
    socketChannel.on('disconnect', () => {
        stateUsers.delete(socketChannel)
    })

})
server.listen(PORT, () => {
    console.log('server ')
})
