"use client";

import AddDish from "@/app/[locale]/manage/dishes/add-dish";
import EditDish from "@/app/[locale]/manage/dishes/edit-dish";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { DishStatusType, DishStatusValues } from "@/constants/type";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import { useDeleteDishMutation, useDishListQuery } from "@/queries/useDish";
import {
  DishListResType,
  FilterPrice,
  FilterPriceType,
} from "@/schemaValidations/dish.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DOMPurify from "dompurify";
import {
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  Check,
  FilterIcon,
  PencilIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useDebouncedCallback } from "use-debounce";
import { PaginationTableDish } from "./pagination";
type DishItem = DishListResType["data"]["items"][0];

const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void;
  dishIdEdit: number | undefined;
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: DishItem | null) => {},
});

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete,
}: {
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}) {
  const { mutateAsync } = useDeleteDishMutation();
  const deleteDish = async () => {
    if (dishDelete) {
      try {
        const result = await mutateAsync(dishDelete.id);
        setDishDelete(null);
        toast({
          title: result.payload.message,
        });
      } catch (error) {
        handleErrorApi({
          error,
        });
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete dish?</AlertDialogTitle>
          <AlertDialogDescription>
            Dish{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {dishDelete?.name}
            </span>{" "}
            will be deleted permanently
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
const PAGE_SIZE = 10;
export default function DishTable() {
  const searchParam = useSearchParams();
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const [query, setQuery] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(PAGE_SIZE),
      sortBy: parseAsStringLiteral(["name"]),
      sortOrder: parseAsStringLiteral(["asc", "desc"]),
      search: parseAsString,
      status: parseAsStringLiteral(DishStatusValues),
      fromPrice: parseAsInteger,
      toPrice: parseAsInteger,
    },
    {
      history: "push",
    }
  );

  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null);

  const dishListQuery = useDishListQuery({
    page: Number(query.page),
    limit: Number(query.limit),
    sortBy: (query.sortBy as "name") || undefined,
    sortOrder: (query.sortOrder as "asc" | "desc") || undefined,
    search: query.search as string,
    status: query.status as DishStatusType,
    fromPrice: query.fromPrice ?? undefined,
    toPrice: query.toPrice ?? undefined,
  });

  const data = dishListQuery.data?.payload.data.items ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<DishItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div>
          <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
            <AvatarImage src={row.getValue("image")} />
            <AvatarFallback className="rounded-none">
              {row.original.name}
            </AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: () => {
        const isSorting = sorting.some((sort) => sort.id === "name");
        const isSortingAsc = isSorting && sorting[0].desc === false;
        const isSortingDesc = isSorting && sorting[0].desc === true;
        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex cursor-pointer items-center gap-2 ${
                  isSorting ? "rounded-md p-2 font-bold text-primary" : ""
                }`}
              >
                Name{" "}
                {isSortingAsc ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : isSortingDesc ? (
                  <ArrowDownIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownUpIcon className="h-4 w-4" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSorting([{ id: "name", desc: false }]);
                    setQuery({ sortBy: "name", sortOrder: "asc" });
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2",
                    isSortingAsc && "bg-primary text-primary-foreground"
                  )}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  asc
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setQuery({ sortBy: "name", sortOrder: "desc" });
                    setSorting([{ id: "name", desc: true }]);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2",
                    isSortingDesc && "bg-primary text-primary-foreground"
                  )}
                >
                  <ArrowDownIcon className="h-4 w-4" />
                  desc
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => {
                    setQuery({ sortBy: null, sortOrder: null });
                    setSorting([]);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                  Remove Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="capitalize">
          {formatCurrency(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(row.getValue("description")),
          }}
          className="whitespace-pre-line"
        />
      ),
    },
    {
      accessorKey: "status",
      header: () => {
        return <div>Status</div>;
      },
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: function Actions({ row }) {
        const { setDishIdEdit, setDishDelete } = useContext(DishTableContext);
        const openEditDish = () => {
          setDishIdEdit(row.original.id);
        };

        const openDeleteDish = () => {
          setDishDelete(row.original);
        };
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full p-2 hover:bg-primary hover:text-primary-foreground"
              onClick={openEditDish}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full p-2 hover:bg-destructive hover:text-destructive-foreground"
              onClick={openDeleteDish}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    dishListQuery.refetch();
  }, [dishListQuery, query]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setQuery({ search: value || null });
  }, 500);
  const handleOnChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  const [open, setOpen] = useState(false);
  const form = useForm<FilterPriceType>({
    resolver: zodResolver(FilterPrice),
  });
  const onSubmit = (data: FilterPriceType) => {
    setQuery((prev) => ({
      ...prev,
      fromPrice: data.fromPrice,
      toPrice: data.toPrice,
      page: 1,
    }));
  };
  const resetFilterPrice = () => {
    setQuery((prev) => ({
      ...prev,
      fromPrice: null,
      toPrice: null,
      page: 1,
    }));
    form.reset({
      fromPrice: undefined,
      toPrice: undefined,
    });
  };

  return (
    <DishTableContext.Provider
      value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}
    >
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish
          dishDelete={dishDelete}
          setDishDelete={setDishDelete}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 rounded-lg border px-4 py-2 my-2 w-[400px]">
            <SearchIcon className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              defaultValue={query.search as string}
              onChange={handleOnChangeSearch}
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  View
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px]">
                <div className="space-y-2">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <div
                          key={column.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => {
                              column.toggleVisibility(!!value);
                            }}
                          />
                          <Label className="capitalize">
                            {column.id === "image"
                              ? "Image"
                              : column.id === "name"
                              ? "Name"
                              : column.id === "price"
                              ? "Price"
                              : column.id === "description"
                              ? "Description"
                              : column.id === "status"
                              ? "Status"
                              : column.id}
                          </Label>
                        </div>
                      );
                    })}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" role="combobox" aria-expanded={open}>
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Status
                  {query.status && (
                    <XIcon
                      className="ml-2 h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery({ status: null });
                        setOpen(false);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search status..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {DishStatusValues.map((status) => (
                        <CommandItem
                          key={status}
                          value={status}
                          onSelect={(currentValue) => {
                            setQuery({
                              ...query,
                              status: currentValue as DishStatusType,
                            });
                            setOpen(false);
                          }}
                        >
                          {status}
                          <Check
                            className={cn(
                              "ml-auto",
                              query.status?.includes(status)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" role="combobox">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Price Range
                  {query.fromPrice && query.toPrice && (
                    <XIcon
                      className="ml-2 h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFilterPrice();
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-4">
                <Form {...form}>
                  <form
                    noValidate
                    className="grid auto-rows-max items-start gap-4 md:gap-8"
                    id="filter-price-form"
                    onSubmit={form.handleSubmit(onSubmit, (e) => {
                      console.log(e);
                    })}
                  >
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="fromPrice"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                              <Label htmlFor="fromPrice">From price</Label>
                              <div className="col-span-3 w-full space-y-2">
                                <Input
                                  id="fromPrice"
                                  className="w-full"
                                  {...field}
                                  placeholder="From price"
                                />
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="toPrice"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                              <Label htmlFor="toPrice">To price</Label>
                              <div className="col-span-3 w-full space-y-2">
                                <Input
                                  placeholder="To price"
                                  id="toPrice"
                                  className="w-full"
                                  {...field}
                                  type="number"
                                />
                                <FormMessage />
                              </div>{" "}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      form="filter-price-form"
                    >
                      Apply
                    </Button>
                  </form>
                </Form>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <AddDish />
        <PaginationTableDish
          totalPages={dishListQuery.data?.payload.data.totalPage || 0}
          query={query}
          setQuery={setQuery}
        />
      </div>
    </DishTableContext.Provider>
  );
}

export type DishListParamsType = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: DishStatusType[];
  fromPrice?: number;
  toPrice?: number;
};
