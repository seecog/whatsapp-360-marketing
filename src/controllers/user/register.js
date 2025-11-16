// src/controllers/user/register.js
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { User } from '../../models/User.js';
import { buildTokenPair, hashToken } from '../../utils/token.util.js';

export default async function register(req, res) {
    try {
        const { firstName, lastName, phoneNo, email, password } = req.body || {};
        if (!firstName || !lastName || !phoneNo || !email || !password) {
            return res.status(404).json({ message: 'firstName, lastName, phoneNo, email and password required' });
        }

        console.log('registering user', email);

        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(404).json({ message: 'User already exists' });

        const user = await User.create({
            avatarUrl: null,
            firstName, 
            lastName,
            phoneNo,
            email,
            password,
        });

        const createdUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating user");
        }

        // build tokens correctly
        const { accessToken, refreshToken, accessExp, refreshExp } = buildTokenPair(createdUser.id);

        // persist hashed refresh + expiry on user doc
        createdUser.refreshTokens = hashToken(refreshToken);
        createdUser.refreshTokenExpiresAt = refreshExp ? new Date(refreshExp * 1000) : null;
        await createdUser.save();

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { tokens: { accessToken, refreshToken }, user: createdUser }, "User registered Successfully")
            )
    } catch (e) {
        console.error('register error', e);
        return res.status(500).json({ message: 'internal_error' });
    }
}