import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Edit as EditIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Link as LinkIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';

const ProfileTab = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            // Use cached profile for instant load
            const response = await chrome.runtime.sendMessage({
                action: 'GET_CACHED_USER_PROFILE',
            });

            if (response.success) {
                setProfile(response.data);
            }
        } catch (error) {
            console.error('[ProfileTab] Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            // Force refresh from backend
            const response = await chrome.runtime.sendMessage({
                action: 'REFRESH_USER_PROFILE',
            });

            if (response.success) {
                setProfile(response.data);
            }
        } catch (error) {
            console.error('[ProfileTab] Failed to refresh profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        // Open web app profile editor in new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html#/profile') });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Loading profile...
                </Typography>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No profile found. Complete onboarding to get started.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('index.html#/onboarding') })}
                    sx={{ bgcolor: '#3DCEA5', '&:hover': { bgcolor: '#34B38F' } }}
                >
                    Complete Onboarding
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3DCEA5' }}>
                        Your Profile
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={handleRefresh}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={handleEdit}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                {/* User Info */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: '#3DCEA5',
                                    fontSize: '20px',
                                    fontWeight: 600,
                                }}
                            >
                                {profile.firstName?.[0]}{profile.lastName?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {profile.firstName} {profile.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                    {profile.email}
                                </Typography>
                                {profile.phone && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                        {profile.phone}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {profile.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                📍 {profile.location}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                <SchoolIcon fontSize="small" sx={{ color: '#3DCEA5' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Education
                                </Typography>
                            </Stack>
                            {profile.education.slice(0, 2).map((edu, idx) => (
                                <Box key={idx} sx={{ mb: idx < profile.education.length - 1 ? 1.5 : 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                                        {edu.school}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                        {edu.degree} · {edu.startYear} - {edu.endYear}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Experience */}
                {profile.experience && profile.experience.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                <WorkIcon fontSize="small" sx={{ color: '#3DCEA5' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Experience
                                </Typography>
                            </Stack>
                            {profile.experience.slice(0, 2).map((exp, idx) => (
                                <Box key={idx} sx={{ mb: idx < 1 ? 1.5 : 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                                        {exp.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                        {exp.company} · {exp.location}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                        {exp.startDate} - {exp.endDate || 'Present'}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {profile.skills.slice(0, 12).map((skill, idx) => (
                                    <Chip
                                        key={idx}
                                        label={skill}
                                        size="small"
                                        sx={{
                                            height: 24,
                                            fontSize: '11px',
                                            bgcolor: '#f1f5f9',
                                            '&:hover': { bgcolor: '#e2e8f0' },
                                        }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Links */}
                {profile.links && Object.keys(profile.links).length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                <LinkIcon fontSize="small" sx={{ color: '#3DCEA5' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Links
                                </Typography>
                            </Stack>
                            <Stack spacing={0.75}>
                                {Object.entries(profile.links).map(([key, url]) => (
                                    <Typography
                                        key={key}
                                        variant="body2"
                                        component="a"
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            fontSize: '12px',
                                            color: '#3DCEA5',
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' },
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Typography>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Resume Upload Info */}
                {profile.resumeUrl && (
                    <Card variant="outlined">
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <DescriptionIcon fontSize="small" sx={{ color: '#3DCEA5' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Resume
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 1 }}>
                                Uploaded: {new Date(profile.resumeUploadedAt || Date.now()).toLocaleDateString()}
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                href={profile.resumeUrl}
                                target="_blank"
                                sx={{
                                    fontSize: '12px',
                                    textTransform: 'none',
                                    borderColor: '#3DCEA5',
                                    color: '#3DCEA5',
                                    '&:hover': { borderColor: '#34B38F', bgcolor: '#f0fdf9' },
                                }}
                            >
                                Preview
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default ProfileTab;
