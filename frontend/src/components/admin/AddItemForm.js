import React, { useState } from 'react';

/**
 * AddItemForm Component
 * 
 * A reusable form for adding new items. Includes built-in validation:
 * - Prevents empty/whitespace-only submissions
 * - Enforces a minimum length of 2 characters
 * - Checks for duplicates (case-insensitive) against the existing list
 * 
 * @param {string} label - Singular label for the item type (e.g., "Department")
 * @param {Array} existingItems - Current list of {id, name} items for duplicate checking
 * @param {Function} onAdd - Callback when a valid new item is submitted, receives the trimmed name
 */
const AddItemForm = ({ label, existingItems, onAdd }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    /**
     * Validates and submits the new item.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = inputValue.trim();

        // Validation: empty input
        if (!trimmed) {
            setError(`Please enter a ${label.toLowerCase()} name.`);
            return;
        }

        // Validation: minimum length
        if (trimmed.length < 2) {
            setError(`${label} name must be at least 2 characters.`);
            return;
        }

        // Validation: duplicate check (case-insensitive)
        const isDuplicate = existingItems.some(
            (item) => item.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) {
            setError(`"${trimmed}" already exists.`);
            return;
        }

        // All validations passed — submit and reset
        onAdd(trimmed);
        setInputValue('');
        setError('');
    };

    return (
        <form className="add-item-form" onSubmit={handleSubmit}>
            <div className="form-input-group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (error) setError(''); // Clear error on new input
                    }}
                    placeholder={`Enter new ${label}`}
                />
                <button type="submit" className="btn-add">Add {label}</button>
            </div>
            {error && <p className="form-error">{error}</p>}
        </form>
    );
};

export default AddItemForm;
