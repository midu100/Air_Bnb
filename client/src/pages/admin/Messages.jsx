import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HiOutlineSearch, HiOutlineChatAlt } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useGetMyConversationsQuery, useGetConversationQuery } from '../../store/api/conversationApi';
import { useGetMessagesQuery, useSendMessageMutation } from '../../store/api/messageApi';
import { toast } from 'react-hot-toast';
import socket from '../../lib/socket';

const Messages = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { data: conversations = [], isLoading: convLoading, refetch: refetchConversations } = useGetMyConversationsQuery();
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Set default active chat when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !activeChatId) {
      setActiveChatId(conversations[0]._id);
    }
  }, [conversations, activeChatId]);

  const { data: messages = [], isLoading: msgLoading, refetch: refetchMessages } = useGetMessagesQuery(activeChatId, {
    skip: !activeChatId
  });

  // ====== Join the personal room so the sidebar updates live
  useEffect(() => {
    if (!currentUser?._id) return

    socket.emit('setup', currentUser._id)

    const handleUpdate = () => refetchConversations()
    socket.on('conversation_updated', handleUpdate)

    return () => socket.off('conversation_updated', handleUpdate)
  }, [currentUser?._id, refetchConversations])

  // ====== Join the open conversation room, replaces the old 3s polling
  useEffect(() => {
    if (!activeChatId) return

    socket.emit('join_room', activeChatId)

    const handleNew = () => refetchMessages()
    socket.on('new_message', handleNew)

    return () => socket.off('new_message', handleNew)
  }, [activeChatId, refetchMessages])

  const [sendMessageMutation] = useSendMessageMutation();
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll messages list to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChat = useMemo(() => {
    return conversations.find(c => c._id === activeChatId) || null;
  }, [conversations, activeChatId]);

  const getOtherUser = (conv) => {
    if (!conv || !currentUser) return { fullName: 'User' };
    if (conv.creator && String(conv.creator._id) !== String(currentUser._id)) {
      return conv.creator;
    }
    return conv.participant || { fullName: 'User' };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChatId) return;

    try {
      await sendMessageMutation({
        conversationId: activeChatId,
        content: inputMsg,
        contentType: 'text'
      }).unwrap();
      setInputMsg('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message.');
    }
  };

  const otherUser = activeChat ? getOtherUser(activeChat) : null;

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
                placeholder="Conversations directory..."
                disabled
                className="w-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-400 rounded px-3 py-2 pl-9 focus:outline-none"
              />
              <HiOutlineSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {convLoading ? (
              <div className="p-4 text-center text-xs font-bold text-neutral-400">Loading inbox...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs font-semibold text-neutral-400">No active conversations found</div>
            ) : (
              conversations.map(chat => {
                const chatUser = getOtherUser(chat);
                return (
                  <button
                    key={chat._id}
                    onClick={() => setActiveChatId(chat._id)}
                    className={`w-full text-left p-4 flex flex-col gap-1 transition-colors cursor-pointer hover:bg-neutral-50 ${
                      activeChatId === chat._id ? 'bg-neutral-50 border-l-4 border-black pl-3' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black">{chatUser.fullName}</span>
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase truncate">
                      {chatUser.email}
                    </span>
                    <p className="text-xs text-neutral-600 line-clamp-1 mt-1 font-semibold">
                      {chat.lastMessage || 'No messages yet.'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right chat message content */}
        <div className="flex-1 flex flex-col justify-between bg-neutral-50/50">
          {activeChat && otherUser ? (
            <>
              {/* Active Chat Header */}
              <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black">{otherUser.fullName}</h4>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{otherUser.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">Active Stay</span>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {msgLoading && messages.length === 0 ? (
                  <div className="text-center text-xs font-semibold text-neutral-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs font-semibold text-neutral-400">Send a greeting message to start the conversation!</div>
                ) : (
                  messages.map((m, idx) => {
                    const isHost = m.sender?._id === currentUser?._id || m.sender === currentUser?._id;
                    return (
                      <div key={m._id || idx} className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded px-4 py-2 text-xs leading-relaxed font-semibold shadow-xs ${
                          isHost 
                            ? 'bg-black text-white rounded-br-none' 
                            : 'bg-white border border-neutral-200 text-black rounded-bl-none'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200 flex gap-3">
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <HiOutlineChatAlt className="w-12 h-12 text-neutral-300" />
              <h4 className="font-bold text-sm text-neutral-600">Select a conversation</h4>
              <p className="text-[10px] text-neutral-400">Choose a guest chat from the left pane to begin messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
