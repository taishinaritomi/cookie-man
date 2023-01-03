import type { Cookie } from '../states/cookie';
import { isOpenAddCookie, setIsOpenAddCookie } from '../states/cookie';
import { addChromeCookie, currentUrl } from '../states/cookie';
import { CookieForm } from './CookieForm';

const getDefaultCookie = (): Cookie => {
  const url = new URL(currentUrl() || 'http://example.com');
  url.port = '';

  return {
    chromeCookie: {
      name: '',
      storeId: '',
      expirationDate: undefined,
      value: '',
      domain: url.host,
      path: '/',
      sameSite: 'no_restriction',
      hostOnly: true,
      httpOnly: false,
      secure: false,
      session: true,
    },
    displayExpiration: 'Session',
    displayUrl: '',
    match: false,
    searchName: '',
  };
};

export const AddCookie = () => {
  return <>{isOpenAddCookie() && <AddCookiePanel />}</>;
};

const AddCookiePanel = () => {
  const defaultCookie = getDefaultCookie();
  return (
    <div class="border p-3 border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700">
      <CookieForm
        cookie={defaultCookie}
        isRemove={false}
        onSave={(newCookie) => {
          addChromeCookie(newCookie);
          setIsOpenAddCookie(false);
        }}
        onCancel={() => setIsOpenAddCookie(false)}
      />
    </div>
  );
};
