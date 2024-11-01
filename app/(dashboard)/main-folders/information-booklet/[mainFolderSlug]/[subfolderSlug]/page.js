import InformationBooklets from "@/components/information-booklets";
import { getInformationBooklets } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

export default async function SubfolderPage({ params }) {

  const queryClient = new QueryClient()
  const urlParams = await params

  console.log("urlParams", urlParams);

  await queryClient.fetchQuery({
    queryKey: ['booklets', urlParams],
    queryFn: () => getInformationBooklets(urlParams),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformationBooklets urlParams={urlParams} />
    </HydrationBoundary>
  )
}
