import express from "express";
import { addCustomer, listCustomers, updateCustomer, deleteCustomer } from "../controllers/customer.controllers.js";
import { verifyUser } from "../middleware/authMiddleware.js";


export const customerRouter = express.Router();
customerRouter.post("/", verifyUser, addCustomer);
customerRouter.get("/", verifyUser, listCustomers);
customerRouter.put("/:id", verifyUser, updateCustomer);
customerRouter.delete("/:id", verifyUser, deleteCustomer);
