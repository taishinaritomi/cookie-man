// import Fuse from "fuse.js";
// import {
//   createContext,
//   type Dispatch,
//   type PropsWithChildren,
//   type SetStateAction,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { type Browser, browser } from "wxt/browser";
// import {
//   type Cookie,
//   formatCookie,
//   generateCookieURL,
//   getCookies,
//   getDefaultCookie,
//   type SetCookie,
//   type UpdateSetCookie,
// } from "../../../libs/browser";

// export function useCookie() {
//   const {
//     selectedTab,
//     setSelectedTab,
//     cookies: _cookies,
//     refreshCookie,
//     updateCookies,
//   } = usePopupContext();

//   const [currentURL, setCurrentURL] = useState<string | null>(null);
//   const [cookies, setCookies] = useState<Cookie[]>([]);

//   useEffect(() => {
//     setCurrentURL(selectedTab?.url ?? null);
//   }, [selectedTab]);

//   useEffect(() => {
//     _cookies.then((v) => setCookies(v));
//   }, [_cookies]);

//   const defaultCookie = useMemo(
//     () => getDefaultCookie(currentURL ?? "http://example.com"),
//     [currentURL],
//   );

//   async function createCookie(setCookie: SetCookie) {
//     await browser.cookies.set(setCookie);
//   }

//   async function updateCookie(id: string, updateCookie: UpdateSetCookie) {
//     const cookie = cookies.find((c) => c.id === id);

//     if (cookie && currentURL) {
//       await browser.cookies.remove({
//         url: generateCookieURL(cookie.browserCookie),
//         name: cookie.browserCookie.name,
//         storeId: cookie.browserCookie.storeId,
//       });

//       const setCookie: SetCookie = {
//         url: generateCookieURL(cookie.browserCookie),
//         name: updateCookie.name ?? cookie.browserCookie.name,
//         value: updateCookie.value ?? cookie.browserCookie.value,
//         domain: updateCookie.hostOnly
//           ? undefined
//           : (updateCookie.domain ?? cookie.browserCookie.domain),
//         path: updateCookie.path ?? cookie.browserCookie.path,
//         expirationDate: updateCookie.session
//           ? undefined
//           : (updateCookie.expirationDate ??
//             cookie.browserCookie.expirationDate),
//         storeId: cookie.browserCookie.storeId,
//         secure: updateCookie.secure ?? cookie.browserCookie.secure,
//         httpOnly: updateCookie.httpOnly ?? cookie.browserCookie.httpOnly,
//         sameSite: updateCookie.sameSite ?? cookie.browserCookie.sameSite,
//       };

//       const newCookie = await browser.cookies.set(setCookie);

//       if (newCookie) {
//         updateCookies((cookies) => {
//           const updatedCookies = cookies.map((cookie) => {
//             if (cookie.id === id) {
//               const formattedCookie = formatCookie(newCookie);
//               formattedCookie.id = id;

//               return formattedCookie;
//             }
//             return cookie;
//           });

//           return updatedCookies;
//         });
//       }
//     }
//   }

//   async function removeCookie(cookie: Cookie) {
//     await browser.cookies.remove({
//       url: generateCookieURL(cookie.browserCookie),
//       name: cookie.browserCookie.name,
//       storeId: cookie.browserCookie.storeId,
//     });
//   }

//   return {
//     currentURL,
//     selectedTab,
//     setSelectedTab,
//     cookies,
//     defaultCookie,
//     createCookie,
//     updateCookie,
//     removeCookie,
//     refreshCookie,
//   };
// }

// interface PopupContext {
//   cookies: Promise<Cookie[]>;
//   updateCookies: Dispatch<SetStateAction<Cookie[]>>;
//   refreshCookie(): void;

//   selectedTab: Browser.tabs.Tab | null;
//   setSelectedTab: Dispatch<SetStateAction<Browser.tabs.Tab | null>>;

//   cookieSearchText: string;
//   setCookieSearchText(text: string): void;
// }

// const PopupContext = createContext<PopupContext | null>(null);

// function usePopupContext() {
//   const context = useContext(PopupContext);
//   if (!context) {
//     throw new Error("usePopupContext must be used within a PopupProvider");
//   }
//   return context;
// }

// export function PopupProvider(props: PropsWithChildren) {
//   const [cookieSearchText, setCookieSearchText] = useState("");
//   const [selectedTab, setSelectedTab] = useState<Browser.tabs.Tab | null>(null);

//   const cookies = useMemo(
//     () => getCookies(selectedTab?.url ?? null),
//     [selectedTab],
//   );

//   const [updatedCookies, setUpdatedCookies] = useState<{
//     cookies: Cookie[];
//     time: number;
//   } | null>(null);

//   const refreshCookies = useCallback(async () => {
//     const _currentURL = selectedTab?.url;
//     const cookies = _currentURL ? await getCookies(_currentURL) : [];
//     setUpdatedCookies({
//       cookies: cookies.map(formatCookie),
//       time: performance.now(),
//     });
//   }, [selectedTab?.url]);

//   const sortedCookies = useMemo(async () => {
//     const isUpdated = (updatedCookies?.time ?? 0) > (await cookies).time;

//     const _cookies = isUpdated
//       ? (updatedCookies?.cookies ?? [])
//       : (await cookies).cookies;

//     if (!isUpdated) {
//       setUpdatedCookies(null);
//     }

//     if (cookieSearchText) {
//       const fuse = new Fuse(_cookies, {
//         keys: [
//           "browserCookie.name",
//           "browserCookie.domain",
//           "browserCookie.path",
//         ],
//       });

//       return fuse.search(cookieSearchText).map((r) => {
//         return r.item;
//       });
//     }

//     return _cookies;
//   }, [cookies, updatedCookies, cookieSearchText]);

//   async function updateCookies(value: SetStateAction<Cookie[]>) {
//     if (value instanceof Function) {
//       setUpdatedCookies({
//         cookies: value((updatedCookies ?? (await cookies)).cookies),
//         time: performance.now(),
//       });
//     } else {
//       setUpdatedCookies({
//         cookies: value,
//         time: performance.now(),
//       });
//     }
//   }

//   return (
//     <PopupContext
//       value={{
//         cookies: sortedCookies,
//         updateCookies,
//         refreshCookie: refreshCookies,

//         selectedTab,
//         setSelectedTab,

//         cookieSearchText,
//         setCookieSearchText,
//       }}
//     >
//       {props.children}
//     </PopupContext>
//   );
// }
