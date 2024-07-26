const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public"))); // For static files like images, css, van js etc

io.on("connection", function(socket) {
    console.log(`New client connected: ${socket.id}`);

    socket.on('send-location', function(data) {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', function() {
        console.log(`Client disconnected: ${socket.id}`);
        io.emit('user-disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render("index.ejs");
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0');
