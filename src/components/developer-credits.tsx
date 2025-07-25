interface Developer{
    name: string;
    role: string;
    profileUrl?: string;
}

interface DeveloperProps{
    developers: Developer[];
}

export default function DeveloperCredits({developers}: DeveloperProps) {
    return (
      <div className="text-center text-sm text-muted-foreground border-t pt-8">
        <p>
          Feature developed by{" "}
          {developers.map((dev, index) => (
            <span key={dev.name}>
              <a
                href={dev.profileUrl || "#"}
                className="text-primary hover:underline font-medium"
              >
                <span className="font-bold">{dev.name}</span> - {dev.role}
              </a>
              {index < developers.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    );
}