import { WritingText } from "./ui/shadcn-io/writing-text";
import { TypingText } from "./ui/shadcn-io/typing-text";
import { ExpandableText } from "./expandable-text";

function PageTitle({
  text,
  className = "",
  subheading,
  icon: Icon,
}: {
  text: string;
  subheading?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <WritingText
          className="text-3xl font-bold"
          text={text}
          spacing={9}
          transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.25 }}
        />
        {subheading && (
          <div className="mt-1">
            {/* Desktop view - always show full text */}
            <p className="text-muted-foreground hidden md:block">{subheading}</p>
            
            {/* Mobile view - truncated with dropdown */}
            <div className="md:hidden">
              <ExpandableText text={subheading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  //TODO: Fix subheading, add diff typing effect.
}

export default PageTitle;