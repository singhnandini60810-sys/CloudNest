import { Cloud, Sparkles, Upload } from "lucide-react";
import AssistantPanel from "../components/assistants/AssistantPanel";
import FileTypeChart from "../components/dashboard/FileTypeChart";
import QuickUpload from "../components/dashboard/QuickUpload";
import RecentActivity from "../components/dashboard/RecentActivity";
import RecentFiles from "../components/dashboard/RecentFiles";
import StatCards from "../components/dashboard/StatCards";
import StorageOverview from "../components/dashboard/StorageOverview";
import DashboardLayout from "../components/layout/DashboardLayout";

function DashboardPage() {
  return (
    <DashboardLayout>
      <section className="dashboard-welcome">
        <div className="dashboard-welcome__content">
          <span className="dashboard-welcome__eyebrow">
            <Sparkles size={17} />
            Welcome back
          </span>

          <h2>Good morning, Nandini!</h2>

          <p>
            Upload, organize and securely share your files from one beautiful
            cloud workspace.
          </p>

          <button className="primary-button" type="button">
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
        <AssistantPanel />
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <RecentActivity />
        <QuickUpload />
      </section>

      <section className="dashboard-footer-banner">
        <div className="dashboard-footer-banner__cloud">☁️</div>

        <div>
          <h3>Keep your files safe in CloudNest</h3>
          <p>Your data is securely stored and protected in the cloud.</p>
        </div>

        <button className="secondary-button" type="button">
          Learn More
        </button>
      </section>
    </DashboardLayout>
  );
}

export default DashboardPage;