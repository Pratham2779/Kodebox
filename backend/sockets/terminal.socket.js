// src/sockets/terminal.socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Docker from "dockerode";
import pty from "node-pty"; 
import { config } from "dotenv";

import { User } from "../src/models/user.model.js";
import { Plan } from "../src/models/plan.model.js";
import { Instance } from "../src/models/instance.model.js";
import { Volume } from "../src/models/volume.model.js";
import { createAndRunInstance, removeInstance } from "../src/utils/instance.util.js";

config();

const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const TERMINAL_CORS_ORIGIN = process.env.TERMINAL_CORS_ORIGIN || "http://localhost:5173";
const DOCKER_SOCKET_PATH = process.env.DOCKER_SOCKET_PATH || "/var/run/docker.sock";
const FORCE_SHELL_POKE = process.env.FORCE_SHELL_POKE === "true";

const IMAGE_NAME = process.env.INSTANCE_IMAGE || "lscr.io/linuxserver/code-server:latest";
const NETWORK_NAME = process.env.DOCKER_NETWORK || "kodebox-net";

if (!JWT_SECRET) throw new Error("JWT_ACCESS_TOKEN_SECRET is required");

const docker = new Docker({ socketPath: DOCKER_SOCKET_PATH });

export function initTerminalSocket(httpServer) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: TERMINAL_CORS_ORIGIN,
      credentials: true,
    },
    transports: ["websocket"],
  });

  const nsp = io.of("/terminal");

  nsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("No token provided");
      const payload = jwt.verify(token, JWT_SECRET);
      socket.data.userId = payload.id;
      return next();
    } catch (err) {
      console.warn("Terminal auth failed:", err.message);
      return next(new Error("Unauthorized or connection expired (refresh page)"));
    }
  });

  nsp.on("connection", async (socket) => {
    let ptyProcess = null;
    let closed = false;

    const cleanup = (reason) => {
      if (closed) return;
      closed = true;
      try {
        if (ptyProcess) {
          ptyProcess.removeAllListeners();
          try { ptyProcess.kill(); } catch {}
          ptyProcess = null;
        }
      } catch (err) {  }
    };

    try {
      const user = await User.findByPk(socket.data.userId);
      if (!user) {
        socket.emit("terminal:error", "User not found");
        return cleanup("user-not-found");
      }
      const plan = await Plan.findByPk(user.plan_id);
      if (!plan) {
        socket.emit("terminal:error", "Invalid user plan");
        return cleanup("invalid-plan");
      }

      const instanceName = `${user.username}-kodebox`;
      const subdomain = `${user.username}-kodebox.prathamesh.site`;
      const password = `${user.username}@${user.id}`;
      const volumeName = `${user.username}-workspace`;

      let instance = await Instance.findOne({ where: { user_id: user.id } });
      let containerExists = false;
      let container = null;

      if (instance && instance.status !== "deleted") {
        try {
          container = docker.getContainer(instance.name);
          await container.inspect();
          containerExists = true;
        } catch (err) {
          containerExists = false;
        }
      }

      if (!instance || !containerExists || instance.status === "deleted") {
        socket.emit("terminal:output", `\r\n\x1b[1;36mInitializing new workspace for ${user.username} (Plan: ${plan.name})...\x1b[0m\r\n`);

        try {
          await removeInstance(instanceName).catch(() => {});

          await createAndRunInstance({
            instanceName,
            volumeName,
            subdomain,
            password,
            cpu: plan.cpu_limit,
            memory: plan.memory_limit_mb,
            network: NETWORK_NAME,
            image: IMAGE_NAME
          });

          if (instance) {
            instance.name = instanceName;
            instance.image_name = IMAGE_NAME;
            instance.instance_password = password;
            instance.network_name = NETWORK_NAME;
            instance.status = "running";
            await instance.save();
          } else {
            instance = await Instance.create({
              user_id: user.id,
              name: instanceName,
              image_name: IMAGE_NAME,
              instance_password: password,
              status: "running",
              network_name: NETWORK_NAME
            });
          }

          const existingVolume = await Volume.findOne({ where: { instance_id: instance.id } });
          if (!existingVolume) {
            await Volume.create({
              volume_name: volumeName,
              instance_id: instance.id,
              mount_path: "/workspace",
              size_limit_mb: plan.disk_limit_mb
            });
          }

          container = docker.getContainer(instance.name);
          socket.emit("terminal:output", "\r\n\x1b[1;32mWorkspace initialized successfully!\x1b[0m\r\n");

        } catch (creationError) {
          console.error("Auto-create failed:", creationError);
          socket.emit("terminal:output", "\r\n\x1b[1;31mFailed to create workspace. Please contact support.\x1b[0m\r\n");
          return cleanup("creation-failed");
        }
      } else {
        const inspect = await container.inspect();
        if (!inspect.State.Running) {
          socket.emit("terminal:output", "\r\n\x1b[1;36mStarting your workspace...\x1b[0m\r\n");
          await container.start();
          instance.status = "running";
          await instance.save().catch(()=>{});
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      const shellCmd = "docker";
      const execArgs = ["exec", "-it", instance.name, "/bin/bash"];
     
      ptyProcess = pty.spawn(shellCmd, execArgs, {
        name: "xterm-256color",
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || "/",
        env: process.env,
      });

      ptyProcess.onData((data) => {
        if (closed) return;
        socket.emit("terminal:output", data);
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        if (!closed) {
          socket.emit("terminal:output", `\r\n\x1b[1;33mProcess exited (code=${exitCode})\x1b[0m\r\n`);
        }
        cleanup("pty-exit");
      });

      socket.on("terminal:input", (data) => {
        if (closed || !ptyProcess) return;
        try {
          if (data instanceof ArrayBuffer) {
            const s = new TextDecoder().decode(new Uint8Array(data));
            ptyProcess.write(s);
          } else if (typeof data === "string") {
            ptyProcess.write(data);
          } else if (data && typeof data === "object" && data.type === "Buffer" && Array.isArray(data.data)) {
            ptyProcess.write(Buffer.from(data.data).toString("utf8"));
          } else {
            ptyProcess.write(String(data));
          }
        } catch (err) {
          console.error("Error writing to pty:", err);
        }
      });

      socket.on("terminal:resize", ({ cols, rows }) => {
        try {
          if (ptyProcess && typeof cols === "number" && typeof rows === "number") {
            ptyProcess.resize(cols, rows);
          }
        } catch (err) {
          console.error("Resize error:", err);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        cleanup("socket-disconnect");
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
        cleanup("socket-error");
      });

      socket.emit("terminal:ready");
      if (FORCE_SHELL_POKE) {
        setTimeout(() => {
          try { ptyProcess.write("\n"); } catch {}
        }, 100);
      }

    } catch (err) {
      console.error("Terminal init error:", err && err.message || err);
      socket.emit("terminal:error", "Terminal initialization failed");
      cleanup("init-error");
    }
  });

  return io;
}