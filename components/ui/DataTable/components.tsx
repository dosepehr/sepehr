'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
} from '@tanstack/react-table';
import {
    AlertCircleIcon,
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    InboxIcon,
    SearchIcon,
    SearchXIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';
import { Button } from '@/components/ui/Button/components';
import { Checkbox } from '@/components/ui/Checkbox/components';
import EmptyWrapper from '@/components/ui/Empty';
import InputWrapper from '@/components/ui/Input';
import Pagination, {
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/Pagination';
import SelectWrapper from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import type {
    DataTablePaginationProps,
    DataTableRootProps,
    DataTableSkeletonProps,
    TableStateProps,
} from './data-table.types';

// ── Shared ────────────────────────────────────────────────────────────────────

const fadeProps = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
};

// ── Table primitives ──────────────────────────────────────────────────────────

const Table = ({ className, ...props }: React.ComponentProps<'table'>) => {
    return (
        <div
            data-slot="table-container"
            className="relative w-full overflow-x-auto"
        >
            <table
                data-slot="table"
                className={cn('w-full caption-bottom text-sm', className)}
                {...props}
            />
        </div>
    );
};

const TableHeader = ({
    className,
    ...props
}: React.ComponentProps<'thead'>) => {
    return (
        <thead
            data-slot="table-header"
            className={cn('[&_tr]:border-b', className)}
            {...props}
        />
    );
};

const TableBody = ({ className, ...props }: React.ComponentProps<'tbody'>) => {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
};

const TableFooter = ({
    className,
    ...props
}: React.ComponentProps<'tfoot'>) => {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
                className,
            )}
            {...props}
        />
    );
};

const TableRow = ({ className, ...props }: React.ComponentProps<'tr'>) => {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
                className,
            )}
            {...props}
        />
    );
};

const TableHead = ({ className, ...props }: React.ComponentProps<'th'>) => {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground has-[[role=checkbox]]:pe-0',
                className,
            )}
            {...props}
        />
    );
};

const TableCell = ({ className, ...props }: React.ComponentProps<'td'>) => {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                'p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pe-0',
                className,
            )}
            {...props}
        />
    );
};

const TableCaption = ({
    className,
    ...props
}: React.ComponentProps<'caption'>) => {
    return (
        <caption
            data-slot="table-caption"
            className={cn('mt-4 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
};

// ── DataTableRoot ─────────────────────────────────────────────────────────────

function selectionColumn<TData>(): ColumnDef<TData, unknown> {
    return {
        id: '__select__',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                          ? 'indeterminate'
                          : false
                }
                onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
    };
}

function indexColumn<TData>(
    current = 1,
    limit = 20,
): ColumnDef<TData, unknown> {
    return {
        id: '__index__',
        header: '#',
        cell: ({ row }) => (
            <span className="text-muted-foreground tabular-nums">
                {(current - 1) * limit + row.index + 1}
            </span>
        ),
        enableSorting: false,
    };
}

const DataTableRoot = <TData,>({
    columns,
    data,
    maxHeight,
    stickyOffset,
    className,
    emptyTitle = 'No results',
    emptyDescription,
    rowSelection: externalRowSelection,
    setRowSelection: externalSetRowSelection,
    haveSelection = false,
    filterColumn,
    filterPlaceholder = 'Search...',
    footerRow,
    hideRowIndex = false,
    current = 1,
    limit = 20,
}: DataTableRootProps<TData>) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [internalRowSelection, setInternalRowSelection] =
        React.useState<RowSelectionState>({});

    const rowSelection = externalRowSelection ?? internalRowSelection;
    const setRowSelection = externalSetRowSelection ?? setInternalRowSelection;

    const resolvedColumns = React.useMemo(() => {
        const cols: ColumnDef<TData, unknown>[] = [];
        if (haveSelection) cols.push(selectionColumn<TData>());
        if (!hideRowIndex) cols.push(indexColumn<TData>(current, limit));
        cols.push(...columns);
        return cols;
    }, [columns, haveSelection, hideRowIndex, current, limit]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns: resolvedColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: (updater) => {
            const next =
                typeof updater === 'function' ? updater(rowSelection) : updater;
            setRowSelection(next);
        },
        state: { sorting, columnFilters, rowSelection },
        enableSorting: false,
    });

    const isEmpty = table.getRowModel().rows.length === 0;

    const resolvedMaxHeight =
        stickyOffset !== undefined
            ? `calc(100dvh - ${stickyOffset}px)`
            : maxHeight;

    return (
        <motion.div
            {...fadeProps}
            initial={false}
            className={cn('flex flex-col gap-2', className)}
        >
            {filterColumn && (
                <div className="px-1">
                    <InputWrapper
                        startAddon={<SearchIcon />}
                        placeholder={filterPlaceholder}
                        value={
                            (table
                                .getColumn(filterColumn)
                                ?.getFilterValue() as string) ?? ''
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            table
                                .getColumn(filterColumn)
                                ?.setFilterValue(e.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
            )}

            <div
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region, required by WCAG 2.1.1 (verified via axe's scrollable-region-focusable check)
                tabIndex={resolvedMaxHeight ? 0 : undefined}
                style={
                    resolvedMaxHeight
                        ? { maxHeight: resolvedMaxHeight }
                        : undefined
                }
                className={cn(
                    'w-full rounded-lg border border-border',
                    resolvedMaxHeight ? 'overflow-auto' : 'overflow-x-auto',
                )}
            >
                <table className="w-full caption-bottom text-sm">
                    {!isEmpty && (
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header, i) => {
                                        const isFirst = i === 0;
                                        const canSort =
                                            header.column.getCanSort();
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    'text-xs font-medium text-muted-foreground',
                                                    isFirst
                                                        ? 'text-start'
                                                        : 'text-center',
                                                    resolvedMaxHeight &&
                                                        'sticky top-0 z-10 bg-muted',
                                                )}
                                            >
                                                {/* c8 ignore start */}
                                                {header.isPlaceholder ? null : canSort ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="-mx-2 gap-1"
                                                        onClick={() =>
                                                            header.column.toggleSorting()
                                                        }
                                                    >
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                        {header.column.getIsSorted() ===
                                                        'asc' ? (
                                                            <ArrowUpIcon className="size-3" />
                                                        ) : header.column.getIsSorted() ===
                                                          'desc' ? (
                                                            <ArrowDownIcon className="size-3" />
                                                        ) : (
                                                            <ArrowUpDownIcon className="size-3" />
                                                        )}
                                                    </Button>
                                                ) : (
                                                    /* c8 ignore stop */ flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                    )}
                    <AnimatePresence mode="wait">
                        {isEmpty ? (
                            <motion.tbody
                                key="empty"
                                {...fadeProps}
                                initial={false}
                                data-slot="table-body"
                                className="[&_tr:last-child]:border-0"
                            >
                                <tr>
                                    <td
                                        colSpan={resolvedColumns.length}
                                        className="p-0"
                                    >
                                        <EmptyWrapper
                                            title={emptyTitle}
                                            description={emptyDescription}
                                            icon={<InboxIcon />}
                                            className="min-h-72 rounded-none border-0"
                                        />
                                    </td>
                                </tr>
                            </motion.tbody>
                        ) : (
                            <motion.tbody
                                key="rows"
                                {...fadeProps}
                                initial={false}
                                data-slot="table-body"
                                className="[&_tr:last-child]:border-0"
                            >
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected()
                                                ? 'selected'
                                                : undefined
                                        }
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell, i) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        i === 0
                                                            ? 'text-start'
                                                            : 'text-center',
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                ))}
                            </motion.tbody>
                        )}
                    </AnimatePresence>
                    {footerRow && !isEmpty && (
                        <TableFooter>
                            <TableRow>
                                {footerRow.map((cell, i) => (
                                    <TableCell key={i}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </table>
            </div>
        </motion.div>
    );
};

// ── DataTablePagination ───────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
];

const MAX_PAGES = 5;

function getPageNumbers(
    current: number,
    total: number,
): (number | 'ellipsis')[] {
    if (total <= MAX_PAGES)
        return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | 'ellipsis')[] = [1];
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
    return pages;
}

const DataTablePagination = ({
    current,
    total,
    setPage,
    limit,
    setLimit,
}: DataTablePaginationProps) => {
    const pages = getPageNumbers(current, total);

    return (
        <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="whitespace-nowrap">Rows per page</span>
                <SelectWrapper
                    value={String(limit)}
                    onValueChange={(v) => {
                        setLimit(Number(v));
                        setPage(1);
                    }}
                    options={PAGE_SIZE_OPTIONS}
                    triggerClassName="h-8 w-20"
                    aria-label="Rows per page"
                />
            </div>

            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={(e) => {
                                e.preventDefault();
                                if (current > 1) setPage(current - 1);
                            }}
                            aria-disabled={current <= 1}
                            className={
                                current <= 1
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>

                    {pages.map((page, i) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${i}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === current}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={(e) => {
                                e.preventDefault();
                                if (current < total) setPage(current + 1);
                            }}
                            aria-disabled={current >= total}
                            className={
                                current >= total
                                    ? 'pointer-events-none opacity-50'
                                    : ''
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

// ── DataTableSkeleton ─────────────────────────────────────────────────────────

const DataTableSkeleton = ({
    columns = 5,
    rows = 8,
}: DataTableSkeletonProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full overflow-auto rounded-lg border border-border"
        >
            <table className="w-full caption-bottom text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th
                                key={i}
                                className="h-10 px-3"
                                aria-hidden="true"
                            >
                                <Skeleton className="mx-auto h-4 w-24" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, ri) => (
                        <tr
                            key={ri}
                            className="border-b border-border last:border-0"
                        >
                            {Array.from({ length: columns }).map((_, ci) => (
                                <td key={ci} className="px-3 py-2.5">
                                    <Skeleton className="h-4 w-full" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
};

// ── TableState ────────────────────────────────────────────────────────────────

const TableState = ({
    isLoading,
    isFetching = false,
    isError = false,
    isEmpty = false,
    loadingEl,
    onRetry,
    emptyTitle,
    emptyDescription,
    hasSearch = false,
    children,
}: TableStateProps) => {
    const showLoading = isLoading || isFetching;
    const showChildren = !showLoading && !isError && !isEmpty;

    return (
        <AnimatePresence mode="wait">
            {showLoading && (
                <motion.div key="loading" {...fadeProps}>
                    {loadingEl}
                </motion.div>
            )}

            {!showLoading && isError && (
                <motion.div key="error" {...fadeProps}>
                    <EmptyWrapper
                        title="Something went wrong"
                        description="Failed to load data. Please try again."
                        icon={<AlertCircleIcon />}
                        className="min-h-72"
                        action={
                            onRetry && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRetry}
                                >
                                    Retry
                                </Button>
                            )
                        }
                    />
                </motion.div>
            )}

            {!showLoading && !isError && isEmpty && (
                <motion.div key="empty" {...fadeProps}>
                    <EmptyWrapper
                        title={
                            emptyTitle ??
                            (hasSearch ? 'No results found' : 'No data yet')
                        }
                        description={
                            emptyDescription ??
                            (hasSearch
                                ? 'Try adjusting your search or filters.'
                                : undefined)
                        }
                        icon={hasSearch ? <SearchXIcon /> : <InboxIcon />}
                        className="min-h-72"
                    />
                </motion.div>
            )}

            {showChildren && (
                <motion.div key="content" {...fadeProps}>
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export {
    DataTablePagination,
    DataTableRoot,
    DataTableSkeleton,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    TableState,
};
