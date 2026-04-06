import { useState } from "react";

const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1); // reset page
  };

  return {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    setPage,
    setPageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default usePagination;
