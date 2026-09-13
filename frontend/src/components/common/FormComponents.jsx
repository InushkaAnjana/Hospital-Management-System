import React from 'react';
import { X } from 'lucide-react';

export const FormCard = ({ title, subtitle, children, onSubmit, actions, style = {} }) => {
  return (
    <form className="form-card" onSubmit={onSubmit} style={style}>
      {(title || subtitle) && (
        <div className="form-header">
          {title && <h3 className="form-title">{title}</h3>}
          {subtitle && <p className="form-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="form-body">{children}</div>
      {actions && <div className="form-actions">{actions}</div>}
    </form>
  );
};

export const FormGrid = ({ children, columns = 'auto-fit' }) => {
  return <div className="form-grid">{children}</div>;
};

export const FormGroup = ({
  label,
  required = false,
  error = null,
  hint = null,
  children,
  style = {},
}) => {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      {children}
      {error && <span className="form-error-text">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
};

export const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error = false,
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={`form-input ${error ? 'error' : ''}`}
      {...props}
    />
  );
};

export const Select = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = false,
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`form-select ${error ? 'error' : ''}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  error = false,
  disabled = false,
  ...props
}) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`form-textarea ${error ? 'error' : ''}`}
      {...props}
    />
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  maxWidth = '560px',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="topbar-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
