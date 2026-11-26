import NotFoundComponent from "@/components/not-found"

export default function SecretSantaNotFound() {
    return (
        <NotFoundComponent
            title="This Secret Santa doesn't exist"
            description="The link may be wrong, or the host deleted it. Ask the host for a new link."
            showExploreSuggestions={false}
        />
    )
}
