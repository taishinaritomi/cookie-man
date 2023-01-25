import type { JSX } from 'solid-js';
import { cls } from '@/utils/cls';

export const TextBox = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      type='text'
      class={cls(
        'w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800',
        props.class,
      )}
    />
  );
};
