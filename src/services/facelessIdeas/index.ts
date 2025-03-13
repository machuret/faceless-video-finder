
import { fetchFacelessIdeas, fetchFacelessIdeaById } from './fetchService';
import { createFacelessIdea, updateFacelessIdea, deleteFacelessIdea } from './mutationService';
import { processCsvImport } from './importService';
import { FacelessIdeaInfo, FacelessIdeaCreateInput, FacelessIdeaUpdateInput, CsvImportResult } from './types';

// Validate faceless idea ID format (only lowercase letters, numbers, and underscores)
export const validateFacelessIdeaId = (id: string): boolean => {
  const regex = /^[a-z0-9_]+$/;
  return regex.test(id);
};

// Re-export the types and functions
export type { 
  FacelessIdeaInfo, 
  FacelessIdeaCreateInput, 
  FacelessIdeaUpdateInput,
  CsvImportResult
};

export { 
  fetchFacelessIdeas, 
  fetchFacelessIdeaById,
  createFacelessIdea,
  updateFacelessIdea,
  deleteFacelessIdea,
  processCsvImport
  // validateFacelessIdeaId is already exported above, don't need to re-export
};

// Export default fallback data
export const DEFAULT_FACELESS_IDEAS: FacelessIdeaInfo[] = [
  {
    id: "compilation",
    label: "Compilation Videos",
    description: "Create videos that compile interesting clips, facts, or moments around a specific theme",
    image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000",
    production: "Source clips from stock footage or with proper permissions, edit them together with transitions, add background music and captions",
    example: "Top 10 Movie Scenes, Amazing Animal Moments, Funniest Fails"
  },
  {
    id: "data_visualization",
    label: "Data Visualization",
    description: "Videos that present data, statistics, and facts in visually engaging ways",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
    production: "Research topic thoroughly, create animations using tools like After Effects or Blender, add voiceover narration",
    example: "Country GDP Comparisons, Population Growth Visualized, Climate Change Statistics"
  },
  {
    id: "relaxation",
    label: "Relaxation/Ambient Videos",
    description: "Calming videos with beautiful scenery, sounds, or ambient music to help viewers relax",
    image_url: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?q=80&w=1000",
    production: "Record or source high-quality nature footage, add ambient sounds or gentle music, edit for smooth transitions",
    example: "Thunderstorm Sounds, Fireplace with Crackling Sounds, Ocean Waves"
  },
  {
    id: "tutorials",
    label: "Tutorial Videos",
    description: "Step-by-step guides teaching viewers how to accomplish specific tasks",
    image_url: "https://images.unsplash.com/photo-1544819675-9fc1c24badf3?q=80&w=1000",
    production: "Plan each step clearly, record screen or process, add clear voiceover instructions, include text annotations",
    example: "Excel Tips and Tricks, Adobe Photoshop Basics, DIY Home Repairs"
  }
];
