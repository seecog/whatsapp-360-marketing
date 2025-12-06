import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, buildTokenPair, hashToken } from "../../utils/token.util.js";
import { User } from "../../models/User.js";

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("x-refresh-token")?.trim();
        if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

        // 1) signature/exp check
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            return res.status(401).json({ message: "invalid or expired refresh token" });
        }

        // 2) find user and validate the stored hash/expiry
        const user = await User.findByPk(decoded.sub);
        console.log("User at refresh:", user);
        if (!user || !user.refreshTokens) {
            return res.status(401).json({ message: "no active session" });
        }

        const now = new Date();
        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt <= now) {
            return res.status(401).json({ message: "refresh token expired" });
        }

        console.log("User refreshTokens:", user.refreshTokens);
        console.log("Provided refreshToken:", decoded);

        // my additions: check hash + expiry
        if (!user.refreshTokens) {
            return res.status(401).json({ message: "no active session (hash missing)" });
        }

        const nowDate = new Date();
        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt <= nowDate) {
            return res.status(401).json({ message: "refresh token expired" });
        }

        const incomingHash = hashToken(refreshToken);

        if (incomingHash !== user.refreshTokens) {
            user.refreshTokens = null;
            user.refreshTokenExpiresAt = null;
            await user.save();
            return res.status(401).json({ message: "refresh token mismatch; session revoked" });
        }

        // 3) rotate: new access + new refresh; overwrite on user
        const { accessToken, refreshToken: newRefresh, accessExp, refreshExp } = buildTokenPair(user.id);

        // add my secure fields
        user.refreshTokens = hashToken(newRefresh);
        user.refreshTokenExpiresAt = refreshExp ? new Date(refreshExp * 1000) : null;
        await user.save();

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefresh, options)
            .json({
                message: "Token refreshed", tokens: { accessToken, refreshToken: newRefresh }, user
            });
    } catch (e) {
        console.error("refresh error", e);
        return res.status(500).json({ message: "internal_error" });
    }
};