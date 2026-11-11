"use strict";

const http = require("node:http");
const next = require("next");

const hostname = "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
	console.error("Invalid PORT: expected an integer between 1 and 65535.");
	process.exit(1);
}

const app = next({
	dev: false,
	hostname,
	port,
});

const handle = app.getRequestHandler();

async function startServer() {
	await app.prepare();

	const server = http.createServer((req, res) => {
		Promise.resolve(handle(req, res)).catch((error) => {
			console.error("Next.js request error:", error);

			if (!res.headersSent) {
				res.statusCode = 500;
				res.end("Internal Server Error");
			} else {
				res.destroy(error);
			}
		});
	});

	server.keepAliveTimeout = 5000;
	server.headersTimeout = 60000;

	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, hostname, resolve);
	});

	server.on("error", (error) => {
		console.error("HTTP server error:", error);
		process.exitCode = 1;
	});

	console.log(`Next.js production server listening on ${hostname}:${port}`);

	const shutdown = (signal) => {
		console.log(`Received ${signal}; shutting down gracefully.`);
		const forceClose = setTimeout(() => server.closeAllConnections(), 10000);
		forceClose.unref();

		server.close((error) => {
			clearTimeout(forceClose);
			if (error) {
				console.error("HTTP server shutdown error:", error);
				process.exitCode = 1;
			}
		});
	};

	process.once("SIGTERM", () => shutdown("SIGTERM"));
	process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
	console.error("Failed to start Next.js server:", error);
	process.exit(1);
});
