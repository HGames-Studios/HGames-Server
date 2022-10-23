type PlayerEvent = "Join"       // Join server
    | "Disconnect"              // Internet disconnection
    | "Reconnect"               // Internet connect after disconenction in (30s)
    | "Banned"                  // AntiCheat Banned
    | "Kicked"                  // Kicked from session
    | "ChatMessage"             // Chat Message
    | "Move"                    // On move
    | "Quit"                    // On quit server
    | "LevelUp"                 // On levelup

interface PlayerEventObject {
    name: PlayerEvent,
    callback: any,
    canceled: boolean
}

export { PlayerEvent }
export { PlayerEventObject }

export class Player {
    private x: number = 0;
    private y: number = 0;
    private width: number = 0;
    private height: number = 0;

    private asset: string = '';
    private money: number = 100;
    private xp: number = 0;
    private level: number = 1;

    private xp_per_level: number = 500;
    private listeners: Array<PlayerEventObject> = [];
    public socketId: string
    public clientData: any;

    constructor(socketId: any) {
        this.socketId = "" + socketId;
    }

    public setXpPerLevel(xp_per_level: number): void {
        this.xp_per_level = xp_per_level;
    }

    public getLevelUpRequiredXp(): number {
        return this.xp_per_level * this.level
    }

    public checkIfCanLevelUp(): boolean {
        return this.xp >= this.getLevelUpRequiredXp()
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public setCurrentAsset(asset: string): void {
        this.asset = asset;
    }

    public setMoney(money: number): void {
        this.money = money;
    }

    public setXp(xp: number): void {
        this.xp = xp;
    }

    public setLevel(level: number): void {
        this.level = level; 
    }

    public addMoney(money: number): void {
        this.money += money;
    }

    public addXp(xp: number): void {
        this.xp += xp;
    }

    public on(eventName: PlayerEvent, callback: any): number {
        this.listeners.push({
            name: eventName,
            callback: callback,
            canceled: false
        });

        return this.listeners.length;
    }

    public cancelListener(index: number): boolean {
        this.listeners[index].canceled = true;

        return true;
    }

    public uncancelListener(index: number): boolean {
        this.listeners[index].canceled = false;

        return true;
    }

    public getListenersOf(eventName: PlayerEvent) {
        return this.listeners.filter((listener: PlayerEventObject) => {
            return listener.name === eventName && !listener.canceled;
        });
    }

    public fire(eventName: PlayerEvent, data: any): void {
        this.getListenersOf(eventName).forEach((event: PlayerEventObject): void => event.callback(data))
    }

    // Default Tick Function
    public tick() {
        if(this.checkIfCanLevelUp()) this.levelUp()
    }

    // Private methods
    private levelUp(): void {
        if(!this.checkIfCanLevelUp()) return;

        this.xp -= this.getLevelUpRequiredXp();
        this.level++;

        this.getListenersOf('LevelUp').forEach(listener => listener.callback({
            time: Date.now(),
            invokator: this,
            newLevel: this.level
        }));
    }
}