import { WritingText } from "./ui/shadcn-io/writing-text";


export default function PageTitle({
  text,
  className = "",
    icon: Icon,
}: {
  text: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {Icon && <Icon className="w-8 h-8 text-primary" />}
      <WritingText className="text-3xl text-center font-bold text-neutral-extradark" text={text}>
      </WritingText>
    </div>
  );
}