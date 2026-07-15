import { CloudUpload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";

function QuickUpload() {
  const navigate = useNavigate();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        navigate("/files");
      }
    },
    [navigate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <article className="dashboard-card quick-upload-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Quick Upload</h3>
          <p>Add files to your cloud space</p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`quick-upload-zone ${
          isDragActive ? "quick-upload-zone--active" : ""
        }`}
      >
        <input {...getInputProps()} />

        <div className="quick-upload-zone__icon">
          <CloudUpload size={36} />
        </div>

        <strong>
          {isDragActive ? "Drop your files here" : "Drag and drop files here"}
        </strong>

        <span>or</span>

        <button
          type="button"
          className="primary-button"
          onClick={(event) => {
            event.stopPropagation();
            navigate("/files");
          }}
        >
          Browse Files
        </button>

        <small>Maximum file size: 100 MB</small>
      </div>
    </article>
  );
}

export default QuickUpload;