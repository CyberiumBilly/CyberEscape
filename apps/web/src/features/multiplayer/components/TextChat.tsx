import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { addMessage } from '@/store/slices/chatSlice';
import { useSocket } from '@/hooks/useSocket';
import { Send } from 'lucide-react';

interface Props {
  teamId: string;
}

export default function TextChat({ teamId }: Props) {
  const dispatch = useDispatch();
  const messages = useSelector((s: RootState) => s.chat.messages);
  const auth = useSelector((s: RootState) => s.auth);
  const { emit, on } = useSocket();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = on('chat:message', (msg: any) => dispatch(addMessage(msg)));
    return unsub;
  }, [on, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    emit('chat:message', { roomId: teamId, text });
    setText('');
  };

  return (
    <div className="flex h-96 flex-col rounded-xl border border-cyber-border bg-cyber-card">
      <div className="border-b border-cyber-border p-3 font-semibold">Team Chat</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`text-sm ${msg.userId === auth.user?.id ? 'text-right' : ''}`}>
            <span className="text-xs text-cyber-muted">{msg.userName}</span>
            <div className={`mt-0.5 inline-block rounded-lg px-3 py-1 ${
              msg.userId === auth.user?.id ? 'bg-cyber-primary/20 text-cyber-primary' : 'bg-cyber-surface'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex border-t border-cyber-border p-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button onClick={send} className="rounded-lg p-2 text-cyber-primary hover:bg-cyber-surface">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
