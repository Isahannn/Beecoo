import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

const SmartSearch = ({ onSearchChange, disabled }) => {
  const [query, setQuery] = useState(() => localStorage.getItem('searchQuery') || '');

  const debouncedOnSearchChange = useCallback(
    debounce((newQuery) => {
      console.log('Debounced search query:', newQuery);
      localStorage.setItem('searchQuery', newQuery);
      onSearchChange(newQuery);
    }, 500),
    [onSearchChange]
  );

  const handleChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedOnSearchChange(newQuery);
  }, [debouncedOnSearchChange]);

  const handleClear = useCallback(() => {
    setQuery('');
    localStorage.setItem('searchQuery', '');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="search-bar">
      <div className="relative w-full max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Поиск по имени..."
          className="search-input"
          disabled={disabled}
          aria-label="Поиск пользователей по имени"
        />
        {query && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors duration-200"
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SmartSearch);