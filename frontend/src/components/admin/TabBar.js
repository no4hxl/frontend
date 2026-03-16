import React from 'react';

/**
 * TabBar Component
 * 
 * A reusable navigation bar that renders tab buttons from a configuration object.
 * Highlights the currently active tab.
 * 
 * @param {Object} tabConfig - Map of tab keys to {label, singular} objects
 * @param {string} activeTab - The currently active tab key
 * @param {Function} onTabChange - Callback when a tab is clicked
 */
const TabBar = ({ tabConfig, activeTab, onTabChange }) => {
    return (
        <div className="dashboard-tabs">
            {Object.entries(tabConfig).map(([key, config]) => (
                <button
                    key={key}
                    className={activeTab === key ? 'active' : ''}
                    onClick={() => onTabChange(key)}
                >
                    {config.label}
                </button>
            ))}
        </div>
    );
};

export default TabBar;
