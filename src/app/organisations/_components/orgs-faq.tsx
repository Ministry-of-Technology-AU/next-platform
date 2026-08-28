"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "Who can access and manage an organisation account on the platform?",
    answer:
      "Every registered student organisation has an official authenticated login associated with its verified Ashoka email. Organization heads can also share specific role evaluations and interview pipelines with circle leads and panellists without handing over full administrative credentials.",
  },
  {
    question: "How do Platform Advertisements work and where do they appear?",
    answer:
      "When you create an advertisement via the Ads Manager, it appears directly in the prime carousel feed of the student-facing Platform (/platform), seen by thousands of Ashoka students daily. You can schedule precise start/end dates, upload high-res banners, and add custom action buttons linking to application forms or external registration links.",
  },
  {
    question: "How does the Inductions Pipeline keep track of candidate stages?",
    answer:
      "When students submit an application form, their response is automatically linked to your active induction cycle. You can transition candidates across stages (Pending, Shortlisted, Interview Scheduled, Approved, Rejected). Any decision update or feedback note you provide is reflected instantly in the student's personal dashboard under 'My Ongoing Applications'.",
  },
  {
    question: "Can we use custom questions and file uploads in our recruitment forms?",
    answer:
      "Yes! The integrated Form Engine supports short text, essay prompts, multiple-choice radio options, URLs, and file attachments (resumes, design portfolios, writing samples). Student authentication ensures all responses are verified with real @ashoka.edu.in accounts.",
  },
  {
    question: "How do we update our public club details in the Organisations Catalogue?",
    answer:
      "Head to the Organisation Profile page to update your club's description, official logo, banner artwork, taglines, category, and social links. You can also toggle the master 'Inductions Open' status and deadline countdown displayed to the entire student body.",
  },
  {
    question: "Is When2meet integrated for panel and interview scheduling?",
    answer:
      "Yes, the platform includes a native When2meet availability scheduler that allows your core team and interview panellists to highlight their free hours and find overlapping interview slots seamlessly.",
  },
];

export function OrgsFAQ() {
  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col items-start text-left mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-left">
          Got questions? We&apos;ve got answers
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl text-left">
          Everything you need to know about setting up and running your club on Platform.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-lg text-left">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border-b border-border/60 last:border-b-0 py-1"
            >
              <AccordionTrigger className="text-base sm:text-lg font-bold text-foreground hover:text-primary hover:no-underline text-left py-4">
                <span className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8 pt-1 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
