
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchRandomFact, DidYouKnowFact } from "@/services/didYouKnowService";
import { Loader2, Info } from "lucide-react";

const DidYouKnowFactComponent = () => {
  const [fact, setFact] = useState<DidYouKnowFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRandomFact = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading random fact for Did You Know component");
        const randomFact = await fetchRandomFact();
        console.log("Random fact loaded:", randomFact ? "success" : "no fact found");
        setFact(randomFact);
      } catch (err) {
        console.error("Error loading random fact:", err);
        setError("Failed to load fact");
      } finally {
        setLoading(false);
      }
    };

    loadRandomFact();
  }, []);

  if (loading) {
    return (
      <Card className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  if (error || !fact) {
    return (
      <Card className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <Info className="h-5 w-5 mr-2" />
          <span>No facts available at the moment</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-3">Did You Know?</h3>
      <div className="text-gray-700 space-y-2 text-lg">
        <p className="font-semibold text-blue-700">{fact.title}</p>
        <div dangerouslySetInnerHTML={{ __html: fact.content }} />
      </div>
    </Card>
  );
};

export default DidYouKnowFactComponent;
