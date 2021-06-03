const net = require('net');

const socket = net.createConnection({port: 1974}, () => {
    console.log('connected to server');
});
socket.setEncoding('utf-8');
process.stdin.pipe(socket);

// listen to the data event
socket.on('data', data => {
    console.log(data);
})