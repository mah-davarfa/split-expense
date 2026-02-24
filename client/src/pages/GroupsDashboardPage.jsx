import { useState, useEffect, } from "react";
import { Link } from "react-router-dom";
import { groupsApi } from "../api/groups.api.js";
import { useAuth } from "../auth/AuthProvider.jsx";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from '../components/ErrorBanner.jsx';
import KebabMenu from "../components/KebabMenu.jsx";
import Modal from "../components/Modal.jsx";

const GroupsDashboardPage = ()=>{
    const {user,getToken} = useAuth();
    const token = getToken();

    const [isCreateGroupClicked,setIsCreateGroupClicked]= useState(true)
    const [newGroup, setNewGroup]= useState({
        name: "", description: ""
    })

    const [dashboardUser, setDashboardUser] = useState(null);
    const [memberships, setMemberships] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({name: "", description: ""});

    const loadDashboard = async()=>{
        if(!token) return;

        try{
            setLoading(true);
            setError('');

            const data = await groupsApi.getGroupsDashboard(token);
            // backend returns: { user:{name,email}, memberships:[{groupId, role}] }
            setDashboardUser(data.user );
            setMemberships(Array.isArray(data.memberships) ? data.memberships : []);
        }catch(err){
            setError(err.message || "Failed to load dashboard");
        }finally{
            setLoading(false);
        }
    }

    ////on mounting loads GROUPS DASHBOARD
    useEffect(()=>{
        loadDashboard();
    },[token])
    
    const displayName = dashboardUser?.name || user?.name || "—";
   const displayEmail = dashboardUser?.email || user?.email || "—";

    const createAGroupHandler =()=>{
        setIsCreateGroupClicked(false)
    }

    const cancelHandler=(e)=>{
        e.preventDefault()
         setIsCreateGroupClicked(true)
         setNewGroup({name: "", description: ""})
         setError('')
    }

    const newGroupHandler= async(e)=>{
        e.preventDefault()

        const name= newGroup.name.trim();
        const description= newGroup.description.trim();

        if (name.length < 2) {
            setError('Group name must be at least 2 characters long');
            return;
        }
        if (description.length < 5) {
            setError('Group description must be at least 5 characters long');
            return;
        }

        try{
            setCreating(true);
            setError('');

            await groupsApi.creategroup(token,{name,description});
            await loadDashboard();

        setIsCreateGroupClicked(true)
         setNewGroup({name: "", description: ""})

        }catch(err){
            setError(err.message || "Failed to create group");
        }finally{
            setCreating(false);
        }
    };
    /////check if user is admin
    const isAdminMemberShip =(m)=>m?.role ==='admin';

    /////====edit Group==////
    const openEdit = (m)=>{
        const g = m?.groupId;
        if(!g) return;

        setEditTarget({groupId:g._id});
        setEditForm({name:g.name || '', description:g.description || ''});
        setEditOpen(true);
    };

    const closeEdit =()=>{
        if(editSubmitting) return;
        setEditOpen(false);
        setEditTarget(null);
        setEditForm({name:'', description:''});
    };

    const submitEdit = async(e)=>{
        e.preventDefault();
        if(!editTarget?.groupId) return;

        const name=editForm.name.trim();
        const description=editForm.description.trim();
        if (name.length < 2) {
            setError('Group name must be at least 2 characters long');
            return;
        }
        if (description.length < 5) {
            setError('Group description must be at least 5 characters long');
            return;
        }

        try{
            setEditSubmitting(true);
            setError('');
            const res = await groupsApi.updateGroup(token, editTarget.groupId, {name, description});

            const updated = res?.updatedGroup;
            //update memberships list 
            if(updated){
                setMemberships((prev)=> prev.map((m)=>
                    m.groupId._id === updated._id
                    ? {...m, groupId:{...m.groupId, ...updated}} 
                    : m
                ));
            }
            closeEdit();
        }catch(err){
            setError(err.message || "Failed to update group");
        }finally{
            setEditSubmitting(false);
        }
    }

    ////inactive the Group////
    const inactivateGroup = async(m)=>{
        const g = m.groupId;
        if(!g?._id) return;

        try{
            setError('');
            await groupsApi.inactiveGroup(token, g._id);
            await loadDashboard();

        }catch(err){
            setError(err.message || "Failed to inactivate group");
        }
    };
    //const data = await groupsApi.getGroupsDashboard(token);
  let jsonDataResponse = {
  "user": {
    "name": "string",
    "email": "string"
  },
  "memberships": [
    {
      "_id": "GroupMemberDocumentId",
      "groupId": {
        "_id": "GroupId",
        "name": "string",
        "description": "string",
        "createdBy": "UserId",
        "status": "string",
        "createdAt": "2025-01-01T00:00:00.000Z"
      },
      "role": "string"
    }
  ]
}



    return(
      <div>
        <h3>Groups Dashboard</h3>
        {error &&(
            <ErrorBanner message={error}  onClose={() => setError("")} />
        )}
        {loading?(
            <LoadingSpinner label="Loading your dashboard..."/>
        ):(
         <>
                      {/* User section */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0 }}>
              <strong>Name:</strong> {displayName}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Email:</strong> {displayEmail}
            </p>
          </div>
          <h4 style={{ marginBottom: 8 }}>Groups you are a member of:</h4>

            {memberships.length === 0 ? (
            <p>No groups yet. Create one below.</p>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {memberships.map((m)=>{
                   const g = m.groupId; 
                   if (!g) return null;

                   const createdAt = g.createdAt ?
                   new Date(g.createdAt).toLocaleDateString()
                   :'-';
                   const canAdmin = isAdminMemberShip(m);
                    return(
                        <div
                        key={g._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            padding: "10px 12px",
                            border: "1px solid #e5e5e5",
                            borderRadius: 10,
                            gap: 12,
                        }}
                        >
                            {/*clickable group */}
                            <Link
                            to={`/app/groups/${g._id}`}
                            style={{
                                flex:1,
                                textDecoration:'none',
                                color:'inherit'
                            }}
                            >
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <strong>{g.name}</strong>
                                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                                        {g.description}
                                    </span>
                                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                                        Created: {createdAt} | Role: {m.role}
                                        {g.status? ` | Status: ${g.status}` : ''}
                                    </div>
                                </div>
                            </Link>
                            {/*Admin actions */}
                            {canAdmin && (
                            <KebabMenu
                            items={[
                                {
                                  label:'Edit',
                                  onClick:()=> openEdit(m),
                                  disabled: g.status === 'inactive'
                                },
                                {
                                    label:'Make inactive',
                                    onClick:()=> inactivateGroup(m),
                                    disabled: g.status === 'inactive'
                                },
                            ]}
                            />
                        )}
                      </div>
                        );
                    })}
                </div>
                    
            )}
                {/* create group section */}
                <div style={{ marginTop: 18 }}>
                {isCreateGroupClicked?(
                    <button onClick={createAGroupHandler}>+ Create a group</button>
                ):(
                    <form onSubmit={newGroupHandler} style={{ display: "grid", gap: 10 }}>
                        <input
                            placeholder="Enter Group Name"
                            name="name"
                            value={newGroup.name}
                            onChange={(e) =>
                                setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                            }
                            disabled={creating}
                            />

                            <input
                            placeholder="Enter Group Description"
                            name="description"
                            value={newGroup.description}
                            onChange={(e) =>
                                setNewGroup((prev) => ({ ...prev, description: e.target.value }))
                            }
                            disabled={creating}
                            />

                        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
                        Split mode is <strong>equal</strong> by default. Percentage/share options
                        become available after you add members.
                        </p>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button type="submit" disabled={creating}>
                                {creating ? "Creating..." : "Submit"}
                            </button>
                            <button
                                onClick={cancelHandler}
                                disabled={creating}
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form> 
                 )}
            </div>
         </>
        )}
            {/* Edit Group Modal */}
            {editOpen && (
                <Modal title="Edit Group" onClose={closeEdit}>
                    <form onSubmit={submitEdit} style={{ display: "grid", gap: 10 }}>
                        <div>
                            <label>Group Name:</label>
                            <input
                                value={editForm.name}
                                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                disabled={editSubmitting}
                            />
                        </div>
                        <div>
                            <label>Description</label>
                            <input
                                value={editForm.description}
                                onChange={(e) =>
                                setEditForm((p) => ({ ...p, description: e.target.value }))
                                }
                                disabled={editSubmitting}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={closeEdit} disabled={editSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );

}
export default GroupsDashboardPage;