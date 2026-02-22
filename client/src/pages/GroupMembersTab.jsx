import { useState } from "react";
const GroupMembersTab = ()=>{

    const [addAMemberNotClicked,setaddAMemberNotClicked]=useState(true)
    const [newMember,setnewMember]=useState({
        name:'',
        email:''
    })

    const inviteMemberHandler=()=>{
        setaddAMemberNotClicked(false)
    }

    const newMemberHandler=(e)=>{
        e.preventDefault();
   //////////fetch the newmmber //////////////////
        setaddAMemberNotClicked(true)
        setnewMember({name:'',email:''})
    }

    const cancelHandler=(e)=>{
        e.preventDefault();
        setaddAMemberNotClicked(true)
        setnewMember({name:'',email:''})
    } 
    return(
        <div>
            <h3>GroupMembersTab   page</h3>
            <div>
            {addAMemberNotClicked ?
           (
                <p onClick={inviteMemberHandler}>Invite new member to this group</p>
           ):(
                <form onSubmit={newMemberHandler}>
                    <div>
                        <input
                        name="name"
                        value={newMember.name}
                        onChange={(e)=>setnewMember({...newMember,name:e.target.value})}
                        placeholder="Enter Name"
                        />
                        <input
                        name="email"
                        value={newMember.email}
                        onChange={(e)=>setnewMember({...newMember,email:e.target.value})}
                        placeholder="Enter Email"
                        />  
                    </div>

                    <div>
                        <button type="submit">Submit</button>
                        <button onClick={cancelHandler}>Cancel</button>
                    </div>  
                </form>
           )}
            
           </div>
        </div>
        
    )
}
export default GroupMembersTab;