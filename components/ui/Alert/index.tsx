'use client';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { FC } from 'react';
import type { AlertWrapperProps } from './alert.types';
import { Alert, AlertDescription, AlertTitle } from './components';

const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    destructive: XCircle,
    default: Info,
};

const AlertWrapper: FC<AlertWrapperProps> = ({
    title,
    children,
    variant = 'default',
    Icon,
}) => {
    const IconComponent = Icon ?? iconMap[variant];

    return (
        <Alert variant={variant}>
            <IconComponent size={20} className="shrink-0" />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription className="w-full">{children}</AlertDescription>
        </Alert>
    );
};

export default AlertWrapper;
