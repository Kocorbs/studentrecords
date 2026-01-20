import React from 'react';
import { COLORS } from '../../utils/constants';
import '../../styles/App.css';

interface ExportOptionsProps {
    onExportAll: () => void;
    onExportSelected: () => void;
    onExportStatistics: () => void;
    onClose: () => void;
    hasSelected: boolean;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
    onExportAll,
    onExportSelected,
    onExportStatistics,
    onClose,
    hasSelected
}) => {
    const options = [
        {
            text: '📋 Export All Records (PDF)',
            onClick: onExportAll,
            description: 'Export all student records as PDF'
        },
        {
            text: '📄 Export Selected Record (PDF)',
            onClick: onExportSelected,
            description: 'Export the currently selected student record',
            disabled: !hasSelected
        },
        {
            text: '📊 Export Statistics (PDF)',
            onClick: onExportStatistics,
            description: 'Export system statistics and reports'
        }
    ];

    return (
        <div style={{
            backgroundColor: COLORS.background,
            padding: '30px',
            minWidth: '400px'
        }}>
            <h2 style={{
                textAlign: 'center',
                color: COLORS.primary,
                marginBottom: '20px',
                fontSize: '20px'
            }}>
                📤 Export Options
            </h2>

            <div style={{ marginBottom: '30px' }}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={option.onClick}
                        disabled={option.disabled}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            marginBottom: '10px',
                            backgroundColor: option.disabled ? '#e9ecef' : COLORS.primary,
                            color: option.disabled ? '#6c757d' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: option.disabled ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            display: 'block'
                        }}
                        onMouseEnter={(e) => {
                            if (!option.disabled) {
                                e.currentTarget.style.backgroundColor = COLORS.secondary;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!option.disabled) {
                                e.currentTarget.style.backgroundColor = COLORS.primary;
                            }
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{option.text}</div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>{option.description}</div>
                    </button>
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={onClose}
                    className="btn btn-danger"
                    style={{
                        backgroundColor: COLORS.danger,
                        padding: '10px 30px',
                        fontSize: '14px'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ExportOptions;