import { http } from "./http";

export const balancesApi = {
  // GET /api/groups/:groupId/balances
  get: (token, groupId) => {
    return http(`/api/groups/${groupId}/balances`, {
      method: "GET",
      token,
    });
  },

  // POST /api/groups/:groupId/balances/payments
  recordPayment: (token, groupId, { fromUser, toUser, amount, note = "" }) => {
    return http(`/api/groups/${groupId}/balances/payments`, {
      method: "POST",
      token,
      body: {
        fromUser,
        toUser,
        amount,
        note,
      },
    });
  },

  // DELETE /api/groups/:groupId/balances/payments/:paymentId
  voidPayment: (token, groupId, paymentId, voidedReason) => {
    return http(`/api/groups/${groupId}/balances/payments/${paymentId}`, {
      method: "DELETE",
      token,
      body: {
        voidedReason,
      },
    });
  },
};