export type SkillGroup = 'frontend' | 'backend' | 'mobile' | 'ai' | 'tools';

export interface Skill {
  name: string;
  group: SkillGroup;
  /** Drives visual weight — core skills read larger and brighter. */
  core?: boolean;
}

/** Mirrors the technical skills section of the CV. */
export const skills: Skill[] = [
  // Frontend
  { name: 'HTML / CSS', group: 'frontend', core: true },
  { name: 'JavaScript', group: 'frontend', core: true },
  { name: 'TypeScript', group: 'frontend', core: true },
  { name: 'React', group: 'frontend', core: true },
  { name: 'Tailwind CSS', group: 'frontend', core: true },
  { name: 'Three.js', group: 'frontend', core: true },
  { name: 'GSAP', group: 'frontend' },
  { name: 'p5.js', group: 'frontend' },
  { name: 'Bootstrap', group: 'frontend' },
  { name: 'Svelte', group: 'frontend' },

  // Backend & data
  { name: 'C#', group: 'backend', core: true },
  { name: 'ASP.NET', group: 'backend', core: true },
  { name: 'Entity Framework', group: 'backend', core: true },
  { name: 'SQL', group: 'backend', core: true },
  { name: 'Node.js', group: 'backend', core: true },
  { name: 'Express', group: 'backend' },
  { name: 'Firebase', group: 'backend' },
  { name: 'Supabase', group: 'backend' },
  { name: 'Docker', group: 'backend' },
  { name: 'Python', group: 'backend' },

  // Mobile & games
  { name: 'Flutter', group: 'mobile', core: true },
  { name: 'Dart', group: 'mobile', core: true },
  { name: 'Unity', group: 'mobile', core: true },
  { name: 'Kotlin', group: 'mobile' },
  { name: 'React Native', group: 'mobile' },
  { name: 'WebGL', group: 'mobile' },

  // APIs & AI
  { name: 'Gemini API', group: 'ai', core: true },
  { name: 'Claude API', group: 'ai', core: true },
  { name: 'TensorFlow.js', group: 'ai' },
  { name: 'MediaPipe', group: 'ai' },
  { name: 'Mapbox API', group: 'ai' },

  // Tools
  { name: 'Git / GitHub', group: 'tools', core: true },
  { name: 'Visual Studio', group: 'tools' },
  { name: 'VS Code', group: 'tools' },
  { name: 'Vite', group: 'tools' },
  { name: 'Figma', group: 'tools' },
];

export const skillsByGroup = (group: SkillGroup) => skills.filter((s) => s.group === group);

export const SKILL_GROUPS: SkillGroup[] = ['frontend', 'backend', 'mobile', 'ai', 'tools'];
