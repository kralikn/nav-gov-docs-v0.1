"use client"

import { uploadDoc } from "@/utils/actions"
import { Button } from "./ui/button"
import { QueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function UploadDocButton({ docData, groupTitle, isExist, newNavDocSlug, queryClient }) {

  const { toast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => uploadDoc(values),
    onSuccess: (data) => {
      console.log(data);
      if (!data) {
        toast({
          description: 'Valami hiba történt...',
        });
        return;
      }
      toast({ description: 'A füzet feltöltve.' })
      queryClient.invalidateQueries({ queryKey: ['new-booklets', newNavDocSlug] });
      // queryClient.invalidateQueries({ queryKey: ['curr-and-last-year-folders'] });
    }
  })

  const handleSubmit = (values) => {
    mutate(values)
  }
  return (
    <Button onClick={() => handleSubmit({ docData, groupTitle, newNavDocSlug })} disabled={isExist || isPending}>{!isPending ? 'Feltöltés' : 'Feltöltés...'}</Button>
  )
}
