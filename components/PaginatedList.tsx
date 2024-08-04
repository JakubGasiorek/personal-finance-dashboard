import { PaginatedListProps } from "@/types";
import { useState } from "react";

const PaginatedList = <T,>({
  items,
  renderItem,
  itemsPerPage = 3,
}: PaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const displayedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <div className="flex-grow">
        <ul>{displayedItems.map(renderItem)}</ul>
      </div>
      <div className="flex justify-between mt-4 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 md:px-4 py-2 bg-green-800 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 md:px-4 py-2 bg-green-800 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default PaginatedList;
