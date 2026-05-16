import Counter from '../components/Counter.jsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-medium tracking-tight text-white mb-2">
        mini-ssr
      </h1>
      <p className="text-sm text-neutral-500 mb-16">
        React server-side rendering, sin magia.
      </p>
      <Counter initial={0} />
    </div>
  );
}
