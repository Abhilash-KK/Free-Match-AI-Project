// Avatar helper utility for FreeMatch AI

export const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'FM';
  const clean = name.trim();
  if (!clean) return 'FM';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const validateAvatarFile = (file) => {
  if (!file) return { valid: false, error: 'No file selected.' };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes((file.type || '').toLowerCase())) {
    return { valid: false, error: 'Please upload a valid JPG, PNG, or WEBP image.' };
  }

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Profile picture size exceeds the allowed limit.' };
  }

  return { valid: true };
};
