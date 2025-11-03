import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  bannerImage: string;
  href: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function GameCard({ 
  bannerImage, 
  href, 
  name, 
  description, 
  isActive 
}: GameCardProps) {
  const displayDescription = isActive ? description : "COMING SOON!";
  
  return (
    <div className={`border rounded-lg p-4 shadow hover:shadow-lg transition aspect-square flex flex-col ${
      isActive ? '' : 'opacity-50 grayscale'
    }`}>
      <Image
        src={bannerImage}
        alt={name}
        width={400}
        height={200}
        className="rounded-md mb-4 flex-shrink-0 object-cover"
      />
      <h2 className="text-xl font-semibold mb-2 text-left">{name}</h2>
      <p className="mb-4 flex-grow text-center">
        {displayDescription}
      </p>
      {isActive ? (
        <Link href={href} className="w-full">
          <Button className="w-full" variant='animated'>
            Play Now
          </Button>
        </Link>
      ) : (
        <Button 
          className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed w-full"
          disabled
        >
          Coming Soon
        </Button>
      )}
    </div>
  );
}