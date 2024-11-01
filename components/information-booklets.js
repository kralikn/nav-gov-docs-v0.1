'use client'

import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { getInformationBooklets, createDocument } from "@/utils/actions"
import SignedUrl from "./signed-url"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

export default function InformationBooklets({ urlParams }) {

  const { toast } = useToast()
  const queryClient = new QueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['booklets', urlParams],
    queryFn: () => getInformationBooklets(urlParams)
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (docId) => createDocument(docId),
    onSuccess: (data) => {
      if (!data) {
        toast({
          description: 'Valami hiba történt...',
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['booklets', urlParams] })
      toast({ description: 'Sikeres embedding.' })
    }
  })

  const handleSubmit = (e, docId) => {
    e.preventDefault()
    mutate(docId);
  }

  const informationBooklets = data?.informationBooklets || []

  let cardTitle = ""
  if (informationBooklets.length > 0) {
    const { doc_group_title, } = informationBooklets[0]
    cardTitle = doc_group_title
  }

  if (isLoading) return <h2 className='text-xl'>Kérlek várj...</h2>

  if (informationBooklets.length < 1) return <h2 className='text-xl'>Nincs feltöltött információs füzet...</h2>

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-x-6">
        <Card className="border-0 shadow-none">
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



                  {/* ------------------------------------------------------------------------------------------------------------------------------- */}

                  <form onSubmit={(e) => handleSubmit(e, docData.id)}>
                    <Button type="submit" disabled={isPending || docData.embedded}>embedding</Button>
                    {/* <Button type="submit" >embedding</Button> */}
                  </form>

                  {/* ------------------------------------------------------------------------------------------------------------------------------- */}


                  <SignedUrl signedUrl={docData.signedUrl} />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
