'use client'

import { useQuery } from "@tanstack/react-query"
import InformationBookletSubfolderCard from "./information-booklet-subfolder-card"
import { getSubfolders } from "@/utils/actions"


export default function Subfolders({ mainFolderSlug }) {

  const { data, isPending } = useQuery({
    queryKey: ['subfolders'],
    queryFn: () => getSubfolders(mainFolderSlug)
  })

  const subFolders = data?.subFolders || []

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (subFolders.length < 1) return <h2 className='text-xl'>Nincs feltöltött információs füzet...</h2>
  console.log(subFolders);
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {subFolders.map(subfolder => (
          <InformationBookletSubfolderCard key={subfolder.doc_group_title} subfolderData={subfolder} mainFolderSlug={mainFolderSlug} />
        ))}
      </div>
    </div>
  )
}
