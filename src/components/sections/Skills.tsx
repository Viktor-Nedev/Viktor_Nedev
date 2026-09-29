import { Reveal, RevealText } from '../ui/Reveal';
import { useT } from '../../i18n';
import { SKILL_ROWS, readableBrand, skillsByGroup, type Skill } from '../../data/skills';
import { cn } from '../../lib/cn';

function SkillLogo({ skill }: { skill: Skill }) {
  if (skill.icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        aria-hidden
        className="shrink-0 fill-current transition-colors duration-300"
      >
        <path d={skill.icon.path} />
      </svg>
    );
  }
  // Tools the icon library no longer carries get a monogram in the same box.
  return (
    <span
      aria-hidden
      className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[4px] bg-current px-[3px] font-mono text-[0.5rem] font-bold leading-none"
    >
      <span className="text-white">{skill.mono}</span>
    </span>
  );
}

function SkillChip({ skill }: { skill: Skill }) {
  // Brand colour is revealed on hover only: at rest every chip shares the
  // page's ink, so forty logos read as one system rather than a sticker wall.
  const brand = skill.icon ? readableBrand(skill.icon.hex) : 'var(--color-volt)';

  return (
    <li>
      <span
        className={cn(
          'group/chip inline-flex cursor-default items-center gap-2 rounded-full border py-1.5 pl-2.5 pr-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5',
          skill.core
            ? 'border-white/90 bg-white/70 text-chalk shadow-[0_4px_14px_-10px_rgba(13,47,82,0.5)]'
            : 'border-slate-2/80 bg-white/35 text-mist',
        )}
        style={{ ['--brand' as string]: brand }}
      >
        <span className="inline-flex text-chalk/80 transition-colors duration-300 group-hover/chip:text-[var(--brand)]">
          <SkillLogo skill={skill} />
        </span>
        {skill.name}
      </span>
    </li>
  );
}

export function Skills() {
  const t = useT();

  return (
    <section id="skills" className="section-y relative">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-eyebrow mb-5">{t.skills.title}</p>
          </Reveal>
          <RevealText text={t.skills.heading} className="text-h2" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-mist">{t.skills.lede}</p>
          </Reveal>
        </div>

        <div className="mt-16 space-y-12">
          {SKILL_ROWS.map((row, ri) => (
            <div
              key={ri}
              className={cn('grid gap-10 sm:grid-cols-2', row.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}
            >
              {row.map((group, gi) => (
                <Reveal key={group} delay={(ri * 3 + gi) * 0.07}>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
                      {t.skills.groups[group]}
                    </h3>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {skillsByGroup(group).map((skill) => (
                        <SkillChip key={skill.name} skill={skill} />
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-14 flex items-center gap-3 font-mono text-sm text-mist">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
            {t.skills.learning}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
