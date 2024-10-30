import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function InformationBookletMainFolderCard({ year }) {
  return (
    <Card  className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{`Információs füzetek - ${year}`}</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/main-folders/information-booklet/${year}`}>
            Almappák
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
