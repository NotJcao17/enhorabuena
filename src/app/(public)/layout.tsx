import { ThemeProvider } from "@/components/catalog/ThemeProvider";
import { Header } from "@/components/catalog/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
