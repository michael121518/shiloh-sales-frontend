import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 py-6">{children}</main>
  </div>
);

export default Layout;
