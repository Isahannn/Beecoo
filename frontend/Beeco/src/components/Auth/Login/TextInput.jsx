import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  minLength = 0,
  className = '',
}) => (
  <div className={`form-group ${className}`}>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      className={`form-control ${className}`}
      style={{ fontSize: '1.0rem', padding: '10px' , width:'100%',border:'1px solid black'}}
    />
  </div>
);

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  minLength: PropTypes.number,
  className: PropTypes.string,
};

export default TextInput;
