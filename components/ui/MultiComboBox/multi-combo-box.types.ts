export type MultiComboBoxOption = {
    value: string;
    label: string;
    [key: string]: unknown;
};

export type MultiComboBoxProps = {
    options: MultiComboBoxOption[];
    selected: string[];
    onChange?: (values: string[]) => void;

    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundText?: string;
    required?: boolean;

    disabled?: boolean;
    isPending?: boolean;
    isError?: boolean;
    error?: string;

    hideSelectedBadges?: boolean;
    className?: string;
};
