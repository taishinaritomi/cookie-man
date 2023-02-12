import {
  Accordion,
  AccordionButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from 'solid-headless';
import { IoChevronDown } from 'solid-icons/io';
import { For, mergeProps } from 'solid-js';
import type { Cookie, CookieSetDetails } from '../states/cookie';
import {
  cookies,
  initCookies,
  removeCookie,
  updateCookie,
} from '../states/cookie';
import { CookieForm } from './CookieForm';
import { cls } from '@/utils/cls';

initCookies();

export const CookieList = () => {
  return (
    <Accordion
      class='flex gap-3 flex-col'
      defaultValue={cookies()?.[0]}
      toggleable={true}
      multiple={true}
    >
      <For each={cookies()} fallback={<NoCookie />}>
        {(cookie) => <CookieItem cookie={cookie} />}
      </For>
    </Accordion>
  );
};

const NoCookie = () => {
  return (
    <div class='flex items-center justify-center my-8'>
      <p class='text-sm font-bold'>No Cookie</p>
    </div>
  );
};

type AccordionRefs = {
  button: HTMLButtonElement;
};

const CookieItem = (_props: { cookie: Cookie }) => {
  const props = mergeProps({ isRemove: true }, _props);
  const accordionRefs = {} as AccordionRefs;
  const onSave = (setDetails: CookieSetDetails) => {
    updateCookie(props.cookie, setDetails);
  };

  const onRemove = async () => await removeCookie(props.cookie);
  const onCancel = async () => accordionRefs.button.click();

  return (
    <AccordionItem
      class={cls(
        'border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700',
        props.cookie.match && 'border-slate-400 dark:border-slate-500',
      )}
      value={props.cookie}
    >
      {/* virtual AccordionButton use onCancel */}
      <AccordionButton
        class='hidden'
        ref={accordionRefs.button}
      ></AccordionButton>
      <AccordionHeader>
        {({ isSelected }) => (
          <AccordionButton
            class={cls(
              'w-full p-2 rounded',
              props.cookie.match && 'bg-slate-300 dark:bg-slate-600',
              isSelected() && 'rounded-b-none',
            )}
          >
            <div class='flex gap-2 items-center'>
              <IoChevronDown
                size={16}
                class={cls(
                  'transition-transform -rotate-90',
                  isSelected() && 'transform rotate-0',
                )}
              />
              <div class='flex flex-col gap-1 text-left items-start'>
                <p
                  class={cls(
                    'font-bold text-base pl-1 truncate w-80',
                    props.cookie.chromeCookie.name ? '' : 'opacity-50',
                  )}
                >
                  {props.cookie.chromeCookie.name || 'unknown'}
                </p>
                <p class='text-white bg-purple-500 rounded-full px-2 mb-1 shadow'>
                  {props.cookie.displayUrl}
                </p>
              </div>
            </div>
          </AccordionButton>
        )}
      </AccordionHeader>
      <AccordionPanel
        class={cls(
          'p-3 border-t border-slate-300 dark:border-slate-600',
          props.cookie.match && 'border-slate-400 dark:border-slate-500',
        )}
      >
        <CookieForm
          cookie={props.cookie}
          isRemove={true}
          onCancel={onCancel}
          onRemove={onRemove}
          onSave={onSave}
        />
      </AccordionPanel>
    </AccordionItem>
  );
};
