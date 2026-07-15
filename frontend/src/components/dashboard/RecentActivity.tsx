import {
  FolderPlus,
  Share2,
  Trash2,
  UploadCloud,
} from "lucide-react";

const activities = [
  {
    text: "You uploaded Project Proposal.pdf",
    time: "Today, 9:30 AM",
    icon: UploadCloud,
  },
  {
    text: "You shared Design System.zip",
    time: "Today, 8:45 AM",
    icon: Share2,
  },
  {
    text: "You deleted Old Presentation.pptx",
    time: "Yesterday, 5:15 PM",
    icon: Trash2,
  },
  {
    text: "You created folder Client Work",
    time: "May 20, 2026",
    icon: FolderPlus,
  },
];

function RecentActivity() {
  return (
    <article className="dashboard-card activity-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Recent Activity</h3>
          <p>Latest actions in your account</p>
        </div>

        <button className="text-button" type="button">
          See All
        </button>
      </div>

      <div className="activity-list">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.text} className="activity-item">
              <div className="activity-item__icon">
                <Icon size={18} />
              </div>

              <div className="activity-item__content">
                <strong>{activity.text}</strong>
                <span>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default RecentActivity;