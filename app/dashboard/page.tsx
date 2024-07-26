import { Button } from "@/components/ui/button";
import { Archive, DeleteIcon, PlusIcon } from "lucide-react";

const CreateNewDocument = () => {
  return (
    <div className="bg-white/30 w-full md:max-w-xs mx-auto border rounded-xl grid place-items-center">
      <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
        <PlusIcon className="w-4 h-4 text-gray-500 md:w-8 md:h-8" />
        <p className="text-sm text-gray-500 mt-2">Add a new document</p>
      </div>
    </div>
  );
};

const DocumentItem = () => {
  return (
    <div className="bg-white/30 w-full md:max-w-sm mx-auto aspect-square  border rounded-xl flex flex-col p-4 lg:p-6">
      <div className="flex-1">
        <h3 className="text-sm text-gray-500 font-semibold">Document Name</h3>
        <p className="text-sm text-gray-500 opacity-80">Date</p>
      </div>
      <Button variant={"destructive"} className="flex">
        <Archive />
        <span className="ml-2">Archive</span>
      </Button>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="p-4 min-h-screen">
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6 max-w-5xl mx-auto ">
        <CreateNewDocument />
        {new Array(3).fill(0).map((_, i) => (
          <DocumentItem key={i} />
        ))}
      </div>
    </div>
  );
}
