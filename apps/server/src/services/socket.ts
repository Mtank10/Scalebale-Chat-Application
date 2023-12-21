import { Server } from "socket.io";
import Redis from 'ioredis'
import prismaClient from './prisma'

const pub = new Redis({
    host:"redis-37716543-rajshivam691-1545.a.aivencloud.com",
    port:21795,
    username:"default",
    password:"AVNS_p4svvzU0XkdFArlWE2C",
})
const sub = new Redis(
    {
    host:"redis-37716543-rajshivam691-1545.a.aivencloud.com",
    port:21795,
    username:"default",
    password:"AVNS_p4svvzU0XkdFArlWE2C",
    }
)

class SocketService {
    private _io: Server;
    constructor(){
        console.log("Init Socket Service...");
        this._io = new Server(
            {
                cors:{
                    allowedHeaders:["*"],
                    origin:"*",
                }
            }
        );
        sub.subscribe("MESSAGES");
    }


    public initListeners() {
        const io = this.io;
        console.log("init socket listeners...")
        io.on("connect", (socket: { id: any; on: (arg0: string, arg1: ({ message }: { message: string; }) => Promise<void>) => void; }) =>{
            console.log(`New Socket Connected`, socket.id);

         socket.on('event:message', async ({message}:{message: string})=>{
             console.log('New Message Rec.',message);
             //publish this message to redis
             await pub.publish('MESSAGES',JSON.stringify({message}))        

         })

        });
        
        sub.on("message",async (channel,message)=>{
            if(channel==="MESSAGES"){
                io.emit("message",message);
                await prismaClient.message.create({
                    data:{
                        text:message,
                    }
                })
            }
        })
        
    }

    get io(){
        return this._io;
    }

    
}

export default SocketService;