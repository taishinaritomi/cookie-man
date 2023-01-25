import { BsCheckLg } from 'solid-icons/bs';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { cls } from '@/utils/cls';

export const CheckBox = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  const [checked, setChecked] = createSignal(props.checked || false);
  return (
    <div class='flex items-center justify-center relative'>
      {checked() && <BsCheckLg class='absolute' size={14} color='#FFF' />}
      <input
        {...props}
        type='checkbox'
        checked={checked()}
        class={cls(
          'w-4 h-4 rounded',
          'border border-slate-300 dark:border-slate-600',
          'bg-white dark:bg-slate-800 checked:bg-blue-500 checked:border-blue-500',
          'hover:cursor-pointer appearance-none',
          props.class,
        )}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
          if (props.onChange instanceof Function) props.onChange(e);
        }}
      />
    </div>
  );
};
