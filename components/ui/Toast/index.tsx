'use client';
/* c8 ignore stop */

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: '!shadow-lg !shadow-black/[0.08] dark:!shadow-black/30',
                    success:
                        '!bg-[oklch(0.97_0.05_150)] !border-[oklch(0.85_0.08_150)] !text-[var(--success)] [&_[data-icon]]:!text-[var(--success)] dark:!bg-[oklch(0.22_0.05_150)] dark:!border-[oklch(0.35_0.07_150)]',
                    error: '!bg-[oklch(0.97_0.05_27)] !border-[oklch(0.88_0.07_27)] !text-[var(--destructive)] [&_[data-icon]]:!text-[var(--destructive)] dark:!bg-[oklch(0.22_0.05_27)] dark:!border-[oklch(0.35_0.07_27)]',
                    warning:
                        '!bg-[oklch(0.97_0.05_70)] !border-[oklch(0.88_0.07_70)] !text-[var(--warning)] [&_[data-icon]]:!text-[var(--warning)] dark:!bg-[oklch(0.22_0.05_70)] dark:!border-[oklch(0.35_0.07_70)]',
                    info: '!bg-[oklch(0.97_0.05_262)] !border-[oklch(0.88_0.07_262)] !text-[var(--info)] [&_[data-icon]]:!text-[var(--info)] dark:!bg-[oklch(0.22_0.05_262)] dark:!border-[oklch(0.35_0.07_262)]',
                },
            }}
            {...props}
        />
    );
};

export default Toaster;
