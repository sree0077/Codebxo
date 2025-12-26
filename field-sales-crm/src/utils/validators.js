// Validation utilities for form fields

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateDropdown = (value, fieldName) => {
  if (!value || value === '') {
    return `Please select ${fieldName}`;
  }
  return null;
};

export const validateClientForm = (client) => {
  const errors = {};

  const nameError = validateRequired(client.clientName, 'Client Name');
  if (nameError) errors.clientName = nameError;

  const phoneError = validatePhone(client.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  const businessTypeError = validateDropdown(client.businessType, 'Business Type');
  if (businessTypeError) errors.businessType = businessTypeError;

  const usingSystemError = validateDropdown(client.usingSystem, 'Currently Using System');
  if (usingSystemError) errors.usingSystem = usingSystemError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (email, password) => {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateInteractionForm = (interaction) => {
  const errors = {};

  const typeError = validateDropdown(interaction.type, 'Interaction Type');
  if (typeError) errors.type = typeError;

  if (!interaction.notes || interaction.notes.trim() === '') {
    errors.notes = 'Notes are required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

