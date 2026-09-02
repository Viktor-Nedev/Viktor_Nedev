import { useState } from 'react';
import { motion } from 'motion/react';
import { Reveal, RevealText } from '../ui/Reveal';
import { useT } from '../../i18n';
import { SKILL_GROUPS, skillsByGroup } from '../../data/skills';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/easing';

export function Skills() {
  const t = useT();
  const [hovered, setHovered] = useState<string | null>(null);

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

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.08}>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
                  {t.skills.groups[group]}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {skillsByGroup(group).map((skill) => (
                    <li key={skill.name}>
                      <motion.span
                        onHoverStart={() => setHovered(skill.name)}
                        onHoverEnd={() => setHovered(null)}
                        className={cn(
                          'inline-block cursor-default rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300',
                          skill.core
                            ? 'border-slate-2 bg-slate-1/60 text-chalk'
                            : 'border-slate-2/70 text-mist',
                          hovered === skill.name && 'border-volt text-volt',
                        )}
                        animate={{ y: hovered === skill.name ? -3 : 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        {skill.name}
                      </motion.span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
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
