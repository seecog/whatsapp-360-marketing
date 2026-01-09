import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/User.js";

export async function checkEmail(req, res) {
  try {
    const emailRaw = String(req.query?.email || "").trim().toLowerCase();

    if (!emailRaw) {
      return res.status(400).json(new ApiResponse(400, { available: false }, "email is required"));
    }

    // Basic sanity check (DB + model validation is the source of truth)
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
    if (!emailLooksValid) {
      return res.status(400).json(new ApiResponse(400, { available: false }, "invalid email"));
    }

    const exists = await User.findOne({ where: { email: emailRaw } });
    const available = !exists;

    return res.status(200).json(new ApiResponse(200, { available }, available ? "available" : "exists"));
  } catch (e) {
    console.error("checkEmail error", e);
    return res.status(500).json(new ApiResponse(500, { available: false }, "internal_error"));
  }
}


