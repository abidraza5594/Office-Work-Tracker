import { useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Chrome, UserRound } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { user, signInWithGoogle, signInAsGuest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<"google" | "guest" | null>(null);

  if (user) return <Navigate to="/today" replace />;

  const run = async (mode: "google" | "guest") => {
    setIsSubmitting(mode);
    try {
      if (mode === "google") await signInWithGoogle();
      else await signInAsGuest();
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-8 text-text-primary">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-panel"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-accent-blue text-white shadow-glow">
          <BriefcaseBusiness className="h-9 w-9" />
        </div>
        <div className="mt-5 text-center">
          <h1 className="font-heading text-3xl font-bold text-text-primary">Office Work Tracker</h1>
          <p className="mt-2 text-sm text-text-muted">
            Daily work logs, history, search, and stats in one calm workspace.
          </p>
        </div>
        <div className="mt-7 space-y-3">
          <Button className="w-full" size="lg" onClick={() => run("google")} disabled={Boolean(isSubmitting)}>
            <Chrome className="h-5 w-5" />
            Sign in with Google
          </Button>
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => run("guest")}
            disabled={Boolean(isSubmitting)}
          >
            <UserRound className="h-5 w-5" />
            Continue as Guest
          </Button>
        </div>
        <p className="mt-5 rounded-lg bg-bg-elevated p-3 text-center text-xs font-medium text-text-muted">
          Guest mode is private to this browser session. Link Google later from Settings to keep access.
        </p>
      </motion.section>
    </main>
  );
}
