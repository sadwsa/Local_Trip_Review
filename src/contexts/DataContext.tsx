import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Destination, Category, Tag, Review } from '../types';
import { dbService } from '../models/Database';
import { mockDestinations, mockCategories, mockTags, mockReviews } from '../data/mockData';

interface DataContextType {
  destinations: Destination[];
  categories: Category[];
  tags: Tag[];
  reviews: Review[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  seedMockData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [fetchedDests, fetchedCats, fetchedTags, fetchedRevs] = await Promise.all([
        dbService.destinations.getAll(),
        dbService.categories.getAll(),
        dbService.tags.getAll(),
        // Just fetching all reviews for now
        dbService.reviews.getAll()
      ]);

      setDestinations(fetchedDests);
      setCategories(fetchedCats);
      setTags(fetchedTags);
      setReviews(fetchedRevs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedMockData = async () => {
    setIsLoading(true);
    try {
      // Seed Categories
      for (const cat of mockCategories) {
        await dbService.categories.create(cat, cat.id);
      }
      // Seed Tags
      for (const tag of mockTags) {
        await dbService.tags.create(tag, tag.id);
      }
      // Seed Destinations
      for (const dest of mockDestinations) {
        await dbService.destinations.create(dest, dest.id);
      }
      // Seed Reviews
      for (const rev of mockReviews) {
        await dbService.reviews.create(rev, rev.id);
      }
      await refreshData();
    } catch (error) {
      console.error("Error seeding mock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ destinations, categories, tags, reviews, isLoading, refreshData, seedMockData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
