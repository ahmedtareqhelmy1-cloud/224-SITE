import React, {useState} from 'react'

export default function AASTDiscountButton({total, onApply}){
  const [show, setShow] = useState(false)
  const [reg, setReg] = useState('')
  const [msg, setMsg] = useState('')

  function apply(){
    const valid = /^(19|20|21|22|23|25)\//.test(reg)
    if(!valid){ setMsg('❌ Invalid AAST registration number.'); return }
    const newTotal = Math.round(total * 0.85)
    setMsg('✅ AAST student discount applied: 15% off your total.')
    onApply(newTotal)
  }

  return (
    <div>
      {!show && <button className="btn btn-outline-primary" onClick={()=>setShow(true)}>🎓 I’m an AAST Student — Get 15% Off</button>}
      {show && (
        <div className="mt-2">
          <input className="form-control mb-2" placeholder="Enter Your Registration Number" value={reg} onChange={e=>setReg(e.target.value)} />
          <div className="d-flex">
            <button className="btn btn-primary me-2" onClick={apply}>Apply</button>
            <button className="btn btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
          </div>
          {msg && <div className="mt-2 text-info">{msg}</div>}
        </div>
      )}
    </div>
  )
}
