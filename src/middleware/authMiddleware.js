import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import { User } from "../models/User.js"
import { decodeExpUnix, verifyAccessToken } from "../utils/token.util.js"

function shouldRedirectToLogin(req) {
    // Only redirect for real browser page navigations to HTML pages.
    // Fetch/XHR often sends Accept: */* which previously caused unwanted redirects.
    const accept = String(req.headers?.accept || "");
    const wantsHtml = accept.includes("text/html");
    const isApiPath =
        String(req.originalUrl || "").startsWith("/api/") ||
        String(req.originalUrl || "").startsWith("/api/v1/");
    const isGet = req.method === "GET";
    const isXHR = req.xhr || String(req.headers?.["x-requested-with"] || "").toLowerCase() === "xmlhttprequest";

    return isGet && wantsHtml && !isApiPath && !isXHR;
}

export const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            if (shouldRedirectToLogin(req)) return res.redirect('/login');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: 'Unauthorized request',
            });
        }

        const decoded = verifyAccessToken(token)
        console.log("Decoded Token:->", decoded)

        const user = await User.findByPk(decoded?.sub, {
            attributes: { exclude: ['password', 'refreshTokens'] }
        });

        if (!user) {
            if (shouldRedirectToLogin(req)) return res.redirect('/login');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: 'Invalid access token',
            });
        }

        req.user = user;
        console.log("verify User")
        next()
    } catch (error) {
        console.log("Auth error:", error.message);
        
        if (shouldRedirectToLogin(req)) {
            res.clearCookie('accessToken');
            return res.redirect('/login');
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
        });
    }
})

export const verifyOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            if (shouldRedirectToLogin(req)) return res.redirect('/login');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: 'Unauthorized request',
            });
        }

        const decoded = verifyAccessToken(token)
        console.log("Decoded Token:->", decoded)

        const owner = await User.findByPk(decoded?.sub, {
            attributes: { exclude: ['password', 'refreshTokens'] }
        });

        if (!owner) {
            if (shouldRedirectToLogin(req)) return res.redirect('/login');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: 'Invalid access token',
            });
        }

        if (owner.role !== "shop_owner") {
            if (shouldRedirectToLogin(req)) return res.redirect('/login');
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: 'only shop owner can access',
            });
        }

        req.owner = owner;
        console.log("verify Owner")
        next()
    } catch (error) {
        console.log("Auth error:", error.message);
        
        if (shouldRedirectToLogin(req)) {
            res.clearCookie('accessToken');
            return res.redirect('/login');
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
        });
    }
});