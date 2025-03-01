
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction: React.FC = () => {
  return (
    <div className="mt-16 mb-8 max-w-3xl mx-auto text-center">
      <h3 className="text-2xl font-semibold mb-4">Ready to grow your YouTube channel?</h3>
      <p className="text-gray-600 mb-8">
        Start your journey to YouTube success today with our comprehensive training program.
        Learn at your own pace and implement proven strategies for channel growth.
      </p>
      <Link to="/calculators">
        <Button size="lg" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors">
          Explore All Calculators
        </Button>
      </Link>
      <p className="mt-4 text-sm text-gray-500">
        Want to see channel examples? <Link to="/" className="text-blue-600 hover:underline">Browse examples</Link>
      </p>
    </div>
  );
};

export default CallToAction;
