import { http } from "./http.js";
//////  POST 
export const expensesApi = {
  create: (token, groupId, { description, amount, expenseDate, receiptUrl = [] }) => {

    const body = {
      description,
      amount,
      expenseDate,
      receiptUrl, 
    };

    return http(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      token,
      body,
    });
  },


  /////GET /api/groups/:groupId/expenses
getAll:(token,groupId)=>{
    return http(`/api/groups/${groupId}/expenses`,{
        method:'GET',
        token,
    })
},

//GET /api/groups/:groupId/expenses?me=true
getMine:(token,groupId)=>{
    return http(`/api/groups/${groupId}/expenses?me=true`,{
        method:'GET',
        token
    })
},

//PUT /api/groups/:groupId/expenses/:expensesId 
updateExpense:(token, groupId, expensesId, updates)=>{

    return http(`/api/groups/${groupId}/expenses/${expensesId}`,{
        method:'PUT',
        token,
        body:updates
    })
},

//DELETE /api/groups/:goupId/expenses/:expensesId 
  void: (token, groupId, expensesId, voidedReason) => {
    return http(`/api/groups/${groupId}/expenses/${expensesId}`, {
      method: "DELETE",
      token,
      body: { voidedReason },
    })
}
};



