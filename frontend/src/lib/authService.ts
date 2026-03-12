// src/lib/authService.ts
import { api } from "./axios";

export const authService = {
  login(email: string, password: string, rememberMe: boolean) {
    return api.post("/auth/login", { email, password, rememberMe });
  },

  logout() {
    return api.post("/auth/logout");
  },

  refresh() {
    return api.post("/auth/refresh");
  },

  me() {
    return api.get("/user/me");
  },

  updateProfile(formData: FormData) {
    return api.post("/user/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },


  requestPasswordReset(email: string) {
    return api.post("/auth/email/verification/request", { email });
  },

  verifyPasswordResetOtp(email: string, otp: string) {
    return api.post("/auth/email/verification/confirm", { email, otp });
  },

  resetPassword(email: string, newPassword: string) {
    return api.post("/auth/reset-password", { email, newPassword });
  },
};