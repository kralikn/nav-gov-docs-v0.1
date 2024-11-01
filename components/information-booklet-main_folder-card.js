import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function InformationBookletMainFolderCard({ mainFolder }) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{`Információs füzetek - ${mainFolder}`}</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/main-folders/information-booklet/${mainFolder}`}>
            Almappák
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
