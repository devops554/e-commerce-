import React from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface ReusablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemsLabel?: string;
    className?: string;
}

export const ReusablePagination: React.FC<ReusablePaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemsLabel = "records",
    className = ""
}) => {
    if (totalPages <= 1) return null;

    // Calculate how many items are currently being shown
    const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm mt-6 ${className}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">
                Showing {showingFrom}-{showingTo} of {totalItems} {itemsLabel}
            </p>
            <Pagination className="mx-0 w-fit">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(Math.max(1, currentPage - 1));
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                            return (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === p}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(p);
                                        }}
                                        className="cursor-pointer font-bold"
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        } else if (p === currentPage - 2 || p === currentPage + 2) {
                            return (
                                <PaginationItem key={p}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(Math.min(totalPages, currentPage + 1));
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
