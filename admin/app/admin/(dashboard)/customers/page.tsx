"use client";

import { userApi } from "@/app/actions/userApi";
import {
  formatDate,
  getUserStatusConfig,
  UserStatus,
} from "@/lib/dashboard-utils";
import { Column, TableView } from "@/modules/components/table-view";

import { User } from "@/types/user";
import { Avatar, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useCallback } from "react";

const columns: Column[] = [
  { name: "CUSTOMER ID", uid: "_id", sortable: true },
  { name: "CUSTOMER", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ADDRESSES", uid: "addresses", sortable: true },
  { name: "WISHLIST", uid: "wishlist", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "JOINED DATE", uid: "createdAt", sortable: true },
];

export default function CustomersPage() {
  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: userApi.getAllUsers,
  });

  const customers = customersResponse?.data || [];

  const renderCell = useCallback((customer: User, columnKey: React.Key) => {
    const key = columnKey as keyof User;
    const cellValue = customer[key];

    switch (columnKey) {
      case "_id": {
        const id = String(cellValue).slice(0, 8);
        return (
          <p className="font-medium text-small uppercase text-gray-300">
            #{id}
          </p>
        );
      }

      case "name": {
        const name = String(cellValue).toLowerCase();
        const image = customer?.profileImageUrl;
        return (
          <div className="flex items-center gap-x-2">
            <Avatar
              showFallback
              color="success"
              name={name}
              src={image}
              size="sm"
            />
            <p className="font-medium text-small capitalize  text-gray-300">
              {name}
            </p>
          </div>
        );
      }

      case "email":
        return <p className="text-xs text-gray-400">{String(cellValue)}</p>;

      case "addresses": {
        const addresses = (Array.isArray(cellValue) && cellValue.length) || 0;
        return (
          <p className="text-small  text-gray-300">{addresses} address(es)</p>
        );
      }

      case "wishlist": {
        const wishlist = (Array.isArray(cellValue) && cellValue.length) || 0;
        return <p className="text-small  text-gray-300">{wishlist} item(s)</p>;
      }
      case "status": {
        const config = getUserStatusConfig(cellValue as UserStatus);
        return (
          <Chip
            classNames={{
              base: `capitalize border ${config.borderClass} ${config.bgClass}`,
              content: config.textClass,
            }}
            size="sm"
            variant="flat"
          >
            {config.label}
          </Chip>
        );
      }

      case "createdAt": {
        const date = formatDate(String(cellValue));
        return <p className="text-xs text-gray-400">{date}</p>;
      }

      default:
        return typeof cellValue === "object"
          ? JSON.stringify(cellValue)
          : String(cellValue);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Customers ({customers?.length || 0})
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your customers
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <Loader2 className="size-10 animate-spin mb-4" />
          <p>Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary border border-dashed border-admin-divider rounded-xl">
          <p className="text-lg font-medium mb-2">No customers yet</p>
          <p className="text-sm">
            When you have customers on your application, they would be displayed
            here.
          </p>
        </div>
      ) : (
        <TableView<User>
          items={customers}
          columns={columns}
          renderCell={renderCell}
          getItemKey={(customer) => customer.clerkId}
          isLoading={isLoading}
          emptyMessage="No customers found"
          searchPlaceholder="Search by ID, name, email or status..."
          searchKeys={["name", "_id", "email", "status"]}
        />
      )}
    </div>
  );
}
