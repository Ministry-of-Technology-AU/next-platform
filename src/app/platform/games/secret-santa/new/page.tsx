import { Gift } from "lucide-react"
import PageTitle from "@/components/page-title"
import { auth } from "@/auth"
import { CreateStepper } from "../_components/create-stepper"
import { fallbackName } from "../utils"

// Reads the session for the default name.
export const dynamic = "force-dynamic"

export default async function NewSecretSantaPage() {
    const session = await auth()
    const email = session?.user?.email ?? ""
    const defaultName = session?.user?.name?.trim() || (email ? fallbackName(email) : "")

    return (
        <>
            <PageTitle
                icon={Gift}
                text="Start a Secret Santa"
                subheading="Three quick steps. You can change any of this later, until you draw names."
            />
            <div className="mt-6 sm:mt-8">
                <CreateStepper defaultName={defaultName} />
            </div>
        </>
    )
}
