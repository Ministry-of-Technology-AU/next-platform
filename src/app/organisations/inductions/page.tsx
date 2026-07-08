"use client";
import PageTitle from "@/components/page-title";
import { Hammer } from "lucide-react";
import Image from "next/image";

export default function InductionsPage() {
    return (
        <div className="container pt-12 px-8 flex flex-col items-center">
            <PageTitle text="This page is under construction" icon={Hammer} subheading="We're working hard to get this page ready for you. Stay tuned!" />
            <Image
                src="/mascot-construction.png"
                alt="Mascot Under Construction"
                width={400}
                height={900}
                className="mx-auto"
            />
            <div className="flex flex-col items-center">

                <p className="text-center">We're cooking up something you're gonna absolutely love. Stay tuned to find out!</p>
            </div>
            <p className="text-center pt-10 text-muted-foreground">We're revamping the SG Website too! Stay tuned!</p>

        </div>

    );
}