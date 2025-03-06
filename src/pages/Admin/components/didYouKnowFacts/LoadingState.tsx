
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
};

export default LoadingState;
