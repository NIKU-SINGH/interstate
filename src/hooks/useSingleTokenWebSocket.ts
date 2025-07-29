import { useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import { env } from "../env";

export default function useSingleTokenWebSocket(mint: string | undefined) {
  const [token, setToken] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptRef = useRef(0);

  // Throttle updates to avoid excessive renders
  const throttledSetToken = useRef(
    throttle((newData: any) => {
      setToken(newData);
    }, 1000)
  ).current;

  useEffect(() => {
    if (!mint) return;

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        // Use /token?pairaddress=mint endpoint
        const ws = new WebSocket(`${env.NEXT_PUBLIC_WEBSOCKET_URL}/token?mint=${mint}`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          reconnectAttemptRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            // Expect { token, trades } object
            if (message && typeof message === "object") {
              if (message.token && message.trades) {
                throttledSetToken(message.token);
                setTrades(message.trades);
              } else {
                throttledSetToken(message);
              }
            }
          } catch (err) {
            setError("Failed to parse WebSocket message");
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          handleReconnect();
        };

        ws.onerror = () => {
          setError("WebSocket error");
          handleReconnect();
        };
      } catch (error) {
        setError("Failed to establish WebSocket connection");
      }
    };

    const handleReconnect = () => {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        setError("Maximum reconnection attempts reached. Please refresh the page.");
        return;
      }
      reconnectAttemptRef.current += 1;
      setTimeout(connectWebSocket, Math.min(1000 * Math.pow(2, reconnectAttemptRef.current - 1), 16000));
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      throttledSetToken.cancel();
    };
  }, [mint, throttledSetToken]);

  return { token, trades, isConnected, error };
} 