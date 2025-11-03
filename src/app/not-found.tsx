"use client";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import Image from "next/image";


export default function LandingPage() {
    return (
        <div className="container pt-14 px-8 flex flex-col items-center">
        <PageTitle text="404 Page Not Found" icon={SearchX} subheading="The page you're looking for probably doesn't exist."/>
        <Image
        src="/mascot-not-found.png"
        alt="Mascot Under Construction"
        width={400}
        height={900}
        className="mx-auto"
      />
      <div className="flex flex-col items-center">

      <p className="text-center">Or maybe you just mistyped?</p>
      <p className="text-center pt-4 text-muted-foreground">It's okay. We all make mistakes.</p>

      <Button
        onClick={() => (window.location.href = "/platform")}
        className="mt-4 text-sm sm:text-base px-4 sm:px-6 hover:underline hover:text-primary-bright"
        variant="animatedGhost"
      >
        Click here to go back to Platform
      </Button>
      </div>

        </div>
        
    );
}