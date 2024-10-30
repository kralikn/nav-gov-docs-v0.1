import MainFolders from "@/components/main-folders";
import { getMainFolders } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export default async function DashboardPage() {

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['main-folders'],
    queryFn: () => getMainFolders(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainFolders />
    </HydrationBoundary>
  )
}
