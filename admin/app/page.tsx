// app/page.tsx
import { Button } from "@heroui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Our Store</h1>
        <p className="text-xl mb-8">Download our app now!</p>
        <div className="flex gap-4 justify-center">
          <Button color="secondary">Secondary Button</Button>

          <Link
            href="https://apps.apple.com/your-app"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            App Store
          </Link>
          <Link
            href="https://play.google.com/store/apps/your-app"
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Play Store
          </Link>
          <Link
            href="/admin"
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
