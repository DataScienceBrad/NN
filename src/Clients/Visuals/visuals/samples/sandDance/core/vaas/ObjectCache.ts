module sandDance {
    interface Cache {
        [name: string]: any;
    }

    export class ObjectCache {
        private cache: Cache = {};

        public set(name: string, obj: any): void {
            this.cache[name] = obj;
        }

        public get(name: string): any {
            return this.cache[name];
        }
    }
}