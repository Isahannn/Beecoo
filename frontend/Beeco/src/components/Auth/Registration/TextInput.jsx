import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  ...props
}) => (
  <div className="inputGroup">
    <label htmlFor={id} className="label">{label}</label>
    <input
      id={id}
      name={name}
      value={value || ''}
      onChange={onChange}
      {...props}
      className="input"
    />
    {error && <div className="error">{error}</div>}
  </div>
);

TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default TextInput;