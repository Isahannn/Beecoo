import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './style/Input.css';

const PasswordInput = ({
  name,
  label,
  value,
  onChange,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = `password-${name}`;
  const isFilled = value && value.length > 0;

  return (
    <div className="float-label-group">
      <input
        type={showPassword ? 'text' : 'password'}
        id={inputId}
        name={name}
        value={value || ''}
        onChange={onChange}
        {...props}
        className={`float-input ${error ? 'has-error' : ''}`}
        placeholder=" "
      />
      <label
        htmlFor={inputId}
        className={`float-label ${isFilled ? 'filled' : ''}`}
      >
        {label}
      </label>
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={1}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>
      {error && <div className="float-error">{error}</div>}
    </div>
  );
};

PasswordInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default PasswordInput;
