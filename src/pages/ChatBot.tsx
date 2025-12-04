import ChatBot from '../components/ChatBot';

export default function ChatBotPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">AI Cybersecurity Assistant</h1>
        <p className="text-slate-400">
          Ask me anything about cybersecurity, CTF challenges, secure coding, network security, and more!
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatBot />
      </div>
    </div>
  );
}

