import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { socialAuth } from "@/utils/actions"
import { Radar } from "lucide-react"

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-b-foreground/10 h-16">
        <div className="flex items-center w-4/5 mx-auto h-full">
          <div className="flex items-center space-x-2">
            <Radar size={30}/>
            <h1 className="font-bold text-2xl">NavTár</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 flex justify-center items-center w-4/5 mx-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl">Chatelj a NAV információs füzetekkel</CardTitle>
            <CardDescription className="">
              Csatlakozz Google-fiókkal és próbáld ki az AI által támogatott keresést
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>Automatikus hozzáférés a legfrissebb NAV információs füzetekhez</li>
              <li>Interaktív chat, amely azonnali válaszokat nyújt</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={socialAuth}>Belépés Google-fiókkal</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
