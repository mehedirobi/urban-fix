import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ShieldCheck,
  BellRing,
  BarChart3,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      id: 1,
      title: "Easy Issue Reporting",
      description:
        "Report potholes, broken streetlights, drainage problems, and other city issues in just a few clicks.",
      icon: <MapPin size={40} />,
    },
    {
      id: 2,
      title: "Transparent Tracking",
      description:
        "Track issue progress from submission to resolution with complete visibility and accountability.",
      icon: <BarChart3 size={40} />,
    },
    {
      id: 3,
      title: "Verified & Secure",
      description:
        "Every report is securely managed with authenticated users and trusted administration processes.",
      icon: <ShieldCheck size={40} />,
    },
    {
      id: 4,
      title: "Real-Time Updates",
      description:
        "Receive instant notifications and status updates whenever progress is made on reported issues.",
      icon: <BellRing size={40} />,
    },
  ];

  return (
    <section className="py-24 bg-base-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="badge badge-primary badge-lg mb-4">
            Why UrbanFix
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Powerful Features for Smarter Cities
          </h2>

          <p className="text-base-content/70 text-lg">
            UrbanFix helps citizens and authorities work together
            efficiently to identify, track, and resolve urban
            infrastructure issues.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              className="
                group
                bg-base-200
                rounded-3xl
                p-8
                border
                border-base-300
                hover:border-primary/30
                hover:shadow-2xl
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-primary/10
                  flex
                  items-center
                  justify-center
                  text-primary
                  mb-6
                  group-hover:scale-110
                  transition-transform
                  duration-300
                "
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>

              <p className="text-base-content/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;