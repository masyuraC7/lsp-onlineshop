// Utility untuk validasi form umum
export function validateRequiredFields(form, requiredFields, customMessages = {}) {
  const errors = {};
  requiredFields.forEach((field) => {
    if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
      errors[field] = customMessages[field] || 'Field wajib diisi';
    }
  });
  return errors;
}

export function validateEmail(email, messageIfEmpty = 'Email harus diisi', messageIfInvalid = 'Format email tidak valid') {
  if (!email) return messageIfEmpty;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return messageIfInvalid;
  return '';
}
