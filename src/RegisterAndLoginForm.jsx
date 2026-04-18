import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setErrorMsg(null);
    try{
      const url = isLoginOrRegister === 'register' ? 'register' : 'login';
      const { data } = await axios.post(
        `/api/${url}`,
        { username, password }
      );
      console.log('LOGIN SUCCESS:', data);
      setLoggedInUsername(username);
      setId(data.id);
    } catch (err){
      console.log('LOGIN ERROR:', err);
      // Surface error response text directly to the user (e.g. "Wrong password")
      const message = err.response?.data || "Authentication failed. Please try again.";
      setErrorMsg(typeof message === 'string' ? message : "Authentication error");
    }
  }
  return (
    <div className="bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="z-10 mb-8 flex flex-col items-center">
        <h1 className="text-5xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] tracking-wider">
          HELLO
        </h1>
        <p className="text-slate-400 text-sm mt-3 tracking-[0.3em] uppercase font-semibold">Secure Connection Terminal</p>
      </div>

      <form className="w-80 z-10 mx-auto p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative" onSubmit={handleSubmit}>
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fuchsia-400 rounded-br-xl"></div>

        <input value={username}
               onChange={ev => setUsername(ev.target.value)}
               type="text" placeholder="Access ID (Username)"
               className="block w-full rounded-md p-3 mb-4 bg-slate-950/70 border border-slate-700 text-cyan-50 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm" />
               
        <input value={password}
               onChange={ev => setPassword(ev.target.value)}
               type="password"
               placeholder="Passcode"
               className="block w-full rounded-md p-3 mb-6 bg-slate-950/70 border border-slate-700 text-cyan-50 placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 transition-all font-mono text-sm" />
               
        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(8,145,178,0.5)] hover:shadow-[0_0_25px_rgba(8,145,178,0.8)] text-white font-cyber tracking-widest block w-full rounded-md p-3 transition-all hover:scale-[1.02] active:scale-95 uppercase">
          {isLoginOrRegister === 'register' ? 'Initialize' : 'Authenticate'}
        </button>

        {errorMsg && (
          <div className="text-red-400 text-xs text-center mt-4 p-2 bg-red-950/50 border border-red-500/30 rounded-md font-mono">
            {errorMsg}
          </div>
        )}

        <div className="text-center mt-6 text-sm text-slate-400">
          {isLoginOrRegister === 'register' && (
            <div>
              Entity exists?
              <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-semibold" onClick={() => setIsLoginOrRegister('login')}>
                Establish link
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              New entity?
              <button type="button" className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-colors font-semibold" onClick={() => setIsLoginOrRegister('register')}>
                Register bio-signature
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}