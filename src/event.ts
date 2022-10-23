export class Event {
    public time: number;
    public invokator: any;
    public name: string;

    constructor() {
        this.time = Date.now()
    }
}