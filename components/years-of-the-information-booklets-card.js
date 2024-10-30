import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function YearsOfTheInformationBookletsCard({ cardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{`Információs füzetek - ${cardData.year}`}</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/new-nav-docs/${cardData.slug}`}>
            Dokumentumok
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
