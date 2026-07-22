import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  const displayName =
    user?.name?.trim() || "CloudNest User";

  const firstName =
    displayName.split(/\s+/)[0] || "User";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header">
      <button
        type="button"
        className="dashboard-header__menu"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={23} />
      </button>

      <label className="dashboard-header__search">
        <Search size={20} />

        <input
          type="search"
          placeholder="Search files, folders..."
          aria-label="Search files and folders"
        />
      </label>

      <div className="dashboard-header__actions">
        <button
          type="button"
          className="dashboard-header__notification"
          aria-label="Notifications"
        >
          <Bell size={21} />
          <span>3</span>
        </button>

        <button
          type="button"
          className="dashboard-header__profile"
          aria-label="Open account menu"
        >
          <div className="dashboard-header__avatar">
            {initials || "CN"}
          </div>

          <div className="dashboard-header__profile-text">
            <strong>{firstName}</strong>
            <span>My account</span>
          </div>

          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;