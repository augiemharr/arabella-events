import SiteLockGuard from "@/components/SiteLockGuard";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLockGuard>{children}</SiteLockGuard>;
}
