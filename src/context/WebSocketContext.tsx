import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface DomainEvent {
  type: string;
  payload: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  lastEvent: DomainEvent | null;
  eventsLog: DomainEvent[];
  dataVersion: number; // Increment to trigger refetches in components
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastEvent: null,
  eventsLog: [],
  dataVersion: 0,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<DomainEvent | null>(null);
  const [eventsLog, setEventsLog] = useState<DomainEvent[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      return;
    }

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: DomainEvent = JSON.parse(event.data);
        setLastEvent(parsed);
        setEventsLog((prev) => [parsed, ...prev.slice(0, 49)]);

        // Invalidate queries whenever a domain action occurs
        if (
          parsed.type === 'INVENTORY_MOVED' ||
          parsed.type === 'GOODS_RECEIVED' ||
          parsed.type === 'INSPECTION_COMPLETED' ||
          parsed.type === 'ITEM_PICKED' ||
          parsed.type === 'ORDER_PACKED' ||
          parsed.type === 'ORDER_DISPATCHED' ||
          parsed.type === 'STOCK_COUNT_SUBMITTED' ||
          parsed.type === 'AGENT_RUN_UPDATE' ||
          parsed.type === 'APPROVAL_RESOLVED'
        ) {
          setDataVersion((v) => v + 1);
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    return ws;
  }, []);

  useEffect(() => {
    const socket = connect();
    return () => {
      if (socket) socket.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastEvent, eventsLog, dataVersion }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const usePrismWebSocket = () => useContext(WebSocketContext);
