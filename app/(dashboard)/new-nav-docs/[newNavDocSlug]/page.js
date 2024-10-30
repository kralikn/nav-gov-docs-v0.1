import { getPdfLinksFromNAVGov } from "@/utils/actions"
import NewInformationBooklets from "@/components/new-information-booklets";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

export default async function InformationBookletsPage({ params }) {

  const queryClient = new QueryClient()
  const { newNavDocSlug } = await params

  await queryClient.fetchQuery({
    queryKey: ['new-booklets', newNavDocSlug],
    queryFn: () => getPdfLinksFromNAVGov(newNavDocSlug),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewInformationBooklets newNavDocSlug={newNavDocSlug} />
    </HydrationBoundary>
  )
}
