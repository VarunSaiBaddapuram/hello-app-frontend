import Avatar from "./Avatar.jsx";

export default function Contact({id, username, onClick, selected, online}) {
  return (
    <div key={id} onClick={() => onClick(id)}
         className={"border-b border-white/5 flex items-center gap-3 cursor-pointer transition-all duration-300 relative "
            + (selected ? 'bg-cyan-900/20 backdrop-blur-sm' : 'hover:bg-white/5')}>
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-r-md"></div>
      )}
      <div className="flex gap-4 py-3 pl-6 pr-4 items-center w-full">
        <Avatar online={online} username={username} userId={id} />
        <span className={"font-mono transition-colors duration-300 " + (selected ? "text-cyan-100 font-bold tracking-widest" : "text-slate-400")}>
          {username}
        </span>
      </div>
    </div>
  );
}