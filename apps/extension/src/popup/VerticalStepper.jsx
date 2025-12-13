import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UnstartedIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 1, label: 'Collecting Data', description: 'Extracting job requirements' },
    { id: 2, label: 'Creating Resume / Cover Letter', description: 'Generating tailored documents' },
    { id: 3, label: 'Auto Filling Common Questions', description: 'Filling standard form fields' },
    { id: 4, label: 'Auto Filling AI Questions', description: 'Answering complex questions' },
    { id: 5, label: 'Reverifying Questions', description: 'Checking required fields' },
];

const VerticalStepper = ({ currentStep = 0, stepStatuses = {}, errors = {} }) => {
    const getStepStatus = (stepId) => {
        if (errors[stepId]) return 'error';
        if (stepStatuses[stepId] === 'complete') return 'complete';
        if (stepId === currentStep) return 'active';
        if (stepId < currentStep) return 'complete';
        return 'pending';
    };

    const getStepIcon = (stepId) => {
        const status = getStepStatus(stepId);
        const baseStyle = { fontSize: '20px' };

        switch (status) {
            case 'complete':
                return <CheckCircleIcon sx={{ ...baseStyle, color: '#3DCEA5' }} />;
            case 'error':
                return <ErrorIcon sx={{ ...baseStyle, color: '#ef4444' }} />;
            case 'active':
                return (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                border: '3px solid #3DCEA5',
                                bgcolor: 'white',
                            }}
                        />
                    </motion.div>
                );
            default:
                return <UnstartedIcon sx={{ ...baseStyle, color: '#cbd5e1' }} />;
        }
    };

    return (
        <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                Application Progress
            </Typography>

            <Stack spacing={2}>
                {STEPS.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isLast = index === STEPS.length - 1;

                    return (
                        <Box key={step.id}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                {/* Icon */}
                                <Box sx={{ pt: 0.25, position: 'relative' }}>
                                    {getStepIcon(step.id)}
                                    {/* Connector line */}
                                    {!isLast && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: 24,
                                                width: 2,
                                                height: 32,
                                                bgcolor: status === 'complete' ? '#3DCEA5' : '#e2e8f0',
                                                transform: 'translateX(-50%)',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: status === 'active' ? 600 : 500,
                                            color: status === 'active' ? '#1e293b' : status === 'complete' ? '#64748b' : '#94a3b8',
                                            fontSize: '13px',
                                            mb: 0.25,
                                            transition: 'color 0.3s ease',
                                        }}
                                    >
                                        {step.label}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: status === 'active' ? '#64748b' : '#94a3b8',
                                            fontSize: '11px',
                                            display: 'block',
                                            transition: 'color 0.3s ease',
                                        }}
                                    >
                                        {step.description}
                                    </Typography>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {errors[step.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#ef4444',
                                                        fontSize: '11px',
                                                        display: 'block',
                                                        mt: 0.5,
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    {errors[step.id]}
                                                </Typography>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Active step indicator */}
                                    {status === 'active' && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Box
                                                sx={{
                                                    height: 2,
                                                    bgcolor: '#3DCEA5',
                                                    mt: 0.75,
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </Box>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default VerticalStepper;
