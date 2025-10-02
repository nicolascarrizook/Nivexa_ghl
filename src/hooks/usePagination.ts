import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  pageNumbers: number[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setItemsPerPage: (items: number) => void;
  getPageItems: <T>(items: T[]) => T[];
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / currentItemsPerPage);
  }, [totalItems, currentItemsPerPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * currentItemsPerPage;
  }, [currentPage, currentItemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + currentItemsPerPage, totalItems);
  }, [startIndex, currentItemsPerPage, totalItems]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, currentPage + halfRange);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfRange) {
      end = Math.min(maxPagesToShow, totalPages);
    } else if (currentPage >= totalPages - halfRange) {
      start = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setItemsPerPage = useCallback((items: number) => {
    setCurrentItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const getPageItems = useCallback(<T,>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  return {
    currentPage,
    totalPages,
    itemsPerPage: currentItemsPerPage,
    startIndex,
    endIndex,
    pageNumbers,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setItemsPerPage,
    getPageItems
  };
}