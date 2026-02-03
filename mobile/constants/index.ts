import authImage from "@/assets/images/auth-image.png";
import googleIcon from "@/assets/images/google.png";
import appleIcon from "@/assets/images/apple.png";
import electronics from "@/assets/images/electronics.png";
import fashion from "@/assets/images/fashion.png";
import sports from "@/assets/images/sports.png";
import books from "@/assets/images/books.png";
import { SecurityOption } from "@/types";

export const images = {
  authImage,
  googleIcon,
  appleIcon,
};

export const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Electronics", image: electronics },
  { name: "Fashion", image: fashion },
  { name: "Sports", image: sports },
  { name: "Books", image: books },
];

export const PROFILE_MENU_ITEMS = [
  {
    id: 1,
    icon: "person-outline",
    title: "Edit Profile",
    color: "#3B82F6",
    action: "/edit-profile",
  },
  {
    id: 2,
    icon: "list-outline",
    title: "Orders",
    color: "#10B981",
    action: "/orders",
  },
  {
    id: 3,
    icon: "location-outline",
    title: "Addresses",
    color: "#F59E0B",
    action: "/addresses",
  },
  {
    id: 4,
    icon: "heart-outline",
    title: "Wishlist",
    color: "#3B82F6",
    action: "/wishlist",
  },
] as const;

// Export as FUNCTIONS that accept state values
export const getSecuritySettings = (
  twoFactorEnabled: boolean,
  biometricEnabled: boolean
): SecurityOption[] => [
  {
    id: "password",
    icon: "lock-closed-outline",
    title: "Change Password",
    description: "Update your account password",
    type: "navigation",
  },
  {
    id: "two-factor",
    icon: "shield-checkmark-outline",
    title: "Two-Factor Authentication",
    description: "Add an extra layer of security",
    type: "toggle",
    value: twoFactorEnabled,
  },
  {
    id: "biometric",
    icon: "finger-print-outline",
    title: "Biometric Login",
    description: "Use Face ID or Touch ID",
    type: "toggle",
    value: biometricEnabled,
  },
];

export const getPrivacySettings = (
  pushNotifications: boolean,
  emailNotifications: boolean,
  marketingEmails: boolean,
  shareData: boolean
): SecurityOption[] => [
  {
    id: "push",
    icon: "notifications-outline",
    title: "Push Notifications",
    description: "Receive push notifications",
    type: "toggle",
    value: pushNotifications,
  },
  {
    id: "email",
    icon: "mail-outline",
    title: "Email Notifications",
    description: "Receive order updates via email",
    type: "toggle",
    value: emailNotifications,
  },
  {
    id: "marketing",
    icon: "megaphone-outline",
    title: "Marketing Emails",
    description: "Receive promotional emails",
    type: "toggle",
    value: marketingEmails,
  },
  {
    id: "data",
    icon: "analytics-outline",
    title: "Share Usage Data",
    description: "Help us improve the app",
    type: "toggle",
    value: shareData,
  },
];

export const accountSettings = [
  {
    id: "activity",
    icon: "time-outline",
    title: "Account Activity",
    description: "View recent login activity",
  },
  {
    id: "devices",
    icon: "phone-portrait-outline",
    title: "Connected Devices",
    description: "Manage devices with access",
  },
  {
    id: "data-download",
    icon: "download-outline",
    title: "Download Your Data",
    description: "Get a copy of your data",
  },
];
