const DEPARTMENT_RULES = [
  { prefix: '192372', department: 'CSE_AI', label: 'CSE AI' },
  { prefix: '192311', department: 'AIML', label: 'AIML' },
  { prefix: '192371', department: 'CSE', label: 'CSE' },
  { prefix: '192324', department: 'ECE', label: 'ECE' },
  { prefix: '192312', department: 'MEC', label: 'MEC' },
  { prefix: '192322', department: 'EEE', label: 'EEE' },
  { prefix: '192373', department: 'CSE_DS', label: 'CSE DS' }
];

export function normalizeDepartmentName(rawValue = '') {
  const value = String(rawValue || '').trim().toUpperCase();
  if (!value) return '';
  const cleaned = value.replace(/[^A-Z0-9_\s-]/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (cleaned === 'CSE AI' || cleaned === 'CSE_AI') return 'CSE_AI';
  if (cleaned === 'CSE DS' || cleaned === 'CSE_DS') return 'CSE_DS';
  if (cleaned.includes('AIML')) return 'AIML';
  if (cleaned.includes('CSE')) return 'CSE';
  if (cleaned.includes('ECE')) return 'ECE';
  if (cleaned.includes('MEC')) return 'MEC';
  if (cleaned.includes('EEE')) return 'EEE';
  return cleaned;
}

export function detectDepartmentFromRegisterNumber(registerNumber = '') {
  const value = String(registerNumber || '').trim();
  if (!/^\d{9}$/.test(value)) return null;
  const prefix = value.slice(0, 6);
  const match = DEPARTMENT_RULES.find((rule) => prefix === rule.prefix);
  return match ? match.department : null;
}

export function validateStudentRegistration(registerNumber, departmentName = '') {
  const value = String(registerNumber || '').trim();
  if (!value) return { valid: false, reason: 'Missing register number' };
  if (!/^\d{9}$/.test(value)) {
    return { valid: false, reason: 'Registration number must be exactly 9 numeric digits with no letters or spaces.' };
  }

  const detectedDepartment = detectDepartmentFromRegisterNumber(value);
  if (!detectedDepartment) {
    return { valid: false, reason: 'Registration number prefix is not recognized for any allowed department.' };
  }

  if (departmentName) {
    const normalizedDepartment = normalizeDepartmentName(departmentName);
    if (normalizedDepartment && normalizedDepartment !== detectedDepartment) {
      return {
        valid: false,
        reason: `Registration number ${value} belongs to ${detectedDepartment}, not ${normalizedDepartment}.`
      };
    }
  }

  return { valid: true, department: detectedDepartment };
}

export const DEPARTMENT_CONFIG = {
  CSE_AI: { label: 'CSE AI', prefix: '192372' },
  AIML: { label: 'AIML', prefix: '192311' },
  CSE: { label: 'CSE', prefix: '192371' },
  ECE: { label: 'ECE', prefix: '192324' },
  MEC: { label: 'MEC', prefix: '192312' },
  EEE: { label: 'EEE', prefix: '192322' },
  CSE_DS: { label: 'CSE DS', prefix: '192373' }
};

export function getDepartmentRules() {
  return DEPARTMENT_RULES.map((rule) => ({ ...rule }));
}
