import Banner from "./Banner";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import LatestResolvedIssues from "./LatestResolvedIssues";
import WhyChooseUs from "./WhyChooseUs";
import VisionMission from "./VisionMission";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="bg-base-100">
      {/* Hero Banner */}
      <Banner />

      {/* Latest Issues */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <LatestResolvedIssues />
      </section>

      {/* Features */}
      <section className="bg-base-200">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Features />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <HowItWorks />
      </section>

      {/* Why Choose Us */}
      <section className="bg-base-200">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <WhyChooseUs />
        </div>
      </section>

      {/* Vision Mission */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <VisionMission />
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="
            max-w-5xl
            mx-auto
            rounded-3xl
            bg-primary
            text-primary-content
            p-10
            md:p-16
            text-center
          "
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            Help Build a Better City
          </h2>

          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of citizens working together to
            improve urban infrastructure, report issues, and
            create cleaner, safer communities.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create-issue"
              className="btn btn-neutral rounded-full px-8"
            >
              Report an Issue
            </Link>

            <Link
              to="/all-issues"
              className="btn btn-outline rounded-full px-8"
            >
              Explore Issues
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;