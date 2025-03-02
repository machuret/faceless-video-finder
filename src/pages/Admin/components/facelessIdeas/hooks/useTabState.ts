
import { useState } from "react";

export const useTabState = () => {
  const [activeTab, setActiveTab] = useState("list");
  
  return {
    activeTab,
    setActiveTab
  };
};
