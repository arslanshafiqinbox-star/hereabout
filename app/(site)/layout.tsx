import BottomBar from "@/components/BottomBar";
import TopBar from "@/components/TopBar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      {children}
      <BottomBar />
    </div>
  );
}
