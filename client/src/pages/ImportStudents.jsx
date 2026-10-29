import { useMemo, useState } from 'react';
import { FileSpreadsheet, UploadCloud } from 'lucide-react';
import { api } from '../services/api.js';

const DEFAULT_REGISTRATION_LIST = [
  '192372001', '192372002', '192372003', '192372004', '192372005',
  '192372006', '192372007', '192372008', '192372009', '192372010',
  '192472001', '192472002', '192472003', '192472004', '192472005',
  '192472006', '192472007', '192472008', '192472009', '192472010',
  '192311001', '192311002', '192311003', '192311004', '192311005',
  '192311006', '192311007', '192311008', '192311009', '192311010'
].join('\n');

export default function ImportStudents() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [manualList, setManualList] = useState(DEFAULT_REGISTRATION_LIST);
  const [groupSize, setGroupSize] = useState(40);

  const getUploadRoute = (selectedFile) => {
    if (selectedFile && /\.pdf$/i.test(selectedFile.name)) {
      return '/students/department-pdf';
    }
    return '/students/import';
  };

  const defaultRangesText = useMemo(() => {
    const ranges = [
      ['192372001', '192372400'],
      ['192472001', '192472400'],
      ['192311001', '192311500']
    ];
    const values = [];
    for (const [start, end] of ranges) {
      const startNumber = Number(start);
      const endNumber = Number(end);
      for (let number = startNumber; number <= endNumber; number += 1) {
        values.push(String(number));
      }
    }
    return values.join('\n');
  }, []);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadRoute = getUploadRoute(selectedFile);
      const { data } = await api.post(uploadRoute, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(data);
      setMessage(`${data.detected || 0} records detected | ${data.validCount || 0} valid | ${data.invalidCount || 0} invalid`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to import file.');
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('confirm', 'true');
      const { data } = await api.post(getUploadRoute(file), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`Import completed. ${data.validCount || 0} students saved.`);
      setPreview(data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const importRegistrationList = async () => {
    if (!manualList.trim()) {
      setMessage('Please enter registration numbers before importing.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/students/import-list', {
        registerNumbers: manualList,
        groupSize,
        shuffle: true,
        year: 3,
        useDefaultRanges: false
      });
      setMessage(data.message || `Imported ${data.validCount || 0} registration numbers.`);
      setPreview({
        detected: data.detected || 0,
        validCount: data.validCount || 0,
        invalidCount: data.duplicateCount || 0,
        valid: data.batches || []
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to import registration list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Student Import</h2>
        <p className="text-sm text-slate-500">Upload CSV/XLSX files or paste a registration list for auto-allocation.</p>
      </div>

      {message ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{message}</div> : null}

      <div className="card p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-sky-400 hover:bg-sky-50">
          <UploadCloud className="mb-3 text-sky-600" size={42} />
          <div className="text-lg font-semibold text-slate-700">Drag and drop CSV/XLSX/PDF here</div>
          <div className="mt-1 text-sm text-slate-500">or click to select a file</div>
          <input type="file" accept=".csv,.xlsx,.pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Registration Number List</h3>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => setManualList(defaultRangesText)}
          >
            Use default list
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="text-sm font-medium text-slate-700">
            <span className="mb-2 block">Paste registration numbers (one per line or comma separated)</span>
            <textarea
              className="field min-h-[180px] resize-y"
              value={manualList}
              onChange={(event) => setManualList(event.target.value)}
              placeholder="192372001\n192372002\n..."
            />
          </label>
          <div className="flex min-w-[160px] flex-col justify-end gap-3">
            <label className="text-sm font-medium text-slate-700">
              <span className="mb-2 block">Students per subject</span>
              <input
                type="number"
                min="1"
                max="100"
                className="field"
                value={groupSize}
                onChange={(event) => setGroupSize(Number(event.target.value) || 40)}
              />
            </label>
            <button className="btn-primary" disabled={loading} onClick={importRegistrationList}>
              {loading ? 'Importing...' : 'Import Registration List'}
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-4 text-lg font-bold">Import Summary</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-xs uppercase text-slate-500">Detected</div>
                <div className="mt-1 text-2xl font-bold">{preview.detected || 0}</div>
              </div>
              <div className="rounded-md bg-emerald-50 p-3">
                <div className="text-xs uppercase text-emerald-700">Valid</div>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{preview.validCount || 0}</div>
              </div>
              <div className="rounded-md bg-rose-50 p-3">
                <div className="text-xs uppercase text-rose-700">Invalid</div>
                <div className="mt-1 text-2xl font-bold text-rose-700">{preview.invalidCount || 0}</div>
              </div>
            </div>

            {preview.valid?.length ? (
              <div className="mt-5">
                <button className="btn-primary" onClick={confirmImport} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Import'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="card p-5">
            <h3 className="mb-4 text-lg font-bold">Detected Students</h3>
            {preview.valid?.length ? (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {preview.valid.slice(0, 6).map((batch, index) => (
                  <div key={index} className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
                    {Array.isArray(batch) ? (
                      <div>{batch.join(', ')}</div>
                    ) : typeof batch === 'object' && batch !== null ? (
                      <div>
                        <div className="font-semibold">{batch.registerNumber || 'Unknown registration number'}</div>
                        <div>{batch.name || 'Unnamed student'} | {batch.branch || 'Department not detected'}</div>
                      </div>
                    ) : (
                      <div>{String(batch)}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No batches generated.</div>
            )}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2 text-lg font-bold">
          <FileSpreadsheet size={20} />
          Expected Columns
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {['Register Number', 'Name', 'Branch', 'Year', 'Section'].map((column) => (
            <span key={column} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{column}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
