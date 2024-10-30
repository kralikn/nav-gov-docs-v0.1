import { FileStack, SearchCode, FileUp, Users } from 'lucide-react';

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
  }
];

export default links;