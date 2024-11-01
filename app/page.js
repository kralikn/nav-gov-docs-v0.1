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
            <Radar size={30} />
            <h1 className="font-bold text-2xl">NavTár</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 flex justify-center items-center w-4/5 mx-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl">Beszélgess NAV információs füzetekkel</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>Csatlakozz Google-fiókoddal, és kérdezz az adózással kapcsolatos legfrissebb változásokról,</li>
              <li>kedvezményekről és kötelezettségekről az AI asszisztensünktől</li>
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
