import { useState } from "react";

const GroupsDashboardPage = ()=>{
    const [isCreateGroupClicked,setIsCreateGroupClicked]= useState(true)
    const [newGroup, setNewGroup]= useState({
        name: "", description: ""
    })
    
    const createAGroupHandler =()=>{
        setIsCreateGroupClicked(false)
    }

    const cancelHandler=(e)=>{
        e.preventDefault()
         setIsCreateGroupClicked(true)
         setNewGroup({name: "", description: ""})
    }

    const newGroupHandler=(e)=>{
        e.preventDefault()

//////////need function call to fetch create newGroup & loading while updating////////

        setIsCreateGroupClicked(true)
         setNewGroup({name: "", description: ""})
    }

    return(
        <div>
        <h3>GroupsDashboard page</h3>

       { /*User information in here (extract)  */}
        <p>Name:</p>
        <p>Email:</p>

        <h4>My Groups</h4>
        { /*Groups maps here to craete lists of Groups, each Group has <Link to="/app/groups/123">Go to Group 123</Link> need to be fetch too */}
        <p>Group Name     | Description      | Date </p>

        {isCreateGroupClicked ?
         (<p onClick={createAGroupHandler}>Create new Group</p>) :(
        <form onSubmit={newGroupHandler}>
            <div>
                <input
                 placeholder="Enter Group's Name"
                 name='name'
                 value={newGroup.name}
                 onChange={(e)=> 
                    setNewGroup({...newGroup,name:e.target.value})}
                />
                <input
                 placeholder="Enter Group's Description"
                 name="description"
                 value={newGroup.description}
                 onChange={(e)=>
                    setNewGroup({...newGroup,description:e.target.value})}
                />
            </div>
            <div>
                <button type="submit">Submit</button>
                <button onClick={cancelHandler}>Cancel</button>
            </div>

        </form>
        )}

        </div>

    )
}
export default GroupsDashboardPage;