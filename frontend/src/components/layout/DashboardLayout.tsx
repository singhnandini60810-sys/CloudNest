import { useState, type ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <div
        className={`dashboard-layout__sidebar ${
          isSidebarOpen ? "dashboard-layout__sidebar--open" : ""
        }`}
      >
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          className="dashboard-layout__overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="dashboard-layout__main">
        <DashboardHeader
          onMenuClick={() => setIsSidebarOpen((current) => !current)}
        />

        <main className="dashboard-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;