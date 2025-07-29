import { useEffect, useRef, useState } from 'react';
import throttle from 'lodash.throttle';
import { env } from '../env';

interface UsePaginatedTokensWebSocketParams {
  filter?: 'marketcap' | 'volume_24h' | 'txs_24h' | 'new' | 'newmarketcap' | 'trending';
  order?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  loading: boolean;
}

export default function usePaginatedTokensWebSocket({
  filter = 'marketcap',
  order = 'desc',
  offset = 0,
  limit = 20,
}: UsePaginatedTokensWebSocketParams = {}) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    loading: true,
  });
  const [data, setData] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptRef = useRef(0);

  const throttledSetData = useRef(
    throttle((newData: any[]) => {
      setData(newData);
      setState(prev => ({ ...prev, loading: false }));
    }, 1000)
  ).current;

  useEffect(() => {
    let url = env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!url.endsWith('/')) url += '/';
    url += 'tokens';
    const params = new URLSearchParams({
      filter,
      order,
      offset: String(offset),
      limit: String(limit),
    });
    url += `?${params.toString()}`;

    setState(prev => ({ ...prev, loading: true, isConnected: false, error: null }));

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setState(prev => ({ ...prev, isConnected: true, isReconnecting: false, error: null }));
          reconnectAttemptRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (Array.isArray(message)) {
              throttledSetData(message);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
            setState(prev => ({ ...prev, error: 'Failed to parse WebSocket message' }));
          }
        };

        ws.onclose = (event) => {
          console.log('WebSocket connection closed with code:', event.code, 'reason:', event.reason);
          setState(prev => ({ ...prev, isConnected: false }));
          handleReconnect();
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setState(prev => ({ ...prev, error: 'WebSocket connection error. Attempting to reconnect...' }));
          handleReconnect();
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setState(prev => ({ ...prev, error: 'Failed to establish WebSocket connection' }));
      }
    };

    const handleReconnect = () => {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        setState(prev => ({
          ...prev,
          isReconnecting: false,
          error: 'Maximum reconnection attempts reached. Please refresh the page.'
        }));
        return;
      }
      setState(prev => ({ ...prev, isReconnecting: true }));
      reconnectAttemptRef.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current - 1), 16000);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      throttledSetData.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, order, offset, limit, throttledSetData]);

  return {
    ...state,
    data,
  };
} 