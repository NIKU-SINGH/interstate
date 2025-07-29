import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import PulseTable from '../components/PulseTable';
import type { Token } from '~/utils/db';
import Header from '../components/Header';
import usePaginatedTokensWebSocket from '../hooks/usePaginatedTokensWebSocket';

export default function PulsePage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use WebSocket for New Pairs
  const { data: newPairsTokens, loading: wsLoading, error: wsError } = usePaginatedTokensWebSocket({ filter: 'new', limit: 20 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/getAllTokens')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tokens');
        return res.json();
      })
      .then((data: { result: Token[] }) => {
        setTokens(data.result || []);
      })
      .catch(() => setError('Failed to load tokens.'))
      .finally(() => setLoading(false));
  }, []);

  // Segregate tokens
  const newPairs = tokens.filter(t => {
    const prog = typeof t.bonding_curve_progress === 'string' ? parseFloat(t.bonding_curve_progress) : t.bonding_curve_progress;
    return prog < 0.6;
  });
  const finalStretch = tokens.filter(t => {
    const prog = typeof t.bonding_curve_progress === 'string' ? parseFloat(t.bonding_curve_progress) : t.bonding_curve_progress;
    return prog > 0.6 && prog < 0.85;
  });
  const migrated = tokens.filter(t => {
    const prog = typeof t.bonding_curve_progress === 'string' ? parseFloat(t.bonding_curve_progress) : t.bonding_curve_progress;
    return prog >= 0.85;
  });

  return (
    <>
      <Head>
        <title>Pulse | Interstate Memeboard</title>
      </Head>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Header />
        <div className="w-full p-4">
          <h1 className="text-2xl font-bold mb-6">Pulse</h1>
          {(loading || wsLoading) ? (
            <div className="flex flex-row w-full overflow-x-auto scrollbar-thin scrollbar-track-neutral-900/50 scrollbar-thumb-neutral-700/50">
              <PulseTable title="New Pairs" tokens={[]} loading skeletonRowCount={10} isFirstOrLast="first" />
              <PulseTable title="Final Stretch" tokens={[]} loading skeletonRowCount={10} />
              <PulseTable title="Migrated" tokens={[]} loading skeletonRowCount={10} isFirstOrLast="last" />
            </div>
          ) : (error || wsError) ? (
            <div className="text-center text-red-400 py-10">{error || wsError}</div>
          ) : (
            <div className="flex flex-row w-full overflow-x-auto scrollbar-thin scrollbar-track-neutral-900/50 scrollbar-thumb-neutral-700/50">
              <PulseTable title="New Pairs" tokens={newPairsTokens} isFirstOrLast="first" />
              <PulseTable title="Final Stretch" tokens={finalStretch} />
              <PulseTable title="Migrated" tokens={migrated} isFirstOrLast="last" />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 