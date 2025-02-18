import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
export function PaginationTableUser({
  query,
  setQuery,
  totalPages,
}: {
  query: any;
  setQuery: any;
  totalPages: number;
}) {
  const currentPage = Number(query.page);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setQuery({ currentPage: (currentPage - 1).toString() });
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setQuery({ currentPage: (currentPage + 1).toString() });
    }
  };

  return (
    <div className="flex flex-col gap-2 my-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={{
                query: {
                  ...(query.page ? { page: (currentPage - 1).toString() } : {}),
                  ...(query.search ? { search: query.search } : {}),
                  ...(query.sortBy ? { sortBy: query.sortBy } : {}),
                  ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
                  ...(query.limit ? { limit: query.limit } : {}),
                },
              }}
              onClick={handlePreviousPage}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <Link
                href={{
                  query: {
                    ...(query.page ? { page: pageNum.toString() } : {}),
                    ...(query.search ? { search: query.search } : {}),
                    ...(query.sortBy ? { sortBy: query.sortBy } : {}),
                    ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
                    ...(query.limit ? { limit: query.limit } : {}),
                  },
                }}
                className={`rounded-md px-4 py-2 transition-colors duration-300 ${
                  pageNum === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {pageNum}
              </Link>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={{
                query: {
                  ...(query.page ? { page: (currentPage + 1).toString() } : {}),
                  ...(query.search ? { search: query.search } : {}),
                  ...(query.sortBy ? { sortBy: query.sortBy } : {}),
                  ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
                  ...(query.limit ? { limit: query.limit } : {}),
                },
              }}
              onClick={handleNextPage}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center justify-end gap-2">
        <p className="text-sm font-semibold">Rows per page</p>
        <Select
          value={query.limit ? query.limit.toString() : "10"}
          onValueChange={(value) => {
            setQuery({ limit: value, page: "1" });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
