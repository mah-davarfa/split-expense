import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import KebabMenu from "../components/KebabMenu";
import { expensesApi } from "../api/expenses.api.js";
import { balancesApi } from "../api/balances.api.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import Modal from "../components/Modal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const money = (n) => {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
};

const GroupExpensesTab = () => {
  const [addExpenceNotClicked, setAddExpenceNotClicked] = useState(true);
  const [addNewExpence, setAddNewExpence] = useState({
    description: "",
    amount: "",
    expenseDate: "",
  });
  const [mode, setMode] = useState("all"); // 'all' or 'mine'
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  const [voidOpen, setVoidOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidSubmitting, setVoidSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    expenseDate: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [receiptFiles, setReceiptFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptSrc, setReceiptSrc] = useState("");

  const navigate = useNavigate();
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const token = getToken();

  const loadExpenses = async () => {
    if (!token || !groupId) return;

    try {
      setLoading(true);
      setError("");

      const data =
        mode === "mine"
          ? await expensesApi.getMine(token, groupId)
          : await expensesApi.getAll(token, groupId);

      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!token || !groupId) return;

    try {
      setSummaryLoading(true);
      setSummaryError("");

      const data = await balancesApi.get(token, groupId);
      setSummaryData(data);
    } catch (err) {
      setSummaryError(err.message || "Failed to load expense summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupId, mode]);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, groupId]);

  const totalGroupPaid = useMemo(() => {
    return Number(summaryData?.totalGroupPaid?.[0]?.totalGroupPaid ?? 0);
  }, [summaryData]);

  const memberPaidSummary = useMemo(() => {
    const balances = Array.isArray(summaryData?.balances) ? summaryData.balances : [];
    const totals = Array.isArray(summaryData?.totalEachUserIdPaid)
      ? summaryData.totalEachUserIdPaid
      : [];

    return totals.map((item) => {
      const matchedUser = balances.find(
        (b) => String(b.userId) === String(item._id)
      );

      return {
        userId: item._id,
        name: matchedUser?.name || "Unknown",
        total: Number(item.totalEachUserIdPaid ?? 0),
      };
    });
  }, [summaryData]);

  const onPickReceipts = (e) => {
    const files = Array.from(e.target.files || []);
    setReceiptFiles(files);

    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const handleEdit = (expense) => {
    setEditTarget(expense);

    setEditForm({
      description: expense.description || "",
      amount: expense.amount || "",
      expenseDate: expense.expenseDate
        ? new Date(expense.expenseDate).toISOString().split("T")[0]
        : "",
    });

    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    const updates = {};

    if (editForm.description.trim() !== "") {
      updates.description = editForm.description.trim();
    }

    if (editForm.amount !== "") {
      updates.amount = Number(editForm.amount);
    }

    if (editForm.expenseDate !== "") {
      updates.expenseDate = editForm.expenseDate;
    }

    const targetId = editTarget._id;

    setEditOpen(false);
    setEditTarget(null);
    setEditForm({ description: "", amount: "", expenseDate: "" });

    if (Object.keys(updates).length === 0) {
      alert("Nothing to update.");
      return;
    }

    try {
      setEditSubmitting(true);

      const res = await expensesApi.updateExpense(
        token,
        groupId,
        targetId,
        updates
      );

      const updated = res.updatedExpenses;

      setExpenses((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x))
      );

      await loadSummary();
    } catch (err) {
      alert(err.message || "Server error. Update failed.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleVoid = (expense) => {
    setVoidTarget(expense);
    setVoidReason("");
    setVoidOpen(true);
  };

  const submitVoid = async (e) => {
    e.preventDefault();
    if (!voidTarget) return;

    if (!voidReason || voidReason.trim().length < 3) {
      alert("Reason must be at least 3 characters.");
      return;
    }

    const expensesId = voidTarget._id;
    const reason = voidReason.trim();

    setVoidOpen(false);
    setVoidTarget(null);
    setVoidReason("");

    try {
      setVoidSubmitting(true);
      const res = await expensesApi.void(token, groupId, expensesId, reason);
      const updated = res.updatedVoidedExpense;

      setExpenses((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x))
      );

      await loadSummary();
    } catch (err) {
      alert(err.message || "Server error. Void failed.");
    } finally {
      setVoidSubmitting(false);
    }
  };

  const cancelHandler = (e) => {
    e.preventDefault();
    setAddExpenceNotClicked(true);
    setReceiptFiles([]);
    setPreviews([]);
    setAddNewExpence({ description: "", amount: "", expenseDate: "" });
  };

  const addExpenceHandler = async (e) => {
    e.preventDefault();

    const description = addNewExpence.description.trim();
    const amountRaw = addNewExpence.amount;
    const expenseDateRaw = addNewExpence.expenseDate;

    if (description.length < 3) {
      alert("Description must be at least 3 characters.");
      return;
    }

    const amount = Number(amountRaw);

    if (amountRaw === "" || Number.isNaN(amount)) {
      alert("Amount must be a valid number.");
      return;
    }

    if (amount < 0) {
      alert("Amount cannot be negative.");
      return;
    }

    let expenseDate = expenseDateRaw;

    if (!expenseDate) {
      expenseDate = new Date().toISOString().split("T")[0];
    }

    const parsedDate = new Date(expenseDate);
    if (Number.isNaN(parsedDate.getTime())) {
      alert("Invalid date.");
      return;
    }

    setAddExpenceNotClicked(true);

    try {
      let res;
      const hasFiles = receiptFiles.length > 0;

      if (hasFiles) {
        res = await expensesApi.createWithReceipts(token, groupId, {
          description,
          amount,
          expenseDate,
          files: receiptFiles,
        });
      } else {
        res = await expensesApi.create(token, groupId, {
          description,
          amount,
          expenseDate,
          receiptUrl: [],
        });
      }

      const created = res.created;

      setExpenses((prev) => [created, ...prev]);

      setAddNewExpence({ description: "", amount: "", expenseDate: "" });
      setReceiptFiles([]);
      setPreviews([]);

      await loadSummary();
    } catch (err) {
      alert(err.message || "Server error. Expense not created.");
    }
  };

  const addHandler = () => {
    setAddExpenceNotClicked(false);
  };

  const goToBalancesHandler = () => {
    navigate("../balances");
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3011";

  const buildFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="stack">
      <div className="expenses-layout">
        {/* Left/Main Column */}
        <section className="expenses-main stack">
          <h3>Group Expenses</h3>

          <div>
            {mode === "all" ? (
              <button onClick={() => setMode("mine")}>My Spending</button>
            ) : (
              <button onClick={() => setMode("all")}>
                See Everybody Spending
              </button>
            )}
          </div>

          <div className="stack">
            {loading && <LoadingSpinner />}
            {error && (
              <ErrorBanner message={error} onClose={() => setError("")} />
            )}

            {!loading && !error && expenses.length === 0 && (
              <p className="muted">No expenses yet.</p>
            )}

            {!loading &&
              expenses.map((exp) => (
                <div key={exp._id} className="card stack">
                  <div className="row-between">
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          textDecoration:
                            exp.status === "voided" ? "line-through" : "none",
                          color:
                            exp.status === "voided"
                              ? "var(--muted)"
                              : "inherit",
                        }}
                      >
                        {new Date(exp.expenseDate).toLocaleDateString()} |{" "}
                        {exp.createdBy?.name || "Unknown"} | {exp.description} | $
                        {Number(exp.amount).toFixed(2)}
                        {exp.status === "voided" && (
                          <strong className="text-red" style={{ marginLeft: 8 }}>
                            (VOIDED)
                          </strong>
                        )}
                      </div>
                    </div>

                    {mode === "mine" && (
                      <div>
                        <KebabMenu
                          items={[
                            {
                              label: "Edit",
                              onClick: () => handleEdit(exp),
                              disabled: exp.status === "voided",
                            },
                            {
                              label: "Void",
                              onClick: () => handleVoid(exp),
                              disabled: exp.status === "voided",
                            },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {Array.isArray(exp.receiptUrl) && exp.receiptUrl.length > 0 && (
                    <div
                      className="flex gap-8"
                      style={{
                        flexWrap: "wrap",
                      }}
                    >
                      {exp.receiptUrl.map((p) => {
                        const fullUrl = buildFileUrl(p);
                        return (
                          <img
                            key={p}
                            src={fullUrl}
                            alt="receipt"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 8,
                              cursor: "pointer",
                              border: "1px solid var(--border)",
                              opacity: exp.status === "voided" ? 0.6 : 1,
                            }}
                            onClick={() => {
                              setReceiptSrc(fullUrl);
                              setReceiptOpen(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div>
            <button onClick={goToBalancesHandler}>See Balances</button>
          </div>

          <div>
            {addExpenceNotClicked ? (
              <button onClick={addHandler}>Add Expense</button>
            ) : (
              <form onSubmit={addExpenceHandler} className="card stack">
                <input
                  name="description"
                  value={addNewExpence.description}
                  placeholder="Enter description"
                  onChange={(e) =>
                    setAddNewExpence({
                      ...addNewExpence,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  name="amount"
                  value={addNewExpence.amount}
                  placeholder="Enter amount"
                  onChange={(e) =>
                    setAddNewExpence({
                      ...addNewExpence,
                      amount: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  name="expenseDate"
                  value={addNewExpence.expenseDate}
                  onChange={(e) =>
                    setAddNewExpence({
                      ...addNewExpence,
                      expenseDate: e.target.value,
                    })
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickReceipts}
                />

                {previews.length > 0 && (
                  <div
                    className="flex gap-10"
                    style={{
                      flexWrap: "wrap",
                    }}
                  >
                    {previews.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt="preview"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div
                  className="flex gap-8"
                  style={{
                    justifyContent: "flex-end",
                  }}
                >
                  <button type="button" onClick={cancelHandler}>
                    Cancel
                  </button>
                  <button type="submit">Add</button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Right/Summary Column */}
        <aside className="expenses-summary-col">
          <div className="card expenses-summary-card">
            <div className="row-between">
              <h4 className="m-0">Expense Summary</h4>
            </div>

            {summaryLoading && (
              <div className="mt-10">
                <LoadingSpinner label="Loading summary..." />
              </div>
            )}

            {summaryError && (
              <div className="mt-10">
                <ErrorBanner
                  message={summaryError}
                  onClose={() => setSummaryError("")}
                />
              </div>
            )}

            {!summaryLoading && !summaryError && (
              <div className="stack mt-10">
                <div className="summary-total-box">
                  <div className="muted">Total group spent</div>
                  <div className="summary-total-amount">
                    {money(totalGroupPaid)}
                  </div>
                </div>

                <div className="stack gap-8">
                  <h5 className="m-0">Each member paid so far</h5>

                  {memberPaidSummary.length === 0 ? (
                    <p className="muted m-0">No member totals yet.</p>
                  ) : (
                    memberPaidSummary.map((item) => (
                      <div
                        key={item.userId}
                        className="summary-member-row"
                      >
                        <span>{item.name}</span>
                        <strong>{money(item.total)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {receiptOpen && (
        <Modal
          title="Receipt"
          onClose={() => {
            setReceiptOpen(false);
            setReceiptSrc("");
          }}
        >
          <img
            src={receiptSrc}
            alt="receipt full"
            className="w-full"
            style={{
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </Modal>
      )}

      {voidOpen && (
        <Modal
          title="Void Expense"
          onClose={() => {
            if (voidSubmitting) return;
            setVoidOpen(false);
            setVoidTarget(null);
            setVoidReason("");
          }}
        >
          <form onSubmit={submitVoid}>
            <p className="mt-0">
              Void: <strong>{voidTarget?.description}</strong>
            </p>

            <label style={{ display: "block", marginBottom: "8px" }}>
              Reason (required)
            </label>
            <input
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              minLength={3}
              placeholder="e.g., duplicate entry"
              style={{ width: "100%", padding: "8px" }}
              disabled={voidSubmitting}
            />

            <div className="flex gap-8" style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  if (voidSubmitting) return;
                  setVoidOpen(false);
                  setVoidTarget(null);
                  setVoidReason("");
                }}
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

      {editOpen && (
        <Modal
          title="Edit Expense"
          onClose={() => {
            if (editSubmitting) return;
            setEditOpen(false);
            setEditTarget(null);
            setEditForm({ description: "", amount: "", expenseDate: "" });
          }}
        >
          <form onSubmit={submitEdit}>
            <div>
              <label>Description</label>
              <input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                disabled={editSubmitting}
              />
            </div>

            <div>
              <label>Amount</label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                disabled={editSubmitting}
              />
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                value={editForm.expenseDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, expenseDate: e.target.value })
                }
                disabled={editSubmitting}
              />
            </div>

            <div className="flex gap-8" style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  if (editSubmitting) return;
                  setEditOpen(false);
                  setEditTarget(null);
                  setEditForm({ description: "", amount: "", expenseDate: "" });
                }}
                disabled={editSubmitting}
              >
                Cancel
              </button>

              <button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GroupExpensesTab;