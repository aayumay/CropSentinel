import React, { useState, useEffect } from 'react';
import { useI18n } from '../I18nContext';
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Leaf, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';
import farmerAvatar from '../assets/farmer-avatar.png';
import { updateProfile } from '../services/api';
import { useCropSentinel } from '../state/AppContext';

export default function EditProfileScreen({ onNavigate }) {
  const { t } = useI18n();
  const { state, setState } = useCropSentinel();
  const profile = state.profileData || {};

  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || state.user?.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [photo, setPhoto] = useState(profile.photo || ''); // Initialize empty if no custom photo
  
  const [loading, setLoading] = useState(false);
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(url);
    }
  };
  
  const handleSave = async () => {
    if (!name || !location) return toast.error("Name and Location are required.");
    setLoading(true);
    try {
      const updatedData = { name, email, phone, location };
      const savedProfile = await updateProfile(updatedData);
      
      // Persist photo locally since backend might not support image blobs
      if (photo) {
        localStorage.setItem('cs_profile_photo', photo);
      }

      // Merge updatedData forcefully in case the backend just returns {status: 'success'}
      setState(prev => ({ 
        ...prev, 
        profileData: { 
          ...prev.profileData, 
          ...updatedData, 
          photo: photo || prev.profileData.photo,
          ...(savedProfile.name ? savedProfile : {}) // Only spread savedProfile if it's an actual profile object
        } 
      }));
      toast.success("Profile saved securely!");
      onNavigate('home');
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-max" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)', overflowY: 'auto', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => onNavigate('profile')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow-md)' }}>
          <ArrowLeft size={16} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:18, fontWeight:900, color:'var(--cs-text)', margin:0 }}>Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 24px', gap:8 }}>
        <div style={{ width:80, height:80, borderRadius:24, overflow:'hidden', border:'3px solid var(--cs-border)', position:'relative' }}>
          <img src={photo || farmerAvatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }} />
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--cs-accent)', pointerEvents:'none' }}>Tap to Change Photo</span>
      </div>

      {/* Form fields */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { label:'Full Name',    icon:User,    value:name,     set:setName,     type:'text' },
          { label:'Email',        icon:Mail,    value:email,    set:setEmail,    type:'email' },
          { label:'Phone Number', icon:Phone,   value:phone,    set:setPhone,    type:'tel' },
          { label:'Location',     icon:MapPin,  value:location, set:setLocation, type:'text' }
        ].map(({ label, icon:Icon, value, set, type, placeholder }) => (
          <div key={label}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--cs-text-sec)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</label>
            <div style={{ position:'relative' }}>
              <Icon size={14} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--cs-text-muted)' }} />
              <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder || ''}
                style={{ width:'100%', background:'var(--cs-card)', border:'1.5px solid var(--cs-border)', borderRadius:16, paddingLeft:38, paddingRight:16, paddingTop:13, paddingBottom:13, fontSize:14, color:'var(--cs-text)', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e => e.target.style.borderColor='#4A7C59'}
                onBlur={e => e.target.style.borderColor='#E8E4D8'}
              />
            </div>
          </div>
        ))}

        <button onClick={handleSave} disabled={loading}
          style={{ marginTop:8, width:'100%', background: '#4A7C59', color:'white', fontWeight:700, fontSize:15, padding:'15px', borderRadius:16, border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.3s', opacity: loading ? 0.7 : 1 }}>
          <Save size={16} />
          {loading ? 'Saving to Backend...' : 'Save Profile Details'}
        </button>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
