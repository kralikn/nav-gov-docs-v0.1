import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card"

const checkSubfolderName = (title) => {
  let folderName = ""
  switch(title) {
    case "szja":
      folderName = "Személyi jövedelemadó és a foglalkoztatáshoz kapcsolódó járulékok, más közterhek"
      break;
    case "tao":
      folderName = "Társasági adó"
      break;
    case "jovedeki-ado":
      folderName = "Jövedéki adó, vám"
      break;
    case "illetekek":
      folderName = "Illetékek"
      break;
    case "eljarasi-szabalyok":
      folderName = "Eljárási szabályok"
      break;
    case "egyeb-adonemek":
      folderName = "Egyéb adónemek, kötelezettségek"
      break;
    case "afa":
      folderName = "Általános forgalmi adó"
      break;
    default:
  }
  return folderName
}

export default function InformationBookletSubfolderCard({ subfolderData, mainFolderSlug }) {
  
  // const subfolderName = checkSubfolderName(subfolderData.name)
  
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{`${subfolderData.group_title}`}</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/main-folders/information-booklet/${mainFolderSlug}/${subfolderData.subfolder}`}>
            Dokumentumok
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
