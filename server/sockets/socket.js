let ioRef;

export function initSocket(io) {
  ioRef = io;
  io.on('connection', (socket) => {
    socket.emit('systemLive', { live: true, at: new Date().toISOString() });
  });
}

export function emitEvent(event, payload = {}) {
  if (ioRef) ioRef.emit(event, { ...payload, at: new Date().toISOString() });
}
