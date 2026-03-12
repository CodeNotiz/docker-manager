import Docker from "dockerode";
import os from "os";

// Create a singleton instance of Dockerode
// Connecting to the appropriate local Docker socket based on OS
let socketPath = "/var/run/docker.sock";

if (os.platform() === "win32") {
  socketPath = "//./pipe/docker_engine";
}

const docker = new Docker({ socketPath });

export default docker;
