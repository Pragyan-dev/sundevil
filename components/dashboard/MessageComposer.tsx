"use client";

import { useState } from "react";

export function MessageComposer({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSend() {
    const next = value.trim();
    if (!next) return;
    onSend(next);
    setValue("");
  }

  return (
    <div className="rounded-[1.35rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.82)] p-4">
      <textarea
        className="field-shell min-h-[8rem]"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
      />
      <div className="mt-4 flex justify-end">
        <button type="button" className="button-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
