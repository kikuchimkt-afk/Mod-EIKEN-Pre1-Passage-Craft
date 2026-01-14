import React from 'react';
import '../../styles/index.css';

export function MainLayout({ header, leftColumn, rightColumn, footer }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Header Area */}
            <header style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                background: 'var(--header-bg)',
                color: 'var(--text-inverse)',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 10
            }}>
                {header}
            </header>

            {/* Main Content Area (2 Columns) */}
            <main style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                flex: 1,
                overflow: 'hidden'
            }}>
                {/* Left Column */}
                <section style={{
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--bg-secondary)',
                    overflow: 'hidden'
                }}>
                    {leftColumn}
                </section>

                {/* Right Column */}
                <section style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--bg-secondary)',
                    overflow: 'hidden'
                }}>
                    {rightColumn}
                </section>
            </main>

            {/* Footer Area (Export Panel) */}
            {footer && (
                <footer style={{
                    flexShrink: 0
                }}>
                    {footer}
                </footer>
            )}
        </div>
    );
}
