import { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3000");

    console.log(ws);

    ws.current.onmessage = (e) => {
      console.log(e);

      if (e.data instanceof Blob) {
        const reader = new FileReader();
        console.log(reader);

        reader.onload = () => {
          setMessages((prevMessages) => [...prevMessages, reader.result]);
        };
        reader.readAsText(e.data);
      } else {
        setMessages((prevMessages) => [...prevMessages, e.data]);
      }
    };
    return () => {
      ws.current.close();
    };
  }, []);

  function sendMessage() {
    if (message && ws.current) {
      ws.current.send(message);
      setMessage("");
    }
  }
  return (
    <div className="flex flex-col items-center gap-4 my-8 h-96">
      <div className="text-2xl">Chat App</div>
      <div className="h-full w-1/2 bg-gray-300 rounded-xl">
        {messages.map((msg, index) => {
          return (
            <div key={index} className="">
              {msg}
            </div>
          );
        })}
      </div>
      <div className="w-1/2 flex justify-between gap-2">
        <input
          type="text"
          placeholder="Enter Message"
          className="w-full border rounded-md bg-gray-100 shadow"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="bg-black text-white rounded-lg py-1 px-2 hover:opacity-75"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
