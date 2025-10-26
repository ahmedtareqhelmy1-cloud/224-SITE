import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { storage, firebaseFunctions } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Profile() {
  const { isSignedIn, user } = useUser();
  const initialAvatar = useMemo(() => {
    const img = user?.imageUrl || '';
    return img;
  }, [user]);

  const [profile, setProfile] = useState({ displayName: '', bio: '', avatarUrl: '' });
  const [uploadPct, setUploadPct] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.fullName || '',
        bio: user.publicMetadata?.bio || '',
        avatarUrl: initialAvatar
      });
    }
  }, [user, initialAvatar]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    try {
      const storageRef = ref(storage, `users/${user.id}/avatar_${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        task.on('state_changed', (snap) => {
          try {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setUploadPct(pct);
          } catch {}
        }, reject, async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            setProfile((p) => ({ ...p, avatarUrl: url }));
            resolve();
          } catch (e) { reject(e); }
        });
      });
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Avatar upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    try {
      await firebaseFunctions.saveUserProfile({
        id: user.id,
        displayName: profile.displayName,
        bio: profile.bio,
        email: user.emailAddresses?.[0]?.emailAddress,
        avatarUrl: profile.avatarUrl
      });
      alert('Profile saved');
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile');
    } finally {
      setBusy(false);
    }
  }

  if (!isSignedIn) return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="alert alert-info shadow-sm">Please sign in to view your profile.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row g-4 align-items-start">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-body-tertiary">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                <img src={profile.avatarUrl || (import.meta.env.BASE_URL + 'assets/Logo.svg')} alt="Avatar" className="rounded-circle border" style={{ width: 140, height: 140, objectFit: 'cover' }} onError={(e)=>{ e.currentTarget.src = (import.meta.env.BASE_URL + 'assets/Logo.svg'); }} />
                <label className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-pill">
                  Change
                  <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                </label>
              </div>
              {uploadPct > 0 && uploadPct < 100 && (
                <div className="progress" role="progressbar" aria-valuenow={uploadPct} aria-valuemin="0" aria-valuemax="100">
                  <div className="progress-bar" style={{ width: `${uploadPct}%` }}>{uploadPct}%</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Your Profile</h5>
              <div className="mb-3">
                <label className="form-label">Display Name</label>
                <input className="form-control" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
                <a className="btn btn-outline-secondary" href="#" onClick={(e)=>{ e.preventDefault(); setProfile(p=>({ ...p, displayName: user?.fullName||'', bio: user?.publicMetadata?.bio||'' })); }}>Reset</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
