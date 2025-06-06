import http from 'http';
import SocketService from './services/socket';

async function init() {
    console.log('Starting Chat Application Server...');
    
    const socketService = new SocketService();
    const httpServer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 8000;

    socketService.io.attach(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 HTTP server running at PORT: ${PORT}`);
        console.log(`🔌 Socket.IO server ready for connections`);
    });

    socketService.initListeners();
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        httpServer.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}

init().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});