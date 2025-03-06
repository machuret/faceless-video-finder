
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchRandomFact, DidYouKnowFact } from "@/services/didYouKnowService";
import { Loader2 } from "lucide-react";

const DidYouKnowFactComponent = () => {
  const [fact, setFact] = useState<DidYouKnowFact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRandomFact = async () => {
      try {
        setLoading(true);
        const randomFact = await fetchRandomFact();
        setFact(randomFact);
      } catch (error) {
        console.error("Error loading random fact:", error);
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

  if (!fact) {
    return null;
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
