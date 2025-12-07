'use client';

import Script from 'next/script';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleOneTap() {
    const { status } = useSession();
    const router = useRouter();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handleGoogleOneTap = (response: any) => {
        if (response.credential) {
            signIn('google-onetap', {
                credential: response.credential,
                redirect: false,
            }).then((result) => {
                if (result?.ok) {
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    console.error('One Tap Sign-In Failed:', result?.error);
                }
            });
        }
    };

    useEffect(() => {
        if (scriptLoaded && window.google) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

            if (!clientId) {
                console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID not found. Popup disabled.');
                return;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleOneTap,
                    auto_select: false,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: false,
                });

                if (status === 'unauthenticated') {
                    window.google.accounts.id.prompt((notification: any) => {
                        if (notification.isNotDisplayed()) {
                            console.debug('One Tap not displayed:', notification.getNotDisplayedReason());
                        } else if (notification.isSkippedMoment()) {
                            console.debug('One Tap skipped:', notification.getSkippedReason());
                        } else if (notification.isDismissedMoment()) {
                            console.debug('One Tap dismissed:', notification.getDismissedReason());
                        }
                    });
                }
            } catch (e) {
                console.error('Google One Tap Error:', e);
            }
        }
    }, [scriptLoaded, status]);

    // Only render script if unauthenticated (logic handled inside effect for prompt, but loading script is fine)
    if (status === 'authenticated') return null;

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
        />
    );
}

// Add types for directory access to window.google
declare global {
    interface Window {
        google: any;
    }
}
