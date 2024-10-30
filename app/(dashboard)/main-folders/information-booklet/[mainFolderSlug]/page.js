import Subfolders from "@/components/subfolders";
import { getSubfolders } from "@/utils/actions"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export default async function MainFolderPage({ params }) {

  const queryClient = new QueryClient()
  const { mainFolderSlug } = await params

  await queryClient.prefetchQuery({
    queryKey: ['subfolders'],
    queryFn: () => getSubfolders(mainFolderSlug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Subfolders mainFolderSlug={mainFolderSlug} />
    </HydrationBoundary>
  )
}
