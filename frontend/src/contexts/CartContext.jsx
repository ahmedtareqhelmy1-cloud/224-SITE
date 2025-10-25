import React, {createContext, useContext, useEffect, useState} from 'react'

const CartContext = createContext()

export function CartProvider({children}){
  const [items,setItems] = useState(()=>{
    try{ const raw = localStorage.getItem('cart'); return raw ? JSON.parse(raw) : [] }catch(e){return []}
  })

  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(items)) },[items])

  function add(item){
    setItems(prev=>{
      const found = prev.find(p=>p.id===item.id)
      if(found) return prev.map(p=>p.id===item.id?{...p,qty:p.qty+item.qty}:p)
      return [...prev,{...item,qty:item.qty||1}]
    })
  }
  function remove(id){ setItems(prev=>prev.filter(p=>p.id!==id)) }
  function updateQty(id,qty){ setItems(prev=>prev.map(p=>p.id===id?{...p,qty}:p)) }
  function clear(){ setItems([]) }

  const subtotal = items.reduce((s,i)=>s + (i.salePrice || i.price) * (i.qty||1),0)

  return <CartContext.Provider value={{items,add,remove,updateQty,clear,subtotal}}>{children}</CartContext.Provider>
}

export const useCart = ()=> useContext(CartContext)
