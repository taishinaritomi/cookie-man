import { AddCookie } from './components/AddCookie';
import { CookieList } from './components/CookieList';
import { Header } from './components/Header';

export const PopupView = () => {
  return (
    <div class='w-[400px] p-2 flex flex-col gap-2'>
      <Header />
      <AddCookie />
      <CookieList />
    </div>
  );
};
