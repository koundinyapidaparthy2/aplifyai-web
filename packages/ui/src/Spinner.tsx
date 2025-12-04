import React from 'react';

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'white';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const colorClasses = {
        primary: 'border-primary-200 border-t-primary-600',
        secondary: 'border-secondary-200 border-t-secondary-600',
        white: 'border-white/30 border-t-white',
    };

    return (
        <div
            className={`
        inline-block rounded-full animate-spin
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};
