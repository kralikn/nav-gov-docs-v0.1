import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import links from '@/utils/links'
import Link from 'next/link'
import { AlignLeft } from 'lucide-react';


export default function LinkDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='lg:hidden'>
        <Button variant='' size='icon'>
          <AlignLeft />
          <span className='sr-only'>Toggle links</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-52 lg:hidden'
        align='start'
        sideOffset={25}
      >
        {links.map(link => {
          return (
            <DropdownMenuItem key={link.label}>
              <Link href={link.href} className='flex items-center gap-x-2 '>
                {link.icon} <span className='capitalize'>{link.label}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
