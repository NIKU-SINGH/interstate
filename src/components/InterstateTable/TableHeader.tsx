interface TableHeaderProps {
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export default function TableHeader({ sortKey, sortDirection, onSort }: TableHeaderProps) {
  return (
    <thead>
      <tr className="bg-neutral-800/80">
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase cursor-pointer" onClick={() => onSort('name')}>
          Pair Info {sortKey === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
        </th>
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase cursor-pointer" onClick={() => onSort('fully_diluted_value')}>
          Market Cap {sortKey === 'fully_diluted_value' && (sortDirection === 'asc' ? '▲' : '▼')}
        </th>
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase cursor-pointer" onClick={() => onSort('total_liquidity_usd')}>
          Liquidity {sortKey === 'total_liquidity_usd' && (sortDirection === 'asc' ? '▲' : '▼')}
        </th>
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase cursor-pointer" onClick={() => onSort('volume')}>
          Volume {sortKey === 'volume' && (sortDirection === 'asc' ? '▲' : '▼')}
        </th>
        <th className="flex items-center gap-1 px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase cursor-pointer" onClick={() => onSort('txns')}>
          TXNS {sortKey === 'txns' && (sortDirection === 'asc' ? '▲' : '▼')}
        </th>
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase">
          Audit Log
        </th>
        <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-neutral-200 uppercase">
          Action
        </th>
      </tr>
    </thead>
  );
} 