const express = require("express");
const router = express.Router();
const {
  addPayment,
  getAllPaymentsForGroup,
  getPaymentHistoryForUser,
  calculateBalances,
  getGroupSummary,
  simplifyDebts,
  settleUp,
} = require("../controllers/paymentController");

router.post("/payments", addPayment);

router.get("/payments/group/:groupId", getAllPaymentsForGroup);

router.get("/payments/user/:userId", getPaymentHistoryForUser);

router.get("/balances/:groupId", calculateBalances);

router.get("/summary/group/:groupId", getGroupSummary);

router.get("/simplify-debts/:groupId", simplifyDebts);

router.post("/settle-up", settleUp);

module.exports = router;
