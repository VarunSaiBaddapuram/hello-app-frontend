export default function Avatar({userId, username, online}) {
  const colors = [
    'bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.6)] text-white', 
    'bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.6)] text-white',
    'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)] text-slate-900 font-bold', 
    'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] text-white',
    'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.6)] text-white', 
    'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)] text-white',
  ];
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div className={"w-10 h-10 relative rounded-full flex items-center justify-center font-cyber " + color}>
      <div className="text-center w-full uppercase tracking-wider">{username[0]}</div>
      {online && (
        <div className="absolute w-3 h-3 bg-cyan-400 bottom-0 right-0 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-slate-600 bottom-0 right-0 rounded-full border-2 border-slate-900"></div>
      )}
    </div>
  );
}