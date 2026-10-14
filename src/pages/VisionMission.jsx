import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Earth,
  Zap,
  UsersRound,
  ArrowUpRight,
} from "lucide-react";

const VISION_MISSION_CARDS = [
  {
    id: "environment",
    icon: Earth,
    number: "01",
    title: "Cleaner Environment",
    description:
      "Report overflowing garbage, damaged roads, water leaks, and other civic problems to help create cleaner, safer, and healthier communities.",
  },
  {
    id: "resolution",
    icon: Zap,
    number: "02",
    title: "Faster Resolution",
    description:
      "Follow issue statuses through a centralized digital platform that helps citizens and responsible teams stay informed throughout the resolution process.",
  },
  {
    id: "community",
    icon: UsersRound,
    number: "03",
    title: "Citizen Empowerment",
    description:
      "Give every citizen a voice in local improvement by reporting public issues and contributing to a more accountable, connected community.",
  },
];

const VisionCard = memo(function VisionCard({
  icon: Icon,
  number,
  title,
  description,
  index,
  reduceMotion,
}) {
  const cardVariants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            delay: index * 0.1,
            ease: "easeOut",
          },
        },
      };

  return (
    <motion.article
      variants={cardVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 motion-reduce:transform-none motion-reduce:transition-none sm:p-8"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
          <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <span className="text-sm font-semibold tracking-widest text-base-content/30">
          {number}
        </span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-base-content sm:text-2xl">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-7 text-base-content/65 sm:text-base">
        {description}
      </p>

      <div className="mt-7 flex items-center gap-2 border-t border-base-300 pt-5 text-sm font-semibold text-primary">
        <span>Building better communities</span>
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150 motion-reduce:transition-none"
      />
    </motion.article>
  );
});

const VisionMission = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="vision-mission-heading"
      className="relative overflow-hidden bg-base-200 py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary sm:text-sm">
            What drives us
          </span>

          <h2
            id="vision-mission-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-base-content sm:text-4xl lg:text-5xl"
          >
            Our Vision &amp;{" "}
            <span className="text-primary">Mission</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-base-content/65 sm:text-base sm:leading-8">
            We believe better communities begin when citizens can speak up,
            civic problems become visible, and progress is easier to follow.
            UrbanFix connects local concerns with collective action.
          </p>
        </header>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {VISION_MISSION_CARDS.map((card, index) => (
            <VisionCard
              key={card.id}
              {...card}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-base-100/80 p-5 text-center sm:mt-10 sm:p-7">
          <p className="text-base font-semibold text-base-content sm:text-lg">
            Better cities start with people who care.
          </p>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Every useful report is a step toward a more responsive community.
          </p>
        </div>
      </div>
    </section>
  );
};

export default memo(VisionMission);