"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Collection } from "@/types/collection";
import { api } from "@/lib/api";

interface CollectionContextType {
  collections: Collection[];
  loading: boolean;
  createCollection: (data: { name: string; description?: string }) => Promise<Collection>;
  updateCollection: (
    id: string,
    data: { name: string; description?: string }
  ) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  refreshCollections: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      api.setUserId(session.user.id);
      fetchCollections();
    }
  }, [session?.user?.id]);

  const fetchCollections = async () => {
    try {
      const collections = await api.getCollections();
      setCollections(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (data: { name: string; description?: string }) => {
    const newCollection = await api.createCollection(data);
    setCollections((prev) => [newCollection, ...prev]);
    return newCollection;
  };

  const updateCollection = async (id: string, data: { name: string; description?: string }) => {
    const updatedCollection = await api.updateCollection(id, data);
    setCollections((prev) =>
      prev.map((collection) => (collection.id === id ? updatedCollection : collection))
    );
    return updatedCollection;
  };

  const deleteCollection = async (id: string) => {
    await api.deleteCollection(id);
    setCollections((prev) => prev.filter((collection) => collection.id !== id));
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        loading,
        createCollection,
        updateCollection,
        deleteCollection,
        refreshCollections: fetchCollections
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollections must be used within a CollectionProvider");
  }
  return context;
}
