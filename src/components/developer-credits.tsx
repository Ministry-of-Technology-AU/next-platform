interface Developer{
    name: string;
    role?: string;
    profileUrl?: string;
}

interface DeveloperProps{
    developers: Developer[];
}

export default function DeveloperCredits({developers}: DeveloperProps) {
    return (
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t pt-8 mt-8">
        <p>
          Feature developed by{" "}
          {developers.map((dev, index) => (
            <span key={dev.name}>
              <a
                href={dev.profileUrl || "#"}
                target="_blank"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <span className="font-bold">{dev.name}</span>{dev.role ? ` - ${dev.role}` : ""}
              </a>
              {index < developers.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    );
}