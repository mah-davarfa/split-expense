import {http} from './http.js'

export const groupsApi={
 
    //POST /api/groups (create group)DONE
    creategroup:(token,{name,description})=>{
        const body={
            name,
            description
         }
         return http('/api/groups',{
            method:'POST',
            body,
            token,
         })
        },
         
        //GET /api/groups (shows groups and user info Dashbord)DONE
         getGroupsDashboard:(token)=>{
            return http('/api/groups',{
                method:'GET',
                token,
             })
         },

         //GET /api/groups/:groupId (shows members)DONE
         getGroupWithMembers:(token,groupId)=>{
            return http(`/api/groups/${groupId}`,{
                method:'GET',
                token,
             })
         },

         //PUT /api/groups/:groupId(edit one group if it is admin)DONE
         updateGroup:(token,groupId,{name,description,status})=>{
            const body={name,description,status}
            return http(`/api/groups/${groupId}`,{
                method:'PUT',
                body,
                token,
             })

    },

    //DELETE /api/groups/:groupId(delete one group if it is admin)DONE
    inactiveGroup:(token,groupId)=>{
        return http(`/api/groups/${groupId}`,{
            method:'DELETE',
            token,
         })
    }   
  
}