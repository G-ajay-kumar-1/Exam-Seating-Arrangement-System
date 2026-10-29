const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

function normalizeTextValue(value = '') {
  return String(value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTextFromPdfBuffer(buffer) {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  return loadingTask.promise.then((pdf) => {
    const pagePromises = Array.from({ length: pdf.numPages }, (_, index) => pdf.getPage(index + 1));
    return Promise.all(pagePromises).then((pages) => Promise.all(pages.map(async (page) => {
      const textContent = await page.getTextContent();
      const items = (textContent.items || []).map((item) => ({
        str: normalizeTextValue(item.str),
        x: Number(item.transform?.[4] || 0),
        y: Number(item.transform?.[5] || 0)
      })).filter((item) => item.str);

      const rowMap = new Map();
      items.forEach((item) => {
        const rowKey = Math.round(item.y / 2) * 2;
        const row = rowMap.get(rowKey) || [];
        row.push(item);
        rowMap.set(rowKey, row);
      });

      const rows = Array.from(rowMap.values())
        .map((row) => row.sort((a, b) => a.x - b.x).map((item) => item.str).join(' '))
        .filter(Boolean)
        .map((rowText) => rowText.replace(/\s{2,}/g, ' '))
        .filter((rowText) => /\d{9}/.test(rowText) || /AIML|CSE_AI|CSE_DS|CSE|ECE|MEC|EEE/.test(rowText));

      return rows.join('\n');
    }))).then((pageTexts) => pageTexts.join('\n'));
  });
}

function normalizeDepartmentNameFromText(value = '') {
  const text = String(value || '').trim().toUpperCase();
  if (text.includes('CSE AI') || text.includes('CSE_AI')) return 'CSE_AI';
  if (text.includes('CSE DS') || text.includes('CSE_DS')) return 'CSE_DS';
  if (text.includes('AIML')) return 'AIML';
  if (text.includes('CSE')) return 'CSE';
  if (text.includes('ECE')) return 'ECE';
  if (text.includes('MEC')) return 'MEC';
  if (text.includes('EEE')) return 'EEE';
  return '';
}

function validateStudentRegistration(registerNumber, department) {
  const value = String(registerNumber || '').trim();
  if (!/^\d{9}$/.test(value)) return { valid: false, reason: 'Registration must be exactly 9 numeric digits.' };
  const detectedDepartment = detectDepartmentFromRegisterNumber(value);
  if (!detectedDepartment) return { valid: false, reason: 'Unknown department prefix.' };
  if (department && detectedDepartment !== department) {
    return { valid: false, reason: `Number belongs to ${detectedDepartment} not ${department}.` };
  }
  return { valid: true, department: detectedDepartment };
}

function detectDepartmentFromRegisterNumber(registerNumber = '') {
  const value = String(registerNumber || '').trim();
  if (!/^\d{9}$/.test(value)) return null;
  const prefix = value.slice(0, 6);
  const map = {
    '192372': 'CSE_AI',
    '192311': 'AIML',
    '192371': 'CSE',
    '192324': 'ECE',
    '192312': 'MEC',
    '192322': 'EEE',
    '192373': 'CSE_DS'
  };
  return map[prefix] || null;
}

export function parseDepartmentText(text = '', defaultDepartment = '') {
  const normalizedText = String(text || '')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[|•]/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

  const lines = normalizedText
    .split('\n')
    .map((line) => normalizeTextValue(line))
    .filter(Boolean)
    .filter((line) => /\d{9}/.test(line) || /AIML|CSE[_ ]AI|CSE[_ ]DS|CSE|ECE|MEC|EEE/.test(line));

  const records = [];
  const errors = [];
  const seen = new Set();
  for (const line of lines) {
    const tokens = line.split(/\s+/);
    if (tokens.length < 3) continue;

    const registrationIndex = tokens.findIndex((token) => /^\d{9}$/.test(token));
    if (registrationIndex === -1) continue;

    const registrationNumber = tokens[registrationIndex];
    let departmentIndex = -1;
    for (let index = tokens.length - 1; index > registrationIndex; index -= 1) {
      if (/AIML|CSE|ECE|MEC|EEE/i.test(tokens[index])) {
        departmentIndex = index;
        break;
      }
    }
    if (departmentIndex === -1) continue;

    const departmentText = tokens[departmentIndex].toUpperCase() === 'CSE'
      && /AI|DS/i.test(tokens[departmentIndex + 1] || '')
      ? `${tokens[departmentIndex]} ${tokens[departmentIndex + 1]}`
      : tokens[departmentIndex];
    const department = normalizeDepartmentNameFromText(departmentText || defaultDepartment || '');
    const validation = validateStudentRegistration(registrationNumber, department || defaultDepartment || '');
    if (!validation.valid) {
      errors.push(`${registrationNumber}: ${validation.reason}`);
      continue;
    }

    const nameTokens = tokens.slice(registrationIndex + 1, departmentIndex);
    const cleanName = normalizeTextValue(nameTokens.join(' ')).replace(/\s+\d+$/g, '').replace(/[.,;]+$/g, '');
    if (!cleanName || seen.has(registrationNumber)) continue;
    seen.add(registrationNumber);

    records.push({
      registerNumber: String(registrationNumber),
      name: cleanName,
      branch: validation.department,
      year: 3,
      section: 'A',
      email: `${registrationNumber.toLowerCase()}@college.edu`
    });
  }

  if (!records.length) {
    const fallbackPattern = /(\d{9})\s+([A-Za-z][A-Za-z' .-]{1,80}?)(?:\s+\d+)?\s*(?:AIML|CSE_AI|CSE_DS|CSE|ECE|MEC|EEE)/gi;
    let fallbackMatch;
    while ((fallbackMatch = fallbackPattern.exec(normalizedText)) !== null) {
      const [, registrationNumber, nameText] = fallbackMatch;
      const matchedText = fallbackMatch[0];
      const department = normalizeDepartmentNameFromText(matchedText.match(/(?:AIML|CSE_AI|CSE_DS|CSE|ECE|MEC|EEE)/i)?.[0] || defaultDepartment || '');
      const validation = validateStudentRegistration(registrationNumber, department || defaultDepartment || '');
      if (!validation.valid) {
        errors.push(`${registrationNumber}: ${validation.reason}`);
        continue;
      }

      const cleanName = normalizeTextValue(nameText).replace(/\s+\d+$/g, '').replace(/[.,;]+$/g, '');
      if (!cleanName || seen.has(registrationNumber)) continue;
      seen.add(registrationNumber);

      records.push({
        registerNumber: String(registrationNumber),
        name: cleanName,
        branch: validation.department,
        year: 3,
        section: 'A',
        email: `${registrationNumber.toLowerCase()}@college.edu`
      });
    }
  }

  return { records, errors };
}

export async function parseDepartmentPdf(buffer, defaultDepartment = '') {
  if (!buffer || !buffer.length) {
    return { records: [], errors: ['Empty PDF file.'] };
  }

  try {
    const text = await extractTextFromPdfBuffer(buffer);
    const parsed = parseDepartmentText(text, defaultDepartment);
    if (parsed.records.length) {
      return parsed;
    }
    return { records: [], errors: parsed.errors.length ? parsed.errors : ['No valid registration records matched the department PDF format.'] };
  } catch (error) {
    return { records: [], errors: [error.message || 'Unable to read PDF file.'] };
  }
}
