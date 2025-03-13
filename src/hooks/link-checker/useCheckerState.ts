
import { useState } from 'react';
import { BrokenLink, LinkCheckerState } from './types';

export const useCheckerState = (): LinkCheckerState => {
  const [validationResults, setValidationResults] = useState<BrokenLink[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  
  return {
    validationResults,
    isValidating,
    isChecking,
    brokenLinks: validationResults,
    progress,
    checkedCount,
    totalLinks
  };
};
