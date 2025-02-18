"use client";
import AddEmployee from "@/app/[locale]/manage/accounts/add-account";
import EditAccount from "@/app/[locale]/manage/accounts/edit-account";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Role } from "@/constants/type";
import { cn, handleErrorApi } from "@/lib/utils";
import {
  useDeleteAccountMutation,
  useGetAccountList,
} from "@/queries/useAccount";
import {
  AccountListResType,
  AccountType,
} from "@/schemaValidations/account.schema";
import { RoleType } from "@/types/jwt.types";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { createContext, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { PaginationTableUser } from "./pagination";
type AccountItem = AccountListResType["data"]["items"][number];

const AccountTableContext = createContext<{
  setEmployeeIdEdit: (value: number) => void;
  employeeIdEdit: number | undefined;
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}>({
  setEmployeeIdEdit: (value: number | undefined) => {},
  employeeIdEdit: undefined,
  employeeDelete: null,
  setEmployeeDelete: (value: AccountItem | null) => {},
});

function AlertDialogDeleteAccount({
  employeeDelete,
  setEmployeeDelete,
}: {
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (value: AccountItem | null) => void;
}) {
  const { mutateAsync } = useDeleteAccountMutation();
  const deleteAccount = async () => {
    if (employeeDelete) {
      try {
        const result = await mutateAsync(employeeDelete.id);
        setEmployeeDelete(null);
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
      open={Boolean(employeeDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setEmployeeDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>
            Account{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {employeeDelete?.name}
            </span>{" "}
            will be deleted permanently
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteAccount}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
const PAGE_SIZE = 10;
export default function AccountTable() {
  const [employeeIdEdit, setEmployeeIdEdit] = useState<number | undefined>();
  const [employeeDelete, setEmployeeDelete] = useState<AccountItem | null>(
    null
  );
  const [query, setQuery] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(PAGE_SIZE),
      sortBy: parseAsStringLiteral(["name"]),
      sortOrder: parseAsStringLiteral(["asc", "desc"]),
      search: parseAsString,
    },
    {
      history: "push",
    }
  );

  const accountListQuery = useGetAccountList({
    page: Number(query.page),
    limit: Number(query.limit),
    sortBy: (query.sortBy as "name") || undefined,
    sortOrder: (query.sortOrder as "asc" | "desc") || undefined,
    search: query.search || undefined,
  });
  const data = accountListQuery.data?.payload.data.items ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns: ColumnDef<AccountType>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => (
        <div>
          <Avatar className="rounded-md object-fit h-16 w-16">
            <AvatarImage src={row.getValue("avatar")} />
            <AvatarFallback className="rounded-none">
              {row.original.name.charAt(0)}
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
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return row?.original?.role === Role.Employee ? (
          <Badge variant="outline" className="bg-primary text-white">
            {Role.Employee}
          </Badge>
        ) : row?.original?.role === Role.Owner ? (
          <Badge variant="secondary">{Role.Owner}</Badge>
        ) : (
          <Badge variant="outline">{Role.Guest}</Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: function Actions({ row }) {
        const { setEmployeeIdEdit, setEmployeeDelete } =
          useContext(AccountTableContext);
        const openEditEmployee = () => {
          setEmployeeIdEdit(row.original.id);
        };

        const openDeleteEmployee = () => {
          setEmployeeDelete(row.original);
        };
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full p-2 hover:bg-primary hover:text-primary-foreground"
              onClick={openEditEmployee}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full p-2 hover:bg-destructive hover:text-destructive-foreground"
              onClick={openDeleteEmployee}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  const frameworks = [
    {
      value: Role.Employee,
      label: Role.Employee,
    },
    {
      value: Role.Owner,
      label: Role.Owner,
    },
    {
      value: Role.Guest,
      label: Role.Guest,
    },
  ];
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
    state: {
      sorting,
    },
  });
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setQuery({ search: value || null });
  }, 500);
  const handleOnChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<RoleType[]>([Role.Employee]);
  return (
    <AccountTableContext.Provider
      value={{
        employeeIdEdit,
        setEmployeeIdEdit,
        employeeDelete,
        setEmployeeDelete,
      }}
    >
      <div className="w-full">
        <EditAccount
          id={employeeIdEdit}
          setId={setEmployeeIdEdit}
          onSubmitSuccess={() => {
            accountListQuery.refetch();
          }}
        />
        <AlertDialogDeleteAccount
          employeeDelete={employeeDelete}
          setEmployeeDelete={setEmployeeDelete}
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
          {/* <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" role="combobox" aria-expanded={open}>
                <FilterIcon className="h-4 w-4 mr-2" />
                Role
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search role..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(
                            value.includes(currentValue as RoleType)
                              ? value.filter((v) => v !== currentValue)
                              : [...value, currentValue as RoleType]
                          );
                        }}
                      >
                        {framework.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            value.includes(framework.value)
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
          </Popover> */}
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
        <AddEmployee />
        <PaginationTableUser
          totalPages={accountListQuery.data?.payload.data.totalPage || 0}
          query={query}
          setQuery={setQuery}
        />
      </div>
    </AccountTableContext.Provider>
  );
}
