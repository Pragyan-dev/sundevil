import { ChatWindow } from "@/components/ChatWindow";

export default function ChatPage() {
  return (
    <div className="page-shell pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="maroon-panel">
          <p className="eyebrow text-[var(--asu-gold)]">The working feature</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
            Ask a real question and get a grounded answer.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
            The API route sends your conversation plus the local ASU resource dataset to OpenRouter.
            If the key is missing or the upstream call fails, the UI stays honest and shows a setup
            error instead of pretending.
          </p>
        </section>

        <ChatWindow />
      </div>
    </div>
  );
}
