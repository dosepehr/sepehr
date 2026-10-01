export type OtpInputProps = {
    length?: number;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    separated?: boolean;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};
