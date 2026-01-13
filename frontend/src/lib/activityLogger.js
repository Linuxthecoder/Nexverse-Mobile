import { axiosInstance } from "./axios.js";

export const logActivity = async (activityData) => {
  try {
    await axiosInstance.post("/activity/log", activityData);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
