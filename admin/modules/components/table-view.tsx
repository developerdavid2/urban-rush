"use client";

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

interface TableViewProps<T extends Record<string, unknown>> {
  items: T[];
  columns: Column[];
  renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
  getItemKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
}

export function TableView<T extends Record<string, unknown>>({
  items,
  columns,
  renderCell,
  getItemKey,
  isLoading = false,
  emptyMessage = "No items found",
  searchPlaceholder = "Search...",
  searchKeys = [],
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

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (hasSearchFilter && searchKeys.length > 0) {
      filtered = filtered.filter((item) => {
        return searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
    }

    return filtered;
  }, [items, filterValue, hasSearchFilter, searchKeys]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...paginatedItems].sort((a: T, b: T) => {
      const columnKey = sortDescriptor.column as keyof T;
      const first = a[columnKey];
      const second = b[columnKey];

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
  }, [sortDescriptor, paginatedItems]);

  // Top content (search & filters)
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
                base: "before:bg-[#1b211e] ", // change arrow background
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
                  // list: "bg-zinc-900",
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
    rowsPerPage,
    searchPlaceholder,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-text-secondary">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
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
  }, [selectedKeys, filteredItems.length, page, pages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Admin data table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      color="success"
      classNames={{
        wrapper:
          "max-h-[600px] bg-zinc-900/40 border border-admin-divider rounded-xl overflow-hidden",
        table: "bg-transparent",
        th: "bg-zinc-950/70 text-text-primary border-b border-admin-divider",
        td: "text-text-primary border-b border-admin-divider/30 bg-transparent",
        // Fix selection / hover / focus colors
        tr: cn(
          "[&[data-hover=true]]:bg-emerald-950/40",
          "[&[data-selected=true]>*]:!text-white",
          "[&[data-disabled=true]>*]:!bg-black",
          "[&[data-hover=true] .heroui-cell]:!text-white",
          "data-[selected=true]:bg-emerald-900/50",
          "data-[selected=true]:!text-emerald-100"
        ),
      }}
      selectedKeys={selectedKeys}
      // selectionMode="multiple"
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
        items={sortedItems}
        isLoading={isLoading}
        loadingContent={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        }
      >
        {(item) => (
          <TableRow key={getItemKey(item)}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
