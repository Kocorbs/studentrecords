import React, { useState } from 'react';
import { COLORS, THEMES } from '../../utils/constants';
import '../../styles/App.css';

interface ThemeSettingsProps {
    onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
    const [selectedTheme, setSelectedTheme] = useState('default');

    const handleThemeChange = (theme: string) => {
        setSelectedTheme(theme);

        // In a real app, you would save this to localStorage and apply it globally
        let themeColors = COLORS;

        switch (theme) {
            case 'darkMode':
                themeColors = THEMES.darkMode;
                break;
            case 'blueTheme':
                themeColors = THEMES.blueTheme;
                break;
            default:
                themeColors = THEMES.default;
        }

        alert(`Theme changed to ${theme}. In a real application, this would refresh the dashboard with the new theme.`);

        // Apply theme to CSS variables (simplified version)
        document.documentElement.style.setProperty('--primary-color', themeColors.primary);
        document.documentElement.style.setProperty('--sidebar-color', themeColors.sidebar);
        document.documentElement.style.setProperty('--background-color', themeColors.background);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px'
        }}>
            <div className="modal-header">
                <h2 style={{ margin: 0 }}>🎨 Theme Settings</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <div className="modal-body">
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                        color: COLORS.dark
                    }}>
                        Choose Theme:
                    </label>
                    <select
                        value={selectedTheme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${COLORS.light}`,
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="default">Default (Maroon & Gold)</option>
                        <option value="darkMode">Dark Mode</option>
                        <option value="blueTheme">Blue Theme</option>
                    </select>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: COLORS.light,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: COLORS.text
                }}>
                    Applying a theme will refresh the dashboard.
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button
                        onClick={() => handleThemeChange(selectedTheme)}
                        className="btn btn-primary"
                        style={{
                            backgroundColor: COLORS.primary,
                            padding: '12px 30px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Apply Theme
                    </button>
                </div>
            </div>

            <div className="modal-footer">
                <button
                    onClick={onClose}
                    className="btn btn-danger"
                    style={{
                        backgroundColor: COLORS.danger,
                        padding: '10px 25px'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ThemeSettings;