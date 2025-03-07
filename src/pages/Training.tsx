
import React, { useEffect } from "react";

const TrainingPage = () => {
  useEffect(() => {
    // Redirect to external facelesstraining.com site
    window.location.href = "https://facelesstraining.com/";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-lg">Redirecting to training site...</p>
    </div>
  );
};

export default TrainingPage;
