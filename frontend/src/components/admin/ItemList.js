import React, { useState } from 'react';

/**
 * ItemList Component
 * 
 * A reusable list that displays items with Edit and Delete functionality.
 * Supports inline editing of item names.
 * 
 * @param {Array} items - Array of {id, name} objects to display
 * @param {Function} onEdit - Callback when an item is updated (id, newName)
 * @param {Function} onDelete - Callback when delete is clicked (id)
 * @param {string} label - Singular label for messaging (e.g., "Department")
 */
const ItemList = ({ items, onEdit, onDelete, label }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    /**
     * Toggles editing mode for an item
     */
    function startEditing(item) {
        setEditingId(item.id);
        setEditValue(item.name);
    }

    /**
     * Cancels editing mode
     */
    const cancelEditing = () => {
        setEditingId(null);
        setEditValue('');
    };

    /**
     * Saves the edited value
     */
    const handleSave = (id) => {
        if (editValue.trim() === '') return;
        onEdit(id, editValue.trim());
        setEditingId(null);
    };

    if (items.length === 0) {
        return (
            <div className="empty-list">
                <p>No {label.toLowerCase()}s found. Add one above.</p>
            </div>
        );
    }

    return (
        <ul className="item-list">
            {items.map((item) => (
                <li key={item.id} className="list-item">
                    {editingId === item.id ? (
                        <div className="edit-container">
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="edit-input"
                                autoFocus
                            />
                            <div className="btn-group">
                                <button className="btn-save" onClick={() => handleSave(item.id)}>Save</button>
                                <button className="btn-cancel" onClick={cancelEditing}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <span>{item.name}</span>
                            <div className="btn-group">
                                <button
                                    className="btn-edit"
                                    onClick={() => startEditing(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default ItemList;
