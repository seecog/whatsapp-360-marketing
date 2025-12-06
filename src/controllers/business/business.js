import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { User } from "../../models/User.js"
import { Business } from "../../models/Business.js"
import { Op } from 'sequelize';

function escapeRegex(s = "") {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const createBusiness = asyncHandler(async (req, res) => {
    try {
        const { businessName, timezone, country, category, description, phoneNo, whatsappNo } = req.body || {}

        if (!businessName || !country || !category) return res.status(400).json(new ApiResponse(400, {}, "Business name, country and category are required"));

        if (req.user.role !== "shop_owner") {
            return res.status(403).json(new ApiResponse(403, {}, "Only shop owner can create businesses"))
        }

        const business = await Business.create({
            businessName,
            description,
            timezone,
            country,
            category,
            phoneNo,
            whatsappNo,
            ownerId: req.user.id
        })

        return res
            .status(201)
            .json(new ApiResponse(
                201,
                { business },
                "Business created successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const getMyBusiness = asyncHandler(async (req, res) => {
    try {
        const business = await Business.findAll({ where: { ownerId: req.user.id } })
        if (!business || business.length === 0) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Business not found"))
        }
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { business },
                "Business found successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const updateMyBusiness = asyncHandler(async (req, res) => {
    try {
        const { businessId } = req.params
        const { name, description, category } = req.body

        const business = await Business.findByPk(businessId)
        if (!business) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Business not found"))
        }

        if (req.user.role !== "shop_owner") {
            return res.status(403).json(new ApiResponse(403, {}, "Only shop owner can update businesses"))
        }

        if (req.user.id !== business.ownerId) {
            return res
                .status(403)
                .json(new ApiResponse(403, {}, "You are not allowed to update this business"))
        }

        business.businessName = name || business.businessName
        business.description = description || business.description
        business.category = category || business.category
        await business.save()

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { business },
                "Business updated successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const deleteMyBusiness = asyncHandler(async (req, res) => {
    try {
        const { businessId } = req.params

        const existing = await Business.findByPk(businessId)
        if (!existing) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Business not found"))
        }

        if (req.user.role !== "shop_owner") {
            return res.status(403).json(new ApiResponse(403, {}, "Only shop owner can delete businesses"))
        }

        if (req.user.id !== existing.ownerId) {
            return res
                .status(403)
                .json(new ApiResponse(403, {}, "You are not allowed to delete this business"))
        }

        await Business.destroy({ where: { id: businessId } })

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "Business deleted successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const listBusinesses_admin = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json(new ApiResponse(403, {}, "Only admin can list businesses"))
        }

        const { q, country, category, timezone, page = "1", limit = "20", sortBy = "createdAt", order = "desc" } = req.query

        const filter = {}
        if (q && q.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i")
            filter[Op.or] = [
                { businessName: { [Op.like]: `%${q.trim()}%` } },
                { country: { [Op.like]: `%${q.trim()}%` } },
                { category: { [Op.like]: `%${q.trim()}%` } },
                { description: { [Op.like]: `%${q.trim()}%` } }
            ]
        }

        if (country && country.trim()) filter.country = country.trim().toUpperCase();
        if (category && category.trim()) {
            filter.category = { [Op.like]: `%${category.trim()}%` }
        }
        if (timezone && timezone.trim()) filter.timezone = timezone.trim();

        const pageNum = Math.max(parseInt(page, 10) || 1, 1)
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
        const offset = (pageNum - 1) * limitNum

        const ALLOWED_SORT = ['createdAt', 'updatedAt', 'businessName', 'country', 'category']
        const sortField = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt'
        const sortOrder = order === "asc" ? "ASC" : "DESC"
        const orderClause = [[sortField, sortOrder]]

        const { count: total, rows: items } = await Business.findAndCountAll({
            where: filter,
            order: orderClause,
            limit: limitNum,
            offset: offset
        });

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {
                    items,
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum) || 0,
                    sort: { by: sortField, order: sortOrder === "ASC" ? "asc" : "desc" },
                    filterApplied: filter
                },
                "Business fetched successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const transferOwnerShip_admin = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Only admin can transfer the ownership"))
        }

        const { businessId } = req.params
        const { newOwnerId } = req.body

        // Load business & new owner
        const business = await Business.findByPk(businessId)
        if (!business) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Business not found"))
        }

        const newOwner = await User.findByPk(newOwnerId)
        if (!newOwner) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Owner not found"))
        }

        // Must be a shop_owner
        if (newOwner.role !== "shop_owner") {
            return res
                .status(400)
                .json(new ApiResponse(400, {}, "Only shop owner can take ownership of the businesses"))
        }

        // No-op: already owned by this user
        if (business.ownerId === newOwner.id) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Ownership unchanged"))
        }

        // Ensure the new owner does NOT already own another business
        const other = await Business.findOne({
            where: {
                ownerId: newOwner.id,
                id: { [Op.ne]: business.id }
            }
        })
        if (other) {
            return res
                .status(409)
                .json(new ApiResponse(409, { existingBusinessId: other.id }, "New owner already has a business"))
        }

        // Transfer
        business.ownerId = newOwnerId
        await business.save()

        return res
            .status(200)
            .json(new ApiResponse(
                200, { business }, "Ownership transferred successfully"
            ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

// New CRUD functions for frontend
export const getAllMyBusinesses = asyncHandler(async (req, res) => {
    try {
        const businesses = await Business.findAll({ 
            where: { ownerId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        
        return res.status(200).json(businesses);
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(500, "Internal server error");
    }
});

export const updateBusinessById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { businessName, description, category, phoneNo, whatsappNo, timezone, country } = req.body;

        const business = await Business.findOne({
            where: { id, ownerId: req.user.id }
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        await business.update({
            businessName: businessName || business.businessName,
            description: description || business.description,
            category: category || business.category,
            phoneNo: phoneNo || business.phoneNo,
            whatsappNo: whatsappNo || business.whatsappNo,
            timezone: timezone || business.timezone,
            country: country || business.country
        });

        return res.status(200).json(business);
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(500, "Internal server error");
    }
});