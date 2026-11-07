import { Files } from 'lucide-react';
import DeveloperCredits from '@/components/developer-credits';
import { TourStep } from '@/components/guided-tour';
import PageTitle from '@/components/page-title';
import { getWikiData } from './_server/data';
import { PlatformResourcesClient } from './client';

export const dynamic = 'force-dynamic';

export default async function PlatformResourcesPage() {
  const { folders, documents } = await getWikiData();

  return (
    <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-6 lg:px-8">
      <TourStep
        id="page-title"
        title="Ashoka Wiki"
        content="Handbooks, requirement sheets and study material in one place. Favourite a document and it opens first next time."
        order={0}
      >
        <PageTitle
          icon={Files}
          text="Ashoka Wiki"
          subheading="Handbooks, requirement sheets and study material from across Ashoka, in one place. Favourite what you need and it opens first."
          className="mb-6"
        />
      </TourStep>

      <PlatformResourcesClient folders={folders} documents={documents} />

      <DeveloperCredits developers={[{ name: 'Shashwat Bhajanka' }]} />
    </div>
  );
}
