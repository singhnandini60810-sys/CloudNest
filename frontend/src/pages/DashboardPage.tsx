import { Cloud, Sparkles, Upload } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

function DashboardPage() {
  return (
    <DashboardLayout>
      <section className="dashboard-placeholder">
        <div className="dashboard-placeholder__content">
          <span className="dashboard-placeholder__eyebrow">
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

        <div className="dashboard-placeholder__visual">
          <Cloud size={90} strokeWidth={1.4} />
        </div>
      </section>
    </DashboardLayout>
  );
}

export default DashboardPage;