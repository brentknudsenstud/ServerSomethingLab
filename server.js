const net = require('net');
const fs = require('fs'); // fs is short for file system
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


let clients = [];
let count = 0;

function writeToChatLog(data) {
    fs.appendFileSync('chat.log', '\n' + data, )
}

function getOtherClients(socket) {
    return clients.filter(socketItem => {
        return socketItem.clientId !== socket.clientId;
    })
}

function sendToOtherClients(data, socket) {
    const otherClients = getOtherClients(socket);
    otherClients.forEach(client => client.write(socket.name + ' ' 
    + data))
}

function sendWhisperToAnotherClient(data, socket) {
    const words = data.split(' ');
    const username = words[1];
    const message = socket.name + ' ' + words.slice(2).join(' ');
    const clientToSendMessageTo = getOtherClients(socket).find(client => {
        return client.name.trim() === username.trim();
    })
    if (clientToSendMessageTo) {
        clientToSendMessageTo.write(message)
    }
    
}

function updateUsernameOfClient(data, socket) {
    const words = data.trim().split(' ');
    const username = words[1];
    const otherClients = getOtherClients(socket);
    const message = `Changing ${socket.name} to ${username}`;
    socket.name = username;
    
    otherClients.forEach(client => client.write(message))
  
}

function kickAnotherConnectedClient(data, socket) {
    const words = data.trim().split(' ');
    const username = words[1];
    const password = words[2];
    const clientToKickOut = clients.find(clientsocket => clientsocket.name === username);
    const isValid = clientToKickOut && password === 'Pa$$word';
    
    if (isValid) {
        
        clientToKickOut.write('You are kicked out, buddy! Sorry. Not sorry.');
        clientToKickOut.emit('end');
    }
}

function sendListOfAllConnectedClientNames(socket) {
    const listofNames = clients.map(clientsocket => clientsocket.name);
    const message = listofNames.join(',');
    socket.write(message);
}


function handleMessage(data, socket) {
    
    function isSendWhisperToAnotherClient() {
        const regexp = /^\/w /;
      
        return regexp.test(data);
    } 
    function isUpdateUsernameOfClient() {
        const regexp = /^\/username /;
        return regexp.test(data)
    } 
    function isKickAnotherConnectedClient() {
        const regexp = /^\/kick /;
        return regexp.test(data)
    }
    function isSendListOfAllConnectedClientNames() {
        const regexp = /^\/clientlist/;
        return regexp.test(data);
    }

    if(isSendWhisperToAnotherClient()) {
        sendWhisperToAnotherClient(data, socket);
    } else if (isUpdateUsernameOfClient()) {
        updateUsernameOfClient(data, socket);
    } else if (isKickAnotherConnectedClient()) {
        kickAnotherConnectedClient(data, socket);
    } else if (isSendListOfAllConnectedClientNames()) {
        sendListOfAllConnectedClientNames(socket);
    } else { 
        sendToOtherClients(data, socket);
    }
}

app.get('/', function(request, response) {
    response.send('Welcome to my world!');
});

const server = net.createServer((socket) => {
    clients.push(socket);

    count = count + 1;
    socket.clientId = count;
    socket.name = 'client' + count ; 
    console.log(`socket address: ${socket.remoteAddress}`);
    console.log(`socket port: ${socket.remotePort}`);
    socket.write('Welcome to the chat server!'); 
    socket.setEncoding('utf-8');
    getOtherClients(socket).forEach(clientsocket => clientsocket.write(`connected client ${socket.name}`));
    writeToChatLog(`connected client ${socket.name}`);
    socket.on('data', data => {
        writeToChatLog(data);
        handleMessage(data, socket);

    })
    socket.on('end', function () {
        const disconnectMessage = 'disconnecting ' + socket.name;

        sendToOtherClients(disconnectMessage, socket);
        clients = getOtherClients(socket);
        writeToChatLog('disconnecting ' + socket.name)
        console.log('Number of clients, ', clients.length)
    })
}).listen(1974);

let portNumber = 1974;

console.log(`Connection made! Listening on port ${portNumber}.`);
