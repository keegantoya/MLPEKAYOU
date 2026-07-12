import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
};

export default function Messages({
  otherUserId,
}: {
  otherUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

useEffect(() => {
  markMessagesRead();
  loadMessages();

  const channel = supabase
    .channel(`messages-${otherUserId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
(payload) => {
  console.log("Realtime:", payload.eventType, payload.new);

  markMessagesRead();
  loadMessages();
}
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [otherUserId]);

async function markMessagesRead() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

const { data, error } = await supabase
  .from("messages")
  .update({
    read_at: new Date().toISOString(),
  })
  .eq("sender", otherUserId)
  .eq("receiver", user.id)
  .is("read_at", null)
  .select();

console.log("Updated messages:", data);
console.log("Update error:", error);
console.log("otherUserId:", otherUserId);
console.log("receiver:", user.id);
}

async function loadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender.eq.${user.id},receiver.eq.${otherUserId}),and(sender.eq.${otherUserId},receiver.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    setMessages(data ?? []);
  }

  async function sendMessage() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!text.trim()) return;

    await supabase.from("messages").insert({
      sender: user.id,
      receiver: otherUserId,
      message: text.trim(),
    });

    setText("");

    loadMessages();
  }
  

return (
  <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#1c1c1e",
    }}
  >
    {/* Messages */}
<div
  className="messages-scroll"
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE/Edge
  }}
>
  <div
    style={{
      color: "#8e8e93",
      fontSize: 12,
      textAlign: "center",
      padding: "8px 20px 16px",
      lineHeight: 1.5,
      userSelect: "none",
    }}
  >
    All messages automatically erase after fourteen moons...
  </div>

  {messages.map((m) => {
        const mine = m.sender !== otherUserId;

        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "72%",
                padding: "10px 14px",
                borderRadius: 22,
                background: mine ? "#0A84FF" : "#3A3A3C",
                color: "white",
                fontSize: 16,
WebkitAppearance: "none",
                lineHeight: 1.4,
                wordBreak: "break-word",
                boxShadow: "0 1px 4px rgba(0,0,0,.25)",
              }}
            >
              {m.message}
            </div>
          </div>
        );
      })}
    </div>

    {/* Composer */}
    <div
      style={{
        borderTop: "1px solid #3a3a3c",
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#2c2c2e",
      }}
    >
      <input
        value={text}
        maxLength={500}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Send a message across Equestria..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          borderRadius: 999,
          padding: "11px 16px",
          background: "#3a3a3c",
          color: "white",
          fontSize: 16,
WebkitAppearance: "none",
        }}
      />

      <button
        onClick={sendMessage}
        disabled={!text.trim()}
        style={{
          width: 42,
          height: 42,
          border: "none",
          borderRadius: "50%",
          background: text.trim() ? "#0A84FF" : "#555",
          color: "white",
          cursor: text.trim() ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: ".2s",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
        </svg>
      </button>
    </div>
  </div>
);
}