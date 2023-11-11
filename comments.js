// Create web server
const express = require('express');
const app = express();
const port = 3000;

// Create web server
const http = require('http');
const server = http.createServer(app);

// Create web socket
const { Server } = require('socket.io');
const io = new Server(server);

// Create database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/comment', {useNewUrlParser: true, useUnifiedTopology: true});

// Create model
const Comment = mongoose.model('Comment', {
    name: String,
    message: String
});

// Create static folder
app.use(express.static('public'));

// Send file index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Send file admin.html
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

// Send file admin.html
app.get('/api/comments', (req, res) => {
    Comment.find({}, (err, comments) => {
        res.send(comments);
    });
});

// Send file admin.html
app.get('/api/comments/delete', (req, res) => {
    Comment.deleteMany({}, (err) => {
        res.send('Delete all comments');
    });
});

// Create event connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('comment', (msg) => {
        console.log('Comment: ' + msg);

        // Save to database
        const comment = new Comment({ name: msg.name, message: msg.message });
        comment.save().then(() => console.log('Comment saved'));

        // Send to all client
        io.emit('comment', msg);
    });
});

// Start web server
server.listen(port, () => {
    console.log('Server is running on port ' + port);
});