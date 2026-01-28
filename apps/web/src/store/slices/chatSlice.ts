import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
}

const initialState: ChatState = {
  messages: [],
  unreadCount: 0,
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage & { text?: string }>) {
      const msg = { ...action.payload };
      if (!msg.content && msg.text) {
        msg.content = msg.text;
      }
      delete (msg as any).text;
      state.messages.push(msg);
      if (!state.isOpen) state.unreadCount += 1;
    },
    toggleChat(state) {
      state.isOpen = !state.isOpen;
      if (state.isOpen) state.unreadCount = 0;
    },
    clearChat(state) { state.messages = []; state.unreadCount = 0; },
  },
});

export const { addMessage, toggleChat, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
