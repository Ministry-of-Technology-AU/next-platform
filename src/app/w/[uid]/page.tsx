import { redirect } from 'next/navigation'

export default async function ShortLinkPage({
    params,
}: {
    params: Promise<{ uid: string }>
}) {
    const { uid } = await params
    redirect(`/platform/when2meet/${uid}`)
}
