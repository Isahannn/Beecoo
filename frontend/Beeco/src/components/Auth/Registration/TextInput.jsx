import React from 'react';
import PropTypes from 'prop-types';
import './style/Input.css'

const TextInput = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  ...props
}) => {
  const isFilled = value && value.length > 0;

  return (
    <div className="float-label-group">
      <input
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        {...props}
        className={`float-input ${error ? 'has-error' : ''}`}
        placeholder=" "
      />
      <label
        htmlFor={id}
        className={`float-label ${isFilled ? 'filled' : ''}`}
      >
        {label}
      </label>
      {error && <div className="float-error">{error}</div>}
    </div>
  );
};

TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default TextInput;