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
