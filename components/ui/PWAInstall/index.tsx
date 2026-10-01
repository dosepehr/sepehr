'use client';

import { Download, Share, X } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Cookies from 'universal-cookie';
import Button from '@/components/ui/Button';
import type { BeforeInstallPromptEvent } from './pwa-install.types';

const PWA_DISMISS_COOKIE = 'pwa_install_dismissed';
const DISMISS_DURATION_HOURS = 24;
const noop = () => {};
const noopSubscribe = () => noop;
const serverSnapshotFalse = () => false;

// Non-standard iOS Safari flag for "installed to home screen".
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const getIsIOS = () =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

const getIsStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true;

const subscribeStandalone = (onChange: () => void) => {
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
};

/** One-time client read: is this an iOS device? (false on the server). */
function useIsIOS() {
    return useSyncExternalStore(noopSubscribe, getIsIOS, serverSnapshotFalse);
}

/** Tracks whether the app is running as an installed / standalone PWA. */
function useIsStandalone() {
    return useSyncExternalStore(
        subscribeStandalone,
        getIsStandalone,
        serverSnapshotFalse,
    );
}

export const PWAInstall = () => {
    const cookies = useMemo(() => new Cookies(), []);
    const isIOS = useIsIOS();
    const isStandalone = useIsStandalone();
    const [promptEvent, setPromptEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);

    // Suppress the prompt if it was dismissed within the debounce window.
    const cookieDismissed = useSyncExternalStore(
        noopSubscribe,
        () => {
            const dismissedTime = cookies.get<string>(PWA_DISMISS_COOKIE);
            if (!dismissedTime) return false;
            const hoursPassed =
                (Date.now() - Number.parseInt(dismissedTime, 10)) /
                (1000 * 60 * 60);
            return hoursPassed < DISMISS_DURATION_HOURS;
        },
        () => false,
    );

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as BeforeInstallPromptEvent);
        };
        const handleAppInstalled = () => setPromptEvent(null);

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const persistDismissal = () => {
        cookies.set(PWA_DISMISS_COOKIE, Date.now().toString(), {
            path: '/',
            maxAge: DISMISS_DURATION_HOURS * 60 * 60,
            sameSite: 'lax',
        });
    };

    const install = async () => {
        if (!promptEvent) return;
        try {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;
            if (choice.outcome === 'dismissed') {
                persistDismissal();
            }
            setPromptEvent(null);
        } catch (error) {
            console.error('Installation failed:', error);
        }
    };

    const dismiss = () => {
        persistDismissal();
        setDismissed(true);
    };

    if (dismissed || cookieDismissed || isStandalone) return null;
    if (!isIOS && !promptEvent) return null;

    return (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg md:inset-x-auto md:inset-e-4 md:max-w-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <h3 className="mb-1 font-semibold">Install app</h3>

                    {isIOS ? (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>To install, follow these steps:</p>
                            <ol className="list-inside list-decimal space-y-1 text-xs">
                                <li>
                                    Tap the{' '}
                                    <Share size={14} className="inline" /> Share
                                    button
                                </li>
                                <li>Choose &quot;Add to Home Screen&quot;</li>
                                <li>Tap &quot;Add&quot;</li>
                            </ol>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Install the app on your device for faster access.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="mt-4 flex gap-2">
                {isIOS ? (
                    <Button variant="outline" onClick={dismiss}>
                        Got it
                    </Button>
                ) : (
                    <>
                        <Button onClick={install}>
                            <Download size={18} />
                            Install
                        </Button>
                        <Button variant="outline" onClick={dismiss}>
                            Later
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
