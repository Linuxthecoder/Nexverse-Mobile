import Activity from "../models/activity.model.js";

export const logActivity = async (req, res) => {
  try {
    const { userId, action, durationInSeconds } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: "User ID and action are required." });
    }

    const newActivity = new Activity({
      userId,
      action,
      durationInSeconds,
    });

    await newActivity.save();

    res.status(201).json({ message: "Activity logged successfully." });
  } catch (error) {
    console.error("Error in logActivity controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
