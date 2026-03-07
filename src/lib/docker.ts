import Docker from 'dockerode';

// Create a singleton instance of Dockerode
// Connecting to the local Docker socket by default
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default docker;
