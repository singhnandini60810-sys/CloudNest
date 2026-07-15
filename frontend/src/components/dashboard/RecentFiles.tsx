import {
  FileArchive,
  FileImage,
  FileMusic,
  FileText,
  MoreVertical,
} from "lucide-react";

const recentFiles = [
  {
    name: "Project Proposal.pdf",
    size: "2.4 MB",
    type: "PDF",
    date: "Today, 9:30 AM",
    icon: FileText,
    color: "red",
  },
  {
    name: "Design System.zip",
    size: "15.7 MB",
    type: "ZIP",
    date: "Today, 8:15 AM",
    icon: FileArchive,
    color: "brown",
  },
  {
    name: "Dashboard Design.fig",
    size: "8.9 MB",
    type: "FIG",
    date: "Yesterday, 6:20 PM",
    icon: FileText,
    color: "purple",
  },
  {
    name: "Client Photo.png",
    size: "4.3 MB",
    type: "PNG",
    date: "Yesterday, 4:10 PM",
    icon: FileImage,
    color: "green",
  },
  {
    name: "Music Collection.mp3",
    size: "6.1 MB",
    type: "MP3",
    date: "May 20, 2026",
    icon: FileMusic,
    color: "blue",
  },
];

function RecentFiles() {
  return (
    <article className="dashboard-card recent-files-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Recent Files</h3>
          <p>Your latest uploads</p>
        </div>

        <button className="text-button" type="button">
          See All
        </button>
      </div>

      <div className="recent-files-list">
        {recentFiles.map((file) => {
          const Icon = file.icon;

          return (
            <div key={file.name} className="recent-file">
              <div className={`recent-file__icon recent-file__icon--${file.color}`}>
                <Icon size={21} />
              </div>

              <div className="recent-file__details">
                <strong>{file.name}</strong>

                <span>
                  {file.size} • {file.type}
                </span>
              </div>

              <time>{file.date}</time>

              <button type="button" aria-label={`More options for ${file.name}`}>
                <MoreVertical size={19} />
              </button>
            </div>
          );
        })}
      </div>

      <button className="recent-files-card__footer" type="button">
        See All Files
      </button>
    </article>
  );
}

export default RecentFiles;