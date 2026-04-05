"use client";

import { CollectionCard } from "@/components/CollectionCard";
import { useCollections } from "@/context/CollectionContext";

export function Collections() {
  const { collections, loading } = useCollections();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-8 bg-gray-50 rounded-lg">
          No collections yet. Create your first collection to get started.
        </p>
      ) : (
        collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))
      )}
    </div>
  );
}
