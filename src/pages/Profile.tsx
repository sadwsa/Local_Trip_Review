import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router";
import { LogOut, Settings, Award, MapPin, Heart, ArrowLeft, X, Edit2, UploadCloud } from "lucide-react";
import React, { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { useData } from "../contexts/DataContext";
import { dbService } from "../models/Database";
import { resizeImageToBase64 } from "../utils/imageUtils";
import { where } from "firebase/firestore";

export function Profile() {
  const { user, logout, isAuthenticated, isLoading, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { reviews, destinations } = useData();

  const [checkInsCount, setCheckInsCount] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorDesc, setErrorDesc] = useState("");

  useEffect(() => {
    if (user) {
      dbService.checkIns.getAll([where('userId', '==', user.id)]).then(checkIns => {
        const validCheckIns = checkIns.filter(checkIn => 
          destinations.some(d => d.id === checkIn.destinationId)
        );
        setCheckInsCount(validCheckIns.length);
      }).catch(console.error);

      setEditName(user.name || "");
      setEditAvatarUrl(user.avatarUrl || "");
      setEditBio(user.bio || "");
    }
  }, [user, destinations]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userReviewsCount = reviews.filter(
    (r) => r.userId === user.id && destinations.some(d => d.id === r.destinationId)
  ).length;

  const savedCount = user.savedDestinations?.filter(id => 
    destinations.some(d => d.id === id)
  ).length || 0;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorDesc("");
    try {
      await updateUserProfile({
        name: editName,
        avatarUrl: editAvatarUrl,
        bio: editBio
      });
      setIsEditModalOpen(false);
      setIsSaving(false);
    } catch (err: any) {
      setErrorDesc(err.message || "Failed to update profile");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-primary-900 text-white">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
             <ArrowLeft size={16} />
          </button>
          <h1 className="font-serif italic font-bold text-lg">Profile</h1>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <Settings size={16} />
          </button>
        </div>

        {/* Scrollable Mobile Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24">
          <div className="absolute top-0 left-0 right-0 h-40 bg-primary-900 rounded-b-[40px] z-0"></div>
          
          <div className="relative z-10 px-5 pt-24">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col items-center">
              <div className="relative -mt-16 mb-4">
                <img 
                  src={user.avatarUrl || "https://i.pravatar.cc/150"} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                />
              </div>
              
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Award size={12} /> {user.role}
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 text-xs font-medium">{user.email}</p>
              <p className="text-slate-600 mt-3 text-sm text-center leading-relaxed px-4">{user.bio || "Avid traveler exploring the corners of the world."}</p>
              
              {/* Stats px-2Bar */}
              <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-100 mt-6 pt-5">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{checkInsCount}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1"><MapPin size={10}/> Visits</div>
                </div>
                <div className="text-center border-l border-r border-slate-100">
                  <div className="text-xl font-bold text-slate-900">{savedCount}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-1"><Heart size={10}/> Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userReviewsCount}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reviews</div>
                </div>
              </div>
            </div>

            {/* Action Menu */}
            <div className="space-y-3">
               {user.role === 'Admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full bg-white px-5 py-4 rounded-2xl flex items-center justify-between text-primary-700 font-bold text-sm hover:bg-primary-50 transition-colors shadow-sm border border-primary-100 uppercase tracking-wider"
                >
                  <span>Admin Dashboard</span>
                  <Settings size={16} className="text-primary-400" />
                </button>
              )}
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full bg-white px-5 py-4 rounded-2xl flex items-center justify-between text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm uppercase tracking-wider border border-slate-100"
              >
                <span>Edit Profile</span>
                <Edit2 size={16} className="text-slate-400" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full bg-white px-5 py-4 rounded-2xl flex items-center justify-between text-red-600 font-bold text-sm hover:bg-red-50 transition-colors shadow-sm mt-6 uppercase tracking-wider border border-red-100"
              >
                <span>Log Out</span>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-50 animate-in slide-in-from-bottom-full duration-300">
            <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm z-10 relative">
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                <X size={16} />
              </button>
              <h1 className="font-serif italic font-bold text-lg text-primary-900">Edit Profile</h1>
              <div className="w-8"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {errorDesc && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl">
                    {errorDesc}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Avatar</label>
                  <div className="flex items-center gap-4 mt-2">
                    {editAvatarUrl ? (
                      <div className="relative group">
                        <img src={editAvatarUrl} className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200" alt="Avatar map" />
                        <button 
                          type="button" 
                          onClick={() => setEditAvatarUrl("")}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                         <UploadCloud size={20} />
                      </div>
                    )}
                    <div className="flex-1 relative">
                       <input 
                         type="file" 
                         accept="image/*"
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         onChange={async (e) => {
                           if (!e.target.files?.[0]) return;
                           const file = e.target.files[0];
                           setIsSaving(true);
                           try {
                             const base64 = await resizeImageToBase64(file);
                             setEditAvatarUrl(base64);
                           } catch (err) {
                             setErrorDesc("Failed to process image");
                           } finally {
                             setIsSaving(false);
                           }
                         }}
                       />
                       <button type="button" className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors pointer-events-none active:bg-slate-100">
                         {editAvatarUrl ? "Change Avatar" : "Upload Avatar"}
                       </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium resize-none" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-primary-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 mt-4"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
