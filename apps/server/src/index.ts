import http from 'http';
import SocketService from './services/socket';
async function init(){
    
    const socketService = new SocketService();


    const httpSerer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 8000;

    socketService.io.attach(httpSerer);

    httpSerer.listen(PORT,()=>{
        console.log(`HTTP server at PORT: ${PORT}`);
    })

    socketService.initListeners();
}

init();
