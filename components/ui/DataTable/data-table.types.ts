import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import type * as React from 'react';

export interface DataTableProps<TData> {
    columns: ColumnDef<TData, unknown>[];
    data: TData[];

    // Pagination
    current: number;
    total: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
    hidePagination?: boolean;

    // Layout
    maxHeight?: number | string;
    stickyOffset?: number;
    className?: string;

    // Empty state
    emptyTitle?: string;
    emptyDescription?: string;

    // Row selection
    rowSelection?: RowSelectionState;
    setRowSelection?: (value: RowSelectionState) => void;
    haveSelection?: boolean;

    // Filter
    filterColumn?: string;
    filterPlaceholder?: string;

    // Footer
    footerRow?: React.ReactNode[];

    // Index column
    hideRowIndex?: boolean;
}

export interface DataTableRootProps<TData> {
    columns: ColumnDef<TData, unknown>[];
    data: TData[];
    maxHeight?: number | string;
    stickyOffset?: number;
    className?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    rowSelection?: RowSelectionState;
    setRowSelection?: (value: RowSelectionState) => void;
    haveSelection?: boolean;
    filterColumn?: string;
    filterPlaceholder?: string;
    footerRow?: React.ReactNode[];
    hideRowIndex?: boolean;
    current?: number;
    limit?: number;
}

export interface DataTablePaginationProps {
    current: number;
    total: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
}

export interface DataTableSkeletonProps {
    columns?: number;
    rows?: number;
}

export interface TableStateProps {
    isLoading: boolean;
    isFetching?: boolean;
    isError?: boolean;
    isEmpty?: boolean;
    loadingEl?: React.ReactNode;
    onRetry?: () => void;
    emptyTitle?: string;
    emptyDescription?: string;
    hasSearch?: boolean;
    children: React.ReactNode;
}
