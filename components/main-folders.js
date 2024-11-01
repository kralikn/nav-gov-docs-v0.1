'use client'

import { getMainFolders } from "@/utils/actions"
import InformationBookletMainFolderCard from "./information-booklet-main_folder-card"
import { useQuery } from "@tanstack/react-query"


export default function MainFolders() {

  const { data, isPending } = useQuery({
    queryKey: ['main-folders'],
    queryFn: () => getMainFolders()
  })

  const docMainFolders = data?.mainFolders || []

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (docMainFolders.length < 1) return <h2 className='text-xl'>Nincs feltöltött információs füzet...</h2>

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {docMainFolders.map(doc => (
          <InformationBookletMainFolderCard key={doc.doc_main_folder} mainFolder={doc.doc_main_folder} />
        ))}
      </div>
    </div>
  )
}
