import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import { Bot } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Login page - Server-Side Rendered shell with Client-Side sign-in buttons.
 * Demonstrates SSR + CSR mix: the page layout is server-rendered,
 * while the interactive sign-in buttons are client components.
 */
export default async function LoginPage() {
  // If already authenticated, redirect to chat
  const session = await auth();
  if (session?.user) {
    redirect("/chat");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your AI assistant with real-world tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButtons />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
