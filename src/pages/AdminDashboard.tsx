import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Navigate, Link } from "react-router";
import { LayoutDashboard, MapPin, Tag, Flag, Plus, Edit, Trash2, CheckCircle, XCircle, Search, UploadCloud, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { dbService } from "../models/Database";
import { resizeImageToBase64 } from "../utils/imageUtils";
import { LocationInput } from "../components/LocationInput";

import { removeVietnameseTones } from "../utils/stringUtils";

export function AdminDashboard() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { seedMockData, isLoading, destinations, categories, tags, refreshData } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'destinations' | 'categories' | 'moderation'>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");

  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [destName, setDestName] = useState("");
  const [destDescription, setDestDescription] = useState("");
  const [destLocation, setDestLocation] = useState("");
  const [destLat, setDestLat] = useState<number | undefined>(undefined);
  const [destLng, setDestLng] = useState<number | undefined>(undefined);
  const [destCategory, setDestCategory] = useState("");
  const [destImages, setDestImages] = useState<string[]>([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [tagNameInput, setTagNameInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: string, id: string, name: string } | null>(null);
  
  const [reports, setReports] = useState<any[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, any>>({});
  const [isFetchingReports, setIsFetchingReports] = useState(false);
  const [usersCount, setUsersCount] = useState<number>(0);
  
  useEffect(() => {
    setIsFetchingReports(true);
    dbService.reports.getAll().then(async (fetchedReports) => {
      setReports(fetchedReports);
      const reviewIds = Array.from(new Set(fetchedReports.map(r => r.reviewId)));
      const map: Record<string, any> = {};
      for (const rId of reviewIds) {
        const rev = await dbService.reviews.getById(rId);
        if (rev) {
          map[rId] = rev;
        }
      }
      setReviewsMap(map);
    }).catch(console.error).finally(() => setIsFetchingReports(false));

    dbService.users.getAll().then(users => {
      setUsersCount(users.length);
    }).catch(console.error);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex overflow-hidden h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-primary-700 font-bold text-xl tracking-tight flex items-center gap-2 mb-2 hover:text-primary-800">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xs">
              EXE
            </div>
            <span>EXE101</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Admin Management</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('destinations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'destinations' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MapPin size={20} /> Destinations
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'categories' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Tag size={20} /> Categories & Tags
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'moderation' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Flag size={20} /> Moderation
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
            <img src={user.avatarUrl || "https://i.pravatar.cc/150"} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-xl italic font-semibold text-slate-900 font-serif capitalize">{activeTab === 'dashboard' ? 'Explorer Dashboard' : activeTab.replace('-', ' ')}</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Live
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50">
          {activeTab === 'dashboard' && (
            <>
              <h2 className="font-bold text-lg mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-primary-500">
                  <div className="text-slate-500 text-sm font-medium mb-1">Total Destinations</div>
                  <div className="text-3xl font-bold text-slate-900">{destinations.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-accent-500">
                  <div className="text-slate-500 text-sm font-medium mb-1">Active Users</div>
                  <div className="text-3xl font-bold text-slate-900">{usersCount}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                  <div className="text-slate-500 text-sm font-medium mb-1">Pending Reports</div>
                  <div className="text-3xl font-bold text-slate-900">{reports.filter(r => !r.isResolved).length}</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'destinations' && (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Manage Destinations</h2>
                <button 
                  onClick={() => {
                    setEditingDestination(null);
                    setSelectedTags([]);
                    setDestName("");
                    setDestDescription("");
                    setDestCategory("");
                    setDestLocation("");
                    setDestLat(undefined);
                    setDestLng(undefined);
                    setDestImages([]);
                    setIsDestinationModalOpen(true);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 text-sm shadow-sm"
                >
                  <Plus size={16} /> Add Destination
                </button>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 p-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search destinations..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-700">Image</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                      <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {destinations.filter(dest => {
                      const q = removeVietnameseTones(searchQuery.toLowerCase());
                      const nameNorm = removeVietnameseTones(dest.name.toLowerCase());
                      const descNorm = removeVietnameseTones(dest.description.toLowerCase());
                      return nameNorm.includes(q) || descNorm.includes(q);
                    }).map(dest => (
                      <tr key={dest.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          {dest.imageUrl ? (
                            <img src={dest.imageUrl} alt={dest.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 rounded-lg border border-slate-200" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{dest.name}</td>
                        <td className="px-6 py-4 text-slate-500">{categories.find(c => c.id === dest.categoryId)?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 flex justify-end gap-2 text-slate-400">
                           <button 
                             onClick={() => {
                               setEditingDestination(dest);
                               setSelectedTags(dest.tags || []);
                               setDestName(dest.name || "");
                               setDestDescription(dest.description || "");
                               setDestCategory(dest.categoryId || "");
                               setDestLocation(dest.location || "");
                               setDestLat(dest.latitude);
                               setDestLng(dest.longitude);
                               setDestImages([dest.imageUrl, ...(dest.galleryUrls || [])].filter(Boolean));
                               setIsDestinationModalOpen(true);
                             }}
                             className="p-1.5 hover:bg-slate-200 hover:text-primary-600 rounded transition-colors" title="Edit"
                           >
                             <Edit size={16} />
                           </button>
                           <button 
                             onClick={() => {
                               setDeletingItem({ type: 'destination', id: dest.id, name: dest.name });
                               setIsDeleteModalOpen(true);
                             }}
                             className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete"
                           >
                             <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="flex flex-col gap-8">
              {/* Categories */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Categories</h2>
                  <button 
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryNameInput("");
                      setIsCategoryModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Plus size={16} /> Add Category
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Destinations Count</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                          <td className="px-6 py-4 text-slate-500">{destinations.filter(d => d.categoryId === cat.id).length}</td>
                          <td className="px-6 py-4 flex justify-end gap-2 text-slate-400">
                            <button 
                              onClick={() => {
                                setEditingCategory(cat);
                                setCategoryNameInput(cat.name);
                                setIsCategoryModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-200 hover:text-primary-600 rounded transition-colors" title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setDeletingItem({ type: 'category', id: cat.id, name: cat.name });
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

               {/* Tags */}
               <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Tags (Keywords)</h2>
                  <button 
                    onClick={() => {
                      setEditingTag(null);
                      setTagNameInput("");
                      setIsTagModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Plus size={16} /> Add Tag
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group">
                      <span className="text-slate-700 font-medium">{tag.name}</span>
                      <button 
                        onClick={() => {
                          setDeletingItem({ type: 'tag', id: tag.id, name: tag.name });
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <XCircle size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="flex flex-col gap-8">
               <div>
                <h2 className="font-bold text-lg mb-4 text-amber-600">Pending Reports</h2>
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                  {isFetchingReports ? (
                    <div className="p-8 text-center text-slate-500">Loading reports...</div>
                  ) : reports.filter(r => !r.isResolved).length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending reports to review.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold text-slate-700">Reporter ID</th>
                          <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                          <th className="px-6 py-4 font-semibold text-slate-700 min-w-[300px]">Review Content</th>
                          <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.filter(r => !r.isResolved).map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900" title={report.reportedByUserId}>{report.reportedByUserId.slice(0, 8)}...</td>
                            <td className="px-6 py-4 text-amber-600 font-medium">{report.reason}</td>
                            <td className="px-6 py-4 text-slate-500 italic max-w-[300px] truncate">
                               {reviewsMap[report.reviewId]?.comment || "(Review not found)"}
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                               <button 
                                  className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors" 
                                  title="Approve Report & Hide Review"
                                  onClick={async () => {
                                      try {
                                          await dbService.reviews.delete(report.reviewId);
                                          await dbService.reports.update(report.id, { isResolved: true });
                                          setReports(prev => prev.map(r => r.id === report.id ? { ...r, isResolved: true } : r));
                                          
                                          const review = reviewsMap[report.reviewId];
                                          if (review) {
                                            const destId = review.destinationId;
                                            const dest = destinations.find(d => d.id === destId);
                                            if (dest) {
                                              const newCount = Math.max(0, (dest.reviewCount || 1) - 1);
                                              let newAvg = 0;
                                              if (newCount > 0) {
                                                const totalRating = (dest.averageRating || 0) * (dest.reviewCount || 1);
                                                newAvg = (totalRating - review.rating) / newCount;
                                              }
                                              await dbService.destinations.update(destId, {
                                                reviewCount: newCount,
                                                averageRating: newAvg
                                              });
                                            }
                                          }
                                          await refreshData();
                                      } catch (error) {
                                          console.error('Failed to accept report and delete review:', error);
                                      }
                                  }}
                               ><CheckCircle size={18} /></button>
                               <button 
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors" 
                                  title="Dismiss Report (Keep Review)"
                                  onClick={async () => {
                                      try {
                                          await dbService.reports.update(report.id, { isResolved: true });
                                          setReports(prev => prev.map(r => r.id === report.id ? { ...r, isResolved: true } : r));
                                      } catch (error) {
                                          console.error('Failed to dismiss report:', error);
                                      }
                                  }}
                               ><XCircle size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

               <div>
                <h2 className="font-bold text-lg mb-4 text-green-600">Resolved Reports</h2>
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                  {isFetchingReports ? (
                    <div className="p-8 text-center text-slate-500">Loading reports...</div>
                  ) : reports.filter(r => r.isResolved).length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No resolved reports.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold text-slate-700">Reporter ID</th>
                          <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                          <th className="px-6 py-4 font-semibold text-slate-700 min-w-[300px]">Review Content</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.filter(r => r.isResolved).map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50 opacity-70">
                            <td className="px-6 py-4 font-medium text-slate-900" title={report.reportedByUserId}>{report.reportedByUserId.slice(0, 8)}...</td>
                            <td className="px-6 py-4 text-slate-600">{report.reason}</td>
                            <td className="px-6 py-4 text-slate-500 italic max-w-[300px] truncate">
                               {reviewsMap[report.reviewId]?.comment || "(Review deleted)"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit/Create Destination Modal */}
      {isDestinationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg">{editingDestination ? 'Edit Destination' : 'Add Destination'}</h3>
              <button onClick={() => setIsDestinationModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm flex flex-col">
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={destName} onChange={e => setDestName(e.target.value)} placeholder="Destination Name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Description</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-24 resize-none" value={destDescription} onChange={e => setDestDescription(e.target.value)} placeholder="Describe the destination..."></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Location (Address)</label>
                <LocationInput 
                   location={destLocation} 
                   onChangeLocation={(addr, lat, lng) => {
                     setDestLocation(addr);
                     if (lat !== undefined) setDestLat(lat);
                     if (lng !== undefined) setDestLng(lng);
                   }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Category</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={destCategory} onChange={e => setDestCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Images (Max 10)</label>
                
                {destImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {destImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                        <img src={img} alt={`Destination upload ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setDestImages(destImages.filter((_, i) => i !== idx));
                          }}
                          className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {destImages.length < 10 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept="image/*" 
                      multiple
                      onChange={async (e) => {
                        if (!e.target.files) return;
                        const files = Array.from(e.target.files) as File[];
                        const availableSlots = 10 - destImages.length;
                        const toProcess = files.slice(0, availableSlots);
                        
                        setIsSaving(true);
                        try {
                          const base64Images = await Promise.all(
                            toProcess.map(file => resizeImageToBase64(file))
                          );
                          setDestImages([...destImages, ...base64Images]);
                        } catch (err) {
                          alert("Failed to read some images.");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    />
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 pointer-events-none">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-primary-600 pointer-events-none mb-1">Click to upload images</p>
                    <p className="text-xs text-slate-500 pointer-events-none">You can add {10 - destImages.length} more image(s)</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={(e) => {
                        e.preventDefault();
                        if (selectedTags.includes(tag.id)) {
                          setSelectedTags(selectedTags.filter((id: string) => id !== tag.id));
                        } else {
                          setSelectedTags([...selectedTags, tag.id]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        selectedTags.includes(tag.id)
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsDestinationModalOpen(false)} 
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                disabled={isSaving}
                onClick={async () => {
                  if (!destName.trim() || !destDescription.trim() || !destCategory || !destLocation.trim() || destImages.length === 0) {
                    setValidationMessage("Please fill in all required fields (Name, Description, Category, Location, and at least one image). Map Coordinates and Tags are optional.");
                    return;
                  }
                  
                  setIsSaving(true);
                  try {
                    const imageUrl = destImages.length > 0 ? destImages[0] : '';
                    const galleryUrls = destImages.slice(1);
                    
                    if (editingDestination) {
                      await dbService.destinations.update(editingDestination.id, {
                        name: destName.trim(),
                        description: destDescription.trim(),
                        categoryId: destCategory,
                        tags: selectedTags,
                        imageUrl,
                        galleryUrls,
                        location: destLocation.trim(),
                        latitude: destLat !== undefined ? destLat : (editingDestination.latitude || 0),
                        longitude: destLng !== undefined ? destLng : (editingDestination.longitude || 0),
                      });
                    } else {
                      await dbService.destinations.create({
                        name: destName.trim(),
                        description: destDescription.trim(),
                        categoryId: destCategory,
                        tags: selectedTags,
                        imageUrl,
                        galleryUrls,
                        location: destLocation.trim(),
                        latitude: destLat !== undefined ? destLat : 0,
                        longitude: destLng !== undefined ? destLng : 0,
                        averageRating: 0,
                        reviewCount: 0,
                        checkInCount: 0,
                      });
                    }
                    await refreshData();
                    setIsDestinationModalOpen(false);
                  } catch (e) {
                    alert("Failed to save destination.");
                  } finally {
                    setIsSaving(false);
                  }
                }} 
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={categoryNameInput} onChange={(e) => setCategoryNameInput(e.target.value)} placeholder="Category Name" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
              <button 
                onClick={async () => {
                  if (!categoryNameInput.trim()) return;
                  setIsSaving(true);
                  try {
                    if (editingCategory) {
                      await dbService.categories.update(editingCategory.id, { name: categoryNameInput.trim() });
                    } else {
                      await dbService.categories.create({ name: categoryNameInput.trim() });
                    }
                    await refreshData();
                    setIsCategoryModalOpen(false);
                  } catch(e) {
                    alert("Failed to save category");
                  } finally {
                    setIsSaving(false);
                  }
                }} 
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg">{editingTag ? 'Edit Tag' : 'Add Tag'}</h3>
              <button onClick={() => setIsTagModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-slate-700">Tag Text</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={tagNameInput} onChange={(e) => setTagNameInput(e.target.value)} placeholder="Tag Text" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsTagModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
              <button
                disabled={isSaving}
                onClick={async () => {
                  if (!tagNameInput.trim()) return;
                  setIsSaving(true);
                  try {
                    if (editingTag) {
                      await dbService.tags.update(editingTag.id, { name: tagNameInput.trim() });
                    } else {
                      await dbService.tags.create({ name: tagNameInput.trim() });
                    }
                    await refreshData();
                    setIsTagModalOpen(false);
                  } catch(e) {
                    alert("Failed to save tag");
                  } finally {
                    setIsSaving(false);
                  }
                }} 
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col text-center p-6 gap-4">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
               <Trash2 size={24} />
             </div>
             <div>
               <h3 className="font-bold text-lg text-slate-900 mb-1">Delete {deletingItem.type}</h3>
               <p className="text-sm text-slate-500">Are you sure you want to delete <span className="font-semibold text-slate-700">"{deletingItem.name}"</span>? This action cannot be undone.</p>
             </div>
             
             <div className="flex gap-3 justify-center w-full mt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >Cancel</button>
                <button 
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      if (deletingItem.type === 'category') {
                        await dbService.categories.delete(deletingItem.id);
                      } else if (deletingItem.type === 'tag') {
                        await dbService.tags.delete(deletingItem.id);
                      } else if (deletingItem.type === 'destination') {
                        await dbService.destinations.delete(deletingItem.id);
                      }
                      await refreshData();
                      setIsDeleteModalOpen(false);
                    } catch(e) {
                      alert("Failed to delete item");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                >{isSaving ? "Deleting..." : "Delete"}</button>
             </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {validationMessage && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 rounded-full p-2 shrink-0">
                <XCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 mb-1">Missing Information</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{validationMessage}</p>
                <button
                  onClick={() => setValidationMessage("")}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
