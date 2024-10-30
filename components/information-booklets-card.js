import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card"

const checkSubfolderName = (subfolderName) => {
  let folderName = ""
  switch(subfolderName) {
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

export default function InformationBookletsCard({ docData, cardTitle }) {
  
  // const subfolderName = checkSubfolderName(subfolderData.name)
  
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{`${cardTitle}`}</CardTitle>
      </CardHeader>
      {/* <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/dashboard/information-booklet/${mainFolderSlug}/${subfolderData.name}`}>
            Dokumentumok
          </Link>
        </Button>
      </CardFooter> */}
    </Card>
  )
}
