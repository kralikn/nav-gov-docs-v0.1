'use client'

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { getInformationBooklets } from "@/utils/actions"
import SignedUrl from "./signed-url"

export default function InformationBooklets({ urlParams }) {

  const { data, isPending } = useQuery({
    queryKey: ['booklets', urlParams],
    queryFn: () => getInformationBooklets(urlParams)
  })

  const informationBooklets = data?.informationBooklets || []

  let cardTitle = ""
  if (informationBooklets.length > 0) {
    const { group_title, } = informationBooklets[0]
    cardTitle = group_title
  }

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (informationBooklets.length < 1) return <h2 className='text-xl'>Nincs feltöltött információs füzet...</h2>

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-x-6">
        {<Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center mb-4">{`${cardTitle} ${informationBooklets.length > 0 ? `(${informationBooklets.length})` : ''}`}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {informationBooklets.map(docData => {
              return (
                <div key={docData.id} className="flex justify-between items-center gap-4">
                  <div className="flex space-x-4">
                    <p>{docData.doc_original_name}</p>
                  </div>
                  <SignedUrl signedUrl={docData.signedUrl} />
                </div>
              )
            })}
          </CardContent>
        </Card>}
      </div>
    </div>
  )
}
