
import React, { createContext, useState, useContext, ReactNode } from "react";

export interface NicheInfo {
  name: string;
  description: string | null;
  example: string | null;
  image_url: string | null;
  cpm: number | null;
}

interface NicheContextType {
  selectedNiche: string | null;
  setSelectedNiche: (niche: string | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  nicheDetails: Record<string, NicheInfo>;
  setNicheDetails: (details: Record<string, NicheInfo>) => void;
  refreshNiches: () => void;
  setRefreshNiches: (callback: () => void) => void;
}

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export const NicheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [nicheDetails, setNicheDetails] = useState<Record<string, NicheInfo>>({});
  const [refreshNiches, setRefreshNiches] = useState<() => void>(() => {});

  return (
    <NicheContext.Provider
      value={{
        selectedNiche,
        setSelectedNiche,
        isFormOpen,
        setIsFormOpen,
        nicheDetails,
        setNicheDetails,
        refreshNiches,
        setRefreshNiches,
      }}
    >
      {children}
    </NicheContext.Provider>
  );
};

export const useNicheContext = (): NicheContextType => {
  const context = useContext(NicheContext);
  if (context === undefined) {
    throw new Error("useNicheContext must be used within a NicheProvider");
  }
  return context;
};
