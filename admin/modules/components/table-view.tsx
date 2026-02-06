import { cn } from "@/lib/utils";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import React, { useMemo } from "react";

export interface Column {
  name: string;
  uid: string;
  sortable?: boolean;
}

// Type helpers
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? ObjectType[Key] extends Array<infer ArrayItem>
      ? ArrayItem extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ArrayItem>}`
        : `${Key}`
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function convertToSearchableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  if (Array.isArray(value)) {
    const searchableValues = value
      .map(convertToSearchableString)
      .filter((val): val is string => val !== null);
    return searchableValues.length > 0 ? searchableValues.join(" ") : null;
  }

  return null;
}

function getNestedValue<T>(obj: T, path: string): string | null {
  const keys = path.split(".");
  let current: unknown = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (current == null) return null;

    if (Array.isArray(current)) {
      const remainingPath = keys.slice(i).join(".");
      const arrayValues = current
        .map((item) => getNestedValue(item, remainingPath))
        .filter((val): val is string => val !== null && val !== "");
      return arrayValues.length > 0 ? arrayValues.join(" ") : null;
    }

    if (isRecord(current) && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return convertToSearchableString(current);
}

interface TableViewProps<T extends object> {
  items: T[];
  columns: Column[];
  renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
  getItemKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchKeys?: NestedKeyOf<T>[];
  onRowClick?: (item: T) => void;
}

export function TableView<T extends object>({
  items,
  columns,
  renderCell,
  getItemKey,
  isLoading = false,
  emptyMessage = "No items found",
  searchPlaceholder = "Search...",
  searchKeys = [],
  onRowClick,
}: TableViewProps<T>) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(columns.map((c) => c.uid))
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: columns[0]?.uid || "name",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns, columns]);

  // Step 1: Filter items based on search
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (hasSearchFilter && searchKeys.length > 0) {
      filtered = filtered.filter((item) => {
        return searchKeys.some((key) => {
          const value = getNestedValue(item, key as string);
          if (value === null) return false;
          return value.toLowerCase().includes(filterValue.toLowerCase());
        });
      });
    }

    return filtered;
  }, [items, filterValue, hasSearchFilter, searchKeys]);

  // Step 2: Sort ALL filtered items BEFORE pagination
  // ✅ FIX: Sort the complete filtered list first
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a: T, b: T) => {
      const columnKey = sortDescriptor.column as keyof T;
      const first = a[columnKey];
      const second = b[columnKey];

      // Handle null/undefined - keep them but push to end
      if (first == null && second == null) return 0;
      if (first == null) return 1;
      if (second == null) return -1;

      let cmp = 0;
      if (typeof first === "string" && typeof second === "string") {
        cmp = first.localeCompare(second);
      } else if (typeof first === "number" && typeof second === "number") {
        cmp = first - second;
      } else {
        cmp = String(first).localeCompare(String(second));
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  // Step 3: Calculate pages based on sorted items
  const pages = Math.ceil(sortedItems.length / rowsPerPage) || 1;

  // Step 4: Paginate the sorted items
  // ✅ FIX: Slice from sortedItems instead of filteredItems
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={searchPlaceholder}
            startContent={<SearchIcon className="text-default-300 size-4" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
            variant="bordered"
            classNames={{
              inputWrapper:
                "border-2 border-zinc-700 bg-zinc-900/40 hover:bg-transparent hover:border-zinc-500 data-[focus=true]:!border-emerald-600",
              input: "text-white",
            }}
          />
          <div className="flex gap-3 flex-wrap">
            <Dropdown
              showArrow
              classNames={{
                base: "before:bg-[#1b211e]",
                content: "p-0 border-small border-divider",
              }}
              radius="sm"
            >
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="size-4" />}
                  variant="flat"
                  className="bg-zinc-800 text-white"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
                classNames={{
                  base: "bg-[#1b211e] border border-admin-divider/60 shadow-xl backdrop-blur-sm rounded-lg p-1 overflow-hidden",
                }}
              >
                {columns.map((column) => (
                  <DropdownItem
                    key={column.uid}
                    className="capitalize text-white hover:bg-zinc-800"
                  >
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-small">
            Total {items.length} items
            {filteredItems.length < items.length && (
              <span className="text-yellow-500 ml-2">
                ({filteredItems.length} shown)
              </span>
            )}
          </span>
          <label className="flex items-center text-text-secondary text-small">
            <span className="mr-2">Rows per page: </span>
            <select
              className={cn(
                "bg-zinc-900/60 border border-zinc-700 rounded-md",
                "text-white text-sm font-medium",
                "px-3 py-1.5 min-w-[70px]",
                "cursor-pointer appearance-none",
                "focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30",
                "transition-all duration-200"
              )}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 15, 20].map((num) => (
                <option
                  key={num}
                  value={num}
                  className={cn(
                    "bg-[#1b211e] text-white text-sm rounded-md",
                    "hover:bg-emerald-900/40",
                    "checked:bg-emerald-900/70 checked:text-emerald-300"
                  )}
                >
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    columns,
    items.length,
    filteredItems.length,
    rowsPerPage,
    searchPlaceholder,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-text-secondary">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${sortedItems.length} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            wrapper: "gap-2 bg-zinc-800",
            item: "bg-zinc-800 text-white",
            cursor: "bg-emerald-600 text-white border-emerald-500",
            prev: "bg-zinc-800 text-white border-zinc-700",
            next: "bg-zinc-800 text-white border-zinc-700",
          }}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={page === 1}
            size="sm"
            variant="flat"
            onPress={() => setPage(page - 1)}
            className="bg-zinc-800 text-white border border-zinc-700 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            isDisabled={page === pages}
            size="sm"
            variant="flat"
            onPress={() => setPage(page + 1)}
            className="bg-zinc-800 text-white border border-zinc-700 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, sortedItems.length, page, pages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Admin data table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      color="success"
      classNames={{
        wrapper: cn(
          "max-h-full",
          "bg-zinc-900/40 border border-admin-divider rounded-xl"
        ),
        table: "bg-transparent",
        th: "bg-zinc-950/70 text-text-primary border-b border-admin-divider",
        td: "text-text-primary border-b border-admin-divider/30 bg-transparent",
        tr: cn(
          "[&[data-hover=true]]:bg-emerald-950/40",
          "[&[data-selected=true]>*]:!text-white",
          "[&[data-disabled=true]>*]:!bg-black",
          "[&[data-hover=true] .heroui-cell]:!text-white",
          "data-[selected=true]:bg-emerald-900/50",
          "data-[selected=true]:!text-emerald-100",
          onRowClick && "cursor-pointer"
        ),
      }}
      selectedKeys={selectedKeys}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={emptyMessage}
        items={paginatedItems}
        isLoading={isLoading}
        loadingContent={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        }
      >
        {(item) => (
          <TableRow key={getItemKey(item)} onClick={() => onRowClick?.(item)}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
