import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastHost } from "@/components/common/ToastHost";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { firebaseConfigError, missingFirebaseEnvKeys } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";
import { HistoryPage } from "@/pages/HistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StatsPage } from "@/pages/StatsPage";
import { TodayPage } from "@/pages/TodayPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAppStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function FirebaseSetupScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-8 text-text-primary">
      <section className="w-full max-w-2xl rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-panel">
        <div className="mb-5 inline-flex rounded-full bg-danger/15 px-3 py-1 text-sm font-bold text-danger">
          Firebase config missing
        </div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Office Work Tracker setup baaki hai</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          App blank isliye tha kyunki Firebase Auth ko valid Web API key nahi mil rahi. Service account private key
          browser app mein use nahi hoti. Firebase Console se Web app config lekar `.env.local` fill karein.
        </p>

        <div className="mt-5 rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <p className="text-sm font-bold text-text-primary">Missing values:</p>
          <ul className="mt-2 grid gap-1 text-sm text-text-muted sm:grid-cols-2">
            {missingFirebaseEnvKeys.map((key) => (
              <li key={key} className="font-mono">
                {key}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-6 text-text-muted">
          <p>1. Project root mein `.env.local` file banayein.</p>
          <p>2. Firebase Console → Project Settings → General → Your apps → Web app config se values copy karein.</p>
          <p>3. Dev server restart karke browser refresh karein.</p>
        </div>

        <pre className="mt-5 overflow-x-auto rounded-lg bg-bg-primary p-4 text-xs text-text-primary">
{`VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=office-work-tracker-1f186.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=office-work-tracker-1f186
VITE_FIREBASE_STORAGE_BUCKET=office-work-tracker-1f186.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_web_app_id`}
        </pre>

        <Button type="button" className="mt-5" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </section>
    </main>
  );
}

function AuthenticatedApp() {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary text-text-primary">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  );
}

export function App() {
  if (firebaseConfigError) return <FirebaseSetupScreen />;
  return <AuthenticatedApp />;
}
