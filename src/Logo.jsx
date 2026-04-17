export default function Logo() {
  return (
    <div className="font-cyber text-3xl font-bold flex gap-4 p-5 items-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] uppercase">
      {/* Intricate actual logo symbol */}
      <div className="relative flex items-center justify-center w-10 h-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-12 h-12 absolute drop-shadow-[0_0_8px_rgba(219,39,119,0.9)] z-10">
          <defs>
            <linearGradient id="neonGradientLogo" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
          
          {/* Cyberpunk interlocking geometric shape representing 'Communication' */}
          <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" stroke="url(#neonGradientLogo)" strokeWidth="6" strokeLinejoin="round" />
          <path d="M50 10 L50 50 M10 30 L50 50 M90 30 L50 50 M10 70 L50 50 M90 70 L50 50" stroke="url(#neonGradientLogo)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4"/>
          
          {/* Central Core */}
          <circle cx="50" cy="50" r="10" fill="url(#neonGradientLogo)" className="animate-pulse" />
        </svg>
      </div>
      
      <span className="ml-2 pt-1 font-black">HELLO</span>
    </div>
  );
}