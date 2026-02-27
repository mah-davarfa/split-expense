import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import { groupsApi } from "../api/groups.api.js";
import { membersApi } from "../api/members.api.js";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import KebabMenu from "../components/KebabMenu.jsx";
import Modal from "../components/Modal.jsx";
import { SimpleAvatar } from "../components/SimpleAvatar.jsx";


export const GroupMembersTab = ()=>{

   const { groupId } = useParams();
   const {user,getToken} = useAuth();
    const token =getToken();
   const myId = user?._id || user?.userId;

   const [group ,setGroup] = useState(null);
   const [members ,setMembers] = useState([]);

   const [loading ,setLoading] = useState(true);
   const [error ,setError] = useState(null);

   //for invite modal
   const [inviteOpen ,setInviteOpen] = useState(false);
   const [inviteSubmitting ,setInviteSubmitting] = useState(false);
   const [newMember, setNewMember] = useState({name:'',email:''});
   //removing modal
    const [removeOpen ,setRemoveOpen] = useState(false);
   const [removeSubmitting ,setRemoveSubmitting] = useState(false);
   const [removeTarget, setRemoveTarget] = useState(null);

   const loadGroup= async()=>{
    if (!token || !groupId) return;

    try{
        setLoading(true);
        setError('');

    // backend returns: { group, membersOfGroup }
    const data = await groupsApi.getGroupWithMembers(token,groupId)        
    setGroup(data.group || null);
    setMembers(Array.isArray(data?.membersOfGroup)? data.membersOfGroup : []);

    }catch(err){
        setError(err.message || "Failed to load group members");
    }finally{
        setLoading(false);
    }
   }

   useEffect(()=>{
        loadGroup();
   },[token,groupId])

   //who is admin in group members
   const isAdmin = useMemo(()=>{
        const me =members.find((m)=>{
            const uid = m?.userId._id;
        return uid && String(uid) === String(myId);
        })
        return me?.role === 'admin';
    },[members,myId])

        //invite modal//
    const openInvite = ()=>{
        setNewMember({name:'',email:''});
        setInviteOpen(true);
    }
    const closeInvite =()=>{
        if(inviteSubmitting) return;
        setInviteOpen(false);
        setNewMember({name:'',email:''});
    }

    const submitInvite = async (e)=>{
        e.preventDefault();

        const name= newMember.name.trim();
        const email = newMember.email.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Valid email is required.");
        return;
    }

    try{
        setError('');
        setInviteSubmitting(true);

        await membersApi.invite(groupId,token ,{name,email});
        
       setInviteOpen(false);
       setNewMember({ name: "", email: "" });

        await loadGroup();
        
    }catch(err){
        setError(err.message || "Failed to invite member");
    }finally{
        setInviteSubmitting(false);
    }
    }
    
     const openRemove = (member) => {
        setRemoveTarget(member);
        setRemoveOpen(true);
    };

    const closeRemove = () => {
        if (removeSubmitting) return;
        setRemoveOpen(false);
        setRemoveTarget(null);
    };

    const confirmRemove = async()=>{
        if (!removeTarget) return;
        const memberUserId = removeTarget?.userId?._id;

        if(!memberUserId){
            setError("This looks like a pending invite (no userId). Cannot remove by userId.");
      return;
    }
        try{
           setRemoveSubmitting(true);
            setError("");

            await membersApi.remove( groupId, memberUserId,token);

            setRemoveOpen(false);
            setRemoveTarget(null);

            await loadGroup();

        }catch(err){
            setError(err.message || "Failed to remove member");
        }finally{
            setRemoveSubmitting(false);
           }
        }  
        
        const canShowActionFor =(m)=>{
            if(!isAdmin) return false; // only admins can see actions

            const uid = m?.userId?._id;
            if(uid && myId && String(uid) === String(myId)) return false; // don't show actions for self

            //remove is only for user accepted invitation and has not removed before
            if(m?.inviteStatus !== 'accepted') return false;
            if(m?.membershipStatus !== 'active') return false;
            return true;
        }

        ///display name
        const memberDisplayName =(m)=>{
            if(m?.userId?.name) return m.userId.name;
            //member who is pending invite use email as display name
            if(m?.inviteEmail) return m.inviteEmail;
            return "Unknown Member";
        }
  return (
    <div>
      <h3>Group Members</h3>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {loading ? (
        <LoadingSpinner label="Loading members..." />
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>
              <strong>Group:</strong> {group?.name || "—"}
            </p>
            {!!group?.description && (
              <p style={{ margin: 0, opacity: 0.85 }}>{group.description}</p>
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
            <div className="stack">
              {members.map((m) => {
                const key = m?._id || m?.userId?._id || m?.inviteEmail || Math.random();

                const name = memberDisplayName(m);
                const photo = m?.userId?.profilePicture || ""; // may be "" or undefined
                const role = m?.role || "member";
                const inviteStatus = m?.inviteStatus || "pending";
                const membershipStatus = m?.membershipStatus || "active";

                const isMe =
                  myId && m?.userId?._id && String(m.userId._id) === String(myId);

                return (
                  <div
                    key={key}
                    className="card row-between"
                  >
                    <div style={{ display: "flex", gap: 10, flex: 1 }}>
                      <SimpleAvatar name={name} profilePicture={photo} />

                      <div style={{ flex: 1 }}>
                        <strong>
                          {name} {isMe ? "(me)" : ""}
                        </strong>

                        <div className="muted" style={{ marginTop: 4 }}>
                          Role: {role} | Invite: {inviteStatus} | This Group Status: {membershipStatus}
                        </div>

                        {m?.inviteEmail && (
                          <div className="muted" style={{ marginTop: 2 }}>
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
                onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                disabled={inviteSubmitting}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label>Email (required)</label>
              <input
                value={newMember.email}
                onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                disabled={inviteSubmitting}
                placeholder="Enter email"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={closeInvite} disabled={inviteSubmitting}>
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
              {removeTarget?.userId?.name || removeTarget?.inviteEmail || "this member"}
            </strong>{" "}
            from the group?
          </p>

          <p style={{ fontSize: 13, opacity: 0.85 }}>
            This will set membership to <strong>inactive</strong>. If this member has expense activity,
            the backend will reject the removal.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" onClick={closeRemove} disabled={removeSubmitting}>
              Cancel
            </button>
            <button type="button" onClick={confirmRemove} disabled={removeSubmitting}>
              {removeSubmitting ? "Removing..." : "Confirm remove"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default GroupMembersTab;