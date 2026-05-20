import { useParams, useNavigate, useLocation } from "react-router";
import { MapPin, ArrowLeft, Share2, Heart, MessageSquare, Camera, X, Star, Flag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { StarRating } from "../components/StarRating";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { dbService } from "../models/Database";
import { where, increment } from "firebase/firestore";

export function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, toggleSaveDestination } = useAuth();
  const { destinations, reviews: allReviews, refreshData } = useData();
  
  const destination = destinations.find(d => d.id === id);
  const reviews = allReviews.filter(r => r.destinationId === id);
  
  const fromCheckIn = location.state?.fromCheckIn || false;

  const [toast, setToast] = useState<string | null>(null);
  const isSaved = user?.savedDestinations?.includes(id || "") || false;
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // Check if user has already checked in
  useEffect(() => {
    if (user && destination) {
       dbService.checkIns.getAll([
          where('userId', '==', user.id),
          where('destinationId', '==', destination.id)
       ]).then(checkIns => {
          setHasCheckedIn(checkIns.length > 0);
       }).catch(console.error);
    }
  }, [user, destination, refreshData]);

  const [reportingReview, setReportingReview] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  if (!destination) {
    return <div className="p-8 text-center text-slate-500">Destination not found.</div>;
  }

  const allImages = [destination.imageUrl, ...(destination.galleryUrls || [])].filter(Boolean);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // limit 10 photos total
    const remainingSlots = 10 - reviewPhotos.length;
    if (remainingSlots <= 0) {
      setToast("You can only upload up to 10 photos.");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const filesArray = Array.from(files) as File[];
    if (filesArray.length > remainingSlots) {
      setToast(`Only ${remainingSlots} more photo(s) can be added.`);
      setTimeout(() => setToast(null), 3000);
    }

    const allowedFiles = filesArray.slice(0, remainingSlots);
    
    // Compress and convert to base64 to avoid Firestore document size limits (1MB max)
    const filePromises = allowedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
             const canvas = document.createElement("canvas");
             let width = img.width;
             let height = img.height;
             const MAX_DIMENSION = 800; // Limit dimensions to keep file size small
             if (width > height) {
               if (width > MAX_DIMENSION) {
                 height *= MAX_DIMENSION / width;
                 width = MAX_DIMENSION;
               }
             } else {
               if (height > MAX_DIMENSION) {
                 width *= MAX_DIMENSION / height;
                 height = MAX_DIMENSION;
               }
             }
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext("2d");
             ctx?.drawImage(img, 0, 0, width, height);
             // Compress to JPEG with 0.5 quality
             resolve(canvas.toDataURL("image/jpeg", 0.5));
          };
          if (e.target?.result) {
            img.src = e.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(base64Images => {
      setReviewPhotos(prev => [...prev, ...base64Images]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleCheckIn = async () => {
    if (!isAuthenticated || !user) return navigate("/login");
    if (!destination) return;
    
    setIsCheckingIn(true);
    try {
      await dbService.checkIns.create({
        destinationId: destination.id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      // Optionally update local checkin count
      await dbService.destinations.update(destination.id, {
        checkInCount: increment(1)
      } as any);
      setHasCheckedIn(true);
      setToast("Check-in Successful!");
      setTimeout(() => setToast(null), 3000);
      setIsReviewOpen(true);
      await refreshData();
    } catch (error) {
      console.error("Failed to check in:", error);
      setToast("Check-in failed. Please try again.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCloseReview = () => {
    setIsReviewOpen(false);
  };


  return (
    <div className="flex-1 flex flex-col h-full relative bg-slate-50">
        
        {/* Sticky Floating Toast Notification */}
        {toast && (
          <div className="absolute bottom-24 right-4 z-50 animate-bounce">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <MapPin size={12} />
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-24">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
            {allImages.length > 0 ? (
              allImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${destination.name} ${idx + 1}`}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                    idx === currentImageIndex ? "opacity-80 z-0" : "opacity-0 -z-10"
                  )}
                />
              ))
            ) : (
              <div className="absolute inset-0 w-full h-full bg-slate-800" />
            )}
            
            {allImages.length > 1 && (
              <>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all z-10 flex items-center justify-center shadow-lg active:scale-95 touch-manipulation"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all z-10 flex items-center justify-center shadow-lg active:scale-95 touch-manipulation"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {allImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Top actions */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/50 to-transparent">
              <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={async () => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    if (id) await toggleSaveDestination(id);
                  }}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <Heart size={20} className={cn("transition-colors", isSaved && "fill-accent-500 text-accent-500")} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 -mt-6 bg-white relative rounded-t-3xl border-t border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">
                  Destination
                </p>
                <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                  {destination.name}
                </h1>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-xs font-bold font-sans">
                <StarRating rating={destination.averageRating} size={12} />
                <span>{destination.averageRating.toFixed(1)}</span>
                <span className="opacity-80 font-normal">({destination.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100">
                <MapPin size={12} className="text-primary-600" />
                <span>{destination.checkInCount} {destination.checkInCount === 1 ? 'Check-in' : 'Check-ins'}</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {destination.description}
            </p>
            
            {/* Location & Map */}
            <div className="mb-10">
              <h2 className="font-serif italic font-bold text-lg text-slate-900 mb-3">Location</h2>
              {destination.location && (
                <div className="flex items-start gap-2 text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <MapPin size={16} className="text-primary-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{destination.location}</span>
                </div>
              )}
              <a 
                href={destination.location ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.location)}` : `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
                target="_blank" 
                rel="noreferrer"
                className="block text-center w-full font-bold text-xs text-primary-700 bg-primary-50 py-3 rounded-xl hover:bg-primary-100 transition-colors uppercase tracking-wider"
              >
                Get Directions
              </a>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif italic font-bold text-lg text-slate-900">Reviews</h2>
                <button className="text-primary-600 text-xs font-bold uppercase tracking-widest hover:text-primary-700">Write</button>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl relative group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-500">
                            {review.userName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{review.userName}</div>
                            <div className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {(!user || user.id !== review.userId) && (
                          <button 
                            onClick={() => setReportingReview(review.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Report Review"
                          >
                            <Flag size={14} />
                          </button>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={10} className="mb-2" />
                      <p className="text-slate-700 text-xs leading-relaxed mb-2">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                          {review.images.map((img, i) => (
                            <img key={i} src={img} alt="Review" className="w-20 h-20 object-cover rounded-lg snap-start shadow-sm shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 font-medium text-sm">No reviews yet.</p>
                  <p className="text-slate-400 text-xs">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Check-in / Review FAB */}
        <div className="absolute bottom-24 right-6 z-40">
          {hasCheckedIn || fromCheckIn ? (
            <button 
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-2 bg-primary-700 text-white px-5 py-3 rounded-full shadow-lg shadow-primary-700/30 hover:bg-primary-800 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/30 border-2 border-white"
            >
              <Star size={20} />
              <span className="font-bold text-xs uppercase tracking-wider">Review</span>
            </button>
          ) : (
            <button 
              onClick={handleCheckIn}
              className="flex items-center gap-2 bg-primary-700 text-white px-5 py-3 rounded-full shadow-lg shadow-primary-700/30 hover:bg-primary-800 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/30 border-2 border-white"
            >
              <MapPin size={20} />
              <span className="font-bold text-xs uppercase tracking-wider">Check In</span>
            </button>
          )}
        </div>

        {/* Report Review Modal */}
        {reportingReview && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900">Report Review</h3>
                <button onClick={() => setReportingReview(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <p className="text-sm text-slate-600">Please let us know why you are reporting this review. Our moderation team will investigate.</p>
                <div className="flex flex-col gap-2">
                  {['Spam or misleading', 'Inappropriate content', 'Harassment', 'Other'].map(reason => (
                    <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="reportReason" 
                        value={reason} 
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setReportingReview(null)}
                  className="flex-1 py-3 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!user) {
                      setToast("You must be logged in to report a review.");
                      setTimeout(() => setToast(null), 3000);
                      return;
                    }
                    try {
                      await dbService.reports.create({
                        reviewId: reportingReview,
                        reportedByUserId: user.id,
                        reason: reportReason,
                        isResolved: false,
                        createdAt: new Date().toISOString()
                      });
                      setReportingReview(null);
                      setReportReason("");
                      setToast("Review reported successfully");
                      setTimeout(() => setToast(null), 3000);
                    } catch (error) {
                      console.error("Failed to report review:", error);
                      setToast("Failed to report review");
                      setTimeout(() => setToast(null), 3000);
                    }
                  }}
                  disabled={!reportReason}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {isReviewOpen && (
          <div className="absolute inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom-full duration-300">
            <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm z-10 relative">
              <button onClick={handleCloseReview} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                <X size={16} />
              </button>
              <h1 className="font-bold text-base text-slate-900">Write a Review</h1>
              <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 bg-slate-50 flex flex-col">
              <div className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-slate-100 mb-6">
                {destination.imageUrl ? (
                  <img src={destination.imageUrl} alt={destination.name} className="w-16 h-16 rounded-xl object-cover shadow-sm"/>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 shadow-sm border border-slate-200" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {destination.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Share your experience!</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col items-center">
                <p className="text-sm font-bold text-slate-900 mb-3">How was your visit?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                    >
                      <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 2} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all mb-4"
                  placeholder="Tell others about your experience here... what did you love?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                
                {reviewPhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {reviewPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={reviewPhotos.length >= 10}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 hover:bg-slate-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <Camera size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-primary-600">
                    {reviewPhotos.length >= 10 ? "Maximum 10 photos added" : "Add Photos (Max 10)"}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-white border-t border-slate-100 pb-8 sm:pb-8">
              <button 
                onClick={async () => {
                  if (!user || !destination || rating === 0) return;
                  setIsSubmittingReview(true);
                  try {
                    await dbService.reviews.create({
                      destinationId: destination.id,
                      userId: user.id,
                      rating,
                      comment: reviewText,
                      images: reviewPhotos,
                      createdAt: new Date().toISOString(),
                      userName: user.name || "Anonymous",
                      userAvatar: user.avatarUrl
                    });
                    
                    // Simple average update
                    const newCount = (destination.reviewCount || 0) + 1;
                    const oldAvg = destination.averageRating || 0;
                    const newAvg = ((oldAvg * (newCount - 1)) + rating) / newCount;
                    
                    await dbService.destinations.update(destination.id, {
                      reviewCount: newCount,
                      averageRating: newAvg
                    });

                    handleCloseReview();
                    setReviewText("");
                    setReviewPhotos([]);
                    setRating(0);
                    setToast("Review submitted!");
                    setTimeout(() => setToast(null), 3000);
                    await refreshData();
                  } catch (error) {
                    console.error("Failed to submit review:", error);
                    setToast("Failed to submit. Try again.");
                    setTimeout(() => setToast(null), 3000);
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                className="w-full flex justify-center items-center gap-2 bg-primary-700 text-white font-bold py-4 rounded-xl hover:bg-primary-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={rating === 0 || isSubmittingReview || !reviewText.trim()}
              >
                {isSubmittingReview ? <Loader2 className="animate-spin" size={20} /> : "Submit Review"}
              </button>
            </div>
          </div>
        )}

    </div>
  );
}
