import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineChatAlt } from 'react-icons/hi';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [chats, setChats] = useState([
    {
      id: 0,
      user: 'Sarah Connor',
      property: 'Minimalist A-Frame Cabin',
      lastMessage: 'Is it possible to check in early around 12 PM?',
      time: '10:42 AM',
      unread: true,
      messages: [
        { sender: 'guest', text: 'Hi Julietta! Looking forward to my stay.' },
        { sender: 'host', text: 'Hi Sarah, great to host you!' },
        { sender: 'guest', text: 'Is it possible to check in early around 12 PM?' }
      ]
    },
    {
      id: 1,
      user: 'Alex Rivera',
      property: 'Luxury Sunset Beachfront Villa',
      lastMessage: 'Thank you for the directions. The lockbox was easy to find!',
      time: 'Yesterday',
      unread: false,
      messages: [
        { sender: 'host', text: 'Let me know if you need anything else.' },
        { sender: 'guest', text: 'Thank you for the directions. The lockbox was easy to find!' }
      ]
    },
    {
      id: 2,
      user: 'John Doe',
      property: 'Modern Geometric Glass Oasis',
      lastMessage: 'Can you confirm if there is a coffee maker in the unit?',
      time: '2 days ago',
      unread: false,
      messages: [
        { sender: 'guest', text: 'Can you confirm if there is a coffee maker in the unit?' }
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          lastMessage: inputMsg,
          time: 'Just now',
          messages: [...chat.messages, { sender: 'host', text: inputMsg }]
        };
      }
      return chat;
    }));
    setInputMsg('');
  };

  const currentChat = chats[activeChat];

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Guest Inbox</h2>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Interact with guests, coordinate arrival, and resolve queries</p>
      </div>

      {/* Chat Window */}
      <div className="bg-white border border-neutral-200 rounded h-[600px] flex overflow-hidden shadow-xs">
        {/* Left list of chats */}
        <div className="w-80 border-r border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-neutral-50 border border-neutral-200 text-xs text-black rounded px-3 py-2 pl-9 focus:outline-none focus:border-black"
              />
              <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left p-4 flex flex-col gap-1 transition-colors cursor-pointer hover:bg-neutral-50 ${
                  activeChat === chat.id ? 'bg-neutral-50 border-l-4 border-black pl-3' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black">{chat.user}</span>
                  <span className="text-[10px] text-neutral-400 font-semibold">{chat.time}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase line-clamp-1">{chat.property}</span>
                <p className={`text-xs text-neutral-600 line-clamp-1 mt-1 ${chat.unread ? 'font-bold text-black' : ''}`}>
                  {chat.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right chat message content */}
        <div className="flex-1 flex flex-col justify-between bg-neutral-50/50">
          {/* Active Chat Header */}
          <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-black">{currentChat.user}</h4>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{currentChat.property}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">Active Stay</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {currentChat.messages.map((m, idx) => {
              const isHost = m.sender === 'host';
              return (
                <div key={idx} className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded px-4 py-2 text-xs leading-relaxed font-semibold shadow-xs ${
                    isHost 
                      ? 'bg-black text-white rounded-br-none' 
                      : 'bg-white border border-neutral-200 text-black rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Send Input */}
          <form onSubmit={sendMessage} className="p-4 bg-white border-t border-neutral-200 flex gap-3">
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-neutral-50 border border-neutral-200 text-xs text-black rounded px-4 py-2.5 focus:outline-none focus:border-black font-semibold"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
