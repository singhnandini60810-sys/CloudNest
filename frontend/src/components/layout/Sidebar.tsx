import { Cloud, Crown, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  mainNavigation,
  secondaryNavigation,
} from "../../config/navigation";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Cloud size={31} strokeWidth={1.8} />
        </div>

        <div>
          <h1>CloudNest</h1>
          <p>Your secure cloud space</p>
        </div>
      </div>

      <div className="sidebar__profile">
        <div className="sidebar__avatar">NS</div>

        <div className="sidebar__profile-text">
          <strong>Nandini Singh</strong>
          <span>Free account</span>
        </div>
      </div>

      <nav className="sidebar__navigation" aria-label="Main navigation">
        <div className="sidebar__nav-group">
          {mainNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar__nav-link ${
                    isActive ? "sidebar__nav-link--active" : ""
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar__divider" />

        <div className="sidebar__nav-group">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__nav-link ${
                    isActive ? "sidebar__nav-link--active" : ""
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="sidebar__storage-card">
        <div className="sidebar__storage-icon">
          <Crown size={24} />
        </div>

        <h3>Storage plan</h3>
        <p>2.4 GB of 5 GB used</p>

        <div className="sidebar__progress">
          <span />
        </div>

        <button type="button">Upgrade Storage</button>
      </div>

      <button className="sidebar__logout" type="button">
        <LogOut size={19} />
        <span>Log out</span>
      </button>
    </aside>
  );
}

export default Sidebar;