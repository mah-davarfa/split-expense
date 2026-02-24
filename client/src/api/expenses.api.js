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
},

createWithReceipts: (token, groupId, { description, amount, expenseDate, files = [] }) => {
  const form = new FormData();
  form.append("description", description);
  form.append("amount", String(amount));
  form.append("expenseDate", expenseDate);

  // field name MUST match multer: array("receipts")
  for (const file of files) form.append("receipts", file);

  return http(`/api/groups/${groupId}/expenses`, {
    method: "POST",
    token,
    body: form, // FormData (http.js already handles it)
  });
},

};



