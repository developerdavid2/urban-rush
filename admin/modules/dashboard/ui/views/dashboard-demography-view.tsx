"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/react";
import { Globe, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  GeographyAnalytics,
  GeographyPeriod,
  CountryData,
} from "@/types/dashboard";
import { cn } from "@/lib/utils";
import * as flags from "country-flag-icons/react/3x2";

interface DashboardDemographyViewProps {
  data?: GeographyAnalytics;
  isLoading?: boolean;
  period?: GeographyPeriod;
  onPeriodChange?: (period: GeographyPeriod) => void;
}

// World map GeoJSON URL (TopoJSON format)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country code mapping for flag components
const getCountryCode = (country: string): keyof typeof flags | null => {
  const countryCodeMap: Record<string, keyof typeof flags> = {
    "United States": "US",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
    Germany: "DE",
    France: "FR",
    Nigeria: "NG",
    "South Africa": "ZA",
    India: "IN",
    China: "CN",
    Belgium: "BE",
    "Costa Rica": "CR",
    Austria: "AT",
    Brazil: "BR",
    Mexico: "MX",
    Spain: "ES",
    Italy: "IT",
    Japan: "JP",
    Netherlands: "NL",
    Sweden: "SE",
  };
  return countryCodeMap[country] || null;
};

// Flag component helper
const CountryFlag = ({
  country,
  className,
}: {
  country: string;
  className?: string;
}) => {
  const countryCode = getCountryCode(country);
  if (!countryCode) {
    return (
      <div
        className={cn("flex items-center justify-center text-xl", className)}
      >
        🌍
      </div>
    );
  }

  const FlagComponent = flags[countryCode];
  return <FlagComponent className={className} />;
};

// Get country coordinates for markers
const getCountryCoordinates = (country: string): [number, number] | null => {
  const coords: Record<string, [number, number]> = {
    "United States": [-95, 37],
    "United Kingdom": [-3, 54],
    Canada: [-106, 56],
    Australia: [133, -27],
    Germany: [10, 51],
    France: [2, 46],
    Nigeria: [8, 9],
    "South Africa": [24, -29],
    India: [78, 20],
    China: [104, 35],
    Belgium: [4.5, 50.5],
    "Costa Rica": [-84, 10],
    Austria: [13.3, 47.5],
    Brazil: [-47, -10],
    Mexico: [-102, 23],
    Spain: [-4, 40],
    Italy: [12.5, 42.8],
    Japan: [138, 36],
    Netherlands: [5.3, 52.1],
    Sweden: [15, 62],
  };
  return coords[country] || null;
};

// Calculate trend from country data (instead of Math.random)
const calculateTrend = (
  country: CountryData
): { hasIncreased: boolean; percentage: number } => {
  // If your backend provides trend data, use it here
  // For now, we'll derive it from the revenue/customer ratio
  const revenuePerCustomer = parseFloat(country.revenuePerCustomer);

  // Example logic: if revenue per customer is above average, consider it increasing
  // Replace this with actual trend data from your backend if available
  const hasIncreased = revenuePerCustomer > 0;
  const percentage = Math.abs(parseFloat(country.percentage));

  return { hasIncreased, percentage };
};

export default function DashboardDemographyView({
  data,
  isLoading = false,
  period = "30days",
  onPeriodChange,
}: DashboardDemographyViewProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<
    [number, number] | null
  >(null);

  const countries = data?.countries || [];

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Map Section - 60% */}
      <Card className="relative lg:col-span-3 bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-60 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[140px] opacity-25 pointer-events-none" />

        <CardBody className="relative p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-teal-500/10">
                <Globe className="size-4 text-teal-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Customers Demographic
                </h3>
                <p className="text-xs text-zinc-500">
                  Number of customers based on country
                </p>
              </div>
            </div>

            {/* Period Toggle */}
            <div className="flex bg-zinc-800/70 rounded-lg p-1 border border-zinc-700/50">
              <button
                onClick={() => onPeriodChange?.("7days")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
                  period === "7days"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                )}
              >
                7 Days
              </button>
              <button
                onClick={() => onPeriodChange?.("30days")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
                  period === "30days"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                )}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative bg-zinc-900/30 rounded-lg border border-zinc-700/30 overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
              </div>
            ) : countries.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Globe className="size-12 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">
                  No geography data available
                </p>
              </div>
            ) : (
              <ComposableMap
                projectionConfig={{
                  scale: 147,
                  center: [10, 20],
                }}
                className="w-full h-full"
              >
                <ZoomableGroup>
                  <Geographies geography={geoUrl}>
                    {({
                      geographies,
                    }: {
                      geographies: Array<{
                        rsmKey: string;
                        properties: { name: string };
                      }>;
                    }) =>
                      geographies.map((geo) => {
                        const countryData = countries.find(
                          (c) => c.country === geo.properties.name
                        );

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              countryData
                                ? `rgba(16, 185, 129, ${
                                    parseFloat(countryData.percentage) / 100
                                  })`
                                : "#1f2937"
                            }
                            stroke="#374151"
                            strokeWidth={0.5}
                            style={{
                              default: {
                                outline: "none",
                              },
                              hover: {
                                fill: countryData ? "#10b981" : "#374151",
                                outline: "none",
                                cursor: countryData ? "pointer" : "default",
                              },
                              pressed: {
                                outline: "none",
                              },
                            }}
                            onMouseEnter={() => {
                              if (countryData) {
                                setHoveredCountry(countryData.country);
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredCountry(null);
                              setHoveredPosition(null);
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Markers for top countries */}
                  {countries.map((country) => {
                    const coords = getCountryCoordinates(country.country);
                    if (!coords) return null;

                    return (
                      <Marker
                        key={country.country}
                        coordinates={coords}
                        onMouseEnter={() => {
                          setHoveredCountry(country.country);
                          setHoveredPosition(coords);
                        }}
                        onMouseLeave={() => {
                          setHoveredCountry(null);
                          setHoveredPosition(null);
                        }}
                      >
                        <circle
                          r={6}
                          fill="#10b981"
                          stroke="#059669"
                          strokeWidth={2}
                          className="animate-pulse cursor-pointer"
                        />
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            )}

            {/* Hover Tooltip - Positioned above marker with glassmorphism */}
            {hoveredCountry && hoveredPosition && (
              <div
                className="absolute pointer-events-none z-10"
                style={{
                  left: "50%",
                  top: "30%",
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="relative">
                  {/* Glassmorphism card */}
                  <div className="backdrop-blur-md bg-emerald-500/20 border border-emerald-400/30 text-white px-4 py-2.5 rounded-lg shadow-2xl">
                    <div className="flex items-center gap-2">
                      <CountryFlag
                        country={hoveredCountry}
                        className="w-5 h-4 rounded-sm object-cover"
                      />
                      <p className="font-semibold text-sm">{hoveredCountry}</p>
                    </div>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-400/30" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Table Section - 40% */}
      <Card className="relative lg:col-span-2 bg-green-900/5 border border-admin-divider/30 hover:border-emerald-500/20 transition-all duration-200 shadow-2xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute -top-1/2 right-0 -translate-x-1/2 -rotate-45 size-40 bg-gradient-to-tr from-cyan-100 via-blue-300 to-transparent blur-[100px] opacity-25 pointer-events-none" />

        <CardBody className="relative p-6 flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white mb-1">
              Top Countries by Sales
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">
                ${((data?.top5Totals.totalRevenue || 0) / 1000).toFixed(2)}K
              </p>
              <p className="text-xs text-zinc-500">Since last week</p>
            </div>
          </div>

          {/* Countries List */}
          <div className="flex-1 overflow-auto space-y-2">
            {isLoading ? (
              // Loading skeletons
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
                >
                  <div className="size-8 rounded-full bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-zinc-800" />
                    <div className="h-2 w-32 rounded bg-zinc-800" />
                  </div>
                  <div className="h-4 w-16 rounded bg-zinc-800" />
                </div>
              ))
            ) : countries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Globe className="size-12 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">No countries data</p>
              </div>
            ) : (
              countries.map((country, index) => {
                const isTopCountry = index === 0;
                const trend = calculateTrend(country);

                return (
                  <div
                    key={country.country}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      "bg-zinc-800/30 hover:bg-zinc-800/50",
                      "border border-zinc-700/30 hover:border-zinc-600/50",
                      "transition-all duration-200"
                    )}
                  >
                    {/* Flag */}
                    <div className="flex items-center justify-center size-10 shrink-0 overflow-hidden rounded-full border border-zinc-700/50">
                      <CountryFlag
                        country={country.country}
                        className="object-cover size-12!"
                      />
                    </div>

                    {/* Country Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {country.country}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {country.customerCount.toLocaleString()} Customers
                      </p>
                    </div>

                    {/* Trend Icon */}
                    <div className="flex items-center gap-1">
                      {trend.hasIncreased ? (
                        <TrendingUp className="size-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                    </div>

                    {/* Revenue */}
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-bold text-white">
                        ${(country.totalRevenue / 1000).toFixed(1)}K
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        className={cn(
                          "text-xs font-semibold",
                          isTopCountry
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-zinc-700/50 text-zinc-400"
                        )}
                      >
                        {country.percentage}%
                      </Chip>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Stats */}
          {!isLoading && data && countries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Orders</p>
                  <p className="text-base font-bold text-white">
                    {data.top5Totals.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Global Share</p>
                  <p className="text-base font-bold text-white">
                    {data.top5Totals.percentageOfGlobal}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
