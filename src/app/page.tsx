// FILE: app/page.tsx
// This is the "/" route — pure welcome UI + input.
// On submit, stores message in Zustand and redirects to /chat.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <HomeClient />;
}