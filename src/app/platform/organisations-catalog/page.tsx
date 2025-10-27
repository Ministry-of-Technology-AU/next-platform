import PageTitle from "@/components/page-title";
import { CataloguePage } from "./client";
import { FileStack } from "lucide-react";

export default function OrganisationsCatalogPage() {
    return <div className="pt-6 px-6">
    <PageTitle icon={FileStack} text="Organizations Catalog" subheading="Discover and join various clubs, societies, and departments on campus." />
    <CataloguePage />
    </div>;
    }