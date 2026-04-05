import Providers from "@/components/Providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "X.509 Certificate Manager",
    description: "Hệ thống quản lý và cấp phát chứng nhận số PoC",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className="antialiased bg-slate-50 text-slate-900">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
