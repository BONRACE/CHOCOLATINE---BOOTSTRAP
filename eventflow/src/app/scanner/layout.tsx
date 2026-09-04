import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
