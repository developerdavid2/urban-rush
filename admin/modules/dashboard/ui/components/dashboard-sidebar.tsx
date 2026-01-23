"use client";

import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  MessageSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@heroui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboardIcon },
  { title: "Products", url: "/admin/products", icon: PackageIcon },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCartIcon },
  { title: "Customers", url: "/admin/customers", icon: UsersIcon },
  { title: "Chat Support", url: "/admin/support", icon: MessageSquareIcon },
];

export function AdminSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (url: string) => {
    if (url === "/admin") return pathname === "/admin";
    return pathname.startsWith(url);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? "4.5rem" : "15rem" }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-screen bg-admin-bg/80 border-r border-divider flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-glow">
                <LayoutDashboardIcon className="size-5 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold text-text-primary">Admin</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center justify-center rounded-lg p-1.5 text-text-secondary hover:text-emerald-400 hover:bg-surface transition-all duration-200 cursor-pointer",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="size-4" />
          ) : (
            <ChevronLeftIcon className="size-4" />
          )}
        </motion.button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            const buttonContent = (
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 2 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 my-4 transition-all duration-200",
                    active
                      ? "active-emerald"
                      : "text-text-secondary hover-emerald",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      active && "text-emerald-500"
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );

            return (
              <div key={item.title}>
                {isCollapsed ? (
                  <Tooltip
                    content={item.title}
                    placement="right"
                    delay={0}
                    classNames={{
                      content:
                        "bg-surface text-text-primary border border-emerald-500/20",
                    }}
                  >
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-divider">
        <div
          className={cn(
            "flex items-center gap-2.5",
            isCollapsed && "justify-center"
          )}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "size-9 ring-2 offset-2 ring-emerald-500/20",
                userButtonTrigger:
                  "focus:shadow-none hover:opacity-80 transition-opacity",
              },
            }}
          />
          {!isCollapsed && (
            <div className="flex-1 text-left text-sm overflow-hidden">
              <p className="font-medium text-text-primary truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.emailAddresses[0].emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
