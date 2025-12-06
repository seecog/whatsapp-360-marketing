import { User } from "../../models/User.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildTokenPair, hashToken } from "../../utils/token.util.js";

export const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isValid = await user.isPasswordCorrect(password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { accessToken, refreshToken, accessExp, refreshExp } = buildTokenPair(
            user.id
        );

        user.refreshTokens = hashToken(refreshToken);
        user.refreshTokenExpiresAt = refreshExp ? new Date(refreshExp * 1000) : null;
        await user.save();

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { tokens: { accessToken, refreshToken }, user }, "Login Successful"))

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
})

export const logoutUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({ message: "Invalid user" });
        }

        // Clear refresh tokens and expiry
        user.refreshTokens = null;
        user.refreshTokenExpiresAt = null;
        await user.save();

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0) // Expire the cookie immediately
        };

        return res
            .status(200)
            .cookie("accessToken", "", options)
            .cookie("refreshToken", "", options)
            .json(new ApiResponse(200, null, "Logout Successful"));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});