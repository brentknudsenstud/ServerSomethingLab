const net = require('net');
const fs = require('fs');
let clients = [];
let count = 0;

function writeToChatLog(data) {
    fs.appendFileSync('chat.log', '\n' + data, )
}

function getOtherClients(socket) {
    return clients.filter(socketItem => {
        return socketItem !== socket
    })
}

function sendToOtherClients(data, socket) {
    const otherClients = getOtherClients(socket);
    otherClients.forEach(client => client.write(socket.name + ' ' 
    + data))
}

function sendWhisperToAnotherClient() {

}

function updateUsernameOfClient() {

}

function kickAnotherConnectedClient() {

}

function sendListOfConnectedClientNames() {
    
}

const server = net.createServer((socket) => {
    clients.push(socket);
    console.log('Number of clients, ', clients.length)
    count = count + 1;
    socket.name = 'myNewClient, ' + count ; 
    console.log(`socket address: ${socket.remoteAddress}`);
    console.log(`socket port: ${socket.remotePort}`);
    socket.write('Welcome to the chat server!'); 
    socket.setEncoding('utf-8');

    socket.on('data', data => {
        writeToChatLog(data)
        sendToOtherClients(data, socket)
        console.log(data);
    })
    socket.on('end', function () {
        const disconnectMessage = 'disconnecting ' + socket.name;

        sendToOtherClients(disconnectMessage, socket);
        clients = getOtherClients(socket);
        writeToChatLog('disconnecting ' + socket.name)
        console.log('Number of clients, ', clients.length)
    })
}).listen(1974);

console.log('Connection made! Listening on port 1974.');
