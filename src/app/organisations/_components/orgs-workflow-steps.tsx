"use client";

import { motion } from "motion/react";
import {
  FilePlus,
  PenTool,
  Megaphone,
  UserCheck2,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Create Cycle & Define Roles",
    subtitle: "Setup & Timeline",
    description:
      "Name your recruitment cycle, specify open roles across departments, and assign evaluation permissions to your circle leads.",
    icon: FilePlus,
    iconColor: "text-primary dark:text-primary-bright",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  {
    step: "02",
    title: "Build Custom Application Form",
    subtitle: "Dynamic Question Engine",
    description:
      "Draft custom essay prompts, portfolio upload blocks, and specific requirements with built-in Ashoka student authentication.",
    icon: PenTool,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    step: "03",
    title: "Broadcast Ads & Catalogue Push",
    subtitle: "Campus-Wide Promotion",
    description:
      "Launch targeted banners on the platform homepage and turn on the 'Inductions Open' badge in the public Organisations Catalogue.",
    icon: Megaphone,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    step: "04",
    title: "Review, Interview & Dispatch",
    subtitle: "Real-Time Decision Sync",
    description:
      "Move applicants through pipeline stages, coordinate interview panels using When2meet, and dispatch official decisions with custom feedback.",
    icon: UserCheck2,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
  },
];

export function OrgsWorkflowSteps() {
  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col items-start text-left mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Streamlined Workflow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-left">
          How to run your induction cycle from start to finish
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl text-left">
          Four simple steps to recruit the best talent on campus with complete clarity for both your team and applicants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative"
            >
              <div className="h-full flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:bg-card/90 text-left">
                <div>
                  {/* Step number badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black tracking-tight text-primary/40 dark:text-primary-light/40">
                      {item.step}
                    </span>
                    <div className={`p-3 rounded-2xl ${item.bgColor} ${item.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="space-y-1 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.subtitle}
                    </p>
                    <h3 className="text-lg font-bold text-foreground leading-snug !text-left">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Step {idx + 1} of 4</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
