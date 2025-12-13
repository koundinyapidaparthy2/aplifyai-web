import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const CircularProgress = ({ progress = 0, size = 80, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <Box
            sx={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Background circle */}
            <svg
                width={size}
                height={size}
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#3DCEA5"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </svg>

            {/* Percentage text */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    fontSize: size > 60 ? '18px' : '14px',
                    userSelect: 'none',
                }}
            >
                {Math.round(progress)}%
            </Typography>
        </Box>
    );
};

export default CircularProgress;
