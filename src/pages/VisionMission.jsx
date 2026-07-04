import React, { memo } from "react";

const VISION_MISSION_CARDS = [
  {
    emoji: "🌍",
    title: "Cleaner Environment",
    desc: "Report problems like garbage overflow, damaged roads, or water leakage and help keep your city clean and healthy.",
  },
  {
    emoji: "⚡",
    title: "Faster Resolution",
    desc: "Track issue status in real time and get faster responses through a smart digital system designed for efficiency.",
  },
  {
    emoji: "🤝",
    title: "Citizen Empowerment",
    desc: "Every reported issue contributes to a better city — empowering citizens to actively participate in community improvement.",
  },
];

const VisionCard = memo(function VisionCard({ emoji, title, desc }) {
  return (
    <article
      className="bg-base-100 p-8 rounded-2xl shadow-md min-h-[320px]
        flex flex-col items-center text-center
        border border-transparent
        transition-all duration-300 motion-reduce:transition-none
        hover:border-primary focus-within:border-primary
        hover:shadow-2xl hover:shadow-primary/20
        hover:-translate-y-2 motion-reduce:hover:translate-y-0"
    >
      <div className="text-5xl md:text-6xl mb-5" aria-hidden="true">
        {emoji}
      </div>

      <h3 className="text-xl md:text-2xl font-semibold mb-3 text-base-content">
        {title}
      </h3>

      <p className="text-base-content/70 text-base md:text-lg leading-relaxed">
        {desc}
      </p>
    </article>
  );
});

const VisionMission = () => {
  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Our Vision & Mission
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VISION_MISSION_CARDS.map((card) => (
            <VisionCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(VisionMission);