import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Modal from "../components/Modal.jsx";
import { balancesApi } from "../api/balances.api.js";

const money = (n) => {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
};

const getUserId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return value._id;
  return String(value);
};

const getUserName = (value) => {
  if (!value) return "Unknown";
  if (typeof value === "string") return "Unknown";
  return value.name || "Unknown";
};

const GroupBalancesTab = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const token = getToken();

  const [loading, setLoading] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [voidSubmitting, setVoidSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState(null);

  const [voidOpen, setVoidOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");

  const loadBalances = async () => {
    if (!token || !groupId) return;

    try {
      setLoading(true);
      setError("");

      const res = await balancesApi.get(token, groupId);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupId]);

  const balances = useMemo(() => {
    return data?.balances || [];
  }, [data]);

  const settlement = useMemo(() => {
    return data?.settlement || data?.settelment || [];
  }, [data]);

  const settlementPayments = useMemo(() => {
    return data?.settlementPayments || [];
  }, [data]);

  const totalEachUserIdPaidFromData = useMemo(() => {
    return data?.totalEachUserIdPaid || [];
  }, [data]);

  const totalGroupPaidNumber = useMemo(() => {
    return Number(data?.totalGroupPaid?.[0]?.totalGroupPaid ?? 0);
  }, [data]);

  const totalEachUserPaidNumber = useMemo(() => {
    return totalEachUserIdPaidFromData.map((p) => {
      const user = balances.find((b) => String(b.userId) === String(p._id));

      return {
        name: user?.name ?? "Unknown",
        total: Number(p.totalEachUserIdPaid || 0),
      };
    });
  }, [balances, totalEachUserIdPaidFromData]);

  const openRecordPayment = (s) => {
    setError("");
    setPaymentDraft({
      fromUser: getUserId(s.fromUserId),
      fromName: s.fromName,
      toUser: getUserId(s.toUserId),
      toName: s.toName,
      amount: Number(s.amount || 0).toFixed(2),
      note: "",
    });
    setPaymentOpen(true);
  };

  const closePaymentModal = () => {
    if (paymentSubmitting) return;
    setPaymentOpen(false);
    setPaymentDraft(null);
  };

  const submitPayment = async (e) => {
    e.preventDefault();

    if (!paymentDraft) return;

    const amount = Number(paymentDraft.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    try {
      setPaymentSubmitting(true);
      setError("");

      await balancesApi.recordPayment(token, groupId, {
        fromUser: paymentDraft.fromUser,
        toUser: paymentDraft.toUser,
        amount,
        note: paymentDraft.note,
      });

      setPaymentOpen(false);
      setPaymentDraft(null);

      await loadBalances();
    } catch (err) {
      setError(err.message || "Failed to record payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const openVoidPayment = (payment) => {
    setVoidTarget(payment);
    setVoidReason("");
    setVoidOpen(true);
  };

  const closeVoidModal = () => {
    if (voidSubmitting) return;
    setVoidTarget(null);
    setVoidReason("");
    setVoidOpen(false);
  };

  const submitVoidPayment = async (e) => {
    e.preventDefault();

    if (!voidTarget?._id) return;

    try {
      setVoidSubmitting(true);
      setError("");

      await balancesApi.voidPayment(
        token,
        groupId,
        voidTarget._id,
        voidReason.trim() || "Settlement payment voided"
      );

      setVoidTarget(null);
      setVoidReason("");
      setVoidOpen(false);

      await loadBalances();
    } catch (err) {
      setError(err.message || "Failed to void payment");
    } finally {
      setVoidSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <h3>Group Balances</h3>

      {loading && <LoadingSpinner label="Loading Balances ..." />}

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {!loading && !error && !data && <p>No balances.</p>}

      {!loading && data && (
        <>
          <div className="card">
            <h4 className="mt-0">Split details</h4>

            {data.splitMode === "equal" ? (
              <p className="muted m-0">
                Equal split is active. Everyone shares expenses equally.
              </p>
            ) : (
              <div className="stack gap-6">
                {(data.splitDetails || []).map((m) => (
                  <div key={m.userId} className="row-between">
                    <div>{m.name}</div>

                    <div className="fw-600">
                      {data.splitMode === "percentage"
                        ? `${m.percentage}%`
                        : `${m.share} share`}
                    </div>
                  </div>
                ))}

                {data.splitMode === "percentage" && (
                  <p className="muted mt-8">Total must equal 100%.</p>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <p className="m-0">
              <strong>Total group spent:</strong> {money(totalGroupPaidNumber)}
            </p>
          </div>

          <div className="card">
            <h4 className="mt-0">Each Member Spent</h4>

            {totalEachUserPaidNumber.length > 0 ? (
              totalEachUserPaidNumber.map((p, idx) => (
                <p key={idx} className="m-0 mt-8">
                  {p.name} paid so far: <strong>{money(p.total)}</strong>
                </p>
              ))
            ) : (
              <p className="muted m-0">No expenses recorded yet.</p>
            )}
          </div>

          <div className="card">
            <h4 className="mt-0">Current Balance</h4>

            {balances.map((b) => (
              <div key={b.userId} className="row-between mt-8">
                <div>{b.name}</div>

                <div className="fw-600">
                  {money(b.balance)}
                </div>
              </div>
            ))}

            <p className="muted mt-12 mb-0">
              Positive means this member should receive money. Negative means
              this member still owes money.
            </p>
          </div>

          <div className="card">
            <h4 className="mt-0">Who pays who</h4>

            {settlement.length > 0 ? (
              <div className="stack gap-10">
                {settlement.map((s, idx) => (
                  <div key={idx} className="row-between">
                    <div>
                      <strong>{s.fromName}</strong> pays{" "}
                      <strong>{money(s.amount)}</strong> to{" "}
                      <strong>{s.toName}</strong>
                    </div>

                    <button type="button" onClick={() => openRecordPayment(s)}>
                      Mark as Paid
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m-0">No settlement needed. Balance is even.</p>
            )}
          </div>

          <div className="card">
            <h4 className="mt-0">Recorded Payments</h4>

            {settlementPayments.length > 0 ? (
              <div className="stack gap-10">
                {settlementPayments.map((p) => (
                  <div key={p._id} className="row-between">
                    <div>
                      <strong>{getUserName(p.fromUser)}</strong> paid{" "}
                      <strong>{money(p.amount)}</strong> to{" "}
                      <strong>{getUserName(p.toUser)}</strong>

                      {p.note && (
                        <div className="muted mt-6">
                          Note: {p.note}
                        </div>
                      )}

                      <div className="muted mt-6">
                        Recorded:{" "}
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>

                    <button type="button" onClick={() => openVoidPayment(p)}>
                      Void
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted m-0">No settlement payments recorded yet.</p>
            )}
          </div>

          <p className="mt-12 op-80">
            Note: This records payment made outside the app. It does not move
            real money yet.
          </p>
        </>
      )}

      {paymentOpen && paymentDraft && (
        <Modal title="Record Settlement Payment" onClose={closePaymentModal}>
          <form onSubmit={submitPayment} className="stack">
            <p className="mt-0">
              <strong>{paymentDraft.fromName}</strong> paid{" "}
              <strong>{paymentDraft.toName}</strong>
            </p>

            <div>
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={paymentDraft.amount}
                onChange={(e) =>
                  setPaymentDraft((p) => ({
                    ...p,
                    amount: e.target.value,
                  }))
                }
                disabled={paymentSubmitting}
              />
            </div>

            <div>
              <label>Note optional</label>
              <input
                value={paymentDraft.note}
                onChange={(e) =>
                  setPaymentDraft((p) => ({
                    ...p,
                    note: e.target.value,
                  }))
                }
                placeholder="Example: Zelle, cash, Venmo"
                disabled={paymentSubmitting}
              />
            </div>

            <div className="flex gap-8">
              <button
                type="button"
                onClick={closePaymentModal}
                disabled={paymentSubmitting}
              >
                Cancel
              </button>

              <button type="submit" disabled={paymentSubmitting}>
                {paymentSubmitting ? "Saving..." : "Confirm Paid"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {voidOpen && voidTarget && (
        <Modal title="Void Recorded Payment" onClose={closeVoidModal}>
          <form onSubmit={submitVoidPayment} className="stack">
            <p className="mt-0">
              Void payment from{" "}
              <strong>{getUserName(voidTarget.fromUser)}</strong> to{" "}
              <strong>{getUserName(voidTarget.toUser)}</strong> for{" "}
              <strong>{money(voidTarget.amount)}</strong>?
            </p>

            <div>
              <label>Reason optional</label>
              <input
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Example: entered by mistake"
                disabled={voidSubmitting}
              />
            </div>

            <div className="flex gap-8">
              <button
                type="button"
                onClick={closeVoidModal}
                disabled={voidSubmitting}
              >
                Cancel
              </button>

              <button type="submit" disabled={voidSubmitting}>
                {voidSubmitting ? "Voiding..." : "Confirm Void"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GroupBalancesTab;