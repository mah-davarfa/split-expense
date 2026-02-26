import { http } from "./http.js";

export const invitesApi = {
  accept: (token, inviteToken) => {
    return http("/api/invites/accept", {
      method: "POST",
      token,
      body: { token: inviteToken },
    });
  },
};