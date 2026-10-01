'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { OTPInput, OTPInputContext } from 'input-otp';
import * as React from 'react';
import { useId } from 'react';
import Field, { FieldError, FieldLabel } from '@/components/ui/Field';

// ── Digit normalization ────────────────────────────────────────────────────────

const normalizeDigits = (val: string) =>
    val
        .replace(/[^0-9۰-۹٠-٩]/g, '')
        /* c8 ignore next */
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        /* c8 ignore next */
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

// ── Internal context ───────────────────────────────────────────────────────────

type OtpCtx = { isInvalid: boolean; separated: boolean };
const OtpContext = React.createContext<OtpCtx>({
    isInvalid: false,
    separated: false,
});

// ── Slot ──────────────────────────────────────────────────────────────────────

const OtpSlot = ({ index }: { index: number }) => {
    const { isInvalid, separated } = React.useContext(OtpContext);
    /* c8 ignore next */
    const { char, hasFakeCaret, isActive } =
        React.useContext(OTPInputContext)?.slots[index] ?? {};

    return (
        <div
            data-active={isActive}
            data-invalid={isInvalid || undefined}
            className={cn(
                'relative flex h-10 w-10 items-center justify-center border border-input/50 text-sm font-medium text-foreground transition-all outline-none select-none',
                // grouped: share borders between adjacent slots
                !separated &&
                    'rounded-none border-e-0 first:rounded-s-md first:border-s last:rounded-e-md last:border-e',
                // separated: each slot is a fully rounded standalone box
                separated && 'rounded-md',
                // active
                'data-[active=true]:z-10 data-[active=true]:border-primary data-[active=true]:ring-3 data-[active=true]:ring-primary/50',
                // invalid
                'data-invalid:border-destructive',
                // invalid + active
                'data-invalid:data-[active=true]:border-destructive data-invalid:data-[active=true]:ring-destructive/50',
            )}
        >
            {char}
            {/* c8 ignore next */}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

import type { OtpInputProps } from './otp-input.types';

const OtpInput = ({
    length = 6,
    value,
    onChange,
    onComplete,
    separated = false,
    label,
    error,
    required = false,
    disabled = false,
    className,
}: OtpInputProps) => {
    const inputId = useId();
    const isInvalid = !!error;

    return (
        <Field data-invalid={isInvalid || undefined} className="relative pb-1">
            {label && (
                <FieldLabel
                    htmlFor={inputId}
                    required={required}
                    className="text-foreground"
                >
                    {label}
                </FieldLabel>
            )}

            <OtpContext.Provider value={{ isInvalid, separated }}>
                <OTPInput
                    id={inputId}
                    maxLength={length}
                    value={value}
                    onChange={(val) => onChange?.(normalizeDigits(val))}
                    onComplete={onComplete}
                    disabled={disabled}
                    /* c8 ignore next */
                    pasteTransformer={(val) =>
                        normalizeDigits(val).slice(0, length)
                    }
                    containerClassName={cn(
                        'flex items-center has-disabled:cursor-not-allowed has-disabled:opacity-50',
                        className,
                    )}
                >
                    <div className={cn('flex', separated && 'gap-2')} dir="ltr">
                        {Array.from({ length }, (_, i) => (
                            <OtpSlot key={i} index={i} />
                        ))}
                    </div>
                </OTPInput>
            </OtpContext.Provider>

            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
};

export default OtpInput;
