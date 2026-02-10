// lib/country-flags.ts or utils/country-flags.ts

/**
 * Country Flag Utilities using flagcdn.com CDN
 * No package installation required - uses external CDN for flag images
 */

/**
 * Maps country names to ISO 3166-1 alpha-2 country codes (lowercase)
 * Used for fetching flags from flagcdn.com
 */
export const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "gb",
  Canada: "ca",
  Australia: "au",
  Germany: "de",
  France: "fr",
  Nigeria: "ng",
  "South Africa": "za",
  India: "in",
  China: "cn",
  Belgium: "be",
  "Costa Rica": "cr",
  Austria: "at",
  Brazil: "br",
  Mexico: "mx",
  Spain: "es",
  Italy: "it",
  Japan: "jp",
  Netherlands: "nl",
  Sweden: "se",
  Norway: "no",
  Denmark: "dk",
  Finland: "fi",
  Switzerland: "ch",
  Portugal: "pt",
  Poland: "pl",
  Greece: "gr",
  Ireland: "ie",
  "New Zealand": "nz",
  Singapore: "sg",
  "South Korea": "kr",
  Thailand: "th",
  Malaysia: "my",
  Indonesia: "id",
  Philippines: "ph",
  Vietnam: "vn",
  Egypt: "eg",
  Kenya: "ke",
  Ghana: "gh",
  Morocco: "ma",
  Argentina: "ar",
  Chile: "cl",
  Colombia: "co",
  Peru: "pe",
  Venezuela: "ve",
  "Saudi Arabia": "sa",
  "United Arab Emirates": "ae",
  Israel: "il",
  Turkey: "tr",
  Russia: "ru",
  Ukraine: "ua",
  Romania: "ro",
  "Czech Republic": "cz",
  Hungary: "hu",
  Bulgaria: "bg",
  Pakistan: "pk",
  Bangladesh: "bd",
  Taiwan: "tw",
  "Hong Kong": "hk",
  Ethiopia: "et",
  Tanzania: "tz",
  Uganda: "ug",
  Algeria: "dz",
  Tunisia: "tn",
  Lebanon: "lb",
  Jordan: "jo",
  Iraq: "iq",
  Iran: "ir",
  Afghanistan: "af",
  Kazakhstan: "kz",
  Uzbekistan: "uz",
  Myanmar: "mm",
  Cambodia: "kh",
  Laos: "la",
  Nepal: "np",
  "Sri Lanka": "lk",
  Luxembourg: "lu",
  Iceland: "is",
  Croatia: "hr",
  Serbia: "rs",
  Slovakia: "sk",
  Slovenia: "si",
  Estonia: "ee",
  Latvia: "lv",
  Lithuania: "lt",
  Malta: "mt",
  Cyprus: "cy",
  Albania: "al",
  "Bosnia and Herzegovina": "ba",
  Montenegro: "me",
  "North Macedonia": "mk",
  Georgia: "ge",
  Armenia: "am",
  Azerbaijan: "az",
  Belarus: "by",
  Moldova: "md",
  Andorra: "ad",
  Monaco: "mc",
  Liechtenstein: "li",
  "San Marino": "sm",
  Vatican: "va",
  Qatar: "qa",
  Kuwait: "kw",
  Bahrain: "bh",
  Oman: "om",
  Yemen: "ye",
  Syria: "sy",
  Palestine: "ps",
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
  Pakistan: [69, 30],
  Bangladesh: [90, 24],
  Taiwan: [121, 24],
  "Hong Kong": [114, 22],
};

/**
 * Get the ISO country code for a given country name
 * @param country - Full country name
 * @returns ISO 3166-1 alpha-2 code (lowercase) or null if not found
 */
export const getCountryCode = (country: string): string | null => {
  return COUNTRY_CODE_MAP[country] || null;
};

/**
 * Get flag image URL from flagcdn.com
 * @param countryCode - ISO 3166-1 alpha-2 code (lowercase)
 * @param size - Image size (w20, w40, w80, w160, w320)
 * @returns URL to flag image
 *
 * Available sizes:
 * - w20: 20px width
 * - w40: 40px width (default)
 * - w80: 80px width
 * - w160: 160px width
 * - w320: 320px width
 */
export const getCountryFlagUrl = (
  countryCode: string,
  size: "w20" | "w40" | "w80" | "w160" | "w320" = "w40"
): string => {
  return `https://flagcdn.com/${size}/${countryCode}.png`;
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
 * Get flag URL directly from country name
 * @param country - Full country name
 * @param size - Image size
 * @returns URL to flag image or null if country not found
 */
export const getFlagUrl = (
  country: string,
  size: "w20" | "w40" | "w80" | "w160" | "w320" = "w40"
): string | null => {
  const code = getCountryCode(country);
  if (!code) return null;
  return getCountryFlagUrl(code, size);
};
