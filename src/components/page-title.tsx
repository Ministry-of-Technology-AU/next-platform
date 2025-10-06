import { WritingText } from "./ui/shadcn-io/writing-text";
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
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary dark:text-secondary-dark" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <WritingText
          className="text-2xl sm:text-3xl font-bold"
          text={text}
          spacing={9}
          transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.25 }}
        />
        {subheading && <ExpandableText text={subheading} />}
      </div>
    </div>
  );
}

export default PageTitle;