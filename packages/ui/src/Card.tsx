import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'soft' | 'medium' | 'hard';
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    shadow = 'md',
    hover = false,
    onClick,
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
    };

    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        soft: 'shadow-soft',
        medium: 'shadow-medium',
        hard: 'shadow-hard',
    };

    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-lg border border-gray-200
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hover ? 'transition-shadow hover:shadow-lg cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
