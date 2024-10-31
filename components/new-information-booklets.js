'use client'

import { getPdfLinksFromNAVGov } from "@/utils/actions"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import UploadDocButton from "./upload-doc-button"

export default function NewInformationBooklets({ newNavDocSlug }) {

  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: ['new-booklets', newNavDocSlug],
    queryFn: () => getPdfLinksFromNAVGov(newNavDocSlug)
  })

  const pdfLinksFromNAVGov = data || []

  if (isPending) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (pdfLinksFromNAVGov.length < 1) return <h2 className='text-xl'>Nincs új információs füzetek...</h2>

  return (
    <div className="flex flex-col gap-12">
      {pdfLinksFromNAVGov.map(item => (
        <Card key={item.groupTitle} className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center mb-4">{item.groupTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {item.urlData.map(linkData => {
              return (
                <div key={linkData.urlTitle} className="flex justify-between items-center gap-4">
                  <div className="flex space-x-4">
                    <p>{linkData.urlTitle}</p>
                    {!linkData.isExistInDB && <Badge className="bg-yellow-400">Új</Badge>}
                  </div>
                  <UploadDocButton docData={linkData} groupTitle={item.groupTitle} isExist={linkData.isExistInDB} newNavDocSlug={newNavDocSlug} queryClient={queryClient} />
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
