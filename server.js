const net = require('net');

const server = net.createServer((socket) => {
    socket.name = 'myNewClient'; 
    console.log(`socket address: ${socket.remoteAddress}`);
    console.log(`socket port: ${socket.remotePort}`);
    socket.write('Welcome to the chat server!'); 
}).listen(1974);

console.log('Connection made! Listening on port 1974.');