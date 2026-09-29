import {
  siBootstrap,
  siClaude,
  siCss,
  siDart,
  siDocker,
  siDotnet,
  siExpress,
  siFigma,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siGooglegemini,
  siGreensock,
  siHtml5,
  siJavascript,
  siKotlin,
  siMapbox,
  siMediapipe,
  siNodedotjs,
  siP5dotjs,
  siPython,
  siReact,
  siSupabase,
  siSvelte,
  siTailwindcss,
  siTensorflow,
  siThreedotjs,
  siTypescript,
  siUnity,
  siVite,
  siWebgl,
  type SimpleIcon,
} from 'simple-icons';

export type SkillGroup = 'frontend' | 'backend' | 'mobile' | 'ai' | 'tools';

export interface Skill {
  name: string;
  group: SkillGroup;
  /** Drives visual weight — core skills read larger and brighter. */
  core?: boolean;
  /** Official logo from Simple Icons (CC0). */
  icon?: SimpleIcon;
  /**
   * Monogram for tools with no logo in the library - Microsoft withdrew
   * C#, Visual Studio, VS Code, SQL Server and Entity Framework from it.
   */
  mono?: string;
}

/** Mirrors the technical skills section of the CV. */
export const skills: Skill[] = [
  // Frontend
  { name: 'HTML', group: 'frontend', core: true, icon: siHtml5 },
  { name: 'CSS', group: 'frontend', core: true, icon: siCss },
  { name: 'JavaScript', group: 'frontend', core: true, icon: siJavascript },
  { name: 'TypeScript', group: 'frontend', core: true, icon: siTypescript },
  { name: 'React', group: 'frontend', core: true, icon: siReact },
  { name: 'Tailwind CSS', group: 'frontend', core: true, icon: siTailwindcss },
  { name: 'Three.js', group: 'frontend', core: true, icon: siThreedotjs },
  { name: 'GSAP', group: 'frontend', icon: siGreensock },
  { name: 'p5.js', group: 'frontend', icon: siP5dotjs },
  { name: 'Bootstrap', group: 'frontend', icon: siBootstrap },
  { name: 'Svelte', group: 'frontend', icon: siSvelte },

  // Backend & data
  { name: 'C#', group: 'backend', core: true, mono: 'C#' },
  { name: 'ASP.NET', group: 'backend', core: true, icon: siDotnet },
  { name: 'Entity Framework', group: 'backend', core: true, mono: 'EF' },
  { name: 'SQL', group: 'backend', core: true, mono: 'SQL' },
  { name: 'Node.js', group: 'backend', core: true, icon: siNodedotjs },
  { name: 'Express', group: 'backend', icon: siExpress },
  { name: 'Firebase', group: 'backend', icon: siFirebase },
  { name: 'Supabase', group: 'backend', icon: siSupabase },
  { name: 'Docker', group: 'backend', icon: siDocker },
  { name: 'Python', group: 'backend', icon: siPython },

  // Mobile & games
  { name: 'Flutter', group: 'mobile', core: true, icon: siFlutter },
  { name: 'Dart', group: 'mobile', core: true, icon: siDart },
  { name: 'Unity', group: 'mobile', core: true, icon: siUnity },
  { name: 'Kotlin', group: 'mobile', icon: siKotlin },
  { name: 'React Native', group: 'mobile', icon: siReact },
  { name: 'WebGL', group: 'mobile', icon: siWebgl },

  // APIs & AI
  { name: 'Gemini API', group: 'ai', core: true, icon: siGooglegemini },
  { name: 'Claude API', group: 'ai', core: true, icon: siClaude },
  { name: 'TensorFlow.js', group: 'ai', icon: siTensorflow },
  { name: 'MediaPipe', group: 'ai', icon: siMediapipe },
  { name: 'Mapbox API', group: 'ai', icon: siMapbox },

  // Tools
  { name: 'Git', group: 'tools', core: true, icon: siGit },
  { name: 'GitHub', group: 'tools', core: true, icon: siGithub },
  { name: 'Visual Studio', group: 'tools', mono: 'VS' },
  { name: 'VS Code', group: 'tools', mono: '{ }' },
  { name: 'Vite', group: 'tools', icon: siVite },
  { name: 'Figma', group: 'tools', icon: siFigma },
];

export const skillsByGroup = (group: SkillGroup) => skills.filter((s) => s.group === group);

/** Laid out as two rows: three wide groups, then the two short ones side by side. */
export const SKILL_ROWS: SkillGroup[][] = [
  ['frontend', 'backend', 'mobile'],
  ['ai', 'tools'],
];

/**
 * A brand colour that stays visible on the pale ice ground.
 *
 * Several official colours are near-white (Unity is #FFFFFF) or pale
 * (JavaScript's yellow), and would vanish on hover. Anything under 3:1
 * against white is darkened until it passes.
 */
export function readableBrand(hex: string): string {
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const luminance = (c: number[]) =>
    c
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);

  let rgb = channels;
  for (let step = 0; step < 20; step++) {
    const contrast = 1.05 / (luminance(rgb) + 0.05);
    if (contrast >= 3) break;
    rgb = rgb.map((v) => Math.round(v * 0.86));
  }
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
