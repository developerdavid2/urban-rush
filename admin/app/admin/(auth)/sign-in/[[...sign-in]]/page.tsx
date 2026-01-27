// app/admin/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Use the returnBackUrl from middleware if present
  const afterSignInUrl =
    ((await searchParams.redirect_url) as string) || "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        afterSignInUrl={afterSignInUrl}
      />
    </div>
  );
}
