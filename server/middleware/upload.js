import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const valid = [
      'text/csv',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (valid.includes(file.mimetype) || /\.(csv|xlsx|pdf)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only CSV, XLSX, and PDF uploads are allowed'));
  }
});
