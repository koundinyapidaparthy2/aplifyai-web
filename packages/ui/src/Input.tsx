import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
        return (
            <div className={fullWidth ? 'w-full' : ''}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-300'}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
