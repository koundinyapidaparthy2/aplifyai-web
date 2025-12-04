import React from 'react';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'gray',
    size = 'md',
    className = '',
}) => {
    const variantClasses = {
        primary: 'bg-primary-100 text-primary-700 border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
        success: 'bg-success-100 text-success-700 border-success-200',
        warning: 'bg-warning-100 text-warning-700 border-warning-200',
        danger: 'bg-danger-100 text-danger-700 border-danger-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
};
