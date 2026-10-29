import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const outputDirectory = process.cwd();
const departments = [
  { prefix: '192372', code: 'CSE_AI', label: 'CSE AI' },
  { prefix: '192311', code: 'AIML', label: 'AIML' },
  { prefix: '192371', code: 'CSE', label: 'CSE' },
  { prefix: '192324', code: 'ECE', label: 'ECE' },
  { prefix: '192312', code: 'MEC', label: 'MEC' },
  { prefix: '192322', code: 'EEE', label: 'EEE' },
  { prefix: '192373', code: 'CSE_DS', label: 'CSE DS' }
];

function createStudentRows(department) {
  return Array.from({ length: 600 }, (_, index) => {
    const sequence = String(index + 1).padStart(3, '0');
    return {
      slNo: index + 1,
      registerNumber: `${department.prefix}${sequence}`,
      name: `${department.label} Student ${sequence}`,
      department: department.label
    };
  });
}

function writeDepartmentPdf(department) {
  const outputPath = path.join(outputDirectory, `${department.code}_600_students.pdf`);
  const document = new PDFDocument({
    size: 'A4',
    margin: 36,
    bufferPages: true,
    info: {
      Title: `${department.label} Student List - 600 Students`,
      Author: 'SIMATS Exam Seating System'
    }
  });
  const output = fs.createWriteStream(outputPath);
  document.pipe(output);

  const pageWidth = document.page.width - document.page.margins.left - document.page.margins.right;
  const columns = [
    { title: 'Sl No', width: 52, align: 'center' },
    { title: 'Reg No', width: 105, align: 'left' },
    { title: 'Name', width: pageWidth - 52 - 105 - 105, align: 'left' },
    { title: 'Department', width: 105, align: 'left' }
  ];
  const rowHeight = 22;
  const headerHeight = 28;
  const tableTop = 122;
  const bottomLimit = document.page.height - document.page.margins.bottom;
  let currentY = tableTop;

  const drawCell = (text, x, y, width, height, options = {}) => {
    document.rect(x, y, width, height).strokeColor('#9ca3af').stroke();
    document.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(options.bold ? 9 : 8.5)
      .fillColor('#111827')
      .text(String(text), x + 5, y + (options.bold ? 8 : 6), width - 10, {
        align: options.align || 'left',
        lineBreak: false,
        ellipsis: true
      });
  };

  const drawHeader = () => {
    let x = document.page.margins.left;
    columns.forEach((column) => {
      drawCell(column.title, x, currentY, column.width, headerHeight, {
        bold: true,
        align: column.align
      });
      x += column.width;
    });
    currentY += headerHeight;
  };

  document.fillColor('#0f172a').font('Helvetica-Bold').fontSize(18)
    .text('SIMATS', document.page.margins.left, 38, { align: 'center', width: pageWidth });
  document.font('Helvetica-Bold').fontSize(13)
    .text(`${department.label} Student List`, document.page.margins.left, 66, { align: 'center', width: pageWidth });
  document.font('Helvetica').fontSize(9).fillColor('#475569')
    .text('600 students | Registration numbers 001-600', document.page.margins.left, 89, { align: 'center', width: pageWidth });

  drawHeader();
  createStudentRows(department).forEach((student) => {
    if (currentY + rowHeight > bottomLimit) {
      document.addPage();
      currentY = 48;
      document.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a')
        .text(`${department.label} Student List`, document.page.margins.left, 28);
      drawHeader();
    }

    let x = document.page.margins.left;
    [student.slNo, student.registerNumber, student.name, student.department].forEach((value, index) => {
      drawCell(value, x, currentY, columns[index].width, rowHeight, { align: columns[index].align });
      x += columns[index].width;
    });
    currentY += rowHeight;
  });

  const pageRange = document.bufferedPageRange();
  for (let pageIndex = 0; pageIndex < pageRange.count; pageIndex += 1) {
    document.switchToPage(pageRange.start + pageIndex);
    document.font('Helvetica').fontSize(8).fillColor('#64748b')
      .text(`SIMATS | ${department.label} | Page ${pageIndex + 1} of ${pageRange.count}`, document.page.margins.left, document.page.height - 24, {
        align: 'center',
        width: pageWidth
      });
  }

  document.end();
  return new Promise((resolve, reject) => {
    output.on('finish', () => resolve(outputPath));
    output.on('error', reject);
  });
}

for (const department of departments) {
  const outputPath = await writeDepartmentPdf(department);
  console.log(`Created ${outputPath}`);
}
