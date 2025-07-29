import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar } from 'recharts';
import type { Time } from "lightweight-charts";

export type OHLC = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

function formatTime(t: Time) {
  if (typeof t === 'number') {
    const d = new Date(t * 1000);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  return String(t);
}

export function OHLCChart({ data, width = 900, height = 350, bodyWidth = 12, wickWidth = 2 }: { data: OHLC[]; width?: number; height?: number; bodyWidth?: number; wickWidth?: number }) {
  // Recharts expects data as array of objects with x/y values
  const chartData = data.map((d, i) => ({
    ...d,
    timeLabel: formatTime(d.time),
    index: i,
  }));

  // Find min/max for scaling
  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));

  // Helper to map price to pixel Y
  function priceToY(price: number, chartHeight: number) {
    return ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight;
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis dataKey="timeLabel" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={{ stroke: '#27272a' }} tickLine={false} minTickGap={20} />
        <YAxis domain={[minPrice, maxPrice]} tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={{ stroke: '#27272a' }} tickLine={false} width={60} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', color: '#fff' }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: any, name: string) => [value, name.toUpperCase()]}
        />
        {/* Candlestick bars */}
        <Bar
          dataKey="high"
          fill="#fff0"
          shape={(props: any) => {
            const { x, y, width: w, height: h, payload } = props;
            const chartHeight = height ? height - 40 : 350;
            const openY = priceToY(payload.open, chartHeight);
            const closeY = priceToY(payload.close, chartHeight);
            const highY = priceToY(payload.high, chartHeight);
            const lowY = priceToY(payload.low, chartHeight);
            const color = payload.close > payload.open ? '#10b981' : '#ef4444';
            return (
              <g>
                {/* Wick */}
                <rect x={x + w / 2 - wickWidth / 2} y={highY} width={wickWidth} height={lowY - highY} fill={color} />
                {/* Body */}
                <rect
                  x={x + w / 2 - bodyWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={bodyWidth}
                  height={Math.max(2, Math.abs(closeY - openY))}
                  fill={color}
                  rx={2}
                />
              </g>
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
} 