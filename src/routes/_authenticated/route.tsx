import { createFileRoute, Outlet } from "@tanstack/react-router";

// ⚠️ DEV ONLY — auth gate removed for testing. Restore beforeLoad + AuthenticatedLayout when ready.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});

