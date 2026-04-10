import { ChatWindow } from "@/components/ChatWindow";

export default function ChatEmbedPage() {
  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#f8f1e7_0%,#fffdf8_100%)]">
      <ChatWindow variant="embed" />
    </div>
  );
}
