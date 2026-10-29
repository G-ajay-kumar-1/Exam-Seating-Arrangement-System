export function generateSeats(halls) {
  return halls.flatMap((hall) => {
    const seats = [];
    const hallId = hall._id ? hall._id.toString() : `${hall.block}-${hall.roomNumber}`;
    for (let row = 1; row <= hall.rows; row += 1) {
      for (let column = 1; column <= hall.columns; column += 1) {
        seats.push({
          hallId,
          hall,
          row,
          column,
          seatNumber: `${hall.block}-${String(row).padStart(2, '0')}${String(column).padStart(2, '0')}`
        });
      }
    }
    return seats;
  });
}
