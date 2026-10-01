'use client';

import type { FC } from 'react';
import React from 'react';
import type { BreadcrumbWrapperProps } from './breadcrumb.types';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './components';

const BreadcrumbWrapper: FC<BreadcrumbWrapperProps> = ({
    items,
    separator,
    ellipsis = false,
    maxItems = 3,
}) => {
    const shouldCollapse = ellipsis && items.length > maxItems;
    const visibleItems = shouldCollapse
        ? [items[0], null, ...items.slice(-(maxItems - 1))]
        : items;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {visibleItems.map((item, index) => {
                    const isLast = index === visibleItems.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbItem>
                                {item === null ? (
                                    <BreadcrumbEllipsis />
                                ) : isLast ? (
                                    <BreadcrumbPage>
                                        {item.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        href={item.href ?? '#'}
                                        aria-label={item['aria-label']}
                                    >
                                        {item.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator>
                                    {separator}
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadcrumbWrapper;

export type {
    BreadcrumbItemDef,
    BreadcrumbWrapperProps,
} from './breadcrumb.types';
export {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './components';
