'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Registers the PWA service worker (`public/sw.js`) and surfaces an in-app
 * "update available" prompt when a new version has been installed.
 *
 * Only runs in production: in development the app registers MSW's mock worker
 * at the same `/` scope, and a second service worker would clash with it.
 */
export const ServiceWorkerRegister = () => {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!('serviceWorker' in navigator)) return;

        // Reload once the freshly-activated worker takes control of the page.
        let refreshing = false;
        const onControllerChange = () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        };
        navigator.serviceWorker.addEventListener(
            'controllerchange',
            onControllerChange,
        );

        const promptUpdate = (worker: ServiceWorker) => {
            toast('Update available', {
                description: 'A new version of the app is ready.',
                duration: Infinity,
                action: {
                    label: 'Reload',
                    onClick: () => worker.postMessage('SKIP_WAITING'),
                },
            });
        };

        let registration: ServiceWorkerRegistration | undefined;
        let updateInterval: ReturnType<typeof setInterval> | undefined;

        // Re-check for a new service worker version (surfaces the update prompt
        // without needing a full reload).
        const checkForUpdate = () => void registration?.update();
        const onVisibility = () => {
            if (document.visibilityState === 'visible') checkForUpdate();
        };

        const register = async () => {
            try {
                registration = await navigator.serviceWorker.register(
                    '/sw.js',
                    {
                        scope: '/',
                        updateViaCache: 'none',
                    },
                );

                // Ask the OS to keep our caches from being evicted under storage
                // pressure. Best-effort; ignored where unsupported.
                if (
                    navigator.storage &&
                    typeof navigator.storage.persist === 'function'
                ) {
                    void navigator.storage.persist();
                }

                // An update was already waiting before this page loaded.
                if (
                    registration.waiting &&
                    navigator.serviceWorker.controller
                ) {
                    promptUpdate(registration.waiting);
                }

                // An update is found while the page is open.
                registration.addEventListener('updatefound', () => {
                    const installing = registration?.installing;
                    if (!installing) return;
                    installing.addEventListener('statechange', () => {
                        if (
                            installing.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            promptUpdate(installing);
                        }
                    });
                });

                // Check for updates when the tab regains focus and hourly.
                document.addEventListener('visibilitychange', onVisibility);
                updateInterval = setInterval(checkForUpdate, 60 * 60 * 1000);
            } catch (error) {
                console.error('Service worker registration failed:', error);
            }
        };

        const onLoad = () => void register();
        if (document.readyState === 'complete') {
            void register();
        } else {
            window.addEventListener('load', onLoad);
        }

        return () => {
            window.removeEventListener('load', onLoad);
            document.removeEventListener('visibilitychange', onVisibility);
            if (updateInterval) clearInterval(updateInterval);
            navigator.serviceWorker.removeEventListener(
                'controllerchange',
                onControllerChange,
            );
        };
    }, []);

    return null;
};
