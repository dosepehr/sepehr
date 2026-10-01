export type MultiInputProps = {
    value?: string[];
    onChange?: (values: string[]) => void;

    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
    className?: string;
};
