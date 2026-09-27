import { Reveal, RevealText } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { useI18n, useT } from '../../i18n';
import { featuredProjects } from '../../data/projects';
import type { Project } from '../../data/types';

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const t = useT();
  const { lang } = useI18n();
  // The two award winners lead the grid at double width.
  const wide = index < 2;

  return (
    <Reveal delay={(index % 3) * 0.07} className={wide ? 'sm:col-span-2' : ''}>
      <TiltCard className="group h-full" intensity={5}>
        <article className="surface noise edge-glow sheen relative flex h-full flex-col overflow-hidden rounded-2xl p-7 transition-colors duration-500 group-hover:border-volt/40 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-display text-2xl sm:text-3xl">{project.name}</h3>
            {project.award && (
              <span
                className="shrink-0 rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-wider"
                style={{ color: 'var(--color-gold)', borderColor: 'rgba(255,184,77,0.35)' }}
              >
                {project.award[lang]}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-volt/90">{project.tagline[lang]}</p>
          <p className="mt-4 flex-1 text-mist">{project.description[lang]}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-slate-2 px-2.5 py-1 font-mono text-[0.7rem] text-mist"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-1.5 text-chalk transition-colors hover:text-volt"
              >
                {t.work.live}
                <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">↗</span>
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mist transition-colors hover:text-chalk"
              >
                {t.work.code}
              </a>
            )}
            {project.devpost && (
              <a
                href={project.devpost}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mist transition-colors hover:text-chalk"
              >
                {t.work.devpost}
              </a>
            )}
          </div>
        </article>
      </TiltCard>
    </Reveal>
  );
}

export function Work() {
  const t = useT();

  return (
    <section id="work" className="section-y relative">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.work.title}</p>
          </Reveal>
          <RevealText text={t.work.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.work.lede}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
