const net = require('net');

const socket = net.createConnection({port: 1974}, () => {
    console.log('connected to server');
});