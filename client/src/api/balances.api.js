import {http} from './http'

export const balancesApi={

    // GET /api/groups/:groupId/balances
    get:(token,groupId)=>{
        return http(`/api/groups/${groupId}/balances`,{
            method:'GET',
            token
        })
    }
}