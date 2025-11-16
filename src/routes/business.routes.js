import express from 'express'
import { verifyUser } from '../middleware/authMiddleware.js'
import { createBusiness, deleteMyBusiness, getMyBusiness, listBusinesses_admin, transferOwnerShip_admin, updateMyBusiness, getAllMyBusinesses, updateBusinessById } from '../controllers/business/business.js'

const router = express.Router()

// Map :id to :businessId so controllers that read req.params.businessId work
router.param('id', (req, _res, next, val) => {
    // keep both, harmless if controller reads either one
    req.params.id = val
    if (!req.params.businessId) req.params.businessId = val
    next()
})

// New CRUD routes for frontend
router.route("/").get(verifyUser, getAllMyBusinesses)
router.route("/").post(verifyUser, createBusiness)
router.route("/:id").put(verifyUser, updateBusinessById)
router.route("/:id").delete(verifyUser, deleteMyBusiness)

// Original routes (keeping for backward compatibility)
router.route("/create-business").post(verifyUser, createBusiness)
router.route("/get-my-business").get(verifyUser, getMyBusiness)
router.route("/update-business/:businessId").patch(verifyUser, updateMyBusiness)
router.route("/delete-business/:businessId").delete(verifyUser, deleteMyBusiness)
router.route("/list-business").get(verifyUser, listBusinesses_admin)
router.route("/transfer-ownership/:businessId").get(verifyUser, transferOwnerShip_admin)

export default router