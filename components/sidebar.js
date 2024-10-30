"use client"

import links from '@/utils/links';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { Radar } from 'lucide-react';

export default function Sidebar() {
  
  const pathname = usePathname()

  return (
    <div className="h-full bg-gray-50">
      <div className="h-20 flex items-center px-8">
        <div className="flex items-center space-x-2">
          <Radar size={30}/>
          <h1 className="font-bold text-2xl">NavTár</h1>
        </div>
      </div>

      <div className="row-span-11 flex flex-col gap-y-4 pt-4 px-8">
        {links.map((link) => {
          return (
          <Button
            asChild
            key={link.label}
            variant={pathname.startsWith(link.href)  ? 'default' :'link'}
          >
            <Link href={link.href} className='flex items-center gap-x-2'>
              {link.icon} <span className='capitalize text-left'>{link.label}</span>
            </Link>
          </Button>
        )
        })}
      </div>      
    </div>
  )
}
