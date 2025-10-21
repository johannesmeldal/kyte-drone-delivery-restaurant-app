import React from "react";
import "./TabNavigation.css";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    incoming: number;
    active: number;
    ready: number;
  };
  showSecondaryMenu: boolean;
  onToggleSecondaryMenu: () => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  counts,
  showSecondaryMenu,
  onToggleSecondaryMenu,
}) => {
  return (
    <div className="tab-navigation">
      <div className="main-tabs">
        <button
          className={`tab-btn tab-incoming ${
            activeTab === "incoming" ? "active" : ""
          }`}
          onClick={() => onTabChange("incoming")}
        >
          <span className="tab-label">Incoming</span>
          {counts.incoming > 0 && (
            <span className="tab-badge">{counts.incoming}</span>
          )}
        </button>

        <button
          className={`tab-btn tab-active ${
            activeTab === "active" ? "active" : ""
          }`}
          onClick={() => onTabChange("active")}
        >
          <span className="tab-label">Active</span>
          {counts.active > 0 && (
            <span className="tab-badge">{counts.active}</span>
          )}
        </button>

        <button
          className={`tab-btn tab-ready ${
            activeTab === "ready" ? "active" : ""
          }`}
          onClick={() => onTabChange("ready")}
        >
          <span className="tab-label">Ready</span>
          {counts.ready > 0 && (
            <span className="tab-badge">{counts.ready}</span>
          )}
        </button>
      </div>

      <div className="secondary-menu">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSecondaryMenu}
          title="View history"
        >
          <span className="hamburger-icon">☰</span>
          History
        </button>

        {showSecondaryMenu && (
          <div className="secondary-dropdown">
            <button
              className={`dropdown-item ${
                activeTab === "completed" ? "active" : ""
              }`}
              onClick={() => {
                onTabChange("completed");
                onToggleSecondaryMenu();
              }}
            >
              Completed Orders
            </button>
            <button
              className={`dropdown-item ${
                activeTab === "cancelled" ? "active" : ""
              }`}
              onClick={() => {
                onTabChange("cancelled");
                onToggleSecondaryMenu();
              }}
            >
              Cancelled/Rejected
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabNavigation;

