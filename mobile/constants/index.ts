import authImage from "@/assets/images/auth-image.png";
import googleIcon from "@/assets/images/google.png";
import appleIcon from "@/assets/images/apple.png";
import electronics from "@/assets/images/electronics.png";
import fashion from "@/assets/images/fashion.png";
import sports from "@/assets/images/sports.png";
import books from "@/assets/images/books.png";

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
