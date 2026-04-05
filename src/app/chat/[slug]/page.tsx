import { auth } from "@clerk/nextjs/server";
import { ChatInterface } from "../../../components/ChatInterface";
import { FileUploader } from "../../../components/FileUploader";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = await auth();
  const { slug } = await params;

  if (!userId) redirect("/sign-in");

  api.setUserId(userId);
  const collection = await api.getCollectionBySlug(slug);

  if (!collection) redirect("/");

  return (
    <div className="container mx-auto p-4 min-h-screen-with-layout">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* PDF Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6">Upload PDF to Collection ({collection.name})</h2>
          <FileUploader collection={collection} />
        </div>

        {/* Chat Section */}
        <div className="h-full">
          <ChatInterface collection={collection} />
        </div>
      </div>
    </div>
  );
}
