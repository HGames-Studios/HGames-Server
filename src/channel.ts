export class Channel {
    private id: number;
    private server: any;
    public connected: Array<any>;
    public players: Array<any>;

    constructor(id: number, server: any) {
        this.id = id;
        this.server = server;
        this.connected = [];
        this.players = [];

        this.initialize();
    }

    private initialize(): void {
        const { socket, express }: any = this.server;

        express.get('/channel-' + this.id, (req: any, res: any): void => {
            res.set('Content-Type', 'text/plain');
            res.send(`Channel ${this.id} properly works!`);
        });

        express.get(`/channel-${this.id}/test-connect`, (req: any, res: any): void => {
            res.sendFile(__dirname + "/utils/views/test.html")
        })
    }

    public connect(socket: any): void {
        if(!socket) return;

        // Creating Player
        const playerClass: any = this.server.server_config.player;
        type Player = typeof playerClass;

        const player: Player = new playerClass(socket.id);

        this.players.push(player);
        this.connected.push(socket);

        // Events
        socket.on('join', (data: any) => player.fire('Join', data));
        socket.on('quit', (data: any) => player.fire('Quit', data));
        socket.on('move', (data: any) => player.fire('Move', data));
        socket.on('chatmessage', (data: any) => player.fire('ChatMessage', data));

        socket.on('disconnect', (data: any) => player.fire('Disconnect', data));
        socket.on('reconnect', (data: any) => player.fire('Reconnect', data));

        player.on('Banned', (data: any) => {
            socket.disconnect();
        });

        // Fire event
        this.server.onPlayerConnect(player);
    }
}