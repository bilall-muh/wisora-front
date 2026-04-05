"use client";

import { useState, useEffect, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useCollections } from "@/context/CollectionContext";
import { Collection } from "@/types/collection";

interface CreateCollectionDialogProps {
  collection?: Collection;
  onUpdateSuccess?: (collection: Collection) => void;
  children?: ReactNode;
}

const collectionSchema = z.object({
  name: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional()
});

export function CreateCollectionDialog({
  collection,
  onUpdateSuccess,
  children
}: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!collection;
  const { createCollection, updateCollection } = useCollections();

  const form = useForm<z.infer<typeof collectionSchema>>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name || "",
      description: collection?.description || ""
    }
  });

  useEffect(() => {
    if (open && collection) {
      form.reset({
        name: collection.name,
        description: collection.description || ""
      });
    }
  }, [open, collection, form]);

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    const toastId = toast.loading(isEditing ? "Updating collection..." : "Creating collection...");
    try {
      setIsLoading(true);

      if (isEditing && collection) {
        const updatedCollection = await updateCollection(collection.id, values);
        onUpdateSuccess?.(updatedCollection);
        toast.success("Collection updated successfully", { id: toastId });
      } else {
        await createCollection(values);
        toast.success("Collection created successfully", { id: toastId });
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update collection" : "Failed to create collection", {
        id: toastId
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ||
          (isEditing ? (
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          ) : (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Collection" : "Create Collection"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your collection here."
              : "Add a new collection to organize your content."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter collection title"
                      className="h-10 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter collection description"
                      className="min-h-[80px] px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                    Briefly describe the purpose of this collection.
                  </FormDescription>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="h-9 px-4 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-9 px-4 text-sm font-medium">
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
