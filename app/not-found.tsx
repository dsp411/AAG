import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center text-2xl font-bold mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-[#a0a0a0] max-w-md mb-6">
        The asset, record, or route you are looking for does not exist in this portfolio.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-xs uppercase tracking-wider transition-transform active:scale-95"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
