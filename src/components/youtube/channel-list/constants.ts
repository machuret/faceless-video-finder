
import { ChannelCategory, ChannelType, ChannelSize, UploadFrequency } from "@/types/youtube";

export const channelCategories: ChannelCategory[] = [
  "entertainment",
  "education",
  "gaming",
  "music",
  "news",
  "sports",
  "technology",
  "other"
];

export interface ChannelTypeInfo {
  id: ChannelType;
  label: string;
  description: string;
  production: string;
  example: string;
}

export const channelTypes: ChannelTypeInfo[] = [
  {
    id: "compilation_montage",
    label: "Compilation / Montage",
    description: "Curate themed highlights (funny moments, best-of sports, viral trends).",
    production: "Gather clips (with correct usage rights), edit them together, add text/music.",
    example: "\"Top 10 Funniest Animal Fails,\" \"Best Goal Saves of the Week.\""
  },
  {
    id: "no_face_reaction",
    label: "\"No-Face\" Reaction / Commentary",
    description: "Respond to trending videos, memes, news segments, or cultural topics using only your voice or text overlays.",
    production: "Overlay commentary on snippets of original content or show an abstract background.",
    example: "\"Voice-Only Reaction to Viral TikTok Dances,\" \"Audio Commentary on Meme Compilations.\""
  },
  {
    id: "documentary_story",
    label: "Documentary / Story-Driven (Voiceover + B-Roll)",
    description: "Narrate in-depth topics (biographies, mysteries, historical events) with supporting visuals.",
    production: "Research, scriptwriting, voiceover, archival images/footage, background music.",
    example: "\"Unsolved Historical Mysteries,\" \"Biographies of Famous Inventors.\""
  },
  {
    id: "whiteboard_explainer",
    label: "Whiteboard / Hand-Drawn Explainer",
    description: "Teach or explain concepts by filming a whiteboard or using whiteboard animation software.",
    production: "Sync your (or a voice actor's) narration with drawn graphics or animated sketches.",
    example: "\"Math 101 Tutorials,\" \"Quick Business Concepts Illustrated.\""
  },
  {
    id: "animation_2d_3d",
    label: "2D / 3D Animation Channel",
    description: "Use animated characters and backgrounds for comedic sketches, short stories, or educational content.",
    production: "Script, storyboard, animate scenes, add voiceovers or text.",
    example: "\"Animated Short Stories,\" \"Cartoon Explainers on Science Topics.\""
  },
  {
    id: "text_based_narrative",
    label: "Text-Based Narrative / Meme-Style Videos",
    description: "Present entire stories, lists, or jokes using on-screen text with background visuals or music.",
    production: "Create slides or motion text, add images or GIFs, pair with suitable music.",
    example: "\"Top 10 Life Hacks in Text,\" \"Scrolling Meme Story Over Epic Music.\""
  },
  {
    id: "screen_recording_tutorial",
    label: "Screen Recording / Tutorial (Voiceover or Text)",
    description: "Show how to use software, code, or navigate websites by capturing your screen.",
    production: "Screen-record step-by-step processes, narrate or add text callouts, edit for clarity.",
    example: "\"Photoshop Basics,\" \"Coding a Simple Website in HTML/CSS.\""
  },
  {
    id: "asmr_ambient",
    label: "ASMR / Ambient / Relaxation",
    description: "Provide soothing sounds (tapping, whispering, nature) or calming visuals (rain, ocean waves) without showing your face.",
    production: "Record high-quality audio, minimal or thematic visuals, careful sound editing.",
    example: "\"Rain Sounds for Sleep,\" \"Whispered Reading of Poetry.\""
  },
  {
    id: "news_aggregation",
    label: "News / Event Aggregation (Voiceover / Text)",
    description: "Summarize trending headlines, world events, or niche industry news in a concise format.",
    production: "Gather info from reputable sources, add voiceover or bullet-point text, use relevant stock images.",
    example: "\"Daily Crypto Market Updates,\" \"Morning Tech News Brief.\""
  },
  {
    id: "stock_footage_voiceover",
    label: "Stock Footage + Voiceover (Lifestyle, Motivational, Educational)",
    description: "Pair a script (motivational speech, educational breakdown) with royalty-free stock videos.",
    production: "Write or source the script, record voiceover or use TTS, overlay stock footage, add background music.",
    example: "\"5 Ways to Boost Productivity,\" \"The Basics of Photosynthesis.\""
  },
  {
    id: "text_to_speech",
    label: "Text-to-Speech (TTS) Channels",
    description: "Use an AI or robotic voice to read scripts or user-submitted content while you stay off-mic.",
    production: "Write or compile text (e.g., Reddit stories), use TTS software, add relevant images or minimal footage.",
    example: "\"r/EntitledParents Stories Read by AI,\" \"Top 10 Facts About Space (TTS Narration).\""
  },
  {
    id: "infographic_data",
    label: "Infographic / Data Visualization",
    description: "Turn data points, stats, or research into animated charts, graphs, and infographics.",
    production: "Gather data, design engaging visuals (After Effects, Tableau, Flourish), and optionally add voiceover.",
    example: "\"Global Population Growth Over Time,\" \"Company Earnings Visualized.\""
  },
  {
    id: "hands_only_demo",
    label: "Hands-Only Demonstration / How-To",
    description: "Show cooking, crafts, or repairs using a top-down or close-up camera angle—only hands visible.",
    production: "Record each step, add text/voiceover instructions, focus on clarity of demonstration.",
    example: "\"Hands-Only Baking Tutorials,\" \"DIY Crafts and Projects,\" \"Home Repair Guides.\""
  },
  {
    id: "audio_only_podcast",
    label: "Audio-Only \"Podcast\" Style (Waveform / Static Background)",
    description: "Post audio discussions or interviews with minimal visuals (a single image or waveform).",
    production: "Record/produce a podcast, add a static or looping background, optionally animate the waveform.",
    example: "\"True Crime Conversations,\" \"Roundtable Discussion on Current Events.\""
  },
  {
    id: "music_curation",
    label: "Music Curation / Lofi / Remix Channels",
    description: "Feature playlists, remixes, or lofi beats with a static or looped animation in the background.",
    production: "Source royalty-free/approved tracks, create a simple visual loop or art piece, compile tracks.",
    example: "\"24/7 Lofi Hip-Hop Radio,\" \"Chill Jazz Instrumentals,\" \"Downtempo Electronic Mix.\""
  },
  {
    id: "ai_generated",
    label: "AI-Generated / AI-Driven Videos",
    description: "Use AI tools (e.g., image generation, voice generation, script writing) to build entire videos without showing your face.",
    production: "Generate visuals (Midjourney, DALL·E), audio (TTS or AI voice), or entire scripts (ChatGPT), then compile and edit.",
    example: "\"AI-Generated Art Timelapse,\" \"Short AI Story Narrations.\""
  },
  {
    id: "original_storytelling",
    label: "Original Fictional Storytelling / Narratives",
    description: "Write and narrate your own fictional tales, from sci-fi to horror to romance, using simple or atmospheric visuals.",
    production: "Script short stories, record voiceover or TTS, add fitting background music or still images for ambiance.",
    example: "\"Short Fantasy Fiction Reads,\" \"Scary Horror Tales Anthology.\""
  },
  {
    id: "history_educational",
    label: "History-Focused / Educational Explainers",
    description: "Specialize in historical timelines, events, or academic topics with voiceover and archival references.",
    production: "Research thoroughly, narrate a chronological script, incorporate maps, images, or reenactment footage.",
    example: "\"History of the Roman Empire,\" \"Major Events of the Renaissance Explained.\""
  },
  {
    id: "fake_trailers",
    label: "Fake Trailers / Fan-Made Trailers",
    description: "Edit clips from movies, games, or shows to create hypothetical \"trailers\" or comedic mash-ups.",
    production: "Collect short clips (under fair use), cleverly edit them with trailer-like music, text overlays, and transitions.",
    example: "\"If Pixar Made a Horror Movie,\" \"Mash-Up Trailer of Two Unrelated Films.\""
  },
  {
    id: "movie_tv_analysis",
    label: "Movie / TV Analysis (Quotes, Alternate Endings, Fan Theories)",
    description: "Dive into plot analysis, character breakdowns, or fan theories for popular media—no need to be on camera.",
    production: "Script your commentary, record voiceover or use text, insert relevant stills/clips (under fair use).",
    example: "\"Hidden Details in [Film],\" \"Fan Theories About [TV Show],\" \"Best Quotes from [Series].\""
  },
  {
    id: "police_cam_commentary",
    label: "Police Cam / Body Cam Footage Commentary",
    description: "Present and analyze body cam or dash cam footage from police or emergency services, adding context or explanations.",
    production: "Source publicly released videos, add voiceover or text commentary, blur sensitive information.",
    example: "\"Breakdown of Police Chase Footage,\" \"Analyzing Body Cam Clips for Safety Lessons.\""
  },
  {
    id: "court_reactions",
    label: "Court Reactions / Legal Commentary",
    description: "Show or summarize courtroom footage and legal proceedings, with commentary on legal strategies, verdicts, or trial highlights.",
    production: "Obtain public-domain courtroom clips, provide legal disclaimers, explain case context.",
    example: "\"Court Case Recaps,\" \"Explaining Famous Trial Moments,\" \"Legal Analysis on High-Profile Verdicts.\""
  },
  {
    id: "live_drama_freakouts",
    label: "Live Drama / Public Freakouts (Faceless Commentary)",
    description: "Feature real-life heated moments, then provide commentary without showing your face.",
    production: "Source publicly available clips, add blurred faces or disclaimers, provide voice-only commentary.",
    example: "\"Public Meltdowns Reviewed,\" \"Live-Recorded Drama with Reaction Commentary.\""
  },
  {
    id: "virtual_avatar",
    label: "Virtual Avatar or VTuber-Style Content",
    description: "Present yourself via an animated or 3D avatar rather than your real face.",
    production: "Use software like Live2D or VRoid Studio to create/animate an avatar, sync your voice to mouth movements.",
    example: "\"VTuber Plays [Game],\" \"Virtual Avatar Podcast Discussions.\""
  },
  {
    id: "found_footage_archival",
    label: "Found Footage / Archival Collection",
    description: "Compile rare or old archive videos, vintage commercials, historical footage, or public domain \"found footage,\" then provide context.",
    production: "Gather free-to-use or public domain videos, arrange them in thematic compilations with commentary.",
    example: "\"Rare 1950s Commercials Revisited,\" \"Historical NASA Footage with Explanations.\""
  },
  {
    id: "other",
    label: "Other",
    description: "Any other type of faceless channel not covered in the categories above.",
    production: "Various production methods depending on the specific content type.",
    example: "Unique or hybrid content formats."
  }
];

export const channelSizes: ChannelSize[] = [
  "small",
  "growing",
  "established",
  "larger",
  "big"
];

export const uploadFrequencies: UploadFrequency[] = [
  "very_low",
  "low",
  "medium",
  "high",
  "very_high",
  "insane"
];

export const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Russia",
  "China",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "New Zealand",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Thailand",
  "Philippines",
  "Vietnam",
  "Poland",
  "Turkey",
  "South Africa",
  "Nigeria",
  "Kenya",
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Israel",
  "Pakistan",
  "Bangladesh",
  "Other"
];
