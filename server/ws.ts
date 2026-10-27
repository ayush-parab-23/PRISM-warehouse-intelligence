import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'node:http';

let wss: WebSocketServer | null = null;
const connectedClients = new Set<WebSocket>();

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws/events' });

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    // Send initial handshake
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      facility: 'PRISM Kharghar Node',
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      connectedClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('[WS ERROR]:', err);
      connectedClients.delete(ws);
    });
  });

  console.log('[PRISM WS] WebSocket server mounted at /ws/events');
}

export function broadcastDomainEvent(eventType: string, payload: any) {
  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('[WS SEND ERROR]:', err);
      }
    }
  }
}
