export type Role = 'Admin' | 'Customer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: Role;
  savedDestinations?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  location?: string;
  imageUrl: string;
  galleryUrls: string[];
  latitude: number;
  longitude: number;
  categoryId: string;
  tags: string[]; // Tag IDs
  averageRating: number;
  reviewCount: number;
  checkInCount: number;
  isLiked?: boolean; // Hydrated for current user
  isSaved?: boolean; // Hydrated for current user
}

export interface Review {
  id: string;
  destinationId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: string;
  userName: string;
  userAvatar?: string;
}

export interface CheckIn {
  id: string;
  destinationId: string;
  userId: string;
  timestamp: string;
}

export interface Report {
  id: string;
  reviewId: string;
  reportedByUserId: string;
  reason: string;
  isResolved: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
