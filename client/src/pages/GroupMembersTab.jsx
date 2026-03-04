import { useEffect, useMemo, useState } from "react";
import { useParams ,useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import { groupsApi } from "../api/groups.api.js";
import { membersApi } from "../api/members.api.js";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import KebabMenu from "../components/KebabMenu.jsx";
import Modal from "../components/Modal.jsx";
import { SimpleAvatar } from "../components/SimpleAvatar.jsx";

export const GroupMembersTab = () => {
  const { groupId } = useParams();
  const { bumpGroupVersion } = useOutletContext();
  const { user, getToken } = useAuth();
  const token = getToken();
  const myId = user?._id || user?.userId;

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  // removing modal
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeSubmitting, setRemoveSubmitting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  // ===== Split settings =====
  const [splitEditing, setSplitEditing] = useState(false); // <-- NEW: view/edit mode
  const [splitModeDraft, setSplitModeDraft] = useState("equal");
  const [splitValues, setSplitValues] = useState({}); // { [userId]: number | "" }
  const [splitSaving, setSplitSaving] = useState(false);

  const loadGroup = async () => {
    if (!token || !groupId) return;

    try {
      setLoading(true);
      setError("");

      // backend returns: { group, membersOfGroup }
      const data = await groupsApi.getGroupWithMembers(token, groupId);
      setGroup(data.group || null);
      setMembers(Array.isArray(data?.membersOfGroup) ? data.membersOfGroup : []);
    } catch (err) {
      setError(err.message || "Failed to load group members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupId]);

  // who is admin in group members
  const isAdmin = useMemo(() => {
    const me = members.find((m) => {
      const uid = m?.userId?._id;
      return uid && String(uid) === String(myId);
    });
    return me?.role === "admin";
  }, [members, myId]);

  // eligible members (accepted + active) — matches backend bulkWrite filter
  const eligibleMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m?.inviteStatus === "accepted" &&
        m?.membershipStatus === "active" &&
        m?.userId?._id
    );
  }, [members]);

  const canEditSplit = isAdmin && eligibleMembers.length >= 2;

  // current saved mode from DB
  const savedSplitMode = group?.splitMode || "equal";

  // helper: seed draft values from DB (members list)
  const seedSplitDraftFromDb = (mode) => {
    const seed = {};
    for (const m of eligibleMembers) {
      const uid = m.userId._id;
      if (mode === "percentage") seed[uid] = Number(m.percentage ?? 0);
      else if (mode === "share") seed[uid] = Number(m.share ?? 0);
    }
    return seed;
  };

  // whenever group loads, keep draft aligned (ONLY if not editing)
  useEffect(() => {
    if (!group) return;
    if (splitEditing) return;

    setSplitModeDraft(savedSplitMode);

    if (savedSplitMode === "percentage" || savedSplitMode === "share") {
      setSplitValues(seedSplitDraftFromDb(savedSplitMode));
    } else {
      setSplitValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, eligibleMembers, splitEditing]);

  const percentTotal = useMemo(() => {
    if (splitModeDraft !== "percentage") return 0;
    return eligibleMembers.reduce((sum, m) => {
      const uid = m.userId._id;
      return sum + Number(splitValues[uid] ?? 0);
    }, 0);
  }, [splitModeDraft, eligibleMembers, splitValues]);

  const percentOk = splitModeDraft !== "percentage" || percentTotal === 100;

  const startEditSplit = () => {
    if (!canEditSplit) return;

    // enter edit mode with current saved values
    setSplitEditing(true);
    setError("");

    setSplitModeDraft(savedSplitMode);

    if (savedSplitMode === "percentage" || savedSplitMode === "share") {
      setSplitValues(seedSplitDraftFromDb(savedSplitMode));
    } else {
      setSplitValues({});
    }
  };

  const cancelEditSplit = () => {
    setSplitEditing(false);
    setError("");

    // reset draft back to DB state (so inputs disappear + reflect current saved)
    setSplitModeDraft(savedSplitMode);
    if (savedSplitMode === "percentage" || savedSplitMode === "share") {
      setSplitValues(seedSplitDraftFromDb(savedSplitMode));
    } else {
      setSplitValues({});
    }
  };

  const saveSplit = async () => {
    if (!canEditSplit) return;

    try {
      setError("");
      setSplitSaving(true);

      if (splitModeDraft === "equal") {
        await membersApi.updateSplitBulk(groupId, token, {
          splitMode: "equal",
          members: [],
        });
      } else if (splitModeDraft === "percentage") {
        if (percentTotal !== 100) {
          setError("Total percentage must equal 100.");
          return;
        }

        const payloadMembers = eligibleMembers.map((m) => ({
          userId: m.userId._id,
          percentage: Number(splitValues[m.userId._id] ?? 0),
        }));

        await membersApi.updateSplitBulk(groupId, token, {
          splitMode: "percentage",
          members: payloadMembers,
        });
      } else if (splitModeDraft === "share") {
        const payloadMembers = eligibleMembers.map((m) => ({
          userId: m.userId._id,
          share: Number(splitValues[m.userId._id] ?? 0),
        }));

        await membersApi.updateSplitBulk(groupId, token, {
          splitMode: "share",
          members: payloadMembers,
        });
      }

      // reload DB state, then EXIT edit mode so inputs disappear
      await loadGroup();
      bumpGroupVersion?.();
      setSplitEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update split.");
    } finally {
      setSplitSaving(false);
    }
  };

  // invite modal
  const openInvite = () => {
    setNewMember({ name: "", email: "" });
    setInviteOpen(true);
  };
  const closeInvite = () => {
    if (inviteSubmitting) return;
    setInviteOpen(false);
    setNewMember({ name: "", email: "" });
  };

  const submitInvite = async (e) => {
    e.preventDefault();

    const name = newMember.name.trim();
    const email = newMember.email.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Valid email is required.");
      return;
    }

    try {
      setError("");
      setInviteSubmitting(true);

      await membersApi.invite(groupId, token, { name, email });

      setInviteOpen(false);
      setNewMember({ name: "", email: "" });

      await loadGroup();
    } catch (err) {
      setError(err.message || "Failed to invite member");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const openRemove = (member) => {
    setRemoveTarget(member);
    setRemoveOpen(true);
  };

  const closeRemove = () => {
    if (removeSubmitting) return;
    setRemoveOpen(false);
    setRemoveTarget(null);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const memberUserId = removeTarget?.userId?._id;

    if (!memberUserId) {
      setError(
        "This looks like a pending invite (no userId). Cannot remove by userId."
      );
      return;
    }
    try {
      setRemoveSubmitting(true);
      setError("");

      await membersApi.remove(groupId, memberUserId, token);

      setRemoveOpen(false);
      setRemoveTarget(null);

      await loadGroup();
    } catch (err) {
      setError(err.message || "Failed to remove member");
    } finally {
      setRemoveSubmitting(false);
    }
  };

  const canShowActionFor = (m) => {
    if (!isAdmin) return false;

    const uid = m?.userId?._id;
    if (uid && myId && String(uid) === String(myId)) return false;

    if (m?.inviteStatus !== "accepted") return false;
    if (m?.membershipStatus !== "active") return false;
    return true;
  };

  const memberDisplayName = (m) => {
    if (m?.userId?.name) return m.userId.name;
    if (m?.inviteEmail) return m.inviteEmail;
    return "Unknown Member";
  };

  const renderSavedSplitValue = (m) => {
    if (!m?.userId?._id) return null;
    if (savedSplitMode === "percentage") return `${Number(m.percentage ?? 0)}%`;
    if (savedSplitMode === "share") return `${Number(m.share ?? 0)} share`;
    return null;
  };

  return (
    <div>
      <h3>Group Members</h3>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {loading ? (
        <LoadingSpinner label="Loading members..." />
      ) : (
        <>


          
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                padding: "12px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <strong>Split settings</strong>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    Current mode: <strong>{savedSplitMode}</strong>
                  </div>
                </div>
      {/* ===== Split Settings (Admin only) ===== */}
          {isAdmin && (
                !splitEditing ? (
                  <button onClick={startEditSplit} disabled={!canEditSplit}>
                    Edit split
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={cancelEditSplit} disabled={splitSaving}>
                      Cancel
                    </button>
                    <button
                      onClick={saveSplit}
                      disabled={splitSaving || !percentOk}
                    >
                      {splitSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )
                )}
              </div>

              {!canEditSplit && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                  Add at least <strong>2 accepted members</strong> to edit split
                  settings.
                </div>
              )}

              {/* VIEW MODE: show saved values */}
              {!splitEditing && (
                <div style={{ marginTop: 10 }}>
                  {savedSplitMode === "equal" ? (
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      Equal split is active. No custom values needed.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {eligibleMembers.map((m) => {
                        const uid = m.userId._id;
                        const name = m.userId.name || m.inviteEmail || "Member";
                        return (
                          <div
                            key={uid}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div>{name}</div>
                            <div style={{ fontWeight: 600 }}>
                              {renderSavedSplitValue(m)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* EDIT MODE: dropdown + inputs */}
              {splitEditing && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <label style={{ fontSize: 13, opacity: 0.85 }}>
                      Split mode:
                    </label>
                    <select
                      value={splitModeDraft}
                      onChange={(e) => {
                        const nextMode = e.target.value;
                        setSplitModeDraft(nextMode);

                        // reset values when switching modes in edit
                        if (nextMode === "percentage" || nextMode === "share") {
                          // seed from current DB values of that mode (or 0)
                          setSplitValues(seedSplitDraftFromDb(nextMode));
                        } else {
                          setSplitValues({});
                        }
                      }}
                      disabled={splitSaving}
                      style={{ minWidth: 160 }}
                    >
                      <option value="equal">Equal</option>
                      <option value="percentage">Percentage</option>
                      <option value="share">Shares</option>
                    </select>
                  </div>

                  {splitModeDraft === "percentage" && (
                    <div style={{ marginTop: 10, fontSize: 13 }}>
                      Total must be <strong>100</strong>. Current total:{" "}
                      <strong>{percentTotal}</strong>
                      {!percentOk && (
                        <span style={{ marginLeft: 8, opacity: 0.75 }}>
                          (Adjust values to reach 100)
                        </span>
                      )}
                    </div>
                  )}

                  {(splitModeDraft === "percentage" ||
                    splitModeDraft === "share") && (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {eligibleMembers.map((m) => {
                        const uid = m.userId._id;
                        const name = m.userId.name || m.inviteEmail || "Member";
                        const val = splitValues[uid] ?? "";

                        return (
                          <div
                            key={uid}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div>{name}</div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              max='100'
                              value={val}
                              onChange={(e) =>
                                setSplitValues((p) => ({
                                  ...p,
                                  [uid]:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                }))
                              }
                              style={{ width: 140 }}
                              disabled={splitSaving}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          

          {isAdmin && (
            <div style={{ marginBottom: 14 }}>
              <button onClick={openInvite}>Invite new member</button>
            </div>
          )}

          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {members.map((m) => {
                const key =
                  m?._id || m?.userId?._id || m?.inviteEmail || Math.random();

                const name = memberDisplayName(m);
                const photo = m?.userId?.profilePicture || "";
                const role = m?.role || "member";
                const inviteStatus = m?.inviteStatus || "pending";
                const membershipStatus = m?.membershipStatus || "active";

                const isMe =
                  myId &&
                  m?.userId?._id &&
                  String(m.userId._id) === String(myId);

                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: "10px 12px",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, flex: 1 }}>
                      <SimpleAvatar name={name} profilePicture={photo} />

                      <div style={{ flex: 1 }}>
                        <strong>
                          {name} {isMe ? "(me)" : ""}
                        </strong>

                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                          Role: {role} | Invite: {inviteStatus} | This Group
                          Status: {membershipStatus}
                        </div>

                        {m?.inviteEmail && (
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                            Email: {m.inviteEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    {canShowActionFor(m) && (
                      <KebabMenu
                        items={[
                          {
                            label: "Remove (make inactive)",
                            onClick: () => openRemove(m),
                          },
                        ]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Invite Modal */}
      {inviteOpen && (
        <Modal title="Invite member" onClose={closeInvite}>
          <form onSubmit={submitInvite} style={{ display: "grid", gap: 10 }}>
            <div>
              <label>Name (optional)</label>
              <input
                value={newMember.name}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, name: e.target.value }))
                }
                disabled={inviteSubmitting}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label>Email (required)</label>
              <input
                value={newMember.email}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, email: e.target.value }))
                }
                disabled={inviteSubmitting}
                placeholder="Enter email"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={closeInvite}
                disabled={inviteSubmitting}
              >
                Cancel
              </button>
              <button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Sending..." : "Send invite"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Modal */}
      {removeOpen && (
        <Modal title="Remove member" onClose={closeRemove}>
          <p style={{ marginTop: 0 }}>
            Remove{" "}
            <strong>
              {removeTarget?.userId?.name ||
                removeTarget?.inviteEmail ||
                "this member"}
            </strong>{" "}
            from the group?
          </p>

          <p style={{ fontSize: 13, opacity: 0.85 }}>
            This will set membership to <strong>inactive</strong>. If this member
            has expense activity, the backend will reject the removal.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={closeRemove}
              disabled={removeSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              disabled={removeSubmitting}
            >
              {removeSubmitting ? "Removing..." : "Confirm remove"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GroupMembersTab;