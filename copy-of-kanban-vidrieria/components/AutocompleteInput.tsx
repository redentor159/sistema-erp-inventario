
import React, { useState, useEffect, useRef } from 'react';
import { Suggestion } from '../data/crystalTypes';

interface AutocompleteInputProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string, value: string } }) => void;
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  placeholder?: string;
  suggestions: Suggestion[];
  className?: string;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ name, value, onChange, onSelectSuggestion, placeholder, suggestions, className, required }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onChange({ target: { name, value: userInput } });

    if (userInput) {
      const filtered = suggestions.filter(
        suggestion =>
          suggestion.descripcion.toLowerCase().includes(userInput.toLowerCase()) ||
          suggestion.sku.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onChange({ target: { name, value: suggestion.descripcion } });
    }
    setShowSuggestions(false);
  };
  
  const handleFocus = () => {
    if(suggestions.length > 0) {
        setShowSuggestions(true);
        // Initially show all, or filter based on current value if any
        const currentInput = value || '';
        const filtered = suggestions.filter(
            suggestion =>
              suggestion.descripcion.toLowerCase().includes(currentInput.toLowerCase()) ||
              suggestion.sku.toLowerCase().includes(currentInput.toLowerCase())
        );
        setFilteredSuggestions(filtered);
     }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 cursor-pointer hover:bg-indigo-100 text-sm"
            >
              <span className="font-bold text-gray-800">{suggestion.sku}</span>
              <span className="text-gray-600"> - {suggestion.descripcion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;