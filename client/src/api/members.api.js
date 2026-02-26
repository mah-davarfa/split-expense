import {http} from './http.js';

export const membersApi={

    //POST /api/groups/:groupId/members(admin(creator of group)
// invites a member with email by using SendGrid, Mailgun, Resend, etc. )
    invite:(groupId,token,{name,email})=>{
        const body={
            email,
            name:name? name :''
        };
        return http(`/api/groups/${groupId}/members`,{
            method:'POST',
            body,
            token
        })
    },

    //DELETE /api/groups/:groupId/members/:memberId (admin can delete)
    remove:(groupId, memberId,token)=>{

        return http(`/api/groups/${groupId}/members/${memberId}`,{
            method:'DELETE',
            token
        })
    },

    //PUT /api/groups/:groupId/members/split (admin can edit)
    updateSplitBulk:(groupId,token,{splitMode,members})=>{
        const body={
            splitMode,
            members
        }
        return http(`/api/groups/${groupId}/members/split`,{
            method:'PUT',
            body,
            token
        })
    }
}