import { FileStack, SearchCode, FileUp, Users, MessageCircleMore } from 'lucide-react';

const links = [
  {
    href: '/main-folders',
    label: 'Információs füzetek',
    icon: <FileStack />,
  },
  {
    href: '/new-nav-docs',
    label: 'Új füzetek Keresése',
    icon: <SearchCode />,
  },
  {
    href: '/upload-docs',
    label: 'Saját dokumentum feltöltése',
    icon: <FileUp />,
  },
  {
    href: '/users',
    label: 'felhasználók',
    icon: <Users />,
  },
  // {
  //   href: '/nav-docs/chat',
  //   label: 'chat',
  //   icon: <MessageCircleMore />,
  // }
];

export default links;