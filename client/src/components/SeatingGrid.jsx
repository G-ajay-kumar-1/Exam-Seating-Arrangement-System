export default function SeatingGrid({ halls, plans, selectedSeat, onSelect }) {
  const byHall = halls.map((hall) => ({
    hall,
    seats: plans.filter((plan) => String(plan.hallId?._id || plan.hallId) === String(hall._id))
  }));
  return (
    <div className="space-y-6">
      {byHall.map(({ hall, seats }) => {
        const map = new Map(seats.map((seat) => [`${seat.row}:${seat.column}`, seat]));
        return (
          <section className="card p-4" key={hall._id}>
            <div className="mb-4 text-center">
              <h3 className="font-bold">EXAM HALL {hall.roomNumber}</h3>
              <p className="text-sm text-steel">BLOCK {hall.block}</p>
            </div>
            <div className="overflow-x-auto">
              <div className="grid gap-2" style={{ gridTemplateColumns: `90px repeat(${hall.columns}, minmax(116px, 1fr))` }}>
                <div />
                {Array.from({ length: hall.columns }, (_, i) => <div className="text-center text-xs font-bold text-steel" key={i}>COLUMN {i + 1}</div>)}
                {Array.from({ length: hall.rows }, (_, r) => (
                  Array.from({ length: hall.columns + 1 }, (_, c) => {
                    if (c === 0) return <div className="grid h-24 place-items-center text-xs font-bold text-steel" key={`${r}-label`}>ROW {r + 1}</div>;
                    const seat = map.get(`${r + 1}:${c}`);
                    const active = selectedSeat && selectedSeat === seat?.seatNumber;
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => seat && onSelect?.(seat)}
                        className={`h-24 rounded-md border p-2 text-left text-xs ${seat ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-400'} ${seat?.conflict ? 'bg-red-50 border-red-300' : ''} ${active ? 'ring-2 ring-amber-500' : ''}`}
                      >
                        <div className="font-bold">{seat?.seatNumber || `${hall.block}-${String(r + 1).padStart(2, '0')}${String(c).padStart(2, '0')}`}</div>
                        {seat ? <><div>{seat.registerNumber}</div><div className="truncate">{seat.studentName}</div><div className="font-semibold">{seat.branch}</div></> : <div>Available</div>}
                      </button>
                    );
                  })
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
