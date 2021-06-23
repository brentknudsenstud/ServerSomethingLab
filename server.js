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
        return socketItem !== socket
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
    const message = socket.name + words.slice(1).join(' ');
    const clientToSendMessageTo = getOtherClients(socket).find(client => {
        return client.name === username;
    })
    if (clientToSendMessageTo) {
        clientToSendMessageTo.write(message)
    }
    console.log(username, message);
}

function updateUsernameOfClient(data, socket) {
    const words = data.split(' ');
    const username = words[1];
    socket.name = username;
    console.log(username);
}

function kickAnotherConnectedClient() {

}

function sendListOfAllConnectedClientNames() {

}


function handleMessage(data, socket) {
    
    function isSendWhisperToAnotherClient() {
        const regexp = /^\/w /;
        console.log(regexp.test(data))
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
        const regexp = /^\/clientlist /;
        return regexp.test(data);
    }

    if(isSendWhisperToAnotherClient()) {
        sendWhisperToAnotherClient(data, socket);
    } else if (isUpdateUsernameOfClient()) {
        updateUsernameOfClient(data, socket);
    } else if (isKickAnotherConnectedClient()) {
        kickAnotherConnectedClient(data, socket);
    } else if (isSendListOfAllConnectedClientNames()) {
        sendListOfAllConnectedClientNames(data, socket);
    } else { 
        sendToOtherClients(data, socket);
    }
}

app.get('/', function(request, response) {
    response.send('Welcome to my world!');
});

const server = net.createServer((socket) => {
    clients.push(socket);
    console.log('Number of clients, ', clients.length)
    count = count + 1;
    socket.name = 'client' + count ; 
    console.log(`socket address: ${socket.remoteAddress}`);
    console.log(`socket port: ${socket.remotePort}`);
    socket.write('Welcome to the chat server!'); 
    socket.setEncoding('utf-8');

    socket.on('data', data => {
        writeToChatLog(data)
        handleMessage(data, socket)
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

let portNumber = 1974;

console.log(`Connection made! Listening on port ${portNumber}.`);
