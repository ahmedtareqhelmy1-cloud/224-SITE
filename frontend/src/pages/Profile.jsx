import React, {useEffect, useState} from 'react'
import { useUser } from '@clerk/clerk-react'

export default function Profile(){
  const { isSignedIn, user } = useUser()
  const [profile, setProfile] = useState({displayName:'',bio:''})
  useEffect(()=>{
    if(user){ setProfile({displayName:user.fullName || '', bio: user.publicMetadata?.bio || ''}) }
  },[user])

  function save(){
    // Save profile to Firestore
    (async ()=>{
      try{
        const { firebaseFunctions } = await import('../config/firebase');
        await firebaseFunctions.saveUserProfile({ id: user.id, displayName: profile.displayName, bio: profile.bio, email: user.emailAddresses?.[0]?.emailAddress });
        alert('Profile saved')
      }catch(err){
        console.error('Failed to save profile:', err);
        alert('Failed to save profile')
      }
    })()
  }

  if(!isSignedIn) return <div className="container py-5">Please sign in to view your profile.</div>

  return (
    <div className="container py-5">
      <h2>Profile</h2>
      <div className="mb-3">
        <label className="form-label">Display Name</label>
        <input className="form-control" value={profile.displayName} onChange={e=>setProfile({...profile,displayName:e.target.value})} />
      </div>
      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea className="form-control" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} />
      </div>
      <button className="btn btn-primary" onClick={save}>Save</button>
    </div>
  )
}
