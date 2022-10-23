import { Server, Player } from "../src/index"

class GamePlayer extends Player {}

class Game extends Server {
    constructor() {
        super()
    }

    public config(): any {
        return {
            tickInterval: 1000 / 50,
            port: 4000,
            maxChannels: 50
        };
    }

    public maps(): Array<string> {
        return [
            "maps/map1.hsw"
        ];
    }

    public setup(): void {
        this.usePlayer(GamePlayer);
        this.useConfig(this.config);
        this.useMaps(this.maps);
    }

    public tick(): void {

    }

    public onPlayerConnect(player: GamePlayer): any {
        // Front end emits join event
        player.on('Join', (data: any) => {
            console.log(`Player ${player.socketId} joined!`)
        })

        // Front end emits quit event
        player.on('Quit', (data: any) => {
            console.log(`Player ${player.socketId} quited!`)
        })

        // Socket connection connected
        player.on('Reconnect', (data: any) => {
            console.log(`Player ${player.socketId}'s socket re-connected or connected first time!`)
        })

        // Sudden disconnection
        player.on('Disconnect', (data: any) => {
            console.log(`Player ${player.socketId}'s socket disconnected sudenlly!`)
        })

        // Banned
        player.on('Banned', (data: any) => {
            console.log(`Player ${player.socketId} got banned!`)
        })

        // Kicked
        player.on('Kicked', (data: any) => {
            console.log(`Player ${player.socketId} got kicked!`)
        })

        player.on('Move', (data: any) => {
            console.log(`Player ${player.socketId} moved!`)
        })
    }
}

new Game();