import React from 'react';

/**
 * @param {Object} props
 * @param {Array} props.tabs - Array of objects { id, label }
 * @param {string} props.activeTab - Current active tab ID
 * @param {Function} props.onTabChange - Callback when tab changes
 */
export function Tabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="tabs-header">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
