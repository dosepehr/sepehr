import type * as React from 'react';

export type DropdownItemBase = {
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
};

export type DropdownItemDefault = DropdownItemBase & {
    type?: 'item';
    variant?: 'default' | 'destructive';
    onClick?: () => void;
};

export type DropdownItemCheckbox = DropdownItemBase & {
    type: 'checkbox';
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

export type DropdownItemRadioGroup = {
    type: 'radio-group';
    value: string;
    onValueChange: (value: string) => void;
    items: DropdownItemBase[];
};

export type DropdownItemSub = DropdownItemBase & {
    type: 'sub';
    items: DropdownGroupOrItem[];
};

export type DropdownItem =
    | DropdownItemDefault
    | DropdownItemCheckbox
    | DropdownItemRadioGroup
    | DropdownItemSub;

export type DropdownGroup = {
    label?: string;
    items: DropdownItem[];
};

export type DropdownGroupOrItem = DropdownGroup | DropdownItem;

export type DropdownMenuWrapperProps = {
    trigger: React.ReactNode;
    groups: DropdownGroup[];
    contentClassName?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
};
