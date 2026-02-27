import { useEffect, useState } from "react";
import { useNavigate,useParams} from "react-router-dom";
import KebabMenu from "../components/KebabMenu";
import {expensesApi} from '../api/expenses.api.js'
import {useAuth} from '../auth/AuthProvider.jsx'
import Modal from "../components/Modal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const GroupExpensesTab = ()=>{
    const [addExpenceNotClicked,setAddExpenceNotClicked]=useState(true);
    const [addNewExpence,setAddNewExpence]= useState({
        description:'',
        amount:'',
        expenseDate:''
    })
    const [mode,setMode] =useState('all'); // 'all' or 'mine'
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [voidOpen, setVoidOpen] = useState(false);
    const [voidTarget, setVoidTarget] = useState(null); // expense object
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
    const {groupId} = useParams();
    const {getToken} = useAuth()
        const token= getToken();

    useEffect(() => {
        if (!token || !groupId) return;

        const loadExpenses = async () => {
            try {
            setLoading(true);
            setError("");
            const data = 
                mode === 'mine'
                ? await expensesApi.getMine(token, groupId)
                :await expensesApi.getAll(token, groupId);
            
              // backend returns: { expenses }
            setExpenses(data.expenses || []);
            } catch (err) {
            setError(err.message || "Failed to load expenses");
            }finally{
                setLoading(false);
                }
            };

                loadExpenses();
    }, [token, groupId,mode]);

    const onPickReceipts = (e) => {
    const files = Array.from(e.target.files || []);
    setReceiptFiles(files);

    // preview urls
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    };

    // cleanup preview URLs
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
    }

    const submitEdit = async (e) => {
        e.preventDefault();
        if (!editTarget) return;

       const updates = {};

            if (editForm.description.trim() !== "") updates.description = editForm.description.trim();

            if (editForm.amount !== "") updates.amount = Number(editForm.amount);

            if (editForm.expenseDate !== "") updates.expenseDate = editForm.expenseDate;
            const targetId = editTarget._id;
            // close immediately, regardless of success
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

            // capture values before closing
        const expensesId = voidTarget._id;
        const reason = voidReason.trim();
        // close immediately
        setVoidOpen(false);
        setVoidTarget(null);
        setVoidReason("");

        try {
            setVoidSubmitting(true);
            const res = await expensesApi.void(token, groupId, expensesId, reason);
            const updated = res.updatedVoidedExpense;

            setExpenses((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        } catch (err) {
            alert(err.message || "Server error. Void failed.");
        } finally {
        setVoidSubmitting(false);
        }
        };


    const cancelHandler=(e)=>{
        e.preventDefault();
        setAddExpenceNotClicked(true);
        setReceiptFiles([]);
        setPreviews([]);
        setAddNewExpence({description:'',amount:'',expenseDate:''})
    }

    const addExpenceHandler = async (e) => {
        e.preventDefault();

        const description = addNewExpence.description.trim();
        const amountRaw = addNewExpence.amount;
        const expenseDateRaw = addNewExpence.expenseDate;

        // ===== DESCRIPTION VALIDATION =====
        if (description.length < 3) {
            alert("Description must be at least 3 characters.");
            return;
        }

        // ===== AMOUNT VALIDATION =====
        const amount = Number(amountRaw);

        if (amountRaw === "" || isNaN(amount)) {
            alert("Amount must be a valid number.");
            return;
        }

        if (amount < 0) {
            alert("Amount cannot be negative.");
            return;
        }

        // ===== DATE VALIDATION =====
        let expenseDate = expenseDateRaw;

        if (!expenseDate) {
            // default to today if empty
            expenseDate = new Date().toISOString().split("T")[0];
        }

        const parsedDate = new Date(expenseDate);
        if (isNaN(parsedDate.getTime())) {
            alert("Invalid date.");
            return;
        }

        // ===== SUBMIT =====
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

            // reset form + receipts
            setAddNewExpence({ description: "", amount: "", expenseDate: "" });
            setReceiptFiles([]);
            setPreviews([]);

            } catch (err) {
            alert(err.message || "Server error. Expense not created.");
            }
            };


            const addHandler =()=>{
                setAddExpenceNotClicked(false)
            }

            const goToBalancesHandler=()=>{
                navigate('../balances')
            }

    /////URL builder helper///
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3011";

        const buildFileUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_BASE_URL}${path}`;
        };

    return(
        <div>
            <h3>GroupExpensesTab   page</h3>

            <div>
                {mode === "all" ? (
                    <button onClick={() => setMode("mine")}>My Spending</button>
                ) : (
                    <button onClick={() => setMode("all")}>See everybody Spending</button>
                )}
            </div>
            <div>
                {loading && <LoadingSpinner />}
                {error && <ErrorBanner message={error} onClose={() => setError("")}/>}

                {!loading && !error && expenses.length === 0 && (
                <p>No expenses yet.</p>
                )}

                {!loading && expenses.map((exp) => (
                <div
                    key={exp._id}
                    style={{ flex:1}}
                >
                <span
                    style={{
                        textDecoration: exp.status === "voided" ? "line-through" : "none",
                        color: exp.status === "voided" ? "gray" : "inherit",
                    }}
                    >
                    {new Date(exp.expenseDate).toLocaleDateString()} |{" "}
                    {exp.createdBy?.name || "Unknown"} |{" "}
                    {exp.description} | ${Number(exp.amount).toFixed(2)}
                    {exp.status === "voided" && (
                        <strong style={{ marginLeft: "8px", color: "red" }}>(VOIDED)</strong>
                    )}
                </span>
                {Array.isArray(exp.receiptUrl) && exp.receiptUrl.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {exp.receiptUrl.map((p) => {
                    const fullUrl = buildFileUrl(p);

                    return (
                        <img
                        key={p}
                        src={fullUrl}
                        alt="receipt"
                        style={{
                            width: 54,
                            height: 54,
                            objectFit: "cover",
                            borderRadius: 6,
                            cursor: "pointer",
                            border: "1px solid #ddd",
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
               { mode=== 'mine'&& (
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
               )}

                </div>
                ))}
            </div>
            
            <div>
             

                <button onClick={goToBalancesHandler}>See Balances</button>
            </div>
            
            <div>
             {addExpenceNotClicked?(
                <button onClick={addHandler}>Add Expence</button>
                ):(
                
                <form onSubmit={addExpenceHandler}>
                    <div>
                        <input
                          name="description"
                          value={addNewExpence.description}
                          placeholder="Enter description"
                          onChange={(e)=>setAddNewExpence({...addNewExpence,description:e.target.value})}
                        />
                        <input
                          name="amount"
                          value={addNewExpence.amount}
                          placeholder="Enter damount"
                          onChange={(e)=>setAddNewExpence({...addNewExpence,amount:e.target.value})}
                        />
                        <input
                        type="date"
                        name="expenseDate"
                        value={addNewExpence.expenseDate}
                        onChange={(e) => setAddNewExpence({ ...addNewExpence, expenseDate: e.target.value })}
                        />
                       <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onPickReceipts}
                        />

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {previews.map((src) => (
                            <img key={src} src={src} alt="receipt preview" style={{ width: 80, height: 80, objectFit: "cover" }} />
                        ))}
                        </div>
                    </div>

                    <div>
                        <button type="submit">Add</button>
                        <button onClick={cancelHandler}>Cancel</button>
                    </div>
                </form>
                )}
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
                style={{
                    width: "100%",
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
                <p style={{ marginTop: 0 }}>
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

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
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

                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
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
                
    )
}
export default GroupExpensesTab;