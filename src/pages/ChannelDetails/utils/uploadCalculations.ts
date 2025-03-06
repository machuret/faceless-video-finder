
// Calculate the monthly upload rate based on start date and video count
export const calculateMonthlyUploadRate = (startDate: string | null, videoCount: number | null): number | null => {
  if (!startDate || !videoCount) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate months difference
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
  
  // Avoid division by zero or very small numbers
  if (diffMonths < 0.1) return videoCount;
  
  return videoCount / diffMonths;
};

interface UploadRateCategory {
  label: string;
  color: string;
}

// Get the upload rate category based on the monthly upload rate
export const getUploadRateCategory = (monthlyRate: number | null): UploadRateCategory => {
  if (!monthlyRate) return { label: "N/A", color: "text-gray-500" };
  
  if (monthlyRate >= 60) return { label: "Insanely High (2+ per day)", color: "text-red-600" };
  if (monthlyRate >= 30) return { label: "Very High (Daily)", color: "text-orange-600" };
  if (monthlyRate >= 20) return { label: "High (Every 1-2 days)", color: "text-yellow-600" };
  if (monthlyRate >= 8) return { label: "Normal (2-4 per week)", color: "text-green-600" };
  if (monthlyRate >= 4) return { label: "Medium-Low (1-2 per week)", color: "text-blue-600" };
  if (monthlyRate >= 2) return { label: "Low (Every 10-15 days)", color: "text-indigo-600" };
  return { label: "Very Low (Less than monthly)", color: "text-purple-600" };
};
