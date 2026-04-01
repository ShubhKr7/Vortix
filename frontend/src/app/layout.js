import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Virtual Office MVP | Persistent Workspace",
  description: "A persistent virtual workspace with real-time presence and proximity audio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
