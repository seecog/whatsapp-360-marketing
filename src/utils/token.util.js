// utils/token.util.js (ESM)
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '60m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

export function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}
export function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
export function decodeExpUnix(token) {
    const d = jwt.decode(token);
    return d?.exp ?? null; // seconds since epoch
}

export function hashToken(raw) {
    return crypto.createHash('sha256').update(raw).digest('hex');
}

export function buildTokenPair(userId) {
    const accessToken = signAccessToken({ sub: userId.toString() });
    const refreshToken = signRefreshToken({ sub: userId.toString() });
    const accessExp = decodeExpUnix(accessToken);
    const refreshExp = decodeExpUnix(refreshToken);
    return { accessToken, refreshToken, accessExp, refreshExp };
}