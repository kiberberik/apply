"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useAuthStore } from "@/store/useAuthStore";
import { redirect } from "next/navigation";

export default function AuthPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div>
      <AuthForm />
    </div>
  );
}
