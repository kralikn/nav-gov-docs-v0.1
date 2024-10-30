'use client'

import { getMainFolders } from "@/utils/actions"
import InformationBookletMainFolderCard from "./information-booklet-main_folder-card"
import { useQuery } from "@tanstack/react-query"


export default function MainFolders() {

  const { data, isPending } = useQuery({
    queryKey: ['main-folders'],
    queryFn: () => getMainFolders()
  })

  const mainFolders = data?.mainFolders || []

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (mainFolders.length < 1) return <h2 className='text-xl'>Nincs feltöltött információs füzet...</h2>

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {mainFolders.map(folder => (
          <InformationBookletMainFolderCard key={folder.doc_year} year={folder.doc_year} />
        ))}
      </div>
    </div>
  )
}
