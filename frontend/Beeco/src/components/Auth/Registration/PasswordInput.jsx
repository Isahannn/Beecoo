import React from 'react';
import PropTypes from 'prop-types';

const PasswordInput = ({
  name,
  label,
  value,
  onChange,
  error,
  ...props
}) => {
  const inputId = `password-${name}`;

  return (
    <div className="inputGroup">
      <label htmlFor={inputId} className="label">{label}</label>
      <input
        type="password"
        id={inputId}
        name={name}
        value={value || ''}
        onChange={onChange}
        {...props}
        className="input"
      />
      {error && <div className="error">{error}</div>}
    </div>
  );
};

PasswordInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default PasswordInput;