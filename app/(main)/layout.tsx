import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-bg min-h-screen font-sans text-text">
            <Sidebar />
            <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
