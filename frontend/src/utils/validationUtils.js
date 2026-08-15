/**
 * FreeMatch AI - Comprehensive Validation Utility
 * Standardized frontend validation helpers for forms, fields, file uploads, and dates.
 */

// 1. NAME VALIDATION
export const validateName = (name = '', fieldLabel = 'Name') => {
  if (typeof name !== 'string') return { valid: false, error: `${fieldLabel} is required.` };
  const clean = name.trim();
  if (!clean) return { valid: false, error: `${fieldLabel} cannot be empty or whitespace only.` };
  if (clean.length < 2) return { valid: false, error: `${fieldLabel} must be at least 2 characters long.` };
  if (clean.length > 60) return { valid: false, error: `${fieldLabel} cannot exceed 60 characters.` };

  // Reject numbers or repeated punctuation
  if (/^[0-9]+$/.test(clean)) return { valid: false, error: `${fieldLabel} cannot consist only of numbers.` };
  if (/^[^a-zA-Z0-9]+$/.test(clean)) return { valid: false, error: `${fieldLabel} cannot consist only of symbols.` };
  if (/^(.)\1{3,}$/.test(clean)) return { valid: false, error: `${fieldLabel} contains invalid repeated characters.` };

  // Allow alphabetic names, spaces, hyphens, apostrophes, periods
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'\-.]+$/;
  if (!nameRegex.test(clean)) {
    return { valid: false, error: `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes.` };
  }

  return { valid: true, value: clean };
};

// 2. EMAIL VALIDATION
export const validateEmail = (email = '') => {
  if (typeof email !== 'string') return { valid: false, error: 'Email address is required.' };
  const clean = email.trim().toLowerCase();
  if (!clean) return { valid: false, error: 'Email address cannot be empty.' };
  if (clean.includes(' ')) return { valid: false, error: 'Email address cannot contain spaces.' };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  return { valid: true, value: clean };
};

// 3. PHONE NUMBER VALIDATION
export const validatePhone = (phone = '', required = false) => {
  if (typeof phone !== 'string') return required ? { valid: false, error: 'Phone number is required.' } : { valid: true, value: '' };
  const clean = phone.trim();
  if (!clean) {
    if (required) return { valid: false, error: 'Phone number cannot be empty.' };
    return { valid: true, value: '' };
  }

  // Reject alphabetic letters
  if (/[a-zA-Z]/.test(clean)) {
    return { valid: false, error: 'Phone number cannot contain letters.' };
  }

  // Support international phone formats: +, digits, spaces, hyphens, parentheses (7 to 20 chars)
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(clean)) {
    return { valid: false, error: 'Please enter a valid phone number (7 to 20 digits, spaces, or country code).' };
  }

  return { valid: true, value: clean };
};

// 4. TITLE VALIDATION (Professional Title, Project Title, Task Title, Certification Name)
export const validateTitle = (title = '', fieldLabel = 'Title', minLen = 3, maxLen = 150) => {
  if (typeof title !== 'string') return { valid: false, error: `${fieldLabel} is required.` };
  const clean = title.trim();
  if (!clean) return { valid: false, error: `${fieldLabel} cannot be empty or whitespace only.` };
  if (clean.length < minLen) return { valid: false, error: `${fieldLabel} must be at least ${minLen} characters.` };
  if (clean.length > maxLen) return { valid: false, error: `${fieldLabel} cannot exceed ${maxLen} characters.` };

  if (/^[0-9]+$/.test(clean)) return { valid: false, error: `${fieldLabel} cannot consist only of numbers.` };
  if (/^[^a-zA-Z0-9]+$/.test(clean)) return { valid: false, error: `${fieldLabel} cannot consist only of symbols.` };

  return { valid: true, value: clean };
};

// 5. TEXT / DESCRIPTION VALIDATION (Bio, Description, About Me, Cover Letter)
export const validateText = (text = '', fieldLabel = 'Description', minLen = 5, maxLen = 2000, required = true) => {
  if (typeof text !== 'string') {
    if (!required) return { valid: true, value: '' };
    return { valid: false, error: `${fieldLabel} is required.` };
  }
  const clean = text.trim();
  if (!clean) {
    if (!required) return { valid: true, value: '' };
    return { valid: false, error: `${fieldLabel} cannot be empty or whitespace only.` };
  }
  if (clean.length < minLen) return { valid: false, error: `${fieldLabel} must be at least ${minLen} characters.` };
  if (clean.length > maxLen) return { valid: false, error: `${fieldLabel} cannot exceed ${maxLen} characters.` };

  if (/^[^a-zA-Z0-9]+$/.test(clean)) return { valid: false, error: `${fieldLabel} contains invalid symbols.` };

  return { valid: true, value: clean };
};

// 6. MONETARY / RATE VALIDATION (Hourly Rate, Budget, Earnings, Payment Amount)
export const validateMoney = (amount, fieldLabel = 'Amount', minVal = 0, maxVal = 1000000, required = true) => {
  if (amount === undefined || amount === null || amount === '') {
    if (!required) return { valid: true, value: 0 };
    return { valid: false, error: `${fieldLabel} is required.` };
  }

  let numStr = String(amount).trim();
  if (numStr.startsWith('$')) numStr = numStr.slice(1).trim();

  if (/[a-zA-Z]/.test(numStr)) {
    return { valid: false, error: `${fieldLabel} must be a valid numeric amount.` };
  }

  const num = parseFloat(numStr);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: `Please enter a valid numeric value for ${fieldLabel}.` };
  }

  if (num < minVal) {
    return { valid: false, error: `${fieldLabel} cannot be less than $${minVal}.` };
  }

  if (num > maxVal) {
    return { valid: false, error: `${fieldLabel} cannot exceed $${maxVal.toLocaleString()}.` };
  }

  return { valid: true, value: num, formatted: `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` };
};

// 7. NUMERIC TYPE VALIDATION (Years of Experience, Hours Per Week)
export const validateNumber = (val, fieldLabel = 'Value', minVal = 0, maxVal = 100, isInteger = false) => {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: `${fieldLabel} is required.` };
  }

  const numStr = String(val).trim().replace(/\+$/, '');
  if (/[a-zA-Z]/.test(numStr)) {
    return { valid: false, error: `${fieldLabel} must be a valid number.` };
  }

  const num = isInteger ? parseInt(numStr, 10) : parseFloat(numStr);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: `${fieldLabel} must be a valid number.` };
  }

  if (num < minVal) {
    return { valid: false, error: `${fieldLabel} cannot be less than ${minVal}.` };
  }

  if (num > maxVal) {
    return { valid: false, error: `${fieldLabel} cannot exceed ${maxVal}.` };
  }

  return { valid: true, value: Math.round(num * 100) / 100 };
};

export const validateHourlyRate = (rate, minVal = 1, maxVal = 1000) => {
  return validateMoney(rate, 'Hourly rate', minVal, maxVal, true);
};

// 8. SKILL VALIDATION
export const validateSkill = (skillName = '', existingSkills = []) => {
  if (typeof skillName !== 'string') return { valid: false, error: 'Skill name is required.' };
  const clean = skillName.trim();
  if (!clean) return { valid: false, error: 'Skill name cannot be empty or whitespace only.' };
  if (clean.length < 2) return { valid: false, error: 'Skill name must be at least 2 characters.' };
  if (clean.length > 50) return { valid: false, error: 'Skill name cannot exceed 50 characters.' };

  if (/^[^a-zA-Z0-9+#.\s]+$/.test(clean)) {
    return { valid: false, error: 'Skill name contains invalid characters.' };
  }

  const isDuplicate = existingSkills.some(s => {
    const sName = typeof s === 'string' ? s : (s?.name || s?.title || '');
    return sName.trim().toLowerCase() === clean.toLowerCase();
  });

  if (isDuplicate) {
    return { valid: false, error: `Skill "${clean}" has already been added.` };
  }

  return { valid: true, value: clean };
};

// 9. URL VALIDATION
export const validateUrl = (url = '', fieldLabel = 'URL', required = false) => {
  if (typeof url !== 'string') {
    if (!required) return { valid: true, value: '' };
    return { valid: false, error: `${fieldLabel} is required.` };
  }
  const clean = url.trim();
  if (!clean) {
    if (!required) return { valid: true, value: '' };
    return { valid: false, error: `${fieldLabel} cannot be empty.` };
  }

  let formattedUrl = clean;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
  if (!urlRegex.test(formattedUrl)) {
    return { valid: false, error: `Please enter a valid web URL for ${fieldLabel} (e.g. https://example.com).` };
  }

  return { valid: true, value: formattedUrl };
};

// 10. PROFILE PICTURE FILE VALIDATION
export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No image file selected.' };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();

  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExt = validExts.some(ext => fileName.endsWith(ext));

  if (!validTypes.includes(fileType) && !hasValidExt) {
    return { valid: false, error: 'Please upload a valid JPG, PNG, or WEBP image.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Profile picture file size must not exceed 5MB.' };
  }

  return { valid: true };
};

// 11. RESUME FILE VALIDATION
export const validateResumeFile = (file) => {
  if (!file) return { valid: false, error: 'No resume file selected.' };

  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();

  const validExts = ['.pdf', '.doc', '.docx'];
  const hasValidExt = validExts.some(ext => fileName.endsWith(ext));

  if (!validTypes.includes(fileType) && !hasValidExt) {
    return { valid: false, error: 'Please upload a valid PDF, DOC, or DOCX resume document.' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Resume file size must not exceed 10MB.' };
  }

  return { valid: true };
};

// 12. DATE RANGE VALIDATION
export const validateDateRange = (startDateStr, endDateStr, isCurrent = false) => {
  if (!startDateStr) return { valid: false, error: 'Start date is required.' };
  if (isCurrent) return { valid: true };
  if (!endDateStr) return { valid: false, error: 'End date is required.' };

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime())) return { valid: false, error: 'Invalid start date format.' };
  if (isNaN(end.getTime())) return { valid: false, error: 'Invalid end date format.' };

  if (start > end) {
    return { valid: false, error: 'Start date cannot be after end date.' };
  }

  return { valid: true };
};

// 13. FUTURE DATE VALIDATION
export const validateFutureDate = (dateStr, fieldLabel = 'Deadline') => {
  if (!dateStr) return { valid: false, error: `${fieldLabel} is required.` };
  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return { valid: false, error: `Invalid ${fieldLabel} date format.` };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (targetDate < today) {
    return { valid: false, error: `${fieldLabel} date cannot be in the past.` };
  }

  return { valid: true };
};
