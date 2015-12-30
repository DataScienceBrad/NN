//--------- SandDance Start.

interface BusEvent {
    data: any;
    date: Date;
}

class Bus {
    private listeners: any[] = [];

    public postMessage(data: any): void {
        this.listeners.forEach((callback) => {
            window.setTimeout(() => {
                callback(<BusEvent> {
                    date: new Date(),
                    data: data
                }, 0);
            });
        });
    }

    public addEventListener(event, callback): void {
        this.listeners.push(callback);
    }
}

/* tslint:disable */
var hostBus = new Bus();
var iframeBus = new Bus();
/* tslint:enable */