interface HammerOptions
{
    drag?: boolean;
    drag_block_horizontal?: boolean;
    drag_block_vertical?: boolean;
    drag_lock_to_axis?: boolean;
    drag_max_touches?: number;
    drag_min_distance?: number;
    hold?: boolean;
    hold_threshold?: number;
    hold_timeout?: number;
    prevent_default?: boolean;
    prevent_mouseevents?: boolean;
    release?: boolean;
    show_touches?: boolean;
    stop_browser_behavior?: Object;
    swipe?: boolean;
    swipe_max_touches?: number;
    swipe_velocity?: number;
    tap?: boolean;
    tap_always?: boolean;
    tap_max_distance?: number;
    tap_max_touchtime?: number;
    doubletap_distance?: number;
    doubletap_interval?: number;
    touch?: boolean;
    transform?: boolean;
    transform_always_block?: boolean;
    transform_min_rotation?: number;
    transform_min_scale?: number;
}

interface HammerPoint
{
    pageX: number;
    pageY: number;
}

interface HammerGesture
{
    timestamp: number;
    target: HTMLElement;
    touches: any[];
    pointerType: string;
    center: HammerPoint;
    deltaTime: number;
    deltaX: number;
    deltaY: number;
    velocityX: number;
    velocityY: number;
    angle: number;
    direction: string;
    distance: number;
    scale: number;
    rotation: number;
    eventType: string;
    srcEvent: any;
    startEvent: any;
}

interface HammerDOMEvent extends Event
{
    gesture: HammerGesture;
}

interface HammerPlugins
{
    showTouches(): void;
    fakeMultitouch(): void;
}

interface HammerInstance
{
    constructor(element: HTMLElement, options?: any);
    element: HTMLElement;
    enabled: boolean;
    options: HammerOptions;
    on(gesture: string, handler: (ev: HammerDOMEvent) => boolean): HammerInstance;
    on(gesture: string, handler: (ev: HammerDOMEvent) => void): HammerInstance;
    off(gesture: string, handler: (ev: HammerDOMEvent) => boolean): HammerInstance;
    off(gesture: string, handler: (ev: HammerDOMEvent) => void): HammerInstance;
    trigger(gesture: string, eventData?: HammerGesture): HammerInstance;
}

interface HammerStatic
{
    (element: HTMLElement, options?: any): HammerInstance;
    Instance: HammerInstance;
    plugins: HammerPlugins;
}

declare var Hammer: HammerStatic;

interface JQuery
{
    hammer(options?: HammerOptions): JQuery;
}

interface JQueryEventObject
{
    gesture: HammerGesture;
}

