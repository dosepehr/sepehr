import { useCallback, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

const DEFAULT_SOUND_SRC = '/sounds/notification.mp3';
const noop = () => {};

export type NotificationPermissionState =
    | NotificationPermission
    | 'unsupported';

export interface NotifyOptions extends NotificationOptions {
    /** Notification heading. Defaults to `'Notification'`. */
    title?: string;
}

export interface NotifyResult {
    ok: boolean;
    reason?: 'unsupported' | 'denied';
}

const isSupported = () =>
    typeof window !== 'undefined' && 'Notification' in window;

const getPermissionSnapshot = (): NotificationPermissionState =>
    isSupported() ? Notification.permission : 'unsupported';

const getServerPermission = (): NotificationPermissionState => 'unsupported';

// Live-track the notification permission via the Permissions API (fires on
// grant/deny/reset) so consumers re-render without any setState-in-effect.
const subscribePermission = (onChange: () => void) => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
        return noop;
    }
    let status: PermissionStatus | undefined;
    let active = true;
    navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((result) => {
            if (!active) return;
            status = result;
            status.addEventListener('change', onChange);
        })
        .catch(noop);
    return () => {
        active = false;
        status?.removeEventListener('change', onChange);
    };
};

// Prefer the service worker registration (works on mobile / installed PWAs);
// fall back to the page-level Notification constructor on desktop browsers.
async function showSystemNotification(
    title: string,
    options?: NotificationOptions,
) {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            await registration.showNotification(title, options);
            return;
        }
    }
    new Notification(title, options);
}

/**
 * Shows system notifications and plays an accompanying sound.
 *
 * @param soundSrc Path to the sound played on `notify` (default
 *   `/sounds/notification.mp3`).
 */
export function useNotification(soundSrc: string = DEFAULT_SOUND_SRC) {
    const permission = useSyncExternalStore(
        subscribePermission,
        getPermissionSnapshot,
        getServerPermission,
    );

    const playSound = useCallback(() => {
        try {
            const audio = new Audio(soundSrc);
            void audio.play().catch(noop);
        } catch {
            // Audio playback is best-effort; ignore failures.
        }
    }, [soundSrc]);

    const requestPermission =
        useCallback(async (): Promise<NotificationPermissionState> => {
            if (!isSupported()) return 'unsupported';
            return Notification.requestPermission();
        }, []);

    const notify = useCallback(
        async (
            message: string,
            options: NotifyOptions = {},
        ): Promise<NotifyResult> => {
            if (!isSupported()) {
                toast.error('Notifications are not supported in this browser.');
                return { ok: false, reason: 'unsupported' };
            }

            let currentPermission = Notification.permission;
            if (currentPermission === 'default') {
                currentPermission = await Notification.requestPermission();
            }

            if (currentPermission !== 'granted') {
                toast.error(
                    'Notifications are blocked. Enable them in your browser settings.',
                );
                return { ok: false, reason: 'denied' };
            }

            // Only play the sound when the notification is actually shown.
            playSound();

            const { title = 'Notification', ...rest } = options;
            await showSystemNotification(title, {
                body: message,
                icon: '/pwa/icon-192.png',
                badge: '/pwa/badge.png',
                ...rest,
            });
            return { ok: true };
        },
        [playSound],
    );

    return { permission, requestPermission, notify, playSound };
}
