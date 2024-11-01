'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, SendHorizontal, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { generateChatResponse } from "@/utils/actions";
import { useToast } from "@/hooks/use-toast"

export default function Chat() {
  const { toast } = useToast()
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (query) => generateChatResponse(query),
    onSuccess: (data) => {
      if (!data) {
        toast({
          description: 'Valami hiba történt...',
        });
        return;
      }
      setMessages((prev) => [...prev, data])
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const query = { role: 'user', content: text }
    mutate([...messages, query])
    setMessages((prev) => [...prev, query])
    setText('')
  }

  console.log("messages on client: ", messages);

  return (
    <div className="min-h-[calc(100vh-8.5rem)] grid grid-rows-[1fr,auto] p-2">
      <div>
        {messages.map(({ role, content }, index) => {
          const avatar = role == 'user' ? '👤' : '🤖'
          const bgc = role === 'user' ? 'bg-gray-100' : '';
          const icon = role === 'user' ? <User /> : <Bot />
          return (
            <div key={index} className={`${bgc} flex py-6 -mx-8 px-8 text-xl leading-loose border-b border-base-300`}>
              <span className="mr-4">{icon}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          )
        })}
        {isPending ? <span className="loading"></span> : null}
      </div>
      <form onSubmit={handleSubmit} className='pt-12 flex '>
        <Input
          type="text"
          placeholder=""
          className="rounded-r-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Button className="rounded-l-none" type="submit" disabled={isPending}>
          <SendHorizontal />
        </Button>
      </form>
    </div>
  )
}
