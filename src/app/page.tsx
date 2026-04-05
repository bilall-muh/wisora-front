import { CreateCollectionDialog } from "@/components/CreateCollectionDialog";
import { Collections } from "@/components/Collections";

export default async function Home() {
  return (
    <main className="container mx-auto py-10">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Collections</h1>
          <CreateCollectionDialog />
        </div>

        <Collections />
      </div>
    </main>
  );
}
