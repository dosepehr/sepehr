'use client';

import { DataTablePagination, DataTableRoot } from './components';
import type { DataTableProps } from './data-table.types';

const DataTable = <TData,>({
    columns,
    data,
    current,
    total,
    setPage,
    limit,
    setLimit,
    hidePagination,
    maxHeight,
    stickyOffset,
    className,
    emptyTitle,
    emptyDescription,
    rowSelection,
    setRowSelection,
    haveSelection,
    filterColumn,
    filterPlaceholder,
    footerRow,
    hideRowIndex,
}: DataTableProps<TData>) => {
    const isEmpty = data.length === 0;

    return (
        <div className="flex flex-col gap-3">
            <DataTableRoot
                columns={columns}
                data={data}
                maxHeight={maxHeight}
                stickyOffset={stickyOffset}
                className={className}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                haveSelection={haveSelection}
                filterColumn={filterColumn}
                filterPlaceholder={filterPlaceholder}
                footerRow={footerRow}
                hideRowIndex={hideRowIndex}
                current={current}
                limit={limit}
            />
            {!isEmpty && !hidePagination && (
                <DataTablePagination
                    current={current}
                    total={total}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            )}
        </div>
    );
};

export default DataTable;
