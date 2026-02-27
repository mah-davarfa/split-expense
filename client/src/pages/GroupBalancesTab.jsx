import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { balancesApi } from "../api/balances.api.js"; 


//helper
const money=(n)=>{
     const num= Number( n|| 0)
     return `$${num.toFixed(2)}`
}
const GroupBalancesTab = ()=>{

    const {groupId}= useParams()
    const {getToken}= useAuth()
    const token = getToken()

    const [loading, setLoading]=useState(false)
    const [error,setError]= useState('')
    const [data ,setData]= useState(null)

    useEffect(()=>{

        if(!token || !groupId) return ;

        const load = async()=>{
            try{
                setLoading(true)
                setError('')
                const res = await balancesApi.get(token,groupId);
                setData(res)
            }catch(err){
                setError(err.message || 'failed to load balances')
            }finally{
                setLoading(false)
            }
        }
        load();

    },[token,groupId])

// in data :balances =[
//   { "userId": "u1", "name": "Bob", "balance": 8 },
//   { "userId": "u2", "name": "Sara", "balance": -2 },
//   { "userId": "u3", "name": "Ali", "balance": -6 }
// ]
const balances = useMemo(()=>{
    return data?.balances ||[];
},[data])


const totalEachUserIdPaidFromData= useMemo(()=>{
    return  data?.totalEachUserIdPaid || [];
},[data])

///nameByuserId={userId->name, ...}
const nameByuserId = useMemo(()=>{
    const map = new Map();
    
    for (const b of balances) map.set(b.userId,b.name)
        return map
},[data])
    console.log('data :',data ) ///////////////remove 

    ///in data :totalGroupPaid= [ { _id: null, totalAmount: 200 }]
const totalGroupPaidNumber= useMemo(()=>{
    return Number(data?.totalGroupPaid?.[0]?.totalGroupPaid??0).toFixed(2)
},[data])    
//in data :totalEachUserIdPaid =[{ _id: "u1", totalPaid: 150 },{ _id: "u2", totalPaid: 90 },...]

//array of object total each user paid
const totalEachUserPaidNumber =useMemo(()=>{
    return totalEachUserIdPaidFromData.map((p)=>{
    const user= balances.find((b)=>String(b.userId) === String(p._id))
    return {
        name:user?.name ?? 'unknown',
        total:Number(p.totalEachUserIdPaid).toFixed(2)
    }
})
},[balances, totalEachUserIdPaidFromData])
console.log('totalEachUserIdPaidFromData 1', totalEachUserIdPaidFromData )
console.log('totalEachUserPaidNumber :',totalEachUserPaidNumber)

// console.log('totalEachUserPaid'totalEachUserPaid)
//totalEachUserPaid= [
//   { userId: "u1", name: "Bob", totalPaid: 150 },
//   { userId: "u2", name: "Sara", totalPaid: 90 }
// ]

    return(
        <div>
            <h3>Group Balances</h3>
            {loading && <LoadingSpinner label='Loading Balances ...'/>}
            {error && <ErrorBanner message={error} onClose={()=>setError('')}/>}
            {!loading && !error &&! data &&<p>NO Balances </p> }
            {!loading && !error && data && (
            <>
                <p style={{marginTop:0}}>
                    Split Mode: <strong>{data.splitMode}</strong>
                </p>

                <h4 style={{ marginTop: 16 }}>The Total Group spent: {`$${totalGroupPaidNumber}`}</h4>
                <div style={{ marginTop: 16 }}>
                   <h4 > Each Member Spent </h4>
                {totalEachUserPaidNumber.map((p,idx)=>(
                    <p key={idx}>{`${p.name} paid so far: $${p.total}` }</p>
                ))}
                </div>
                    <h4 style={{ marginTop: 16 }}>Who pays who (settlement)</h4>
                {Array.isArray(data.settelment) && data.settelment.length>0 ?(
                    <div>
                        {data.settelment.map((s,idx)=>(
                            <div key={idx}>
                                <strong>{s.fromName}</strong> pays: ${Number(s.amount).toFixed(2)} to <strong>{s.toName}</strong>
                            </div>
                        ))}
                    </div>
                ):(<p>No Settlement needed(already even)</p>)}    
            
             <p style={{ marginTop: 12, opacity: 0.8 }}>
            Note: If someone voids an expense, the balance will update the next time you load this tab.
          </p>
            </>
        ) }
        </div>
        
    )
}
export default GroupBalancesTab;