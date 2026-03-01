import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted pt-20">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">404</h1>
        <p className="mb-4 text-lg text-muted-foreground sm:text-xl">Oops! Page not found</p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
