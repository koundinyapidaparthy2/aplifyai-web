'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status, router]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                location: data.location || '',
                bio: data.bio || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update profile');
            const data = await response.json();
            setProfile(data);
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {session?.user?.name || 'Your Profile'}
                                    </h1>
                                    <p className="text-indigo-100">{session?.user?.email}</p>
                                </div>
                            </div>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-8">
                        {editing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                                    <p className="text-lg text-gray-900">{profile?.name || 'Not set'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                                    <p className="text-lg text-gray-900">{profile?.email || session?.user?.email}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                                    <p className="text-lg text-gray-900">{profile?.phone || 'Not set'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                                    <p className="text-lg text-gray-900">{profile?.location || 'Not set'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                                    <p className="text-lg text-gray-900">{profile?.bio || 'Not set'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
