import { Server } from "socket.io";
import Redis from 'ioredis'
import prismaClient from './prisma'
import { v4 as uuidv4 } from 'uuid';

const pub = new Redis({
    host: "redis-37716543-rajshivam691-1545.a.aivencloud.com",
    port: 21795,
    username: "default",
    password: "AVNS_p4svvzU0XkdFArlWE2C",
})

const sub = new Redis({
    host: "redis-37716543-rajshivam691-1545.a.aivencloud.com",
    port: 21795,
    username: "default",
    password: "AVNS_p4svvzU0XkdFArlWE2C",
})

class SocketService {
    private _io: Server;
    
    constructor() {
        console.log("Init Socket Service...");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
        sub.subscribe("MESSAGES");
    }

    public initListeners() {
        const io = this.io;
        console.log("init socket listeners...")
        
        io.on("connect", (socket) => {
            console.log(`New Socket Connected`, socket.id);

            socket.on('event:message', async ({ message, username }: { message: string; username: string }) => {
                console.log('New Message Rec.', message, 'from', username);
                
                const messageData = {
                    id: uuidv4(),
                    message,
                    username,
                    timestamp: new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                };

                // Publish this message to redis
                await pub.publish('MESSAGES', JSON.stringify(messageData));
            });

            socket.on('disconnect', () => {
                console.log(`Socket Disconnected`, socket.id);
            });
        });

        sub.on("message", async (channel, message) => {
            if (channel === "MESSAGES") {
                console.log('Broadcasting message:', message);
                io.emit("message", message);
                
                try {
                    const messageData = JSON.parse(message);
                    await prismaClient.message.create({
                        data: {
                            text: `${messageData.username}: ${messageData.message}`,
                        }
                    });
                } catch (error) {
                    console.error('Error saving message to database:', error);
                }
            }
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketService;