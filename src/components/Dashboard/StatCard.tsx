import React from 'react';
import '../../styles/App.css';

interface StatCardProps {
    title: string;
    value: number | string;
    color: string;
    icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{
                color: color,
                backgroundColor: `${color}15`
            }}>
                {icon}
            </div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-title">{title}</div>
            </div>
        </div>
    );
};

export default StatCard;