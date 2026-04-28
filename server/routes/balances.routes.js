import express from "express";
import {
  getGroupBalence,
  createSettlementPayment,
  voidSettlementPayment,
} from "../controllers/groupBalanceController.js";
import { requireGroupMember } from "../middlewares/groupAuth.js";
import authToken from "../middlewares/auth.js";

const router = express.Router({ mergeParams: true });

// GET /api/groups/:groupId/balances
router.get("/", authToken, requireGroupMember, getGroupBalence);

// POST /api/groups/:groupId/balances/payments
router.post("/payments", authToken, requireGroupMember, createSettlementPayment);

// DELETE /api/groups/:groupId/balances/payments/:paymentId
router.delete(
  "/payments/:paymentId",
  authToken,
  requireGroupMember,
  voidSettlementPayment
);

export default router;