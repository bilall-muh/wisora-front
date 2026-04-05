"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CreateCollectionDialog } from "@/components/CreateCollectionDialog";
import { Pencil, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Collection } from "@/types/collection";
import { useCollections } from "@/context/CollectionContext";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const { deleteCollection, updateCollection } = useCollections();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading("Deleting collection...");
    try {
      await deleteCollection(collection.id);
      toast.success("Collection deleted successfully", { id: toastId });
    } catch {
      toast.error("Failed to delete collection", { id: toastId });
    }
  };

  const handleCardClick = () => {
    router.push(`/chat/${collection.slug}`);
  };

  const handleUpdateSuccess = async (updatedCollection: Collection) => {
    try {
      await updateCollection(collection.id, {
        name: updatedCollection.name,
        description: updatedCollection.description
      });
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    }
  };

  return (
    <Card
      className="w-full group cursor-pointer transition-all hover:shadow-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold truncate text-zinc-900 dark:text-zinc-100">
            {collection.name}
          </h3>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <CreateCollectionDialog collection={collection} onUpdateSuccess={handleUpdateSuccess}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Pencil className="h-4 w-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" />
              <span className="sr-only">Edit collection</span>
            </Button>
          </CreateCollectionDialog>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" />
            <span className="sr-only">Delete collection</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {collection.description || "No description provided"}
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <span className="flex items-center">
              {collection.documentCount} {collection.documentCount === 1 ? "document" : "documents"}
            </span>
            <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
