"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";

export function DashboardStatsCardSkeleton() {
  return (
    <Card
      className="bg-admin-divider/10 border border-admin-divider/30"
      radius="lg"
    >
      <Skeleton className="opacity-15">
        <CardBody className="p-6 space-y-4">
          Header
          <div className="flex items-center gap-3">
            <Skeleton className="rounded-lg bg-stone-500/60 opacity-70">
              <div className="size-10 rounded-lg" />
            </Skeleton>

            <Skeleton className="w-24 rounded-lg bg-stone-500/60 opacity-70">
              <div className="h-4 w-24 rounded-lg" />
            </Skeleton>
          </div>
          <div className="flex items-end justify-between gap-4">
            {/* Left side */}
            <div className="flex-1 space-y-3">
              {/* Value */}
              <Skeleton className="w-32 rounded-lg bg-stone-500/60 opacity-70">
                <div className="h-8 w-32 rounded-lg" />
              </Skeleton>

              {/* Trend pill */}
              <Skeleton className="w-24 rounded-full bg-stone-500/60 opacity-70">
                <div className="h-5 w-24 rounded-full" />
              </Skeleton>
            </div>
          </div>
        </CardBody>
      </Skeleton>
    </Card>
  );
}

export function DashboardStatsSkeletonView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardStatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
