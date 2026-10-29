import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import Exam from '../models/Exam.js';
import SeatingPlan from '../models/SeatingPlan.js';

async function reportRows(examId) {
  const [exam, plans] = await Promise.all([
    Exam.findById(examId),
    SeatingPlan.find({ examId }).populate('hallId').sort({ block: 1, row: 1, column: 1 }).lean()
  ]);
  if (!exam) throw new Error('Exam not found');

  const sortedPlans = [...plans].sort((a, b) => {
    const blockOrder = String(a.block || '').localeCompare(String(b.block || ''));
    if (blockOrder !== 0) return blockOrder;
    const roomA = Number(a.hallId?.roomNumber || 0);
    const roomB = Number(b.hallId?.roomNumber || 0);
    if (roomA !== roomB) return roomA - roomB;
    const seatA = Number(String(a.seatNumber || '0').replace(/\D/g, '')) || 0;
    const seatB = Number(String(b.seatNumber || '0').replace(/\D/g, '')) || 0;
    return seatA - seatB;
  });

  return {
    exam,
    rows: sortedPlans.map((p, index) => ({
      'Sl No': index + 1,
      'Register No': p.registerNumber,
      Name: p.studentName,
      Department: p.branch,
      Exam: exam.name,
      Subject: exam.subject,
      Timing: `${exam.startTime} - ${exam.endTime}`,
      Room: p.hallId?.roomNumber,
      Block: p.block,
      'Seat No': p.seatNumber,
      Conflict: p.conflict ? 'Yes' : 'No'
    }))
  };
}

export async function csvReport(req, res, next) {
  try {
    const { rows } = await reportRows(req.params.examId);
    const headers = Object.keys(rows[0] || { 'Register No': '', Name: '', Branch: '', Exam: '', Room: '', Block: '', 'Seat No': '' });
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=seating-report.csv');
    res.type('text/csv').send(csv);
  } catch (error) { next(error); }
}

export async function excelReport(req, res, next) {
  try {
    const { rows } = await reportRows(req.params.examId);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Seating Plan');
    const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=seating-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) { next(error); }
}

export async function pdfReport(req, res, next) {
  try {
    const { exam, rows } = await reportRows(req.params.examId);
    const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Disposition', 'attachment; filename=seating-report.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('SIMATS', { align: 'center' });
    doc.fontSize(14).text('Automated Exam Seating System', { align: 'center' }).moveDown(0.3);
    doc.fontSize(9).text(`Exam: ${exam.name}`);
    doc.text(`Subject: ${exam.subject}`);
    doc.text(`Date: ${new Date(exam.date).toDateString()}`);
    doc.text(`Timing: ${exam.startTime} - ${exam.endTime}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`).moveDown(0.5);

    const columns = [
      { key: 'Sl No', width: 38 },
      { key: 'Register No', width: 88 },
      { key: 'Name', width: 150 },
      { key: 'Department', width: 110 },
      { key: 'Room', width: 52 },
      { key: 'Block', width: 100 },
      { key: 'Seat No', width: 56 }
    ];

    const startX = 30;
    const rowHeight = 19;
    const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const tableX = startX;
    let y = doc.y + 8;

    const drawCell = (x, width, text, isHeader = false) => {
      const content = String(text ?? '');
      const cellHeight = rowHeight;

      doc
        .lineWidth(0.5)
        .strokeColor(isHeader ? '#1f2937' : '#475569')
        .rect(x, y, width, cellHeight)
        .stroke();

      if (isHeader) {
        doc.fillColor('#0f172a').rect(x, y, width, cellHeight).fill();
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7).text(content, x + 4, y + 5, { width: width - 8, align: 'left' });
      } else {
        doc.fillColor('#ffffff').rect(x, y, width, cellHeight).fill();
        doc.fillColor('#111827').font('Helvetica').fontSize(7).text(content, x + 4, y + 5, { width: width - 8, align: 'left' });
      }
    };

    const drawHeader = () => {
      let currentX = tableX;
      columns.forEach((col) => {
        drawCell(currentX, col.width, col.key, true);
        currentX += col.width;
      });
      y += rowHeight;
    };

    const drawRow = (row) => {
      let currentX = tableX;
      columns.forEach((col) => {
        drawCell(currentX, col.width, row[col.key], false);
        currentX += col.width;
      });
      y += rowHeight;
    };

    drawHeader();

    rows.forEach((row) => {
      if (y > 520) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 20 });
        y = 35;
        drawHeader();
      }
      drawRow(row);
    });

    doc.end();
  } catch (error) { next(error); }
}
