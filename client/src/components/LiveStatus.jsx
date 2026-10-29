import { Wifi } from 'lucide-react';

export default function LiveStatus({ lastUpdated }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <Wifi size={16} />
      <span className="font-semibold">System Live</span>
      <span className="text-emerald-700">Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
    </div>
  );
}
