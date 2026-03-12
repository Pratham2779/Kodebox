import { api } from "./axios";

export const profileService = {

  updateProfile(formData: FormData) {
    return api.post("/user/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};