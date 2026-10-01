'use client';

import Button from '@/components/ui/Button';
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import type { Theme } from './theme-changer.types';

const icons: Record<Theme, React.ReactNode> = {
    light: <SunIcon />,
    dark: <MoonIcon />,
    system: <SunMoonIcon />,
};

const next: Record<Theme, Theme> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
};

const ThemeChanger = () => {
    const { theme, setTheme } = useTheme();

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    if (!mounted)
        return (
            <Button variant="ghost" size="icon" disabled>
                <SunIcon />
            </Button>
        );

    const current = (theme as Theme) ?? 'system';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(next[current])}
            aria-label={`Switch to ${next[current]} theme`}
        >
            {icons[current]}
        </Button>
    );
};

export default ThemeChanger;
