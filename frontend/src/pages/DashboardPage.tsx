import {
  Cloud,
  Sparkles,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import FileTypeChart from "../components/dashboard/FileTypeChart";
import QuickUpload from "../components/dashboard/QuickUpload";
import RecentFiles from "../components/dashboard/RecentFiles";
import StatCards from "../components/dashboard/StatCards";
import StorageOverview from "../components/dashboard/StorageOverview";
import DashboardLayout from "../components/layout/DashboardLayout";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <section className="dashboard-welcome">
        <div className="dashboard-welcome__content">
          <span className="dashboard-welcome__eyebrow">
            <Sparkles size={17} />
            Welcome back
          </span>

          <h2>{getGreeting()}, Nandini!</h2>

          <p>
            Upload, organize, download and securely share your files from one
            cloud workspace.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/files")}
          >
            <Upload size={19} />
            Upload File
          </button>
        </div>

        <div className="dashboard-welcome__visual">
          <Cloud size={90} strokeWidth={1.4} />
        </div>
      </section>

      <StatCards />

      <section className="dashboard-grid dashboard-grid--charts">
        <StorageOverview />
        <FileTypeChart />
      </section>

      <section className="dashboard-grid dashboard-grid--content">
        <RecentFiles />
        <QuickUpload />
      </section>
    </DashboardLayout>
  );
}

export default DashboardPage;