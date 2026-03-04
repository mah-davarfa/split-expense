import { NavLink, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { groupsApi } from "../api/groups.api.js";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const GroupPage = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const token = getToken();

  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState("");

    const [groupVersion, setGroupVersion] = useState(0);
  const bumpGroupVersion = () => setGroupVersion((v) => v + 1);

  useEffect(() => {
    if (!token || !groupId) return;

    const loadGroup = async () => {
      try {
        setLoadingGroup(true);
        setGroupError("");

        
        // backend returns: { group, membersOfGroup }
        const data = await groupsApi.getGroupWithMembers(token, groupId);

        setGroup(data?.group || null);
      } catch (err) {
        setGroupError(err.message || "Failed to load group");
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, [token, groupId, groupVersion]);

  return (
    <div className="stack">
      {/* Group header */}
      <div className="card">
        {loadingGroup ? (
          <LoadingSpinner label="Loading group..." />
        ) : groupError ? (
          <ErrorBanner message={groupError} onClose={() => setGroupError("")} />
        ) : (
          <div className="stack gap-6" >
            <h2 className="m-0">Group: {group?.name || "Group"}</h2>
            {!!group?.description && (
              <p className="muted m-0" >
                Group Description: {group.description}
              </p>
            )}
            <div className="muted text-md" >
              <strong> Split mode: {group?.splitMode || "equal"}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <NavLink
          to=""
          end
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Members
        </NavLink>

        <NavLink
          to="expenses"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Expenses
        </NavLink>

        <NavLink
          to="balances"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Balances
        </NavLink>
      </div>

      {/* Pass group down to tabs */}
      <Outlet context={{ group, loadingGroup, groupError,bumpGroupVersion }} />
    </div>
  );
};

export default GroupPage;