import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import Docker from "dockerode";

// Use the same dockerode setup
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
        console.log('Client connected to terminal socket:', socket.id);
        let execStream = null;

        socket.on('start-terminal', async ({ containerId, cmd = 'sh' }) => {
            // Restrict cmd to allowed shells only
            const allowedCmds = ['sh', 'bash'];
            const safeCmd = allowedCmds.includes(cmd) ? cmd : 'sh';
            try {
                const container = docker.getContainer(containerId);

                const exec = await container.exec({
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: true,
                    Cmd: [safeCmd],
                    Env: ["TERM=xterm-256color"],
                });

                execStream = await exec.start({
                    Tty: true,
                    stdin: true,
                });

                execStream.on('data', (chunk) => {
                    socket.emit('output', chunk.toString('utf-8'));
                });

                socket.on('input', (data) => {
                    if (execStream) {
                        execStream.write(data);
                    }
                });

                execStream.on('end', () => {
                    socket.emit('output', '\r\n[Terminal process ended]\r\n');
                    socket.disconnect();
                });

            } catch (error) {
                socket.emit('output', `\r\nError starting terminal: ${error.message}\r\n`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            if (execStream) {
                try {
                    execStream.end();
                } catch (e) { }
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, hostname, () => {
            console.log(`> Ready on http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port} (accessible on all interfaces)`);
        });
});
