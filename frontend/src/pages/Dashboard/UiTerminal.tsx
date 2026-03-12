import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { io, Socket } from "socket.io-client";
import "xterm/css/xterm.css";
import { tokenStorage } from "../../lib/tokenStorage";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function TerminalPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "ready">("disconnected");


  useEffect(() => {
    if (!containerRef.current) return;


    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontSize: 14,
      lineHeight: 1.2,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
      theme: {
        background: "#0f172a",
        foreground: "#f8fafc",
        cursor: "#10b981",
        selectionBackground: "rgba(255, 255, 255, 0.15)",
        black: "#1e293b",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#f8fafc",
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);


    setTimeout(() => fit.fit(), 150);


    term.attachCustomKeyEventHandler((e) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyC") {
        const sel = term.getSelection();
        if (sel) navigator.clipboard.writeText(sel);
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.code === "KeyV") {
        navigator.clipboard.readText().then((t) => term.paste(t));
        return false;
      }
      return true;
    });

    termRef.current = term;
    fitRef.current = fit;

    return () => {
      term.dispose();
      termRef.current = null;
    };
  }, []);


  useEffect(() => {
    if (!termRef.current || socketRef.current) return;

    const term = termRef.current;
    const fit = fitRef.current!;
    const token = tokenStorage.get();

    if (!token) {
      term.write("\x1b[31m\r\n[Error] No authentication token found. Please login again.\x1b[0m\r\n");
      return;
    }


    const socket = io(`${BACKEND_URL}/terminal`, {
      transports: ["websocket", "polling"],
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;
    setStatus("connecting");
    term.write("\x1b[33m\r\n● Attempting to connect to backend...\x1b[0m\r\n");

    const handleResize = () => {
      fit.fit();
      if (socket.connected) {
        socket.emit("terminal:resize", { cols: term.cols, rows: term.rows });
      }
    };


    socket.on("connect", () => {
      setStatus("connected");
      term.write("\x1b[32m\r\n● Connection Established. Initializing shell...\x1b[0m\r\n");
      handleResize();
    });

    socket.on("connect_error", (err) => {
      setStatus("disconnected");
      term.write(`\x1b[31m\r\n● Connection Failed: ${err.message}\x1b[0m\r\n`);
      
      const errorMessage = err.message.toLowerCase();
      if (errorMessage.includes("unauthorized") || errorMessage.includes("refresh")) {
        term.write("\x1b[33m\r\n● Session expired. Auto-refreshing page in 2 seconds...\x1b[0m\r\n");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });

    socket.on("terminal:ready", () => {
      setStatus("ready");
      term.clear();
      term.write("\x1b[32m● Shell ready. Type 'help' for available commands.\x1b[0m\r\n\r\n");
      handleResize();
    });

    socket.on("terminal:output", (data: string) => term.write(data));

    socket.on("disconnect", (reason) => {
      setStatus("disconnected");
      term.write(`\x1b[33m\r\n● Disconnected from server: ${reason}\x1b[0m\r\n`);
    });

    const inputDisposable = term.onData((data) => {
      if (socket.connected) socket.emit("terminal:input", data);
    });

    window.addEventListener("resize", handleResize);

    return () => {
      inputDisposable.dispose();
      window.removeEventListener("resize", handleResize);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);


  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageMeta
        title="Terminal | Kodebox"
        description="Secure cloud terminal interface"
      />
      <PageBreadcrumb pageTitle="Cloud Terminal" />

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">

        {/* Header Branding */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Interactive Instance Shell
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Real-time access to your backend environment
            </p>
          </div>

          {/* Dynamic Status Badge */}
          <div className={`flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold sm:self-center ${status === 'ready'
            ? 'border-green-500/20 bg-green-500/10 text-green-500'
            : status === 'connecting'
              ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500'
              : 'border-red-500/20 bg-red-500/10 text-red-500'
            }`}>
            <span className={`h-2 w-2 rounded-full ${status === 'ready' || status === 'connecting' ? 'animate-pulse' : ''} ${status === 'ready' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            {status.toUpperCase()}
          </div>
        </div>

        {/* Terminal Window Mockup */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#0f172a] shadow-2xl dark:border-gray-700">

          {/* OS Window Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <div className="ml-3 flex items-center gap-2 text-xs font-medium text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                bash — node-srv-01
              </div>
            </div>
            <div className="hidden text-[10px] font-mono tracking-widest text-slate-500 md:block">
              {BACKEND_URL.replace(/^https?:\/\//, '')}
            </div>
          </div>

          {/* Terminal Body with increased padding */}
          <div className="p-4 sm:p-6">
            <div
              ref={containerRef}
              className="w-full"
              style={{
                height: "calc(100vh - 380px)",
                minHeight: "550px"
              }}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Footer */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-white/5">CTRL + SHIFT + C</kbd> Copy
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-white/5">CTRL + SHIFT + V</kbd> Paste
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-white/5">F11</kbd> Fullscreen
          </span>
        </div>
      </div>
    </div>
  );
}