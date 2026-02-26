import {useEffect,useRef,useState} from 'react'
import Modal from './Modal.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'
import {aiApi}from '../api/ai.api.js'
import {useAuth} from '../auth/AuthProvider.jsx'
import ErrorBanner from './ErrorBanner.jsx'

export const AIAssistant = ()=>{

    const {getToken} = useAuth()
    const token = getToken()

    const [open,setOpen] = useState(false)
    const [messages,setMessages] = useState([]) // {role:'user'|'assistant', content:string}
    const [text,setText] = useState('')
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState('')

    const listRef = useRef(null)

      // auto-scroll to bottom when messages change
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo(
        { top: listRef.current.scrollHeight, behavior: "smooth" }
    );
  }, [messages, open]);

    const send = async(e)=>{
        e.preventDefault()
        const msg = text.trim()
        if(!msg) return;
       
        setError('')
        setText('')

        setMessages(prev=>[...prev,{role:'user',content:msg}])

        try{
            setLoading(true)
            const res = await aiApi.ask(token,msg)
            setMessages((prev)=>[...prev,{role:'assistant',content:res.reply}])
        }catch(err){
            setError(err.message || "Ai request failed")
        }finally{
                setLoading(false)
            }
        }

    
    return (
        <>
            <button
                onClick={()=>setOpen(true)}
                style={{
                position: "fixed",
                right: 18,
                bottom: 18,
                width: 54,
                height: 54,
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
                zIndex: 9999,
                fontSize: 20,
                fontWeight: 700,
                }}
                aria-label="Open AI assistant"
                title="AI assistant"
             >
                AI
            </button>

            {open &&(
                <Modal
                    title="AI Assistant"
                    onClose={()=>{
                        if (loading) return
                        setOpen(false)
                    }}
                >
                    {error &&<ErrorBanner message={error} onClose={()=> setError('')}/>}
              <div
                    ref={listRef}
                    style={{
                    height: "45vh",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    background: "#fafafa",
                    }}
                  >

                    {messages.length ===0 ?(
                        <p style={{ margin: 0, opacity: 0.7 }}
                        >
                         ask AI Assistant
                        </p>
                        ):(
                       messages.map((m,indx)=>(
                            <div 
                                key={indx}
                                style={{
                                    alignSelf: m.role==='user'?'flex-end' :'flex-start',
                                    maxWidth: "80%",
                                    padding: "8px 10px",
                                    borderRadius: 12,
                                    background: m.role === "user" ? "#e8f0ff" : "white",
                                    border: "1px solid #e5e5e5",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {m.content}
                            </div>
                         ))
                        )}
              </div>
                    <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 10 }} >
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message…"
                            disabled={loading}
                            style={{ flex: 1, padding: "10px 12px" }}
                            maxLength={500}
                        />
                        <button type='submit' disabled={loading || !text.trim()}>
                            send
                        </button>
                    </form>
             {loading && (
                    <div style={{ marginTop: 10 }}>
                    <LoadingSpinner label="Thinking..." />
                    </div>
                )}  
             </Modal>
            )}
        </>
    )
    }

