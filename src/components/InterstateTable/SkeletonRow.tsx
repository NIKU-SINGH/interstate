export default function SkeletonRow() {
  return (
    <tr>
      {/* Pair Info skeleton */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 rounded bg-neutral-800 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded bg-neutral-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </td>
      {/* Market Cap skeleton */}
      <td className="px-3 py-2">
        <div className="h-4 w-20 rounded bg-neutral-800 animate-pulse mb-2" />
        <div className="h-3 w-12 rounded bg-neutral-800 animate-pulse" />
      </td>
      {/* Liquidity skeleton */}
      <td className="px-3 py-2">
        <div className="h-4 w-20 rounded bg-neutral-800 animate-pulse" />
      </td>
      {/* Volume skeleton */}
      <td className="px-3 py-2">
        <div className="h-4 w-20 rounded bg-neutral-800 animate-pulse" />
      </td>
      {/* TXNS skeleton */}
      <td className="px-3 py-2">
        <div className="h-4 w-12 rounded bg-neutral-800 animate-pulse mb-2" />
        <div className="h-3 w-16 rounded bg-neutral-800 animate-pulse" />
      </td>
      {/* Audit Log skeleton */}
      <td className="px-3 py-2">
        <div className="h-3 w-12 rounded bg-neutral-800 animate-pulse mb-2" />
        <div className="h-3 w-16 rounded bg-neutral-800 animate-pulse" />
      </td>
      {/* Action skeleton */}
      <td className="px-3 py-2">
        <div className="h-10 w-28 rounded-full bg-neutral-800 animate-pulse" />
      </td>
    </tr>
  );
} 