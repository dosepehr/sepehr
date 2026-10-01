import { useSyncExternalStore } from 'react';

export function useIsMobile(breakpoint = 1280) {
    return useSyncExternalStore(
        (onChange) => {
            const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        () => window.innerWidth < breakpoint,
        /* c8 ignore next */
        () => false,
    );
}
