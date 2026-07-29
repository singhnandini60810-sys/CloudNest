import { CloudUpload } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuickUpload() {
  const navigate = useNavigate();

  const handleOpenUploadPage = () => {
    navigate("/files", {
      state: {
        openUploadModal: true,
      },
    });
  };

  return (
    <article className="dashboard-card quick-upload-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Quick Upload</h3>
          <p>Add files to your CloudNest account</p>
        </div>
      </div>

      <button
        type="button"
        className="quick-upload-zone"
        onClick={handleOpenUploadPage}
        aria-label="Open file upload"
      >
        <div className="quick-upload-zone__icon">
          <CloudUpload size={36} />
        </div>

        <strong>Upload files to CloudNest</strong>

        <span>
          Choose files from your device and upload them securely.
        </span>

        <span className="primary-button">
          Browse Files
        </span>

        <small>Maximum file size: 100 MB</small>
      </button>
    </article>
  );
}

export default QuickUpload;