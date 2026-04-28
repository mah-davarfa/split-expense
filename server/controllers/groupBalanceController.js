import mongoose from "mongoose";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import Expense from "../models/Expense.js";
import SettlementPayment from "../models/SettlementPayment.js";

const httpErrorHandler = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const isIdValidMongooseId = (id) => {
  return mongoose.isValidObjectId(id);
};

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const calculateSettlement = (balances) => {
  const debtors = [];
  const creditors = [];
//id:{userId:_id ,name:name ,balace:0}
  for (const b of Object.values(balances)) {
    const rounded = roundMoney(b.balance);

    if (rounded > 0) {
      creditors.push({ ...b, amount: rounded });
    }

    if (rounded < 0) {
      debtors.push({ ...b, amount: Math.abs(rounded) });
    }
  }

  const settlement = [];
  let c = 0;
  let d = 0;

  while (c < creditors.length && d < debtors.length) {
    const creditor = creditors[c];
    const debtor = debtors[d];

    const pay = roundMoney(Math.min(creditor.amount, debtor.amount));

    if (pay > 0) {
      settlement.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: pay,
      });
    }

    debtor.amount = roundMoney(debtor.amount - pay);
    creditor.amount = roundMoney(creditor.amount - pay);

    if (debtor.amount === 0) d++;
    if (creditor.amount === 0) c++;
  }

  return settlement;
};

//GET /api/groups/:groupId/balances (balance sheet)
//GroupMembr-> {groupId, userId}->All active members and accepted member->Expense ->splitMode->
//  active expense createdBy
//total expense and total expenses per users
export const getGroupBalence = async (req, res, next) => {
  try {
    const groupId = req.params?.groupId;

    if (!groupId) return next(httpErrorHandler("Group id is required", 400));
    if (!isIdValidMongooseId(groupId)) {
      return next(httpErrorHandler("Group id is not a valid DB id", 400));
    }

    const group = await Group.findById(groupId);
    if (!group) return next(httpErrorHandler("Group not found", 404));

    const members = await GroupMember.find({
      groupId,
      inviteStatus: "accepted",
      membershipStatus: "active",
    })
      .select("userId percentage share")
      .populate("userId", "name");
       ///the members=[ 
    //        { _id: "gm1",
    //             userId:{_id:u1 ,name:bob },
        //         percentage:0 , share:1
    //        }, 
    // {...} 
    //] 
    if (!members.length) {
      return next(httpErrorHandler("There is no active member for this group", 400));
    }

    const splitDetails = members.map((m) => ({
      userId: m.userId._id,
      name: m.userId.name,
      percentage: Number(m.percentage ?? 0),
      share: Number(m.share ?? 0),
    }));

    const balances = {};
    /// create-> id:{userId:_id ,name:name ,balace:0}
    for (const m of members) {
      const id = m.userId._id.toString();
      balances[id] = {
        userId: m.userId._id,
        name: m.userId.name,
        balance: 0,
      };
    }

    const expenses = await Expense.find({
      groupId,
      status: "active",
    }).select("amount paidBy");
//[ { _id: "exp1", amount: 25, paidBy: "u1" },{...}]
    for (const ex of expenses) {
      const paidId = ex.paidBy.toString();
      const amount = Number(ex.amount);

      if (balances[paidId]) {
        balances[paidId].balance += amount;
      }

      if (group.splitMode === "equal") {
        const perPerson = amount / members.length;

        for (const m of members) {
          balances[m.userId._id.toString()].balance -= perPerson;
        }
      }

      if (group.splitMode === "percentage") {
        for (const m of members) {
          const share = amount * (Number(m.percentage || 0) / 100);
          balances[m.userId._id.toString()].balance -= share;
        }
      }

      if (group.splitMode === "share") {
        let totalShare = 0;

        for (const m of members) {
          totalShare += Number(m.share || 0);
        }

        if (totalShare <= 0) {
          return next(httpErrorHandler("Invalid share setup", 400));
        }

        for (const m of members) {
          balances[m.userId._id.toString()].balance -=
            amount * (Number(m.share || 0) / totalShare);
        }
      }
    }

    // Apply recorded payments.
    // If Mahmoud paid Ali $25:
    // Mahmoud balance goes up toward zero.
    // Ali balance goes down toward zero.
    const settlementPayments = await SettlementPayment.find({
      groupId,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .populate("fromUser", "name")
      .populate("toUser", "name")
      .populate("createdBy", "name");

    for (const payment of settlementPayments) {
      const fromId = payment.fromUser?._id?.toString();
      const toId = payment.toUser?._id?.toString();
      const amount = Number(payment.amount || 0);

      if (balances[fromId]) {
        balances[fromId].balance += amount;
      }

      if (balances[toId]) {
        balances[toId].balance -= amount;
      }
    }

    for (const b of Object.values(balances)) {
      b.balance = roundMoney(b.balance);
    }

    const settlement = calculateSettlement(balances);

        /////////////////////////getting total for whole group and each user use aggregate pipline//////////////
    const totalGroupPaid= await Expense.aggregate([
        {
            $match:{
                groupId:new mongoose.Types.ObjectId(groupId),
                status:'active'
            }
        },
        {
            $group:{
                _id:null,
                totalGroupPaid:{$sum:'$amount'}

            }
        }
    ])


    /////////////result is: [{ _id: null, totalAmount: 200 }]///

    const totalEachUserIdPaid = await Expense.aggregate([
      {
        $match: {
          groupId: new mongoose.Types.ObjectId(groupId),
          status: "active",
        },
      },
      {
        $group: {
          _id: "$paidBy",
          totalEachUserIdPaid: { $sum: "$amount" },
        },
      },
    ]);
  ///result is like: [{ _id: "u1", totalPaid: 150 },{ _id: "u2", totalPaid: 90 },...]
    res.status(200).json({
      groupId,
      splitMode: group.splitMode,
      message: 'If balance is negative, that member still owes money.',
      balances: Object.values(balances),
      settlement,
      settelment: settlement, // keep old frontend spelling safe
      settlementPayments,
      totalEachUserIdPaid,
      totalGroupPaid,
      splitDetails,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/groups/:groupId/balances/payments
export const createSettlementPayment = async (req, res, next) => {
  try {
    const groupId = req.params?.groupId;
    const userId = req.user?.userId;

    if (!userId) return next(httpErrorHandler("Unauthorized", 401));
    if (!groupId) return next(httpErrorHandler("Group id is required", 400));

    if (!isIdValidMongooseId(groupId)) {
      return next(httpErrorHandler("Group id is not a valid DB id", 400));
    }

    const { fromUser, toUser, amount, note } = req.body;

    if (!fromUser || !toUser) {
      return next(httpErrorHandler("fromUser and toUser are required", 400));
    }

    if (!isIdValidMongooseId(fromUser) || !isIdValidMongooseId(toUser)) {
      return next(httpErrorHandler("fromUser or toUser is not a valid DB id", 400));
    }

    if (String(fromUser) === String(toUser)) {
      return next(httpErrorHandler("fromUser and toUser cannot be the same", 400));
    }

    const cleanAmount = Number(amount);

    if (Number.isNaN(cleanAmount) || cleanAmount <= 0) {
      return next(httpErrorHandler("Amount must be greater than 0", 400));
    }

    const members = await GroupMember.find({
      groupId,
      userId: { $in: [fromUser, toUser] },
      inviteStatus: "accepted",
      membershipStatus: "active",
    });

    if (members.length !== 2) {
      return next(httpErrorHandler("Both users must be active group members", 400));
    }

    const payment = await SettlementPayment.create({
      groupId,
      fromUser,
      toUser,
      amount: roundMoney(cleanAmount),
      note: note ? String(note).trim() : "",
      status: "paid",
      createdBy: userId,
    });

    const populated = await SettlementPayment.findById(payment._id)
      .populate("fromUser", "name")
      .populate("toUser", "name")
      .populate("createdBy", "name");

    res.status(201).json({
      message: "Settlement payment recorded",
      payment: populated,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/groups/:groupId/balances/payments/:paymentId
export const voidSettlementPayment = async (req, res, next) => {
  try {
    const groupId = req.params?.groupId;
    const paymentId = req.params?.paymentId;
    const userId = req.user?.userId;

    if (!userId) return next(httpErrorHandler("Unauthorized", 401));
    if (!groupId || !paymentId) {
      return next(httpErrorHandler("Group id and payment id are required", 400));
    }

    if (!isIdValidMongooseId(groupId) || !isIdValidMongooseId(paymentId)) {
      return next(httpErrorHandler("Invalid DB id", 400));
    }

    const voidedReason =
      req.body?.voidedReason?.trim() || "Settlement payment voided";

    const payment = await SettlementPayment.findOneAndUpdate(
      {
        _id: paymentId,
        groupId,
        status: "paid",
      },
      {
        status: "voided",
        voidedAt: new Date(),
        voidedBy: userId,
        voidedReason,
      },
      { new: true, runValidators: true }
    )
      .populate("fromUser", "name")
      .populate("toUser", "name")
      .populate("createdBy", "name")
      .populate("voidedBy", "name");

    if (!payment) {
      return next(httpErrorHandler("Payment not found or already voided", 404));
    }

    res.status(200).json({
      message: "Settlement payment voided",
      payment,
    });
  } catch (error) {
    return next(error);
  }
};