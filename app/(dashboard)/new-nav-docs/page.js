import CurrentAndLastYearfolders from "@/components/current-and-last-year-folders"
import { getLinksFromNAVGovToCurrentAndLastYear } from "@/utils/actions"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

export default async function NewNavDocsPage() {

  const queryClient = new QueryClient()

  await queryClient.fetchQuery({
    queryKey: ['curr-and-last-year-folders'],
    queryFn: () => getLinksFromNAVGovToCurrentAndLastYear(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CurrentAndLastYearfolders />
    </HydrationBoundary>
  )
}
