import { createServer } from "http"
import express from "express"
import { Player } from "./player"
import { Channel } from "./channel"
const socket = require("socket.io")

export interface ServerConfig {
    maps: Array<string>,
    config: any,
    player: any
}

export class Server {
    public server_config: ServerConfig;
    private server: any;
    private express: any;
    private socket: any;
    private channels: Array<Channel>;
    public setup() {};

    constructor() {
        this.server_config = {
            maps: [],
            config: {
                tickInterval: 1000 / 20,
                port: 4000,
                maxChannels: 5
            },
            player: Player
        }

        this.channels = []

        if(this.setup) this.setup();
        this.initializeServer();
    }

    public usePlayer(PlayerClass: any): void {
        this.server_config.player = PlayerClass;
    }

    public useConfig(config: any): void {
        this.server_config.config = typeof config === 'function' ? config() : config;
    }

    public useMaps(maps: any): void {
        this.server_config.maps = typeof maps === 'function' ? maps() : maps;
    }

    public log(text: string): void {
        console.log("\n" + text + "\n");
    }

    private initializeServer(): void {
        this.express = express();
        this.server = createServer(this.express);
        this.socket = socket(this.server);

        this.express.use('/public', express.static(__dirname + "/utils/public"))
        this.express.get('/', (req: any, res: any): void => res.send("Server works!"))

        this.server.listen(this.server_config.config.port, () => this.log(`Server listening on port ${this.server_config.config.port}`));
        this.handleSockets();
        this.createChannel();
    }

    private findBestChannel(): Channel {
        const notEmpty: Array<Channel> = this.channels.filter((channel: Channel): boolean => {
            return channel.connected.length > 0;
        });

        if(notEmpty.length === 0) {
            return this.channels[Math.round(Math.random() * this.channels.length)];
        }

        const sortedByOccupation: Array<Channel> = notEmpty.sort((a: Channel, b: Channel) => a.connected.length - b.connected.length);
        const averageOccupied: Channel = sortedByOccupation[Math.round(sortedByOccupation.length / 2)];

        return averageOccupied;
    }

    private handleSockets(): void {
        this.socket.on('connection', (socket: any): void => {
            let channel: Channel = this.findBestChannel() ? this.findBestChannel() : this.createChannel();
            channel.connect(socket);
        })
    }

    /**
     * This creates a new socket channel and returns it!
     */
    public createChannel(): Channel {
        this.channels.push(new Channel(this.channels.length, this));

        return this.channels[this.channels.length - 1];
    }
}