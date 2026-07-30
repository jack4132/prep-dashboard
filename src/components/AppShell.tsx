import { Link, Outlet, useLocation } from "react-router-dom";
import { useQuestionSidebar } from "../store/questionSidebarContext";
import "./AppShell.css";

const items = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "/assets/sidebar/dashboard.svg",
  },
  {
    to: "/tests/new",
    label: "Test Creation",
    icon: "/assets/sidebar/creation.svg",
  },
  {
    to: "/tracking",
    label: "Test Tracking",
    icon: "/assets/sidebar/tracking.svg",
  },
];

function QuestionPanel() {
  const { state } = useQuestionSidebar();
  const { questions, totalQuestionCount, editingId, onEdit, onDelete } = state;
  return (
    <aside
      className="shell__question-panel"
      aria-label="Question creation summary"
    >
      <div className="shell__qpanel-copy">
        <p className="body-text-2-medium shell__qpanel-title">
          Question creation
        </p>
        <p className="body-text-2-regular shell__qpanel-total">
          Total Questions: {totalQuestionCount}
        </p>
      </div>
      <div className="shell__qpanel-list">
        {questions.length === 0 ? (
          <p className="muted">No questions added yet.</p>
        ) : null}
        {questions.map((item, index) => (
          <button
            key={item.localId}
            type="button"
            className={`shell__qpanel-item ${editingId === item.localId ? "shell__qpanel-item--active" : ""}`}
            onClick={() => onEdit(item.localId)}
          >
            <span className="shell__qpanel-item-left">
              <img
                className="shell__qpanel-item-icon"
                src="/assets/tick.svg"
                alt=""
                aria-hidden="true"
              />
              <span className="body-text-2-medium">Question {index + 1}</span>
            </span>
            <img
              className="shell__qpanel-item-caret"
              src="/assets/select.svg"
              alt=""
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </aside>
  );
}

export function AppShell() {
  const location = useLocation();
  const isQuestionCreationPage = /^\/tests\/[^/]+\/questions\/?$/.test(
    location.pathname,
  );

  return (
    <div
      className={`shell ${isQuestionCreationPage ? "shell--compact-sidebar" : ""}`}
    >
      <div className="shell__layout">
        <aside className="shell__sidebar" aria-label="Primary">
          <div className="shell__logo-wrap">
            <img
              className="shell__logo"
              src="/assets/prep-route-icon.svg"
              alt="Prep Route logo"
            />
          </div>
          <div className="shell__nav-wrap">
            <nav className="shell__nav">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`shell__option ${location.pathname.startsWith(item.to) ? "shell__option--active" : ""}`}
                >
                  <img
                    className="shell__option-icon"
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="shell__option-text">{item.label}</span>
                </Link>
              ))}
            </nav>
            {isQuestionCreationPage ? <QuestionPanel /> : null}
          </div>
        </aside>

        <main className="shell__main">
          <header className="shell__main-header">
            <div className="shell__main-header-row">
              <img
                className="shell__notification"
                src="/assets/notification.svg"
                alt="Notifications"
              />
              <div className="shell__profile">
                <img
                  className="shell__profile-icon"
                  src="/assets/user-icon.svg"
                  alt="User avatar"
                />
                <div className="shell__profile-text">
                  <span className="heading-2 shell__profile-name">
                    Alex Wando
                  </span>
                  <span className="caption-text shell__profile-role">
                    Admin
                  </span>
                </div>
                <span className="shell__profile-caret" aria-hidden="true" />
              </div>
            </div>
          </header>
          <div className="shell__page-wrap">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
