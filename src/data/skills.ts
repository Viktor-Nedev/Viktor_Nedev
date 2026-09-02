export type SkillGroup = 'frontend' | 'backend' | 'mobile' | 'tools';

export interface Skill {
  name: string;
  group: SkillGroup;
  /** Drives visual weight — core skills read larger and brighter. */
  core?: boolean;
}

export const skills: Skill[] = [
  // Frontend
  { name: 'HTML', group: 'frontend', core: true },
  { name: 'CSS', group: 'frontend', core: true },
  { name: 'JavaScript', group: 'frontend', core: true },
  { name: 'TypeScript', group: 'frontend', core: true },
  { name: 'React', group: 'frontend', core: true },
  { name: 'Svelte', group: 'frontend' },
  { name: 'Three.js', group: 'frontend', core: true },

  // Backend & data
  { name: 'C#', group: 'backend', core: true },
  { name: 'ASP.NET', group: 'backend', core: true },
  { name: 'Entity Framework', group: 'backend', core: true },
  { name: 'SQL', group: 'backend', core: true },
  { name: 'Node.js', group: 'backend' },
  { name: 'Python', group: 'backend' },

  // Mobile & games
  { name: 'Flutter', group: 'mobile', core: true },
  { name: 'Dart', group: 'mobile', core: true },
  { name: 'Unity', group: 'mobile' },
  { name: 'WebGL', group: 'mobile' },

  // Tools
  { name: 'Git', group: 'tools' },
  { name: 'Vite', group: 'tools' },
  { name: 'GSAP', group: 'tools' },
  { name: 'Figma', group: 'tools' },
];

export const skillsByGroup = (group: SkillGroup) => skills.filter((s) => s.group === group);

export const SKILL_GROUPS: SkillGroup[] = ['frontend', 'backend', 'mobile', 'tools'];
