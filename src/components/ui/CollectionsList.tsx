import { FC } from "react";
import { Pencil, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";

interface Collection {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  fileSize: number;
}

interface CollectionsListProps {
  collections: Collection[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CollectionsList: FC<CollectionsListProps> = ({ collections, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          className="group relative hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800/50 bg-white"
        >
          <CardHeader className="space-y-1">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl font-bold line-clamp-1">{collection.title}</CardTitle>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onEdit(collection.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit collection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onDelete(collection.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete collection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {collection.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{formatFileSize(collection.fileSize)}</span>
              </div>
              <time dateTime={collection.createdAt.toISOString()}>
                {formatDate(collection.createdAt)}
              </time>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
