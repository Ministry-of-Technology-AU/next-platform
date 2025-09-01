import { WritingText } from "./ui/shadcn-io/writing-text";
import { TypingText } from "./ui/shadcn-io/typing-text";


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
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-8 w-8 text-primary" />}
      <div className="flex flex-col">
        <WritingText
          className="text-3xl font-bold"
          text={text}
          spacing={9}
          transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.25 }}
        />
        {subheading && <p className="text-muted-foreground">{subheading}</p>}
        {/* {subheading && <TypingText
          text={subheading}
          duration={20}
          cursor={false}
          loop={false}
          holdDelay={2000}
          className="text-muted-foreground"
        />} */}
      </div>
    </div>
  );
  //TODO: Fix subheading, add diff typing effect.
}

export default PageTitle;