import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardList,
  Eye,
  UsersRound,
  ArrowUpRight,
} from "lucide-react";

const WHY_ITEMS = [
  {
    id: "reporting",
    number: "01",
    icon: ClipboardList,
    title: "Simple Issue Reporting",
    description:
      "Report civic problems such as damaged roads, overflowing waste, and water leaks through a centralized digital platform.",
  },
  {
    id: "transparency",
    number: "02",
    icon: Eye,
    title: "Transparent Issue Tracking",
    description:
      "Follow issue statuses and review available progress updates to understand how reported community problems are being handled.",
  },
  {
    id: "community",
    number: "03",
    icon: UsersRound,
    title: "Community Participation",
    description:
      "Help bring local concerns to attention, support community awareness, and contribute to a more connected and accountable city.",
  },
];

const WhyCard = memo(function WhyCard({
  item,
  index,
  reduceMotion,
}) {
  const { number, icon: Icon, title, description } = item;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.45,
                delay: index * 0.1,
                ease: "easeOut",
              },
            }
      }
      viewport={{ once: true, amount: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 motion-reduce:transform-none motion-reduce:transition-none sm:p-8"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
          <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
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
        <span>Designed around citizens</span>

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

const WhyChooseUs = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className="relative overflow-hidden border-y border-base-300 bg-base-200 py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 size-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary sm:text-sm">
            The UrbanFix difference
          </span>

          <h2
            id="why-choose-us-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-base-content sm:text-4xl lg:text-5xl"
          >
            Why Choose <span className="text-primary">UrbanFix?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-base-content/65 sm:text-base sm:leading-8">
            Civic issues deserve visibility and community involvement.
            UrbanFix gives citizens a straightforward way to report local
            problems and follow their progress.
          </p>
        </header>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {WHY_ITEMS.map((item, index) => (
            <WhyCard
              key={item.id}
              item={item}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-base-100/80 p-5 text-center sm:mt-10 sm:p-7">
          <p className="text-base font-semibold text-base-content sm:text-lg">
            Your community. Your voice. A better city.
          </p>

          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Small reports can help bring important local problems to light.
          </p>
        </div>
      </div>
    </section>
  );
};

export default memo(WhyChooseUs);