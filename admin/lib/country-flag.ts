// lib/country-flags.ts or utils/country-flags.ts

import * as flags from "country-flag-icons/react/3x2";

/**
 * Maps country names to ISO 3166-1 alpha-2 country codes
 * Used for rendering flag components
 */
export const COUNTRY_CODE_MAP: Record<string, keyof typeof flags> = {
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
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Switzerland: "CH",
  Portugal: "PT",
  Poland: "PL",
  Greece: "GR",
  Ireland: "IE",
  "New Zealand": "NZ",
  Singapore: "SG",
  "South Korea": "KR",
  Thailand: "TH",
  Malaysia: "MY",
  Indonesia: "ID",
  Philippines: "PH",
  Vietnam: "VN",
  Egypt: "EG",
  Kenya: "KE",
  Ghana: "GH",
  Morocco: "MA",
  Argentina: "AR",
  Chile: "CL",
  Colombia: "CO",
  Peru: "PE",
  Venezuela: "VE",
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
  Israel: "IL",
  Turkey: "TR",
  Russia: "RU",
  Ukraine: "UA",
  Romania: "RO",
  "Czech Republic": "CZ",
  Hungary: "HU",
  Bulgaria: "BG",
};

/**
 * Maps country names to approximate center coordinates [longitude, latitude]
 * Used for map markers
 */
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
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
  Norway: [9, 61],
  Denmark: [10, 56],
  Finland: [26, 64],
  Switzerland: [8, 47],
  Portugal: [-8, 39.5],
  Poland: [19, 52],
  Greece: [22, 39],
  Ireland: [-8, 53],
  "New Zealand": [174, -41],
  Singapore: [103.8, 1.3],
  "South Korea": [127.5, 37],
  Thailand: [101, 15],
  Malaysia: [102, 4],
  Indonesia: [113, -2],
  Philippines: [122, 13],
  Vietnam: [106, 16],
  Egypt: [30, 26],
  Kenya: [37, 1],
  Ghana: [-2, 8],
  Morocco: [-7, 32],
  Argentina: [-64, -34],
  Chile: [-71, -30],
  Colombia: [-74, 4],
  Peru: [-76, -10],
  Venezuela: [-66, 8],
  "Saudi Arabia": [45, 24],
  "United Arab Emirates": [54, 24],
  Israel: [35, 31],
  Turkey: [35, 39],
  Russia: [100, 60],
  Ukraine: [32, 49],
  Romania: [25, 46],
  "Czech Republic": [15.5, 49.8],
  Hungary: [19.5, 47],
  Bulgaria: [25, 43],
};

/**
 * Get the ISO country code for a given country name
 * @param country - Full country name
 * @returns ISO 3166-1 alpha-2 code or null if not found
 */
export const getCountryCode = (country: string): keyof typeof flags | null => {
  return COUNTRY_CODE_MAP[country] || null;
};

/**
 * Get coordinates for a given country
 * @param country - Full country name
 * @returns [longitude, latitude] or null if not found
 */
export const getCountryCoordinates = (
  country: string
): [number, number] | null => {
  return COUNTRY_COORDINATES[country] || null;
};

/**
 * Get the flag component for a country
 * @param country - Full country name
 * @returns Flag component or null if not found
 */
export const getFlagComponent = (
  country: string
): ((props: any) => JSX.Element) | null => {
  const code = getCountryCode(country);
  if (!code) return null;
  return flags[code];
};
