import {useContext, useEffect, useRef, useState} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "lodash";
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {
  const [ws,setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [messages,setMessages] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  
  const EMOTICONS = ['😀','😂','🔥','💯','💀','✨','👍','❤️','☠️','🦾','🚀','👀','🎯','🧠','⚡','🌊','🪐', '💻', '🎮', '💡'];
  const STICKERS = [
    { code: '[STICKER:alert]', label: 'WARNING SYSTEM', colors: 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] border-yellow-400/50 bg-yellow-950/40' },
    { code: '[STICKER:hack]', label: 'SYSTEM OVERRIDE', colors: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] border-emerald-400/50 bg-emerald-950/40' },
    { code: '[STICKER:hello]', label: 'HELLO APPROVED', colors: 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.8)] border-fuchsia-400/50 bg-fuchsia-950/40' },
  ];
  const {username,id,setId,setUsername} = useContext(UserContext);
  const divUnderMessages = useRef();


  useEffect(() => {
    if (id) {
    connectToWs();
  }
  }, [id]);

  function connectToWs(retryCount = 0) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4040';
    const ws = new WebSocket(wsUrl);
    setWs(ws);
    
    let heartbeatInterval;

    ws.addEventListener('open', () => {
      console.log('WS linked');
      // Reset retry count on successful connection
      retryCount = 0;
      
      // Start message-based heartbeat to keep connection alive through proxies (Render/Vercel)
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // 30 second pulse
    });
    
    ws.addEventListener('message', handleMessage);
    
    ws.addEventListener('close', (event) => {
      console.log('WS link broken', event.reason);
      clearInterval(heartbeatInterval);
      setIsWsReady(false);

      if (id) {
        // Render Cold Start / Robust Reconnection Logic
        // Exponential backoff: 1s, 2s, 4s, 8s, up to 15s max
        const baseDelay = event.code === 1006 ? 2000 : 1000; // Longer delay if connection failed abruptly
        const timeout = Math.min(baseDelay * Math.pow(2, retryCount), 15000);
        
        console.log(`Re-establishing link in ${timeout/1000}s... (Attempt ${retryCount + 1})`);
        
        setTimeout(() => {
          connectToWs(retryCount + 1);
        }, timeout);
      }
    });

    ws.addEventListener('error', (err) => {
      console.error('WS Error:', err);
      ws.close(); // Ensure close event fires
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    
    if (messageData.type === 'pong') {
      // Heartbeat received
      return;
    }

    if (messageData.type === 'auth_success') {
      console.log('WS authenticated');
      setIsWsReady(true);
      return;
    }

    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId || (messageData.sender === id && messageData.recipient === selectedUserId)) {
        setMessages(prev => ([...prev, {...messageData}]));
      }
    }
  }
  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();

    if (!newMessageText && !file) {
      return;
    }

    if (!selectedUserId) {
      console.log('No recipient selected');
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready');
      return;
    }

    // Send message directly instead of using an arbitrary setTimeout delay
    try {
      ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      }));
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message over websocket:', err);
    }
  }


  function sendSticker(code) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: code,
        file: null,
      }));
      setShowTools(false);
    } catch (err) {
      console.error('Failed to send sticker:', err);
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth', block:'end'});
    }
  }, [messages]);

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (!selectedUserId) return;

    console.log("FETCHING messages for:", selectedUserId);

    axios.get('/messages/' + selectedUserId)
      .then(res => setMessages(res.data))
      .catch(err => console.log('Fetch error:', err));

  }, [selectedUserId]);

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, '_id');

  return (
    <div className="flex h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] overflow-hidden">
      <div className="bg-slate-900/80 backdrop-blur-xl border-r border-cyan-500/20 w-1/3 flex flex-col shadow-[5px_0_20px_rgba(0,0,0,0.5)] z-10 relative">
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {if(!userId) return; setSelectedUserId(userId);console.log({userId})}}
              selected={userId === selectedUserId} />
          ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => {if(!userId) return; setSelectedUserId(userId)}}
              selected={userId === selectedUserId} />
          ))}
        </div>
        <div className="p-4 text-center flex items-center justify-between border-t border-cyan-500/20 bg-slate-950/50 backdrop-blur-md">
          <span className="text-sm text-cyan-400 flex items-center gap-2 font-mono drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-xs font-cyber tracking-widest bg-red-950/40 py-2 px-4 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/20 transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)] uppercase">DISCONNECT</button>
        </div>
      </div>
      <div className="flex flex-col w-2/3 p-4 relative z-0">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center pointer-events-none">
              <div className="text-cyan-500/40 text-2xl font-cyber tracking-[0.3em] font-bold drop-shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-1000 animate-pulse">&larr; ESTABLISH LINK</div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map(message => (
                  <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                    <div className={"text-left inline-block p-3 my-2 rounded-2xl text-sm max-w-[80%] font-mono " + (message.sender === id ? 'bg-cyan-600/90 shadow-[0_0_15px_rgba(8,145,178,0.4)] text-white border border-cyan-400/50 rounded-br-none':'bg-slate-800/90 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(219,39,119,0.2)] text-cyan-50 rounded-bl-none')}>
                      
                      {/* Sticker Interceptor */}
                      {message.text && message.text.startsWith('[STICKER:') && message.text.endsWith(']') ? (
                        <div className={"flex flex-col items-center justify-center p-4 rounded-xl border-dashed border-2 animate-pulse " + STICKERS.find(s => s.code === message.text)?.colors}>
                          <span className="font-cyber text-xl font-bold tracking-[0.2em]">{STICKERS.find(s => s.code === message.text)?.label || 'DATA CORRUPTED'}</span>
                        </div>
                      ) : (
                        message.text
                      )}
                      
                      {message.file && (
                        <div className="mt-2">
                          <a target="_blank" className="flex items-center gap-2 border-b border-current pb-1 hover:text-white transition-colors" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <div className="relative">
            {/* Tools Popup Panel */}
            {showTools && (
              <div className="absolute bottom-16 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] z-50 animate-[fade_0.2s_ease-in-out]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-cyber text-cyan-400 tracking-widest text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">EMOTIONS & DECALS</h3>
                  <button onClick={() => setShowTools(false)} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wide">Quick Emoticons</div>
                  <div className="flex flex-wrap gap-2">
                    {EMOTICONS.map(emo => (
                      <button key={emo} type="button" onClick={() => setNewMessageText(prev => prev + emo)} className="text-2xl hover:scale-125 transition-transform">
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wide">Sticker Protocols</div>
                  <div className="flex flex-col gap-2">
                    {STICKERS.map(sticker => (
                      <button key={sticker.code} type="button" onClick={() => sendSticker(sticker.code)} className={"w-full text-center p-2 rounded-lg border hover:scale-[1.02] transition-all font-cyber tracking-widest text-sm " + sticker.colors}>
                        {sticker.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form className="flex gap-3 bg-slate-900/60 backdrop-blur-lg border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] rounded-full p-2 mt-2" onSubmit={sendMessage}>
              {/* Toggle Tools Button */}
              <button type="button" onClick={() => setShowTools(prev => !prev)} className="p-3 text-cyan-400 cursor-pointer rounded-full hover:bg-cyan-900/50 hover:text-cyan-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </button>
              
              <input type="text"
                     value={newMessageText}
                   onChange={ev => setNewMessageText(ev.target.value)}
                   placeholder="AWAITING INPUT..."
                   className="bg-transparent flex-grow text-cyan-50 placeholder-cyan-700/50 border-none outline-none px-4 font-mono w-full" />
            <label className="p-3 text-cyan-400 cursor-pointer rounded-full hover:bg-cyan-900/50 hover:text-cyan-300 transition-colors">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>
            <button type="submit" className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-3 text-white rounded-full shadow-[0_0_15px_rgba(219,39,119,0.5)] hover:shadow-[0_0_20px_rgba(219,39,119,0.8)] transition-all hover:scale-[1.05] active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          </div>
        )}
      </div>
    </div>
  );
}