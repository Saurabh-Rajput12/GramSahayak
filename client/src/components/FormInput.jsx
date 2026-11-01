// Reusable Bootstrap form input component with validation states and helper text
import React from 'react';

// FormInput provides consistent label, input control, and feedback messages
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label fw-semibold text-secondary small mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control rounded-3 py-2 ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {helperText && !error && <div className="form-text small text-muted">{helperText}</div>}
    </div>
  );
};

export default FormInput;
