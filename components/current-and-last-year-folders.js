'use client'

import { useQuery } from "@tanstack/react-query"
import YearsOfTheInformationBookletsCard from "./years-of-the-information-booklets-card"
import { getLinksFromNAVGovToCurrentAndLastYear } from "@/utils/actions"

export default function CurrentAndLastYearfolders() {

  const { data, isPending } = useQuery({
    queryKey: ['curr-and-last-year-folders'],
    queryFn: () => getLinksFromNAVGovToCurrentAndLastYear()
  })

  const currentAndLastYearUrls = data || []

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (currentAndLastYearUrls.length < 1) return <h2 className='text-xl'>Nincs letölthető információs füzet...</h2>

  return (
    <div className="grid grid-cols-2 gap-6 pt-6">
      {currentAndLastYearUrls.map(item => (
        <YearsOfTheInformationBookletsCard key={item.slug} cardData={item} />
      ))}
    </div>
  )
}
