const WebSocket = require('ws');
const JSON5 = require('json5');

class Socket {
  constructor(wsUrl, onMessage) {
    this.onMessage = onMessage;
    this.socket = new WebSocket(wsUrl, {
      origin: 'http://game.wsmud.com',
    });

    this.socket.onclose = () => process.exit();
    this.socket.onerror = (err) => {
      console.log(err);
      process.exit();
    };
    this.socket.onmessage = (message) => {
      if (!message || !message.data) {
        return;
      }
      const data = /^{.*}$/.test(message.data)
        ? JSON5.parse(message.data)
        : { type: 'tip', msg: message.data };
      this.onMessage(data);
    };
  }

  send(message) {
    if (typeof message !== 'string') {
      return;
    }

    message.split(',').forEach((cmd) => this.socket.send(cmd));
  }
}

module.exports = Socket;
