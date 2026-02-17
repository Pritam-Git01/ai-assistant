import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Bot, Cloud, Trophy, TrendingUp, ArrowRight } from "lucide-react";

/**
 * Landing page - Server-Side Rendered
 * Public page that showcases the app's features.
 * Redirects authenticated users to the chat interface.
 */
export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AI Assistant</span>
          </div>
          <nav>
            {session?.user ? (
              <Button asChild>
                <Link href="/chat">
                  Go to Chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your AI Assistant with{" "}
            <span className="text-primary">Real-World Tools</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Chat with an intelligent assistant that can fetch live weather data,
            Formula 1 race schedules, and real-time stock prices.
          </p>

          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href={session?.user ? "/chat" : "/login"}>
                {session?.user ? "Start Chatting" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 font-semibold">Weather</h3>
            <p className="text-sm text-muted-foreground">
              Get live weather data for any city worldwide with detailed conditions.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <Trophy className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 font-semibold">F1 Races</h3>
            <p className="text-sm text-muted-foreground">
              Check the next Formula 1 race, circuit details, and season schedule.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 font-semibold">Stocks</h3>
            <p className="text-sm text-muted-foreground">
              Fetch real-time stock prices, market changes, and trading data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Built with Next.js, Vercel AI SDK, and shadcn/ui
        </p>
      </footer>
    </div>
  );
}
