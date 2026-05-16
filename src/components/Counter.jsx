'use client';
import { useState } from 'react';

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <div data-hydrate="Counter" data-props={JSON.stringify({ initial })}>
      <div className="flex items-center gap-8">
        <button
          onClick={() => setCount(count - 1)}
          className="w-9 h-9 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition text-sm cursor-pointer"
        >
          -
        </button>
        <span className="text-5xl font-light text-white tabular-nums w-16 text-center">
          {count}
        </span>
        <button
          onClick={() => setCount(count + 1)}
          className="w-9 h-9 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition text-sm cursor-pointer"
        >
          +
        </button>
      </div>
      <p className="text-[11px] text-neutral-700 mt-8 text-center tracking-wide">
        hidratado en el cliente
      </p>
    </div>
  );
}
