import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  User, 
  Category, 
  Tag, 
  Destination, 
  Review, 
  CheckIn, 
  Report, 
  FAQ 
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ------------------------------------
// Base Repository
// ------------------------------------
class BaseRepository<T extends { id: string }> {
  constructor(public collectionPath: string) {}

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, this.collectionPath), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionPath);
      return [];
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionPath, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as T;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionPath}/${id}`);
      return null;
    }
  }

  async create(data: Omit<T, 'id'>, customId?: string): Promise<string> {
    const colRef = collection(db, this.collectionPath);
    const docRef = customId ? doc(colRef, customId) : doc(colRef);
    try {
      await setDoc(docRef, data);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docRef.path);
      return '';
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath, id);
      await updateDoc(docRef, data as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionPath}/${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionPath}/${id}`);
    }
  }
}

// ------------------------------------
// Specific Repositories
// ------------------------------------
export class UserRepository extends BaseRepository<User> {
  constructor() { super('users'); }
}

export class CategoryRepository extends BaseRepository<Category> {
  constructor() { super('categories'); }
}

export class TagRepository extends BaseRepository<Tag> {
  constructor() { super('tags'); }
}

export class DestinationRepository extends BaseRepository<Destination> {
  constructor() { super('destinations'); }
}

export class ReviewRepository extends BaseRepository<Review> {
  constructor() { super('reviews'); }
}

export class CheckInRepository extends BaseRepository<CheckIn> {
  constructor() { super('checkIns'); }
}

export class ReportRepository extends BaseRepository<Report> {
  constructor() { super('reports'); }
}

export class FAQRepository extends BaseRepository<FAQ> {
  constructor() { super('faqs'); }
}

export const dbService = {
  users: new UserRepository(),
  categories: new CategoryRepository(),
  tags: new TagRepository(),
  destinations: new DestinationRepository(),
  reviews: new ReviewRepository(),
  checkIns: new CheckInRepository(),
  reports: new ReportRepository(),
  faqs: new FAQRepository(),
};
