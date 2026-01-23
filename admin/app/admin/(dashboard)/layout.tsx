"use client";

import { AdminSidebar } from "../../../modules/dashboard/ui/components/dashboard-sidebar";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    if (label === "Admin") label = "Dashboard";

    return {
      label,
      href: path,
      isCurrent: index === segments.length - 1,
    };
  });
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-admin-bg/10 border-b border-divider px-6 py-4 flex items-center justify-between">
          <Breadcrumbs className="text-text-muted">
            {breadcrumbs.map((breadcrumb) => (
              <BreadcrumbItem
                key={breadcrumb.href}
                href={breadcrumb.isCurrent ? undefined : breadcrumb.href}
                color="success"
              >
                <span
                  className={cn(
                    breadcrumb.isCurrent
                      ? "font-semibold text-text-primary pointer-events-none"
                      : "hover:text-text-primary transition-colors text-text-muted"
                  )}
                >
                  {breadcrumb.label}
                </span>
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>

          <div className="flex items-center gap-4">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
              Add Product
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-linear-to-tr from-zinc-900/30 via-50% to-admin-bg p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
