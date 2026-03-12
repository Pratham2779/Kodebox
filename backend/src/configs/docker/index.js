import {config} from 'dotenv';
config();
import Docker from "dockerode";


const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET_PATH || "/var/run/docker.sock",
  timeout: 30_000
});

export { docker };
