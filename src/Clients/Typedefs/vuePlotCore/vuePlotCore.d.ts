declare module vp {
    function arrayEquals(a1: any[], a2: any[]): boolean;
}
/** used to extend array class with new functions. */
interface Array<T> {
    avg(itemFunc?: any): number;
    count(itemFunc?: any): number;
    distinct(itemFunc?: any): T[];
    equals(a2: T[]): boolean;
    generate(container: any, tagName: string, callBack?: any): any[];
    groupBy(...groupCol: string[]): {
        key: string;
        values: T[];
    }[];
    max(itemFunc?: any): number;
    min(itemFunc?: any): number;
    orderByNum(keyFunc?: any): T[];
    orderByStr(keyFunc?: any): T[];
    remove(elem: any): void;
    removeAt(index: number): void;
    sum(itemFunc?: any): number;
    take(amt: any): T[];
    toArray(): number[];
    insert?(index: number | any, value: any): void;
    where(itemFunc?: any): T[];
}
/** used to extend array class with new functions. */
interface Float32Array {
    avg(itemFunc?: any): number;
    count(itemFunc?: any): number;
    distinct(itemFunc?: any): number[];
    equals(a2: Float32Array): boolean;
    generate(container: any, tagName: string, callBack?: any): any[];
    groupBy(...groupCol: string[]): {
        key: string;
        values: number[];
    }[];
    max(itemFunc?: any): number;
    min(itemFunc?: any): number;
    orderByNum(keyFunc?: any): number[];
    orderByStr(keyFunc?: any): number[];
    sum(itemFunc?: any): number;
    take(amt: any): number[];
    toArray(): number[];
    where(itemFunc?: any): number[];
}
declare module vp.unitTests {
}
declare module vp.color {
    class hsl {
        _hue: number;
        _saturation: number;
        _lightness: number;
        _alpha: number;
        constructor(hue: number, saturation: number, lightness: number, alpha?: number);
        toRgb(): any[];
        toString(): string;
        lighten(): hsl;
        darken(): hsl;
        hue(): number;
        saturation(): number;
        lightness(): number;
        alpha(): number;
        adjustHue(factor: number): hsl;
        adjustSaturation(factor: number): hsl;
        adjustValue(factor: number): hsl;
    }
    function hslFromRgb(rgb: any): hsl;
    function rgbFromHsl(hsl: any, ...args: any[]): any[];
    function hueToRgb(m1: any, m2: any, h: any): any;
    function normalizeHue(value: any): any;
}
declare module vp {
}
/** used to extend MATH class with new functions. */
interface Math {
    log10(value: number): number;
    log2(value: number): number;
}
declare module vp.utils {
    enum TokenType {
        none = 0,
        operator = 1,
        id = 2,
        string = 3,
        number = 4,
        comment = 5,
        newLine = 6,
        space = 7,
        eof = 8,
    }
    class scanner {
        _index: number;
        _tokenType: TokenType;
        _token: string;
        _spacesSkipped: number;
        _str: string;
        constructor(str?: string);
        init(str: string): void;
        tokenType(): TokenType;
        spacesSkipped(): boolean;
        token(): string;
        restOfCmd(): string;
        private isStartOfNum(str, ch, index);
        isDigitChar(ch: string, isFirst: boolean): boolean;
        scan(): TokenType;
    }
}
declare module vp {
}
/** used to extend string class with new functions. */
interface String {
    startsWith(prefix: string): boolean;
    endsWith(suffix: string): boolean;
    ltrim(): string;
    rtrim(): string;
    contains(substr: string): boolean;
    capitalize(): string;
}
declare module vp.animation {
    class animationClass {
        ctr: string;
        private _children;
        private elementsBeingAnimated;
        private elemsToDelete;
        private completedFuncs;
        private onFrameCallback;
        private removed;
        private timer;
        private timeStarted;
        private delaying;
        private _frameCount;
        private elem;
        private parentAnimation;
        private _duration;
        private _easeObj;
        private _delay;
        constructor(elem: any, duration: any, easeObj: any, parentAnimation: any, delay?: any);
        restart(): void;
        setTimer(): void;
        remove(anim: any): void;
        frameCount(): number;
        private getSlideLoc(slideLoc, elem);
        initAnim(elem: any): void;
        clearAnim(elem: any): void;
        private getTranslateTo(trans);
        applyEffect(elem: any, effect: any, isEnter: any): void;
        applyEnterEffect(elem: any, effect: any): void;
        applyExitEffect(elem: any, effect: any): void;
        private getTransformObject(elem);
        private parseTransformParams(scanner, transObj, paramCount);
        private parseTransform(str);
        private getFromNumber(elem, isStyle, name);
        private getFromColor(elem, isStyle, name);
        private animatePointsValue(elem, name, isStyle, fromValue, value);
        private animateColorValue(elem, name, isStyle, fromValue, value);
        private animateTransformValue(elem, name, isStyle, fromValue, value);
        animateAttr(elem: any, name: any, value: any, value2?: any, cx?: any, cy?: any, isStyle?: any): void;
        deleteElementOnCompleted(elem: HTMLElement): void;
        private removeChild(elem, name);
        private addAnimation(newChild);
        animateFrame(): boolean;
        children(): any[];
        animateFrameCore(percent: number, startingChildIndex?: number): void;
        stop(): boolean;
        onAnimationComplete(arg: any): animationClass;
        onFrame(arg: any): any;
        private onAnimationStopped(wasCancelled?);
        duration(): number;
        duration(value: number): animationClass;
        delay(): number;
        delay(value: number): animationClass;
        easeObj(): any;
        easeObj(value: any): animationClass;
    }
    function createAnimation(elem: any, duration: any, easeObj: any, container: any, delay: any): animationClass;
    function requestAnimationFrame(callback: any): any;
    function cancelAnimationFrame(timer: any): void;
    var shaderAnimationMgr: any;
}
declare module vp.animation {
    class animationContainer {
        ctr: string;
        children: any[];
        completedFunc: any;
        timer: any;
        _timeStarted: any;
        easeObj: any;
        isRunning: boolean;
        constructor();
        timeStarted(): any;
        add(anim: any): void;
        stop(): void;
        onCompleted(completedFuncParam: any): void;
        clear(): void;
        private onStoppedOrCompleted();
        animateFrame(): void;
    }
}
declare module vp.animation {
    class colorAnimation {
        from: number[];
        to: number[];
        element: any;
        parent: any;
        attributeName: string;
        isStyle: boolean;
        constructor(parent: any, element: any, attributeName: string, fromColor: any, toColor: any, isStyle: boolean);
        private getAnimatedValue(percent);
        animateFrame(percent: any): void;
    }
}
declare module vp.eases {
    enum EaseMode {
        easeIn = 0,
        easeOut = 1,
        easeInOut = 2,
    }
    enum BezierEaseMode {
        ease = 0,
        easeIn = 1,
        easeOut = 2,
        easeInOut = 3,
        linear = 4,
        maxEase = 5,
    }
    class easeBase {
        easeMode: EaseMode;
        easeCore(t: any): any;
        ease(t: any): any;
    }
    class floorEase extends easeBase {
        easeCore(t: any): number;
    }
    class nearestNeighborEase extends easeBase {
        easeCore(t: any): number;
    }
    class linearEase extends easeBase {
        easeCore(t: any): any;
    }
    class quadraticEase extends easeBase {
        easeCore(t: any): number;
    }
    class cubicEase extends easeBase {
        easeCore(t: any): number;
    }
    class quarticEase extends easeBase {
        easeCore(t: any): number;
    }
    class sineEase extends easeBase {
        easeCore(t: any): number;
    }
    class circleEase extends easeBase {
        easeCore(t: any): number;
    }
    class backEase extends easeBase {
        amplitude: number;
        constructor(amplitude: number);
        easeCore(t: any): number;
    }
    class powEase extends easeBase {
        n: number;
        constructor(n: number);
        easeCore(t: any): number;
    }
    class stdEaseOut extends easeBase {
        constructor();
        easeCore(t: any): number;
    }
    class expEase extends easeBase {
        n: number;
        constructor(n: number);
        easeCore(t: any): any;
    }
    class springEase extends easeBase {
        springiness: number;
        oscillations: number;
        constructor(springiness: number, oscillations: number);
        easeCore(t: any): number;
    }
}
declare module vp.animation {
    class dataAnimMgrClass {
        ctr: string;
        _enterShapes: any[];
        _updateShapes: any[];
        _exitShapes: any[];
        _updateRows: any[];
        _container: any;
        _keys: {};
        _data: any[];
        _transition: vp.animation.transitionClass;
        _enterDataPairs: any[];
        _pkCallback: any;
        _dataId: any;
        _seriesCount: number;
        _appendNameOrCallback: any;
        _layerId: string;
        _isSeriesLayer: boolean;
        _seriesNames: string[];
        _pendingSeriesNames: string[];
        _animStartTime: number;
        _animFPS: number;
        _shapesDrawn: number;
        _statsCallback: any;
        constructor(containerUW: any, pkFunc: any, appendSFCtor: any, layerId: string, isSeriesLayer?: boolean, createTransition?: boolean);
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): dataAnimMgrClass;
        hookTransitionEvents(): void;
        /** will stop all animations associated with this mgr. */
        clearActiveAnimations(): void;
        setData(newData: any, isNewDataSet?: boolean, newDataId?: any): dataAnimMgrClass;
        /** this is only called from layers that support series plotting.  It should be called after setData(), but before
        updateShapes().  */
        setSeriesNames(value: string[]): void;
        private applySeriesNames();
        updateShapes(seriesIndex: any, totalSeries: any, callBack: any, appendStrOrFunc?: any): any;
        createExitAnimations(seriesIndex: number, shapesTouched: any[], callBack: any): void;
        createEnterAnimations(seriesIndex: number, shapesTouched: any[], callBack: any): void;
        createUpdateAnimations(seriesIndex: number, shapesTouched: any[], callBack: any): void;
        getData(): any[];
        clear(): void;
        updateWithoutDataChange(): void;
        createMultipleShapes(appendStrOrFunc: any, seriesCount: any, enterDataPairs: any): any[];
        createShape(appendStrOrFunc: any, dataRecord: any, index: any, key: any, seriesIndex: any): any;
        createEnterShapesIfNeeded(seriesCount: any, appendStrOrFunc: any): void;
        processNewlyCreatedShapes(newShapes: any[], pairList: any[], seriesCount: number, seriesIndex?: number): void;
        addKey(uelem: any, key: string): void;
        deleteKey(uelem: any, key: string): void;
        onAnimationComplete(anim: vp.animation.animationClass, wasCancelled: boolean, changeType: string): void;
        removeExitShapesNow(seriesIndex: any): void;
        lookupElement(dataItem: any, dataIndex: any, seriesIndex: any): any;
        private getPrimaryKey(dataItem, dataIndex);
        private getFullKey(dataItem, dataIndex, seriesIndex, key?);
        container(value: any): any;
        dataId(value: any): any;
        /** public property: keyFunc (can be a column name (string) or a callbackthat returns a unique ID for each record). */
        keyFunc(): any;
        keyFunc(value: any): dataAnimMgrClass;
        getExistingShapes(): any[];
        statsCallback(value: any): dataAnimMgrClass;
    }
}
declare module vp.animation {
    enum FadeType {
        none = 0,
        fade = 1,
    }
    enum SlideLoc {
        none = 0,
        left = 1,
        top = 2,
        right = 3,
        bottom = 4,
    }
    enum GrowOrigin {
        none = 0,
        left = 1,
        top = 2,
        right = 3,
        bottom = 4,
        center = 5,
    }
    function makeEffects(fadeType?: any, slideLoc?: SlideLoc, growOrigin?: GrowOrigin, rotateAngle?: number, rotateCx?: number, rotateCy?: number): IEffects;
    interface IEffects {
        fadeType?: FadeType;
        slideLoc?: SlideLoc;
        growOrigin?: GrowOrigin;
        rotateAngle?: number;
        rotateCx?: number;
        rotateCy?: number;
    }
}
declare module vp.animation {
    class numberAnimation {
        from: number;
        to: number;
        isCssProperty: boolean;
        parent: any;
        element: any;
        name: string;
        constructor(parent: any, element: any, attributeName: string, fromValue: string, toValue: string, isCssProperty: boolean);
        private getAnimatedValue(percent);
        private isStyled();
        animateFrame(percent: number): void;
    }
}
declare module vp.animation {
    class pointsAnimation {
        xFrom: number[];
        yFrom: number[];
        xTo: number[];
        yTo: number[];
        element: any;
        parent: any;
        attributeName: string;
        constructor(parent: any, element: any, attributeName: any, fromPoints: any, toPoints: any);
        private getAnimatedValue(percent);
        animateFrame(percent: any): void;
    }
}
declare module vp.animation {
    class transformAnimation {
        parent: any;
        element: any;
        parts: any[];
        constructor(parent: any, element: any);
        makeTransform(name: any, fromValue: any, toValue: any, cx: any, cy: any): void;
        private removePart(name);
        private getAnimatedValue(percent);
        animateFrame(percent: any): void;
    }
}
declare module vp.animation {
    /** Supports data-based generation of SVG text primitives.  Can be used with animations.  Core function
    is "update()". */
    class transitionClass {
        _enterAnim: vp.animation.animationClass;
        _updateAnim: vp.animation.animationClass;
        _exitAnim: vp.animation.animationClass;
        _enterEffect: vp.animation.IEffects;
        _exitEffect: vp.animation.IEffects;
        _activeClients: any[];
        _id: string;
        constructor(duration?: number, easeObj?: any, delay?: number, enterEffect?: string, exitEffect?: string, id?: string);
        hookEnterCompleted(): void;
        hookUpdateCompleted(): void;
        hookExitCompleted(): void;
        private addClient(clientObj);
        /** With this call, the first associated client to have existing animations will clear all of the animations. */
        clearAnimations(clientObj: any): void;
        enter(): vp.animation.animationClass;
        enter(value: vp.animation.animationClass): transitionClass;
        exit(): vp.animation.animationClass;
        exit(value: vp.animation.animationClass): transitionClass;
        update(): vp.animation.animationClass;
        update(value: vp.animation.animationClass): transitionClass;
        enterEffect(): vp.animation.IEffects;
        enterEffect(value: vp.animation.IEffects): transitionClass;
        exitEffect(): vp.animation.IEffects;
        exitEffect(value: vp.animation.IEffects): transitionClass;
    }
    function createTransition(duration?: number, easeObj?: any, delay?: number, enterEffect?: string, exitEffect?: string, id?: string): transitionClass;
}
declare module vp.chartFrame {
    /** The base class for the 4 axis classes.  This class holds drawing data & properties & provides getter/setter access to them.  */
    class axisBaseClass<T> implements IMarkBasedVisualization<T> {
        _rootElem: any;
        _fakeLabel: SVGTextElement;
        _fakeNameLabel: SVGTextElement;
        _fakeSvg: vp.dom.singleWrapperClass;
        _ellipsesBounds: SVGRect;
        _isCrisp: boolean;
        _location: vp.chartFrame.LabelLocation;
        _axisSize: number;
        _expandSpace: number;
        _positiveAutoRotation: boolean;
        _firstBuild: boolean;
        _transition: vp.animation.transitionClass;
        _lastYTickBox: number;
        _lastXTickBox: number;
        _minWidth: number;
        _minHeight: number;
        _offset: number;
        _maxTextWidth: number;
        _maxTextHeight: number;
        _rootMark: vp.marks.groupMarkClass;
        _axisLineMark: vp.marks.lineMarkClass;
        _tickMark: vp.marks.lineMarkClass;
        _tickBox: vp.marks.rectangleMarkClass;
        _minorTickMark: vp.marks.lineMarkClass;
        _labelMark: vp.marks.textMarkClass;
        _nameMark: vp.marks.textMarkClass;
        _name: string;
        _labelStrings: string[];
        _labelOffsets: number[];
        _tickOffsets: number[];
        _minorTickOffsets: number[];
        _breakValues: number[];
        _isAxisLineVisible: boolean;
        _ticksOnInside: boolean;
        _labelOverflow: LabelOverflow;
        _labelRotation: LabelRotation;
        _nameRotation: LabelRotation;
        _onShade: any;
        /** minimum spacing between largest label and avail space per label before overflow algorithm applies, for 0, 45, and 90 degree rotations. */
        _minLabelSpacing: number[];
        /** when set, limits the size of the label space perpendicular to the axis.  */
        _maxPerpendicularSize: number;
        _drawingParams: IAxisDrawingParams;
        _labelSizes: SVGRect[];
        _szMaxText: {
            width: number;
            height: number;
        };
        _availPixelsPerLabel: number;
        _actualLabelRotation: number;
        _measuredSize: number;
        private _axisData;
        private _isLabelsVisible;
        private _isTicksVisible;
        private _isTickBoxesVisible;
        private _hideInteriorLabels;
        private _isMinorTicksVisible;
        constructor(container: any, axisDataOrScale: any, useWebGl: boolean, isCrisp: boolean, location: LabelLocation);
        bounds(elem: SVGElement): {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        createFakeTextElement(parent: any): any;
        createFakeNameElement(parent: any): any;
        hide(transition?: vp.animation.transitionClass): void;
        show(transition?: vp.animation.transitionClass, showValue?: boolean): void;
        isVisible(): boolean;
        buildDefaultDrawingParams(): void;
        clearMeasurements(): void;
        build(transition?: vp.animation.transitionClass, measureOnly?: boolean, clearMeasurements?: boolean): void;
        generateHorizontalName(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        generateVerticalName(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        generateHorizontalLabels(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        generateVerticalLabels(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        generateTicks(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        generateAxisLine(generate: boolean, transition: vp.animation.transitionClass, isRightOrBottomAxis: boolean): void;
        getMeasuredWidth(): number;
        getMeasuredHeight(): number;
        minWidth(): number;
        minWidth(value: number): T;
        minHeight(): number;
        minHeight(value: number): T;
        tickCount(): number;
        tickCount(value: number): T;
        isLabelsVisible(): boolean;
        isLabelsVisible(value: boolean): T;
        isTicksVisible(): boolean;
        isTicksVisible(value: boolean): T;
        isTickBoxesVisible(): boolean;
        isTickBoxesVisible(value: boolean): T;
        isAxisLineVisible(): boolean;
        isAxisLineVisible(value: boolean): T;
        hideInteriorLabels(): boolean;
        hideInteriorLabels(value: boolean): T;
        isMinorTicksVisible(): boolean;
        isMinorTicksVisible(value: boolean): T;
        axisData(): axisDataClass;
        axisData(value: axisDataClass): T;
        shadeMarks(transition: vp.animation.transitionClass, record: any, index: number, isNew: boolean, context: any, measureOnly: boolean): void;
        getNameWidth(): number;
        getNameHeight(): number;
        getMaxLabelSize(isForWidth: boolean): {
            width: number;
            height: number;
        };
        horizontalTickShader(element: any, record: any, index: any, isNew: any, xStart: number, length: number, y: number): void;
        horizontalTickBoxShader(element: any, record: any, index: any, isNew: any, xStart: number, length: number, yRecord: any): void;
        verticalTickShader(element: any, record: any, index: any, isNew: any, yStart: number, length: number, x: number): void;
        verticalTickBoxShader(element: any, record: any, index: any, isNew: any, yStart: number, length: number, xRecord: any): void;
        rootElem(): any;
        translate(x: number, y: number, isCrispAdjustment?: boolean): axisBaseClass<T>;
        rotateText45(text: string, wrapElem: any, alignTo: vp.chartFrame.LabelLocation, angle: number, drawParams: vp.marks.ITextDrawingParams, fakeLabel: SVGTextElement): vp.geom.ISize;
        getRotateSize45(width: number, height: number): {
            width: number;
            height: number;
        };
        rotatedSize(rotation: LabelRotation, normalSize: number, size90: number): number;
        finalTextBaseline(fakeLabel: any, wrapElem: any, align: string): void;
        labelSizes(): any;
        labelSizes(value: any): T;
        getActualMaxPerpendicularSize(): number;
        getAvailablePixelsPerLabelForTruncation(actualLabelRotation: number): number;
        shadeTextLabel(index: number, element: any, cx: number, cy: number, text: string, hAlign: string, vAlign: string, alignTo: LabelLocation, returnWidth: boolean, availPixelsPerLabel: number): number;
        getLabelBounds(index: number, x: number, y: number, hAlign: string): {
            x: number;
            y: number;
            width: number;
            height: number;
            yCorrection: number;
        };
        rotateText90(text: string, wrapElem: any, alignTo: vp.chartFrame.LabelLocation, cx: number, cy: number, angle: number, drawParams: vp.marks.ITextDrawingParams, fakeLabel: SVGTextElement): vp.geom.ISize;
        getFinalTextSize(text: string, drawingParams: vp.marks.ITextDrawingParams, fakeLabel: SVGTextElement): {
            width: number;
            height: number;
        };
        hideTicksIfTooMany(): void;
        getActualLabelRotation(maxMeasuredWidth: number, maxMeasuredHeight: number, axisSize: number, labelCount: number): LabelRotation;
        getAvailPixelsPerLabel(actualRotation: LabelRotation, availAxisSize: number, labelCount: number): number;
        /** See if labels can fit the axis, using rotation and trimming. */
        canLabelsFit(availAxisSize: number, labelCount: number, maxMeasuredWidth: number, maxMeasuredHeight: number): boolean;
        measureAllLabels(labelStrings: string[]): {
            width: number;
            height: number;
        };
        truncateText(text: string, maxLength: number, overflow: LabelOverflow, fakeLabel: SVGTextElement): string;
        eraseCanvas(): void;
        tickOffsets(): number[];
        tickOffsets(value: number[]): T;
        minorTickOffsets(): number[];
        minorTickOffsets(value: number[]): T;
        labelOffsets(): number[];
        labelOffsets(value: number[]): T;
        labelStrings(): string[];
        labelStrings(value: string[]): T;
        name(): string;
        name(value: string): T;
        labelRotation(): LabelRotation;
        labelRotation(value: LabelRotation): T;
        positiveAutoRotation(): boolean;
        positiveAutoRotation(value: boolean): T;
        ticksOnInside(): boolean;
        ticksOnInside(value: boolean): T;
        nameRotation(): LabelRotation;
        nameRotation(value: LabelRotation): T;
        /** The minimum spacing between largest label and avail space per label before overflow algorithm applies, for 0, 45, and 90 degree rotations. */
        minLabelSpacing(): number[];
        minLabelSpacing(value: number): T;
        minLabelSpacing(value: number[]): T;
        maxPerpendicularSize(): number;
        maxPerpendicularSize(value: number): T;
        expandSpace(): number;
        expandSpace(value: number): T;
        labelOverflow(): LabelOverflow;
        labelOverflow(value: LabelOverflow): T;
        onShade(): any;
        onShade(value: any): T;
        drawingParams(): any;
        drawingParams(value: any): T;
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): T;
        isCrisp(): boolean;
        isCrisp(value: boolean): gridLinesClass;
    }
    interface axisBase extends axisBaseClass<axisBase> {
    }
    /** Specifies how to truncate or hide axis labels that exceed the available space.  If "maxLabelSize" is specified, the
    width of the unrotated label, or the height of the rotated label, is compared to the specified value of "maxLabelSize".  Otherwise, the rotated  size of the
    label in the direction of the axis is compared to the available space between breaks on the axis.  When not enough space is available,
    "LabelOverflow" specifies how the label is drawn. */
    enum LabelOverflow {
        /** draws the entire label, even if it results in labels overwriting each other. */
        overWrite = 0,
        /** truncates the label to fit the available space. */
        truncate = 1,
        /** truncates the label with "..." marks to fit the available space. */
        ellipses = 2,
        /** hides all of the labels on the axis if any of the labels is too large for the available space. */
        hideAll = 3,
    }
    /** Specifies the rotation of the axis labels or name. */
    enum LabelRotation {
        none = 0,
        rotate45 = 45,
        rotateMinus45 = -45,
        rotate90 = 90,
        rotateMinus90 = -90,
        auto = -1,
    }
    /** Specifies where the labels are, relative to the axis line.  */
    enum LabelLocation {
        left = 0,
        top = 1,
        right = 2,
        bottom = 3,
    }
    interface IAxisDrawingParams {
        startPadding: number;
        tickLength: number;
        minorTickLength: number;
        labelToTickPadding: number;
        labelToNamePadding: number;
        endPadding: number;
        maxPerpendicularSize: number;
        tick: vp.marks.ILineDrawingParams;
        tickBox: vp.marks.IShapeDrawingParams;
        minorTick: vp.marks.ILineDrawingParams;
        axisLine: vp.marks.ILineDrawingParams;
        label: vp.marks.ITextDrawingParams;
        name: vp.marks.ITextDrawingParams;
    }
    function indexKeyFunc(data: any, index: any): any;
    function offsetKeyFunc(data: any, index: any): any;
    /** used for labels. */
    function labelKeyFunc(data: any, index: any): any;
}
declare module vp.chartFrame {
    /** contain scale, breaks, lablels, and other info needed to build axes, legends, and grid lines.  */
    class axisDataClass {
        _scale: vp.scales.IScaleRun;
        private _name;
        private _tickCount;
        private _breaks;
        private _labels;
        private _formatter;
        private _labelMeasurements;
        private _dateScaleInfo;
        constructor(scale: vp.scales.IScaleRun, name?: string, tickCount?: number, breaks?: number[], labels?: string[], formatter?: any);
        clearMeasurements(): void;
        private onScaleChanged();
        private getLinearBreaks();
        getActualBreaks(): any[];
        /** Calculate the tick and label offsets for this axis data. */
        getOffsets(breaks: any[]): {
            tickOffsets: number[];
            labelOffsets: number[];
        };
        private makeLinearMinor(breaks, minorSteps);
        private makeCategoryMinor(breaks);
        /** we skip over minor breaks and go straight for minor offsets.  This is because its hard to caculate
        minor breaks for category scales, and we don't have any other use for the minor break values themselves. */
        getActualMinorOffsets(breaks: any[]): any[];
        getDecimalDigitCount(value: number): number;
        getActualLabels(breakValues: number[]): string[];
        scale(): vp.scales.IScaleRun;
        scale(value: vp.scales.IScaleRun): axisDataClass;
        tickCount(): number;
        tickCount(value: number): axisDataClass;
        formatter(): any;
        formatter(value: any): axisDataClass;
        labelMeasurements(): labelMeasurementData;
        labelMeasurements(value: labelMeasurementData): axisDataClass;
    }
    function createAxisData(scale: vp.scales.IScaleRun, name?: string, tickCount?: number, breaks?: number[], labels?: string[], formatter?: any): axisDataClass;
    class labelMeasurementData {
        labelSizes: SVGRect[];
        szMaxText: vp.geom.ISize;
        constructor();
        clear(): void;
    }
}
declare module vp.chartFrame {
    /** creates a vertical axis with the labels to the right of the axis line. */
    class bottomAxisClass extends axisBaseClass<bottomAxisClass> {
        constructor(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean);
        shadeMarks(transition: vp.animation.transitionClass, record: any, index: number, isNew: boolean, context: any, measureOnly: boolean): void;
        width(): number;
        width(value: number): bottomAxisClass;
    }
    function createBottomAxis(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean): bottomAxisClass;
}
declare module vp.chartFrame {
    /** A visual object that hosts a title, legend, axes, gridlines, and a plot area.  */
    class chartFrameEx implements IMarkBasedVisualization<chartFrameEx> {
        private _container;
        private _rootMark;
        private _rootElem;
        private _onShade;
        private _isCrisp;
        private _firstShow;
        private _rcPlot;
        private _xData;
        private _yData;
        private _width;
        private _height;
        private _title;
        private _subTitle;
        private _isBoxVisible;
        private _isLeftAxisVisible;
        private _isTopAxisVisible;
        private _isRightAxisVisible;
        private _isBottomAxisVisible;
        private _isGridLinesVisible;
        private _isTitleVisible;
        private _isSubTitleVisible;
        private _transition;
        private _drawingParams;
        private _axesOnOutSide;
        private _leftAxis;
        private _bottomAxis;
        private _topAxis;
        private _rightAxis;
        private _gridLines;
        private _boxMark;
        private _titleMark;
        private _subTitleMark;
        private _legend;
        constructor(container: any, xData: axisDataClass, yData: axisDataClass);
        shadeTextMark(x: number, y: number, anchor: string, element: any, text: string): void;
        hide(transition?: vp.animation.transitionClass): void;
        show(transition?: vp.animation.transitionClass): void;
        isVisible(): boolean;
        buildAndShow(axis: vp.chartFrame.axisBase, show: boolean): void;
        build(transition?: vp.animation.transitionClass): void;
        layoutAxes(transition: vp.animation.transitionClass, left: number, top: number, right: number, bottom: number): void;
        translate(x: number, y: number, isCrispAdjustment?: boolean): chartFrameEx;
        onShade(): any;
        onShade(value: any): chartFrameEx;
        width(): number;
        width(value: number): chartFrameEx;
        height(): number;
        height(value: number): chartFrameEx;
        isBoxVisible(): boolean;
        isBoxVisible(value: boolean): chartFrameEx;
        isLeftAxisVisible(): boolean;
        isLeftAxisVisible(value: boolean): chartFrameEx;
        isTopAxisVisible(): boolean;
        isTopAxisVisible(value: boolean): chartFrameEx;
        isRightAxisVisible(): boolean;
        isRightAxisVisible(value: boolean): chartFrameEx;
        isBottomAxisVisible(): boolean;
        isBottomAxisVisible(value: boolean): chartFrameEx;
        isGridLinesVisible(): boolean;
        isGridLinesVisible(value: boolean): chartFrameEx;
        isTitleVisible(): boolean;
        isTitleVisible(value: boolean): chartFrameEx;
        /** Normally, the width and height and translate properties define the overall chartFrame.  When
        "axesOnOutside" is set to true, those properties define the plot area, and the axes are drawn on the outsides of the area. */
        axesOnOutside(): boolean;
        axesOnOutside(value: boolean): chartFrameEx;
        drawingParams(): any;
        drawingParams(value: any): chartFrameEx;
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): chartFrameEx;
        onTransitionChanged(): void;
        rootElem(): any;
        buildDefaultDrawingParams(): void;
        leftAxis(): leftAxisClass;
        topAxis(): topAxisClass;
        rightAxis(): rightAxisClass;
        bottomAxis(): bottomAxisClass;
        gridLines(): gridLinesClass;
        legend(): rightAxisClass;
        title(): textData;
        subTitle(): textData;
        isCrisp(): boolean;
        isCrisp(value: boolean): gridLinesClass;
        onIsCrispChanged(): void;
        xAxisData(): vp.chartFrame.axisDataClass;
        xAxisData(value: vp.chartFrame.axisDataClass): chartFrameEx;
        yAxisData(): vp.chartFrame.axisDataClass;
        yAxisData(value: vp.chartFrame.axisDataClass): chartFrameEx;
        plotAreaBounds(): ClientRect;
    }
    /** Note: this class will update the range of the x and y scales, so you may want to pass a copy of them, rather than the original. */
    function createChartFrameEx(container: any, xData: axisDataClass, yData: axisDataClass): chartFrameEx;
    interface IChartFrameDrawingParams {
        leftAxis: IAxisDrawingParams;
        topAxis: IAxisDrawingParams;
        rightAxis: IAxisDrawingParams;
        bottomAxis: IAxisDrawingParams;
        gridLines: vp.chartFrame.IGridLineDrawingParams;
        legend: IAxisDrawingParams;
        box: vp.marks.IShapeDrawingParams;
        title: vp.marks.ITextDrawingParams;
        subTitle: vp.marks.ITextDrawingParams;
    }
    class textData {
        text: string;
        dock: string;
    }
    interface IMarkBasedVisualization<T> extends vp.marks.IMark<T> {
        build(transition?: vp.animation.transitionClass): any;
    }
}
declare module vp.chartFrame {
    /** A set of horizontal and vertical gridlines, associated with X and Y scales.  */
    class gridLinesClass implements IMarkBasedVisualization<gridLinesClass> {
        private _container;
        private _rootMark;
        private _rootElem;
        private _onShade;
        private _xData;
        private _yData;
        private _width;
        private _height;
        private _firstShow;
        private _xMark;
        private _yMark;
        private _xMinorMark;
        private _yMinorMark;
        private _isXVisible;
        private _isYVisible;
        private _isXMinorVisible;
        private _isYMinorVisible;
        private _isCrisp;
        private _drawingParams;
        private _transition;
        constructor(container: HTMLElement, xData: axisDataClass, yData: axisDataClass, isCrisp?: boolean);
        buildInitialDrawingParams(): void;
        hide(transition?: vp.animation.transitionClass): gridLinesClass;
        show(transition?: vp.animation.transitionClass): gridLinesClass;
        isVisible(): boolean;
        build(transition?: vp.animation.transitionClass): void;
        private horizontalGridLineShader(element, record, index, isNew, xOffset, isCrisp, da, dir?);
        private verticalGridLineShader(element, record, index, isNew, yOffset, isCrisp, da, dir?);
        opacity(): number;
        opacity(value: number): gridLinesClass;
        height(): any;
        height(value: any): gridLinesClass;
        width(): any;
        width(value: any): gridLinesClass;
        isXVisible(): boolean;
        isXVisible(value: boolean): gridLinesClass;
        isYVisible(): boolean;
        isYVisible(value: boolean): gridLinesClass;
        isXMinorVisible(): boolean;
        isXMinorVisible(value: boolean): gridLinesClass;
        isYMinorVisible(): boolean;
        isYMinorVisible(value: boolean): gridLinesClass;
        isCrisp(): boolean;
        isCrisp(value: boolean): gridLinesClass;
        drawingParams(): IGridLineDrawingParams;
        drawingParams(value: IGridLineDrawingParams): gridLinesClass;
        translate(x: number, y: number, isCrispAdjustment?: boolean): gridLinesClass;
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): gridLinesClass;
        rootElem(): any;
        xAxisData(): vp.chartFrame.axisDataClass;
        xAxisData(value: vp.chartFrame.axisDataClass): chartFrameEx;
        yAxisData(): vp.chartFrame.axisDataClass;
        yAxisData(value: vp.chartFrame.axisDataClass): chartFrameEx;
    }
    function createGridLines(container: HTMLElement, xData: axisDataClass, yData: axisDataClass, isCrisp?: boolean): gridLinesClass;
    interface ILineDrawingParamsEx extends vp.marks.ILineDrawingParams {
        startPadding: number;
        endPadding: number;
    }
    interface IGridLineDrawingParams {
        x: ILineDrawingParamsEx;
        y: ILineDrawingParamsEx;
        xMinor: ILineDrawingParamsEx;
        yMinor: ILineDrawingParamsEx;
    }
}
declare module vp.chartFrame {
    /** creates a vertical axis with the labels to the right of the axis line. */
    class leftAxisClass extends axisBaseClass<leftAxisClass> {
        _leftPad: number;
        constructor(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean);
        shadeMarks(transition: vp.animation.transitionClass, record: any, index: number, isNew: boolean, context: any, measureOnly: boolean): void;
        height(): number;
        height(value: number): leftAxisClass;
    }
    function createLeftAxis(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean): leftAxisClass;
}
declare module vp.chartFrame {
    /** creates a vertical axis with the labels to the right of the axis line. */
    class rightAxisClass extends axisBaseClass<rightAxisClass> {
        constructor(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean);
        shadeMarks(transition: vp.animation.transitionClass, record: any, index: number, isNew: boolean, context: any, measureOnly: boolean): void;
        height(): number;
        height(value: number): leftAxisClass;
    }
    function createRightAxis(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean): rightAxisClass;
}
declare module vp.chartFrame {
    /** creates a vertical axis with the labels to the right of the axis line. */
    class topAxisClass extends axisBaseClass<topAxisClass> {
        constructor(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean);
        shadeMarks(transition: vp.animation.transitionClass, record: any, index: number, isNew: boolean, context: any, measureOnly: boolean): void;
        width(): number;
        width(value: number): topAxisClass;
    }
    function createTopAxis(container: HTMLElement, axisDataOrScale: any, useWebGl?: boolean, isCrisp?: boolean): topAxisClass;
}
declare module vp.canvas {
    class canvasElement {
        ctr: string;
        rootContainer: canvasContainerElement;
        opacity: number;
        parentNode: any;
        children: any[];
        visibility: string;
        transform: vp.geom.ITransform;
        id: number;
        stylesByClass: {};
        stroke: string;
        fill: string;
        constructor(parent: any);
        clientRectToBoundingBox(rc: ClientRect): {
            x: number;
            y: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        getRoot(elem: any): any;
        drawFrame(ctx: CanvasRenderingContext2D, container: any): void;
        preDraw(ctx: CanvasRenderingContext2D): void;
        drawAll(ctx: CanvasRenderingContext2D, container: any): void;
        postDraw(ctx: CanvasRenderingContext2D): void;
        markDrawNeeded(): void;
        setPathData(value: string): void;
        setPathPoints(value: string): void;
        getInsideOfFuncStr(str: string, funcName: string): any;
        setTransform(value: string): void;
        getTransform(): string;
        applyStyle(style: any): void;
        setAttribute(name: any, value: any): void;
        getAttribute(name: any): any;
        append(strElem: any): any;
    }
}
declare module vp.canvas {
    class canvasCircleElement extends canvasElement {
        ctr: string;
        tagName: string;
        parentElement: any;
        cx: number;
        cy: number;
        r: number;
        fill: string;
        stroke: string;
        constructor(parentElement: any);
        applyStyle(style: any): void;
        getOffset(): {
            x: number;
            y: number;
        };
        hitTest(x: any, y: any): any;
        drawAll(ctx: CanvasRenderingContext2D, container: any): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasContainerElement extends canvasElement {
        ctr: string;
        canvas: any;
        ctx: any;
        contextRequest: any;
        initialized: boolean;
        frameCount: number;
        lastTime: number;
        bufferBuildTime: number;
        frameRate: number;
        frameRateChanged: any;
        opacity: number;
        currentFill: string;
        currentStroke: string;
        currentStrokeWidth: number;
        selectedFill: string;
        drawCallback: any;
        activeAnimations: any[];
        drawNeeded: boolean;
        isHitTesting: boolean;
        hitTestX: number;
        hitTestY: number;
        hitTestResult: any;
        drawTimer: any;
        drawCount: number;
        constructor(canvas: any, ctx: any, contextRequest: any);
        getCanvasElementAtPoint(x: any, y: any): any;
        markDrawNeeded(): void;
        removeChild(element: any): void;
        clear(): void;
        hitTestPath(ctx: any, elem: any): void;
        drawAll(ctx: any): void;
        drawFrame(rearmTimer?: any): void;
        close(): void;
    }
}
declare module vp.canvas {
    class canvasEllipseElement extends canvasElement {
        ctr: string;
        tagName: string;
        opacity: number;
        cx: number;
        cy: number;
        rx: number;
        ry: number;
        fill: string;
        stroke: string;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasGroupElement extends canvasElement {
        ctr: string;
        tagName: string;
        opacity: number;
        children: any[];
        x: number;
        y: number;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        hitTest(x: any, y: any): any;
        appendChild(element: any): void;
        removeChild(element: any): void;
        clear(): void;
        drawAll(ctx: any, container: any): void;
    }
}
declare module vp.canvas {
    class canvasImageElement extends canvasElement {
        ctr: string;
        tagName: string;
        x: number;
        y: number;
        width: number;
        height: number;
        strokePlacement: string;
        image: HTMLImageElement;
        _href: any;
        layoutX: any;
        layoutY: any;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        getBBox(): {
            left: any;
            top: any;
            width: number;
            height: number;
            right: any;
            bottom: any;
        };
        hrefOverride(src: any): any;
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasLineElement extends canvasElement {
        ctr: string;
        tagName: string;
        opacity: number;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        stroke: string;
        fill: string;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasPathElement extends canvasElement {
        ctr: string;
        tagName: string;
        opacity: number;
        boundingBox: {
            x: number;
            y: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        createPathFunc: any;
        pathDataStr: string;
        fill: string;
        stroke: string;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        getBBox(): {
            x: number;
            y: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        createPathOnContext(ctx: any): void;
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        setPathData(value: string): void;
        parseDataStr(): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasPolygonElement extends canvasElement {
        ctr: string;
        tagName: string;
        opacity: number;
        boundingBox: {
            x: number;
            y: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        pointStr: string;
        fill: string;
        stroke: string;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        getBBox(): {
            x: number;
            y: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        drawPath(ctx: any): void;
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        setPathPoints(value: string): void;
        points(): string;
        points(value: string): canvasPolygonElement;
        genDrawFromPoints(): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasRectElement extends canvasElement {
        ctr: string;
        tagName: string;
        x: number;
        y: number;
        width: number;
        height: number;
        strokePlacement: string;
        fill: string;
        stroke: string;
        layoutX: any;
        layoutY: any;
        constructor(parentElement: any);
        getOffset(): {
            x: number;
            y: number;
        };
        getBBox(): {
            left: any;
            top: any;
            width: number;
            height: number;
            right: any;
            bottom: any;
        };
        hitTest(x: any, y: any): any;
        drawAll(ctx: any, container: any): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.canvas {
    class canvasTextElement extends canvasElement {
        ctr: string;
        tagName: string;
        textContent: string;
        opacity: number;
        x: number;
        y: number;
        fill: string;
        stroke: string;
        width: number;
        height: number;
        fontWeight: any;
        fontStyle: any;
        verticalAlign: string;
        layoutX: any;
        layoutY: any;
        constructor(parentElement: any);
        applyStyle(style: any): void;
        hitTest(x: any, y: any): any;
        getOffset(): {
            x: number;
            y: number;
        };
        setContextForDrawing(ctx: CanvasRenderingContext2D): void;
        drawAll(ctx: any, container: any): void;
        getBBox(): {
            x: any;
            y: any;
            width: number;
            height: number;
            right: any;
            bottom: any;
        };
        getWidth(): number;
        getHeight(): number;
    }
}
declare module vp.data {
    class aggAvg implements IAggregate {
        _total: number;
        _count: number;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggCount implements IAggregate {
        _count: number;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggMax implements IAggregate {
        _maxValue: number;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggMedian implements IAggregate {
        _values: number[];
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggMin implements IAggregate {
        _minValue: number;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
    interface IAggregate {
        init(): any;
        process(value: number): any;
        getResult(): number;
    }
}
declare module vp.data {
    class aggMode implements IAggregate {
        _counts: any;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggStdDev implements IAggregate {
        _total: number;
        _count: number;
        _numbers: number[];
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggSum implements IAggregate {
        _sum: number;
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    class aggVariance implements IAggregate {
        _total: number;
        _count: number;
        _numbers: number[];
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.data {
    function getTypeName(obj: any): string;
    /** scans all of the entries in data and returns one of: "number", "date", "string". */
    function getDataType(data: any[]): string;
    function calcNumDecimals(max: number, min: number, tickCount: number): number;
    function clamp(value: any, min: any, max: any): any;
    function mapValue(value: any, fromMin: any, fromMax: any, toMin: any, toMax: any): any;
    function range(from: number, to?: number, incr?: number): number[];
    function dataPairHolder(dataItem: any, dataIndex: any): {
        dataItem: any;
        dataIndex: any;
    };
    function dataRepeat(value: any, count: any): any[];
    function lerp(percent: any, a: any, b: any): any;
    function makeLastData(data: any[]): any[];
    function generateItems(root: any, tagName: any, data: any): any;
    function dataJoin(data: any, name1: any): any[];
    function dataFrame(desc: any): any[];
    function dataSelect(data: any, field: any): any[];
    function doesNestedRecordContainColumn(record: any, colName: string): boolean;
    /** extracts the vector of values from the array of records, which includes a field named colName.  If each
    record is in turn an array, returns the count of the array, if countIfArray=true. */
    function getVector(data: any[], colName: string, countIfArray?: boolean): any;
    /**  builds a matrix of records in X and Y, dim size x size, with a "value" field that has some peaks and valleys. */
    function peaks(size: any, flatten: any): any[];
    function isAllIntegers(data: number[]): boolean;
    function createAggregator(name: string): IAggregate;
    /** Groups the data by the specified group column and then takes the specified aggregate of the specified value column within each group.  Returns array of records
    with 2 columns: aggregate value, group key.  if groupRecord is omitted, data is assumed to be pre-grouped. */
    function aggByGroup(data: any[], aggInfo: nameColumnAgg, groupRecord?: nameColumnPair): any[];
    /** Groups the data by the specified group column and then calculates the specified aggregates within each group.  Returns array of records
    with 2 columns for each specified aggregate: aggregate value, group key */
    function multiAggByGroup(data: any[], aggArray: nameColumnAgg[], groupRecord: nameColumnPair): any[];
    /** returns the date part of the DateTime value. */
    function datePart(date: Date): Date;
    class nameColumnPair {
        name: string;
        column: any;
        constructor(name: string, column: string);
    }
    class nameColumnAgg {
        name: string;
        column: any;
        aggName: string;
        constructor(name: string, column: string, aggName: string);
    }
}
declare module vp.unitTests {
    function testDataUtils(): void;
}
declare module vp.dom {
    class selectedSet implements IWrapper<selectedSet> {
        animation: any;
        ctr: string;
        length: number;
        push: (...items: any[]) => number;
        sort: (compareFn?: (a: any, b: any) => number) => any[];
        splice: {
            (start: number): any[];
            (start: number, deleteCount: number, ...items: any[]): any[];
        };
        indexOf: (searchElement: any, fromIndex?: number) => number;
        constructor(elements?: any);
        frameRateChanged(fpsCallBack: any): selectedSet;
        add(content: any): singleWrapperClass;
        clear(): selectedSet;
        show(): boolean;
        show(showIt: boolean): selectedSet;
        showToggle(): selectedSet;
        hide(): boolean;
        hide(showIt: boolean): selectedSet;
        collapse(): selectedSet;
        expand(): selectedSet;
        docOffset(elem: any): any;
        left(): number;
        left(value: number): selectedSet;
        top(): number;
        top(value: number): selectedSet;
        width(): any;
        width(value: any): selectedSet;
        css(name: string): string;
        css(name: string, value: any): selectedSet;
        height(): any;
        height(value: any): selectedSet;
        totalHeight(): number;
        totalWidth(): number;
        toolTipEnabled(): boolean;
        toolTipEnabled(value: boolean): selectedSet;
        animate(duration?: number, ease?: any, container?: any): selectedSet;
        onAnimationComplete(completedFunc: any): selectedSet;
        remove(): selectedSet;
        attr(name: string): string;
        attr(name: string, value: string): selectedSet;
        attr(name: string, value: number): selectedSet;
        prop(name: any, value: any): any;
        attrXlink(name: any, origValue: any): selectedSet;
        attrNS(ns: any, name: any, value: any): selectedSet;
        hLine(x1: number, x2: number, y: number, makeCrisp: boolean): selectedSet;
        vLine(y1: number, y2: number, x: number, makeCrisp: boolean): selectedSet;
        bounds(x: any, y: any, width: any, height: any, makeCrisp?: boolean): selectedSet;
        radius(): number;
        radius(value: number): selectedSet;
        tabIndex(): string;
        tabIndex(value: string): selectedSet;
        opacity(): number;
        opacity(value: number): selectedSet;
        checked(): number;
        checked(value: number): selectedSet;
        position(x: any, y: any): selectedSet;
        absPosition(left: any, top: any): selectedSet;
        removeProp(name: any): selectedSet;
        center(cx: any, cy: any): selectedSet;
        id(): string;
        id(value: string): selectedSet;
        addClass(name: any): selectedSet;
        removeClass(name: any): selectedSet;
        hasClass(name: any): boolean;
        getBounds(relToParent: boolean): any;
        setClass(name: any): selectedSet;
        toggleClass(name: any): selectedSet;
        attach(eventName: string, funcToCall: any, useCapture?: boolean): selectedSet;
        detach(eventName: string, funcToCall: any, useCapture?: boolean): selectedSet;
        transform(): string;
        transform(value: string): selectedSet;
        translate(x: number, y: number, makeCrispGroup?: boolean, makeCrispRoot?: boolean): selectedSet;
        transformOrigin(): string;
        transformOrigin(value: string): selectedSet;
        addStop(offset: any, color: string, opacity?: number): selectedSet;
        textBaseline(alignType: string, rc?: SVGRect): selectedSet;
        from(x1: any, y1: any): selectedSet;
        to(x2: any, y2: any): selectedSet;
        font(family: any, size: any, weight: any, style: any): selectedSet;
        dataPair(dataItem: any, dataIndex: any): selectedSet;
        data(): any[];
        data(value: any[]): selectedSet;
        dataItem(): any;
        dataItem(dataItem: any): selectedSet;
        dataIndex(): number;
        dataIndex(value: number): selectedSet;
        customAttr(name: any): string;
        customAttr(name: any, value: string): selectedSet;
        text(): string;
        text(value: string): selectedSet;
        title(): string;
        title(value: string): selectedSet;
        value(): string;
        value(value: string): selectedSet;
        html(): string;
        html(value: string): selectedSet;
        colors(fill: any, stroke: any, strokeWidth: any): selectedSet;
        href(): string;
        href(value: string): selectedSet;
        safeHref(value: any, fallback: any): selectedSet;
        kids(): selectedSet;
        elementSizes(callBack: any): any;
        background(): string;
        background(value: string): selectedSet;
        focus(): selectedSet;
        dataId(): string;
        dataId(value: string): selectedSet;
        shapeId(): string;
        shapeId(value: string): selectedSet;
        get(index: any): any;
        element(): any;
        wrap(index: any): any;
        toArray(): any[];
        each(callback: any): selectedSet;
        eachWrapped(callback: any): selectedSet;
        merge(elemOrArray: any): selectedSet;
        private removeCore(content);
        append<T>(content: T): T;
        append(content: string): singleWrapperClass;
        prepend(content: any): singleWrapperClass;
        insertBefore(content: any): singleWrapperClass;
        insertAfter(content: any): singleWrapperClass;
        is(elementType: string): boolean;
        context(origRequest: any): any;
    }
}
declare module vp.dom {
    interface IWrapper<T> {
        length: number;
        background(): string;
        background(value: string): T;
        width(): any;
        width(value: any): T;
        height(): any;
        height(value: any): T;
        dataId(): string;
        dataId(value: string): T;
        shapeId(): string;
        shapeId(value: string): T;
        text(): string;
        text(value: string): T;
        value(): string;
        value(value: string): T;
        title(): string;
        title(value: string): T;
        html(): string;
        html(value: string): T;
        show(): boolean;
        show(value: boolean): T;
        hide(): boolean;
        hide(value: boolean): T;
        data(): any[];
        data(value: any[]): T;
        dataItem(): any;
        dataItem(value: any): T;
        dataIndex(): number;
        dataIndex(value: number): T;
        attr(name: string): string;
        attr(name: string, value: string): T;
        attr(name: string, value: number, disableAnim?: boolean): T;
        css(name: string): string;
        css(name: string, value: string): T;
        href(): string;
        href(value: string): T;
        id(): string;
        id(value: string): T;
        checked(): number;
        checked(value: number): T;
        left(): number;
        left(value: number): T;
        top(): number;
        top(value: number): T;
        transform(): string;
        transform(value: string): T;
        transformOrigin(): string;
        transformOrigin(value: string): T;
        opacity(): number;
        opacity(value: number): T;
        radius(): number;
        radius(value: number): T;
        tabIndex(): string;
        tabIndex(value: string): T;
        toolTipEnabled(): boolean;
        toolTipEnabled(value: boolean): T;
        customAttr(name: string): string;
        customAttr(name: string, value: string): T;
        append(content: string): singleWrapperClass;
        append(content: HTMLElement): singleWrapperClass;
        append<T>(content: T): T;
        add(content: any): singleWrapperClass;
        prepend(content: any): singleWrapperClass;
        insertBefore(content: any): singleWrapperClass;
        insertAfter(content: any): singleWrapperClass;
        element(): any;
        safeHref(value: string, fallback: string): any;
        bounds(x: number, y: number, width: number, height: number, makeCrisp?: boolean): T;
        colors(fill: string, stroke: string, strokeWidth: any): T;
        collapse(): T;
        expand(): T;
        totalHeight(): number;
        totalWidth(): number;
        hLine(x1: number, x2: number, y: number, makeCrisp: boolean): T;
        vLine(y1: number, y2: number, x: number, makeCrisp: boolean): T;
        textBaseline(alignType: string, rc?: SVGRect): T;
        setClass(value: string): T;
        hasClass(value: string): boolean;
        addClass(value: string): T;
        removeClass(value: string): T;
        toggleClass(value: string): T;
        translate(x: number, y: number, makeCrispGroup?: boolean, makeCrispRoot?: boolean): T;
        attach(name: string, callback: any, useCapture?: boolean): T;
        detach(name: string, callback: any, useCapture?: boolean): T;
        clear(): T;
        remove(): T;
        animate(duration?: number, ease?: any, container?: any): T;
        onAnimationComplete(callback: any): any;
        toArray(): any[];
        kids(): selectedSet;
        showToggle(): T;
        dataPair(dataItem: any, dataIndex: number): T;
        from(x: number, y: number): T;
        to(x: number, y: number): T;
        font(family: string, size: string, weight: string, style: string): T;
        getBounds(relToParent: boolean): any;
        center(x: number, y: number): T;
        position(x: number, y: number): T;
        absPosition(left: number, top: number): T;
        addStop(offset: any, color: string, opacity?: number): T;
        frameRateChanged(callback: any): T;
        merge(elem: any): selectedSet;
        each(callback: any): T;
        elementSizes(callback: any): any;
        focus(y: any): T;
        is(elementType: string): boolean;
    }
    interface IWrapperOuter extends IWrapper<IWrapperOuter> {
    }
    /** class that wraps a single element (HTML, SVG, Canvas, or WebGL item). */
    class singleWrapperSuperClass<T> implements IWrapper<T> {
        elem: HTMLElement;
        prop: any;
        length: number;
        constructor(elem: HTMLElement);
        element(value?: HTMLElement): HTMLElement;
        css(name: string): string;
        css(name: string, value: string): T;
        hLine(x1: number, x2: number, y: number, makeCrisp: boolean): T;
        vLine(y1: number, y2: number, x: number, makeCrisp: boolean): T;
        bounds(x: any, y: any, width: any, height: any, makeCrisp?: boolean): T;
        colors(fill: any, stroke: any, strokeWidth: any): T;
        text(): string;
        text(value: string): T;
        tabIndex(): string;
        tabIndex(value: string): T;
        title(): string;
        title(value: string): T;
        value(): string;
        value(value: string): T;
        html(): string;
        html(value: string): T;
        show(): boolean;
        show(showIt: boolean): T;
        showToggle(): T;
        hide(): boolean;
        hide(showIt: boolean): T;
        collapse(): T;
        expand(): T;
        dataIndex(): number;
        dataIndex(value: number): T;
        data(): any[];
        data(value: any[]): T;
        dataItem(): any;
        dataItem(value: any): T;
        dataPair(dataItem: any, dataIndex: any): T;
        to(x: any, y: any): T;
        from(x: any, y: any): T;
        attach(name: string, callBack: any, useCapture?: boolean): T;
        detach(name: string, callBack: any, useCapture?: boolean): T;
        transform(): string;
        transform(value: string): T;
        translate(x: number, y: number, makeCrispGroup?: boolean, makeCrispRoot?: boolean): T;
        transformOrigin(): string;
        transformOrigin(value: string): T;
        href(): string;
        href(value: string): T;
        safeHref(value: any, fallback: any): T;
        font(family: any, size: any, weight: any, style: any): T;
        setClass(value: any): T;
        hasClass(value: any): boolean;
        addClass(value: any): T;
        removeClass(value: any): T;
        toggleClass(value: any): T;
        id(): string;
        id(value: string): T;
        getBounds(relToParent: boolean): ClientRect;
        center(cx: any, cy: any): T;
        position(x: any, y: any): T;
        absPosition(left: any, top: any): T;
        opacity(): number;
        opacity(value: number): T;
        radius(): number;
        radius(value: number): T;
        attr(name: string): string;
        attr(name: string, value: string): T;
        attr(name: string, value: number): T;
        customAttr(name: any): string;
        customAttr(name: any, value: string): T;
        remove(): T;
        toolTipEnabled(): boolean;
        toolTipEnabled(value: boolean): T;
        height(): any;
        height(value: any): T;
        width(): any;
        width(value: any): T;
        totalHeight(): number;
        totalWidth(): number;
        left(): number;
        left(value: number): T;
        top(): number;
        top(value: number): T;
        checked(): number;
        checked(value: number): T;
        clear(): T;
        add(content: any): singleWrapperClass;
        append(content: string): singleWrapperClass;
        append(content: HTMLElement): singleWrapperClass;
        append<T>(content: T): T;
        prepend(content: any): singleWrapperClass;
        insertBefore(content: any): singleWrapperClass;
        insertAfter(content: any): singleWrapperClass;
        addStop(offset: any, color: string, opacity?: number): T;
        textBaseline(alignType: string, rc?: SVGRect): T;
        animate(duration?: number, ease?: any, container?: any): T;
        onAnimationComplete(callback: any): T;
        frameRateChanged(callBack: any): T;
        merge(elemOrArray: any): selectedSet;
        toArray(): HTMLElement[];
        wrap(index: any): any;
        kids(): selectedSet;
        each(callback: any): T;
        elementSizes(): {
            width: number;
            height: number;
            marginWidth: number;
            marginHeight: number;
            borderWidth: number;
            borderHeight: number;
            paddingWidth: number;
            paddingHeight: number;
        };
        focus(): T;
        background(): string;
        background(value: string): T;
        dataId(): string;
        dataId(value: string): T;
        shapeId(): string;
        shapeId(value: string): T;
        is(elementType: string): boolean;
    }
    /** class that wraps a single element (HTML, SVG, Canvas, or WebGL item). */
    class singleWrapperClass extends singleWrapperSuperClass<singleWrapperClass> {
        ctr: string;
    }
    function createSingleWrapper(elem: HTMLElement): singleWrapperClass;
}
declare module vp.dom {
    function getElementsInSelectorString(parentElem: any, selector: any): any[];
    function wrapElements(elemOrArray: any): any;
    function unwrap(elem: any): any;
}
declare module vp {
    function select(p1?: any, p2?: any): vp.dom.IWrapperOuter;
}
declare module vp.canvas {
    class canvasSelectedSet extends vp.dom.selectedSet {
        ctr: string;
        parentElem: any;
        length: number;
        selector: any;
        constructor(parentElem: any, selector: any);
        merge(elemOrArray: any): canvasSelectedSet;
        multiAppend(str: any, count: any): any[];
        updateBounds(w: any, h: any): dom.selectedSet;
        initShaderAnimations(duration: any, onCompleteCallback: any): dom.selectedSet;
        resetShaderAnimations(): dom.selectedSet;
        pointSize(value: any): any;
        usePointSprites(value: any): any;
        usePointSize(value: any): any;
        markRebuildNeeded(): dom.selectedSet;
        append(content: string): vp.dom.singleWrapperClass;
        append<T>(content: T): T;
        attr(name: string): string;
        attr(name: string, origValue: any): canvasSelectedSet;
    }
    function canvasSelect(selectStr?: any): canvasSelectedSet;
    function selectContext(selectObj: any, contextName: any): canvasSelectedSet;
}
declare module vp.internal {
    class parsePathDataAndGenerateDrawFunc {
        index: number;
        d: any;
        firstPt: {
            x: number;
            y: number;
        };
        lastPt: {
            x: number;
            y: number;
        };
        firstPointSeen: boolean;
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        constructor(dstr: any);
        parse(): (string | ClientRect)[];
        skipSpaces(d: any): void;
        parseNumber(d: any): number;
        parsePoint(d: any, isRelative: any): {
            x: number;
            y: number;
        };
        onPointSeen(pt: any): void;
    }
}
declare module vp.color {
    var colors: any;
    function getColorFromName(name: any): any;
    function getRandomColor(): any;
    function getColorFromHexString(str: any): any;
    function getColorFromRgbString(str: any): any;
    function toColor(r: any, g?: any, b?: any, a?: any): any;
    function getColorFromString(str: any): any;
    function interpolateColors(color1: any, color2: any, percent: any): any[];
    function isValidColor(value: any): boolean;
    /** extract an HTML legal color value from a palette.  Does NOT do blending between entries. */
    function colorFromPalette(palette: any, index: any, firstPaletteIndex?: number): any;
    /** extract an HTML legal color value from a palette by blending the 2 closest enties as per non-integer index. */
    function continuousColorFromPalette(palette: any, index: any): number[];
    /** does a LERP (mixture) of 2 colors, both of which are 3-dim RGB arrays.  Returns result as a 3-dim RGB array.*/
    function colorLerp(color1: any, color2: any, percent: number): number[];
    /** converts an RGB color array (values 0-255) to an WebGL-compatible percentage array (values 0-1). */
    function makeColorArrayForWebGL(crArray: any): number[];
}
declare module vp.events {
    var eventAttachCount: number;
    var eventDetachCount: number;
    var keyCodes: {
        enter: number;
        shift: number;
        ctrl: number;
        alt: number;
        escape: number;
        left: number;
        up: number;
        right: number;
        down: number;
        insert: number;
        home: number;
        pageUp: number;
        "delete": number;
        end: number;
        pageDown: number;
        space: number;
        A: number;
        B: number;
        C: number;
        D: number;
        E: number;
        F: number;
        G: number;
        H: number;
        I: number;
        J: number;
        K: number;
        L: number;
        M: number;
        N: number;
        O: number;
        P: number;
        Q: number;
        R: number;
        S: number;
        T: number;
        U: number;
        V: number;
        W: number;
        X: number;
        Y: number;
        Z: number;
        minus: number;
        f12: number;
    };
    var keyboardKeys: {};
    function cancelEventDefault(evt: any): boolean;
    function cancelEventBubble(evt: any): void;
    function monitorKeyboard(enable: any): void;
    function isKeyPressed(keyCode: any): boolean;
    function mousePosition(e: any, relToParent?: any): {
        x: number;
        y: number;
    };
    /** capture all MouseMove and MouseUp messages, even those that happen outside of the browser window. This
     works on all major browsers. */
    function setCaptureWindow(moveCallback: any, upCallback: any, frameNames?: string[]): void;
    function releaseCaptureWindow(): void;
    function setCapture(element: any, evt: any, mouseMoveCallback: any, mouseUpCallback: any): any;
    function setFocus(elem: any): void;
    function releaseCapture(element: any, evt: any, mouseMoveCallback?: any, mouseUpCallback?: any): any;
    function enableDragDrop(isEnabled: any): void;
    function attach(elem: any, eventName: any, funcToCall: any, useCapturePhase?: any): void;
    function triggerResize(elem: any): void;
    function wheelDelta(evt: any): any;
    function detach(elem: any, eventName: any, funcToCall: any, useCapture?: boolean): void;
    function elementFromPoint(x: any, y: any): any;
}
declare module vp.internal {
    class inkHitTest {
        tempCanvas: any;
        root: any;
        w: number;
        h: number;
        ctx: any;
        rect: ClientRect;
        constructor(rect: any);
        private transferAttrs(fromElem, toElem, attrNameList);
        private canvasElemFromSvg(canvasRoot, svgElem);
        private addCanvasChild(canvasParent, svgElem);
        close(): void;
        doesShapeOverlap(svgShape: any): boolean;
    }
}
declare module vp.dom {
    function createHtml(tagName: any): HTMLElement;
    function createSvg(tagName: any): SVGElement;
    /** createElement(parent, tagName) - creates an HTML, SVG, or CANVAS element with the specified tagName.
    returns: the newly created element (unwrapped). */
    function createElement(parent: any, tagName: any): any;
    function createElements(parent: any, tagName: any, count: any): any[];
    function add(container: any, content: any): any[];
    function append(container: any, content: any): any;
    function appendElements(container: any, elements: any): void;
    function prepend(container: any, content: any): any;
    function insertBefore(container: any, content: any): any;
    function insertAfter(container: any, content: any): any;
    function appendCoreMulti(self: any, content: any, insertOp: any): any;
}
declare module vp.utils {
    var isFireFox: boolean;
    var isChrome: boolean;
    var isIE: boolean;
    var isIE11: boolean;
    function isUndefined(obj: any): boolean;
    function isDefined(obj: any): boolean;
    function isVuePlotControl(obj: any): boolean;
    function isSvgElement(obj: any): boolean;
    function isSvgDocOrElement(elem: any): boolean;
    function isCanvas(obj: any): boolean;
    function isCanvasChild(obj: any): boolean;
    function isCanvasContainer(obj: any): boolean;
    function isFunction(obj: any): boolean;
    function isNumber(obj: any): boolean;
    function isObject(obj: any): boolean;
    function isBoolean(obj: any): boolean;
    function isValidNumber(obj: any): boolean;
    function isInteger(value: any): boolean;
    function isArray(obj: any): boolean;
    function isString(obj: any): boolean;
    function isSelectedSet(elem: any): boolean;
    function isDate(obj: any): boolean;
}
declare module vp.dom {
    function is(elem: HTMLElement, elementType: string): boolean;
    function left(elem: any, value?: any): any;
    function top(elem: any, value?: any): any;
    function getBounds(elem: any, relToParent?: boolean): ClientRect;
    function parentOffset(elem: any): {
        left: any;
        top: any;
    };
    function windowSize(): {
        width: number;
        height: number;
    };
    function getWidth(elem: any): number;
    function totalWidth(elem: any): number;
    function totalHeight(elem: any): number;
    function elementSizes(elem: any): {
        width: number;
        height: number;
        marginWidth: number;
        marginHeight: number;
        borderWidth: number;
        borderHeight: number;
        paddingWidth: number;
        paddingHeight: number;
    };
    function getBaseVal(elem: any, propName: any, prop: any): number;
    function getHeight(elem: any): number;
    function setWidth(elem: any, value: any): void;
    function setHeight(elem: any, value: any): void;
    function width(elem: any, value?: any): number;
    function height(elem: any, value?: any): number;
    function background(elem: any, value?: any): any;
    function getCssNumber(cssValueStr: any, parentValue?: any): number;
    function center(elem: any, cx: any, cy: any): void;
    function from(elem: any, x1: any, y1: any): void;
    function font(elem: any, family: any, size?: any, weight?: any, style?: any): void;
    function to(elem: any, x2: any, y2: any): void;
    function translate(elem: any, x: number, y: number, makeCrispGroup?: boolean, makeCrispRoot?: boolean): void;
    function transform(elem: any, strTransform?: any): any;
    function transformOrigin(elem: any, value?: any): any;
    function position(elem: any, x: any, y: any): void;
    function absPosition(elem: any, left: any, top: any): void;
    function isSizeName(name: any): boolean;
    function attr(elem: any, name: string, value?: any, disableAnim?: boolean): any;
    function attrNS(elem: any, ns: any, name: any, value?: any): any;
    function href(elem: any, value?: any): any;
    function prop(elem: any, name: any, value?: any): any;
    var customAttr: typeof prop;
    function opacity(elem: any, value?: any): any;
    function checked(elem: any, value?: any): any;
    function removeAttribute(elem: any, name: any): void;
    function removeProp(elem: any, name: any): boolean;
    function id(elem: any, value?: any): any;
    function toolTipEnabled(elem: any, value?: any): any;
    function getClass(elem: any): any;
    function setClass(elem: any, name: any): void;
    function addClass(elem: any, name: any): void;
    function hasClass(elem: any, name: any): boolean;
    function removeClass(elem: any, name: any): void;
    function toggleClass(elem: any, name: any): void;
    function tabIndex(elem: any, value?: any): any;
    function text(elem: any, value?: any): any;
    function getTitleChild(elem: any): any;
    function title(elem: any, value?: any): any;
    function html(elem: any, value?: any): any;
    function value(elem: any, value?: any): any;
    /** remove all childNodes or children of the element. */
    function clear(element: any): void;
    function remove(element: any): void;
    function hide(elem: any): void;
    function collapse(elem: any): void;
    function expand(elem: any): void;
    function show(elem: any, showIt: any): void;
    function visibility(elem: any, value?: any): any;
    function showToggle(elem: any): void;
    function css(elem: any, prop: any, value?: any): any;
    function parent(elem: any): any;
    function children(parentElem: any, includeAll?: any): any[];
    function childNodes(parentElem: any, includeAll?: any): any[];
    function bounds(elem: any, x: any, y: any, width: any, height: any, makeCrisp?: boolean): void;
    function colors(elem: any, fill: any, stroke?: any, strokeWidth?: any): void;
    function addStop(brush: any, offset: any, color: any, opacity: any): void;
    function dataItem(elem: any, value?: any): any;
    function dataIndex(elem: any, value?: any): any;
    function animate(elem: any, duration?: any, ease?: any, container?: any, delay?: any): void;
    function onAnimationComplete(elem: any, completedFunc?: any): void;
    function frameRateChanged(elem: any, callBack: any): void;
    function radius(elem: any, value?: any): any;
    function returnFalse(): boolean;
    function dataPair(elem: any, dataItem: any, dataIndex: any): void;
    function focus(elem: any): void;
    function dataId(elem: any, value?: any): any;
    function shapeId(elem: any, value?: any): any;
    function vLine(elem: any, y1: number, y2: number, x: number, makeCrisp: boolean): void;
    function hLine(elem: any, x1: number, x2: number, y: number, makeCrisp: boolean): void;
    function enableElementSelection(elem: any, enable: any): void;
    function getBodyScroll(): {
        x: number;
        y: number;
    };
    function docOffset(elem: any): {
        left: number;
        top: number;
    };
    function textBaseline(textElem: any, alignType: string, rc?: SVGRect): void;
    function computeTextBaselineDelta(textElem: any, alignType: string): number;
}
declare module vp.dom {
    class styleSheetClass {
        _styleSheet: any;
        _elem: any;
        constructor(innerText?: string);
        addRule(selector: any, style: any): styleSheetClass;
        remove(): styleSheetClass;
        sheet(): any;
        id(value: any): any;
    }
    function createStyleSheet(innerText?: string): styleSheetClass;
}
declare module vp.formatters {
    function comma(value: any, numDecimalPlaces?: number, forceDecimalPlaces?: boolean, removeLeadingSingleZero?: boolean): any;
    function commaOnly(value: any): string;
    function createCommaFormatter(numDecimals: number): (value: number) => any;
    function percent(value: any, numDecimalPlaces: any): any;
    function dollar(value: any, numDecimalPlaces: any): any;
    function scientific(value: any, numDecimalPlaces: any): any;
    function date(value: any): number;
    function string(value: any): string;
    function format(value: any): any;
    function truncateText(text: string, maxLength: number, addEllipses: boolean, fakeLabel: SVGTextElement, ellipsesWidth: number): string;
}
declare module vp.formatters {
    /** Formats a number as a date or time, according to the specified 'format' string.  Example
    formats:  m/dd/yyyy, mmm-yy, hh:mm:ss AM/PM. */
    function formatDateTime(value: any, format: string): string;
    function formatByType(value: any, valueType: string): any;
    /** Formats a number according to the specified 'format' string (a simplified version of an Excel numeric
    formatting string).  Example formats:  0, #,##0.000, $#,##0.00 */
    function formatNumber(value: number, format: string): string;
    function createDateFormatterFromRange(minDate: number, maxDate: number, steps?: number): any;
    function createExcelFormatter(formatString: string, colType: string): any;
}
declare module vp.geom {
    interface IPoint {
        x: number;
        y: number;
        id?: number;
    }
    interface ILocation {
        left: number;
        top: number;
    }
    interface ISize {
        width: number;
        height: number;
    }
    interface ITransform {
        sx: number;
        sy: number;
        tx: number;
        ty: number;
        angle: number;
        cx: number;
        cy: number;
    }
    class rectLight {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x: any, y: any, width: any, height: any);
    }
}
declare module vp.geom {
    class matrix4 {
        length: number;
        constructor();
        toArray(): any[];
        toFloat32Array(): Float32Array;
        static fromFloats(m11: any, m12: any, m13: any, m14: any, m21: any, m22: any, m23: any, m24: any, m31: any, m32: any, m33: any, m34: any, m41: any, m42: any, m43: any, m44: any): matrix4;
        static identity(): matrix4;
        static transpose(m: matrix4): matrix4;
        static toMat3Array(m: matrix4): Float32Array;
        static invert(m: matrix4): matrix4;
        static createOrthographic(width: any, height: any, nearPlane: any, farPlane: any): matrix4;
        static createOrthographicOffCenter(left: any, right: any, bottom: any, top: any, near: any, far: any): matrix4;
        static createLookAt(eyePos: any, lookAt: any, up: any): matrix4;
        static createPerspectiveRH(width: any, height: any, zNear: any, zFar: any): matrix4;
        static createPerspectiveFovRH(fovY: any, aspect: any, zNear: any, zFar: any): matrix4;
        /** WARNING: do NOT use this for WebGL (use RH).
        "fov" is the field of view in the y direction, in radians. */
        static createPerspectiveFovLH(fovY: any, aspect: any, zNear: any, zFar: any): matrix4;
        static createPerspectiveOffCenterRH(left: any, right: any, bottom: any, top: any, zNear: any, zFar: any): matrix4;
        static multiplyVector(m: matrix4, v: vector4): vector4;
        static multiply(a: matrix4, b: matrix4): matrix4;
        /** Note: this function treats "v" as if it were a vector4 (with 4th component=1). It
        performs the multipication:  v * mat    (not the reverse).
        NOTE: we return a vector4 so the call has a chance to use the returned v.w value, which
        sometimes should be used to scale the xyz value (1/w), like when you have the mat includes
        a projection component.  */
        static transformPoint(mat: matrix4, v: vector3): vector4;
        /** taken from: http://msdn.microsoft.com/en-us/library/microsoft.xna.framework.matrix.aspx */
        static createTranslation(x: number, y: number, z: number): matrix4;
        static createScale(x: any, y: any, z: any): matrix4;
        /**Returns a matrix that does a rotation about the X axis by the specified angle in radians. */
        static createRotationX(angle: number): matrix4;
        /**Returns a matrix that does a rotation about the Y axis by the specified angle in radians. */
        static createRotationY(angle: number): matrix4;
        /**Returns a matrix that does a rotation about the Z axis by the specified angle in radians. */
        static createRotationZ(angle: number): matrix4;
        /**Returns a matrix that does a rotation about the Z axis by the specified angle in radians. */
        static createAxisRotation(theta: number, axis: number[]): matrix4;
        /** Returns a matrix that rotates about the z (yaw), y (pitch), and x (roll) axes.  All
        angles are specified in radians. */
        static createFromYawPitchRoll(yaw: number, pitch: number, roll: number): matrix4;
    }
}
declare module vp.geom {
    class point2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
    }
    function createPoint2(x?: number, y?: number): point2;
}
declare module vp.geom {
    class point3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        toString(): string;
    }
    function createPoint3(x?: number, y?: number, z?: number): point3;
}
declare module vp.geom {
    function createRect(left: number, top: number, w: number, h: number): ClientRect;
    function rect(left: number, top: number, w: number, h: number): ClientRect;
    function rectToString(rc: ClientRect): string;
    function rectFromPoints(pt1: any, pt2: any): {
        left: number;
        top: number;
        width: number;
        height: number;
        right: number;
        bottom: number;
    };
    function rectContainsPoint(rc: any, pt: any): boolean;
    /** returns true if rcInner is completely contained within rcOuter. */
    function rectContainsRect(rcOuter: any, rcInner: any): boolean;
    /** returns true if rc1 overlaps in any way with rc2. */
    function rectIntersectsRect(rc1: any, rc2: any): boolean;
    function rectIntersectsSvgShape(rc: any, shape: any): boolean;
    function rectIntersectsAreaPolygon(rc: any, pointStr: any): boolean;
    function rectIntersectsLine(rc: any, x1: any, y1: any, x2: any, y2: any): boolean;
    function offsetRect(rc: any, xoff: any, yoff: any): {
        left: any;
        top: any;
        width: any;
        height: any;
        right: any;
        bottom: any;
    };
}
declare module vp.geom {
    class vector2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        static add(v: vector2, v2: vector2): vector2;
        static subtract(v: vector2, v2: vector2): vector2;
        static multiply(v: vector2, s: number): vector2;
        static dot(v: vector2, v2: vector2): number;
        static normal(v: vector2): vector2;
    }
    function createVector2(x?: number, y?: number): vector2;
}
declare module vp.geom {
    class vector3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        static add(v: vector3, v2: vector3): vector3;
        static magnitude(v: vector3): number;
        static subtract(v: vector3, v2: vector3): vector3;
        static multiply(v: vector3, s: number): vector3;
        static cross(v: vector3, v2: vector3): vector3;
        static dot(v: vector3, v2: vector3): number;
        static normal(v: vector3): vector3;
        static normalToPoints(pt1: point3, pt2: point3, pt3: point3): vector3;
        static zero(): vector3;
        static up(): vector3;
        toString(): string;
    }
    function createVector3(x?: number, y?: number, z?: number): vector3;
}
declare module vp.geom {
    class vector4 {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x: number, y: number, z: number, w: number);
        static add(v: vector4, v2: vector4): vector4;
        static subtract(v: vector4, v2: vector4): vector4;
        static multiply(v: any, s: any): vector4;
        static dot(v: any, v2: any): number;
        static normal(v: any): vector4;
        static zero(): vector4;
    }
}
declare module vp.marks {
    /** Base class for all other mark classes. */
    class markBaseClass<T> implements IMark<T> {
        _container: any;
        _rootElem: any;
        _dataAnimMgr: vp.animation.dataAnimMgrClass;
        _seriesIndex: number;
        _seriesCount: number;
        _containerType: containerType;
        _onShaderCallback: (element: HTMLElement, record: any, index: number, isNew: boolean, context: any, transition: vp.animation.transitionClass) => any;
        _glBuilder: glBuilderClass;
        _jsParser: jsParserClass;
        _data: any;
        _fromGlParams: any;
        _shapeName: string;
        _glShapeName: string;
        _className: string;
        _computedStyle: any;
        _drawingParams: any;
        _isVisible: boolean;
        _firstShow: boolean;
        _transition: vp.animation.transitionClass;
        _showOpacity: number;
        /** "container" can be null, a string ("svg", "canvas", or "webGl"), or a container (SVG doc, SVG "g", Canvas element,
        or a canvas group element).  "shapeName" is name of the shape when an SVG or Canavas container is used.
        "glShapeName" is the name of the associated vuePlot webGl shape. */
        constructor(container: any, shapeName: string, glShapeName?: string, useWebGl?: boolean, className?: string);
        createContainerIfNeeded(container: any): {
            container: any;
            useWebGl: any;
        };
        rootElem(): any;
        translate(x: any, y: any, makeCrispAdjustment?: boolean): T;
        onShade(): any;
        onShade(callback: (element: any, record: any, index: number, isNew: boolean) => any): T;
        keyFunc(): any;
        keyFunc(callback: (element: any, record: any, index: number, isNew: boolean) => any): T;
        drawingParams(): any;
        drawingParams(value: any): T;
        opacity(): number;
        opacity(value: number): T;
        build(transition?: vp.animation.transitionClass, context?: any): void;
        generate(data: any, transition?: vp.animation.transitionClass, context?: any): void;
        applyDrawingParams(elem: HTMLElement): void;
        applyClass(elem: any): void;
        postProcessShape(element: HTMLElement): void;
        clear(): T;
        eraseCanvas(): void;
        isVisible(): boolean;
        /** used at end of opacity animation, or in its place, to ensure item is hidden from hover, tooltips, clicks, etc. */
        setVisibleNow(visible: boolean): void;
        hide(transition?: vp.animation.transitionClass): void;
        show(transition?: vp.animation.transitionClass): void;
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): T;
    }
    class markBase extends markBaseClass<markBase> {
    }
    enum containerType {
        svg = 0,
        canvasElem = 1,
        canvasGroup = 2,
        glCanvas = 3,
        glGroup = 4,
    }
    interface IMark<T> {
        hide(transition?: vp.animation.transitionClass): any;
        show(transition?: vp.animation.transitionClass): any;
        translate(x: number, y: number, makeCrispAdjustment?: boolean): any;
        isVisible(): boolean;
        transition(): vp.animation.transitionClass;
        transition(value: vp.animation.transitionClass): T;
        drawingParams(): any;
        drawingParams(value: any): T;
        rootElem(): any;
    }
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas CIRCLE primitives.  Can be used with animations.  Core function
    is "update()". */
    class circleMarkClass extends markBaseClass<circleMarkClass> {
        constructor(container: any, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createCircleMark(container: any, className?: string): circleMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas ellipse primitives.  Can be used with animations.  Core function
    is "update()". */
    class ellipseMarkClass extends markBaseClass<ellipseMarkClass> {
        constructor(container: HTMLElement, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createEllipseMark(container: HTMLElement, className?: string): ellipseMarkClass;
}
declare module vp.marks {
    interface IShapeDrawingParams {
        stroke?: string;
        fill?: string;
        opacity?: number;
        lineSize?: number;
        lineType?: any;
    }
    interface ILineDrawingParams {
        stroke?: string;
        opacity?: number;
        lineSize?: number;
        lineType?: any;
    }
    interface ITextDrawingParams {
        stroke?: string;
        fill?: string;
        opacity?: number;
        lineSize?: number;
        lineType?: any;
        hAlign?: number;
        vAlign?: number;
        textSize?: number;
        fontFamily?: string;
        fontWeight?: string;
        textLabel?: string;
    }
    /** Apply the drawing parameters to the text element.  "hAdjust" and "vAdjust" allow the caller to apply
    additional positioning adjustments to those already specified in "dp". */
    function applyTextParams(elem: any, dp: ITextDrawingParams, alignText?: boolean, hAdjust?: any, vAdjust?: any): void;
    function calculateTextAdjust(textElem: any, hAlign: any, vAlign: any): {
        x: number;
        y: number;
    };
    function applyLineParams(element: any, dp: ILineDrawingParams): void;
    function applyShapeDrawingParams(elem: HTMLElement, dp: IShapeDrawingParams): void;
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas group primitives.  Can be used with animations.  Core function
    is "update()". */
    class groupMarkClass extends markBaseClass<groupMarkClass> {
        constructor(container: HTMLElement, className?: string);
    }
    function createGroupMark(container: HTMLElement, className?: string): groupMarkClass;
}
declare module vp.marks {
    /** WebGL helper class for marks. */
    class glBuilderClass {
        _gl: any;
        _shaderProgram: any;
        _vertexBuffer: any;
        _canvas: HTMLCanvasElement;
        _trans3d: vp.plotBox.transform3dClass;
        _animation: any;
        _usingPosition: boolean;
        _shapeVertices: any;
        _usingWidth: boolean;
        _glShapeName: string;
        _randomVectors: {};
        _animStartTime: number;
        _animFrameCount: number;
        _animFPS: number;
        _shapesDrawn: number;
        _statsCallback: any;
        constructor(canvas: HTMLCanvasElement, glShapeName: any);
        init(data: any[], glParams: any, fromGlParams: any): void;
        updateScreenSize(w: number, h: number): void;
        buildVertexShader(glParams: any, fromGlParams: any): string;
        fragShader(): string;
        clear(): void;
        drawScene(data: any[], transition: vp.animation.transitionClass, glParams: any, fromGlParams: any): void;
        drawSceneFrame(percent: number): void;
        applyShaderParams(shader: string, glParams: any, fromGlParams: any): string;
        getShader(gl: any, id: any, glParams: any, fromGlParams: any): any;
        initShaders(glParams: any, fromGlParams: any): void;
        setShaderConstants(glParams: any, fromGlParams: any): void;
        initBuffers(data: any[], glParams: any, fromGlParams: any): void;
        getRandomVector(name: string, count: number): number[];
        setPointVertices(data: any[]): number;
        setTriangleVertices(data: any[]): number;
        setRect2dVertices(data: any[]): number;
        setLine2dVertices(data: any[]): number;
        statsCallback(value: any): glBuilderClass;
    }
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas image primitives.  Can be used with animations.  Core function
    is "update()". */
    class imageMarkClass extends markBaseClass<imageMarkClass> {
        constructor(container: HTMLElement, className?: string);
    }
    function createImageMark(container: HTMLElement, className?: string): imageMarkClass;
}
declare module vp.marks {
    /** Used to translate JavaScript shader functions into GL shader statements and expressions. */
    class jsParserClass {
        _context: any;
        constructor();
        makeRecordColumnName(name: string): string;
        colorToGlColor(ca: any): any;
        removeQuotes(name: any): any;
        fixupNumber(value: string): string;
        processRecordColumn(token: string, attrBlock: any): string;
        translateExp(line: string, usage: string, attrBlock: any): string;
        translateJsStatements(lines: string[], attrBlock: any): void;
        translateAttrCall(line: string, attrBlock: any): void;
        getGlParams(shaderCallback: any, context: any): {
            size: string;
            width: string;
            height: string;
            fill: number[];
            stroke: number[];
            x: string;
            y: string;
            opacity: string;
            strokeSize: number;
            cmds: string;
            origColNames: any[];
            dataColNames: any[];
            randomColNames: any[];
            functions: string;
        };
    }
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas line primitives.  Can be used with animations.  Core function
    is "update()". */
    class lineMarkClass extends markBaseClass<lineMarkClass> {
        constructor(container: HTMLElement, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createLineMark(container: HTMLElement, className?: string): lineMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas path primitives.  Can be used with animations.  Core function
    is "update()". */
    class pathMarkClass extends markBaseClass<pathMarkClass> {
        constructor(container: HTMLElement, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createPathMark(container: HTMLElement, className?: string): pathMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of WebGL POINT primitives.  Can be used with animations.  Core function
    is "update()". */
    class pointMarkClass extends markBaseClass<pointMarkClass> {
        constructor(container: HTMLElement, useWebGl?: boolean, className?: string);
        postProcessShape(element: HTMLElement): void;
    }
    function createPointMark(container: HTMLElement, className?: string): pointMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of WebGL rect2d primitives.  Can be used with animations.  Core function
    is "update()". */
    class rect2dMarkClass extends markBaseClass<rect2dMarkClass> {
        constructor(container: HTMLElement, useWebGl?: boolean, className?: string);
        postProcessShape(element: HTMLElement): void;
    }
    function createRect2dMark(container: HTMLElement, useWebGl?: boolean, className?: string): rect2dMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas RECT primitives.  Can be used with animations.  Core function
    is "update()". */
    class rectangleMarkClass extends markBaseClass<rectangleMarkClass> {
        constructor(container: HTMLElement, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createRectangleMark(container: HTMLElement, className?: string): rectangleMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas text primitives.  Can be used with animations.  Core function
    is "update()". */
    class textMarkClass extends markBaseClass<textMarkClass> {
        constructor(container: HTMLElement, className?: string);
        applyDrawingParams(elem: HTMLElement): void;
    }
    function createTextMark(container: HTMLElement, className?: string): textMarkClass;
}
declare module vp.marks {
    /** Supports data-based generation of WebGL triangle primitives.  Can be used with animations.  Core function
    is "update()". */
    class triangleMarkClass extends markBaseClass<triangleMarkClass> {
        constructor(container: HTMLElement, className?: string);
        postProcessShape(element: HTMLElement): void;
    }
    function createTriangleMark(container: HTMLElement, className?: string): triangleMarkClass;
}
declare module vp.layouts {
    /** A structure for accelerating N-body type calculations. */
    class quadTreeClass {
        points: vp.geom.IPoint[];
        rootNode: quadNodeClass;
        constructor(points: vp.geom.IPoint[]);
        buildTree(): void;
        /** Visits each node of the tree in pre-order. */
        visit(callback: any): void;
        /** Visits each node of the tree in post-order. */
        visitPostOrder(callback: any, visitEmptyNodes?: boolean): void;
    }
    class quadNodeClass {
        left: number;
        top: number;
        right: number;
        bottom: number;
        nodes: quadNodeClass[];
        isLeaf: boolean;
        point: vp.geom.IPoint;
        constructor(left: number, top: number, right: number, bottom: number);
        postOrder(callback: any, visitEmptyNodes: boolean): void;
        insert(pt: vp.geom.IPoint): boolean;
        subdivide(): void;
        visit(callback: any): void;
        containsPoint(pt: vp.geom.IPoint): boolean;
    }
    function createQuadTree(points: vp.geom.IPoint[]): quadTreeClass;
}
declare module vp.layouts {
    /** Supports dragstart, drag, dragend events. */
    class dragHelperClass {
        _onDragStartCallback: any;
        _onDragCallback: any;
        _onDragEndCallback: any;
        _dragElem: any;
        _ownerCallback: any;
        constructor(ownerCallback: any);
        addElements(elements: HTMLElement[]): void;
        addElement(elem: HTMLElement): void;
        startDragging(e: any): void;
        dragging(e: any): void;
        endDragging(e: any): void;
        onDragStart(callback: any): any;
        onDrag(callback: any): any;
        onDragEnd(callback: any): any;
    }
}
declare module vp.layouts {
    /** Layout of nodes and optional links using force directed layout. Supports start, tick, and end events. */
    class forceLayoutClass {
        _nodes: IForceNode[];
        _links: IForceLink[];
        _timer: number;
        _alpha: number;
        _friction: number;
        _gravity: number;
        _charge: any;
        _width: number;
        _height: number;
        _linkDistance: any;
        _linkStrength: any;
        _chargeDistance: number;
        _theta: number;
        _tickCount: number;
        _onStartCallback: any;
        _onTickCallback: any;
        _onEndCallback: any;
        _lastTickTime: number;
        _lastDt: number;
        _tickCallbackInProgress: boolean;
        _dragHelper: dragHelperClass;
        _quadTree: quadTreeClass;
        _xDelta: number;
        _yDelta: number;
        _totalUpdateNodesTime: number;
        _maxUpdateNodesTime: number;
        _lastStatTime: number;
        _onStatsCallback: any;
        constructor();
        /** Return a drag helper class, to assist caller in dragging elements associated with "nodes". */
        getDragHelper(): dragHelperClass;
        processDragEvent(name: string, dragElem: any, e: any): void;
        start(): void;
        private innerStart(alphaValue);
        initNodesAsNeeded(): void;
        initLinksAsNeeded(): void;
        stop(): void;
        onStopped(): void;
        resume(): void;
        tick(startTimer?: boolean): void;
        updateNodes(): void;
        addMassToQuadTree(quadTree: quadTreeClass): void;
        updateNode(node: IForceNode, quadTree: quadTreeClass, dt: any, lastDt: any): void;
        computeLinkForces(node: IForceNode): {
            x: number;
            y: number;
        };
        computeLinkForce(node: IForceNode, target: IForceNode, link: IForceLink, forceTotal: vp.geom.IPoint): void;
        computeNodeForces(fromNode: IForceNode, quadTree: quadTreeClass): {
            x: number;
            y: number;
        };
        addForceWithDistance(from: vp.geom.IPoint, to: vp.geom.IPoint, charge: number, maxDistance: number, distOp: string, forceTotal: vp.geom.IPoint): void;
        computeQuadTreeNodeForce(node: IForceNode, qtNode: quadNodeMass, forceTotal: vp.geom.IPoint): void;
        onStart(callback: any): forceLayoutClass;
        onTick(callback: any): forceLayoutClass;
        onEnd(callback: any): forceLayoutClass;
        onStats(callback: any): forceLayoutClass;
        nodes(): IForceNode[];
        nodes(value: IForceNode[]): forceLayoutClass;
        links(): IForceLink[];
        links(value: IForceLink[]): forceLayoutClass;
        gravity(): number;
        gravity(value: number): forceLayoutClass;
        charge(): any;
        charge(value: any): forceLayoutClass;
        width(): number;
        width(value: number): forceLayoutClass;
        height(): number;
        height(value: number): forceLayoutClass;
        alpha(): number;
        alpha(value: number): forceLayoutClass;
        chargeDistance(): number;
        chargeDistance(value: number): forceLayoutClass;
        linkDistance(): number;
        linkDistance(value: number): forceLayoutClass;
        theta(): number;
        theta(value: number): forceLayoutClass;
        friction(): number;
        friction(value: number): forceLayoutClass;
    }
    function createForceLayout(): forceLayoutClass;
    interface IForceNode {
        id: number;
        x: number;
        y: number;
        px: number;
        py: number;
        weight: number;
        charge: number;
        fixed: boolean;
        dragFixed: boolean;
    }
    interface IForceLink {
        source: IForceNode;
        target: IForceNode;
        distance: number;
        strength: number;
    }
    class quadNodeMass extends quadNodeClass {
        totalMass: number;
        xCom: number;
        yCom: number;
    }
}
declare module vp.paths {
    function buildPie(data: any[], cx: number, cy: number, innerRadius: number, outerRadius: number, createCanvasPath: boolean, callback: any): any[];
    function getPieSlicePath(xCenter: number, yCenter: number, innerRadius: number, outerRadius: number, angleDegrees: number, rotation: number, createCanvasPath?: boolean): string;
    function getPieSlicePathSvg(xCenter: number, yCenter: number, innerRadius: number, outerRadius: number, angleDegrees: number, rotation: number): string;
    function getPieSlicePathCanvas(xCenter: number, yCenter: number, innerRadius: number, outerRadius: number, angleDegrees: number, rotation: number): string;
}
declare module vp.curveFitting {
    function line(xa: any, ya: any): {};
    function polyFit(xa: any, ya: any, degree: any): {
        coef: any[];
        sigma: number;
    };
    function weightedLinearRegression(xa: any, ya: any, wa: any): {
        coef: number[];
    };
    function exponentialFit(xa: any, ya: any): {
        coef: number[];
    };
    function linearRegression(xa: any, ya: any, f: any): {
        coef: any[];
        sigma: number;
    };
    function spline(xx: any, yy: any): any[];
}
declare module vp.paths {
    function buildShape(shapeName: string, x: number, y: number, size: number, createCanvasPath?: boolean): string;
    function buildLine(data: any[], buildSinglePath: boolean, callback: any): any[];
    function buildArea(data: any[], callback: any): any[];
    function buildSpline(data: any[], callback: any): any[];
}
declare module vp.paths {
    function getPathDataForShape(shapeType: ShapeType, x: number, y: number, w: number, h: number, createCanvasPath?: boolean): string;
    enum ShapeType {
        circle = 0,
        diamond = 1,
        hexagram = 2,
        pentagram = 3,
        square = 4,
        triangleUp = 5,
        triangleDown = 6,
        triangleLeft = 7,
        triangleRight = 8,
        asterisk = 9,
        x = 10,
        plus = 11,
        plusInDiamond = 12,
        plusInCircle = 13,
        plusInSquare = 14,
        triangleUpDown = 15,
        triangleInSquare = 16,
        xInCircle = 17,
        xInSquare = 18,
    }
    var ShapeTypeNames: string[];
}
declare module vp.plotBox {
    interface AxisOptions {
        showAxis: boolean;
        showTitle: boolean;
        showGridLines: boolean;
        showTicks: boolean;
        showLabels: boolean;
        title: string;
        scale: vp.scales.IScaleRun;
    }
}
declare module vp.plotBox {
    class plotBoxClass {
        _transform3d: transform3dClass;
        _canvas: HTMLCanvasElement;
        _ctx: CanvasRenderingContext2D;
        _width: number;
        _height: number;
        constructor();
        width(): number;
        width(value: number): plotBoxClass;
        height(): number;
        height(value: number): plotBoxClass;
        draw(xOptions: AxisOptions, yOptions: AxisOptions, zOptions: AxisOptions): ClientRect;
    }
    function createPlotBox(): plotBoxClass;
}
declare module vp.plotBox {
    interface IElevationCamera {
        getZoom(): number;
        getX(): number;
        getY(): number;
        getElevation(): number;
        getRotation(): number;
        getMatrix(): vp.geom.matrix4;
        getScreenMatrix(): vp.geom.matrix4;
        setZoom(value: number): any;
        setX(value: number): any;
        setY(valuex: number): any;
        setElevation(value: number): any;
        setRotation(value: number): any;
        screenWidth(): number;
        screenWidth(value: number): transform3dClass;
        screenHeight(): number;
        screenHeight(value: number): transform3dClass;
        xMin(): number;
        xMin(value: number): transform3dClass;
        yMin(): number;
        yMin(value: number): transform3dClass;
        xMax(): number;
        xMax(value: number): transform3dClass;
        yMax(): number;
        yMax(value: number): transform3dClass;
        adjustZoom(value: number, x: number, y: number): any;
        rebuild(): any;
        resetCamera(): any;
    }
    /** This class uses azimuth and elevation to project point3s from 3D space to 2D space. */
    class transform3dClass implements IElevationCamera {
        _xFact: number;
        _yFact: number;
        _xShift: number;
        _yShift: number;
        _azimuth: number;
        _elevation: number;
        _screenWidth: number;
        _screenHeight: number;
        _xOffset: number;
        _yOffset: number;
        _xScale: number;
        _yScale: number;
        _xMin: number;
        _xMax: number;
        _yMin: number;
        _yMax: number;
        _zMin: number;
        _zMax: number;
        _mat: vp.geom.matrix4;
        _mainMat: vp.geom.matrix4;
        _matScreen: vp.geom.matrix4;
        _origWidth: number;
        _xRange: number;
        _yRange: number;
        _zRange: number;
        _isScreenOutput: boolean;
        /** builds a 3D matrix that can be used to translate point3s from 3D to 2D.  The projection
        is specified by an azimuth and an elevation (both in degrees of rotation).  The
        standard MATLAB setting for a 3D view is azimuth=-37.5, elevation=30.  For a direct overhead (2D)
        view, use azimuth=0, elevation=90. */
        constructor(screenWidth?: number, screenHeight?: number, azimuth?: number, elevation?: number, xMin?: number, xMax?: number, yMin?: number, yMax?: number, zMin?: number, zMax?: number, isScreenOutput?: boolean);
        getZoom(): number;
        getX(): number;
        getY(): number;
        getElevation(): number;
        getRotation(): number;
        setZoom(value: number): void;
        setX(value: number): void;
        setY(value: number): void;
        setElevation(value: number): void;
        setRotation(value: number): void;
        resetCamera(): void;
        getMatrix(): geom.matrix4;
        getScreenMatrix(): geom.matrix4;
        rebuild(): transform3dClass;
        transformPointEx(x: number, y: number, z: number): geom.vector3;
        adjustZoom(scaleFactor: number, x: number, y: number): void;
        private safeRange(max, min);
        private testTheMatrix();
        xMin(): number;
        xMin(value: number): transform3dClass;
        xMax(): number;
        xMax(value: number): transform3dClass;
        yMin(): number;
        yMin(value: number): transform3dClass;
        yMax(): number;
        yMax(value: number): transform3dClass;
        screenWidth(): number;
        screenWidth(value: number): transform3dClass;
        screenHeight(): number;
        screenHeight(value: number): transform3dClass;
        /** transform a point3 from 3D to 2D */
        transformPoint(x: number, y: number, z: number): geom.point3;
    }
    function createTransform3d(screenWidth?: number, screenHeight?: number, azimuth?: number, elevation?: number, xMin?: number, xMax?: number, yMin?: number, yMax?: number, zMin?: number, zMax?: number, isScreenOutput?: boolean): transform3dClass;
}
declare module vp.scales {
    /** base class for scales.  it maps an input value into a palette of range values.  An optional
    stops[] can be used to place the range values non-linearly (like a gradient definiton).  "T"
    is the final subclass of baseScaleClass (for correctly typed property setter functions).  */
    interface IScale {
        /** Allows caller to override normal percent-to-color mapping with his own mapping.  */
        mappingCallback(): any;
        mappingCallback(value: any): IScale;
        /** maps an input (domain) value to an output (range) value.  Range values are defined by the palette property. */
        scale(value: any): any;
    }
    class baseScaleClass<T extends IScaleRun> implements IScaleRun {
        ctr: string;
        scaleName: string;
        _palette: any[];
        _expandSpace: number;
        _stops: number[];
        _isRangeClipping: boolean;
        _domainMin: number;
        _domainMax: number;
        _isPaletteDiscrete: any;
        _mappingCallback: any;
        _scaleType: ScaleType;
        _categoryKeys: {};
        _nextKeyIndex: number;
        _domainDelta: number;
        _userSetCategoryKeys: boolean;
        constructor();
        isCategory(): boolean;
        /** The amount of space between the edges of the range space and the first/last break.  */
        expandSpace(): number;
        expandSpace(value: number): T;
        /** Allows caller to override normal percent-to-color mapping with his own mapping.  */
        mappingCallback(): any;
        mappingCallback(value: any): T;
        /** when true, we map each input category value to next palette entry.  */
        isPaletteDiscrete(): boolean;
        isPaletteDiscrete(value: boolean): T;
        /** Specifies how to handle values outside the domain that then get potentially mapped to values outside of the range. */
        isRangeClipping(): boolean;
        isRangeClipping(value: boolean): T;
        /** Specifies if this scales is linear, categorical, or categorical with no duplicates. */
        scaleType(): ScaleType;
        scaleType(value: ScaleType): T;
        /** specifies a set of values to be mapped to.
        The values can be passed as an array, or as multiple arguments. */
        palette(): any[];
        palette(value: any[]): T;
        palette(...args: any[]): T;
        /** specifies the minimum value to be mapped to.  Provided as legacy access to palette property. */
        rangeMin(): number;
        rangeMin(value: number): T;
        /** specifies the maximum value to be mapped to.  Provided as legacy access to palette property. */
        rangeMax(): number;
        rangeMax(value: number): T;
        range(min: number, max: number): any;
        onRangeChanged(): void;
        onPaletteChanged(): void;
        /** specifies a set stop values to be used in parallel withe the palette[].
        The values can be passed as an array, or as multiple arguments. */
        stops(value?: number[]): T;
        domainMin(): number;
        domainMin(value: number): T;
        domainMax(): number;
        domainMax(value: number): T;
        onDomainChanged(): void;
        resetKeys(): void;
        categoryKeys(): string[];
        categoryKeys(value: string[]): T;
        setCategoryKeys(keys: string[]): void;
        onMapTypeChanged(): void;
        /** this gets replaced by one of the 3 scale routines internally. */
        scale: (value: any, seriesIndex?: any) => any;
        /** call this using the index of the key value, as stored in the categoryKeys property. */
        categoryIndexScale(keyIndex: number): any;
        /** use this to get the index of the key before calling categoryScale(). */
        getIndexOfKey(value: any): number;
        categoryKeyScale(value: any): any;
        clip(value: number, min: number, max: number): number;
        calcPercent(value: number): number;
        lerpPalette(t: number, palette: any[]): any;
        lerpScale(value: any, rangePalette?: number[]): any;
        lerp(num: number, num2: number, t: number): number;
        interpolateValues(min: any, max: any, t: any): any;
    }
    class baseScale extends baseScaleClass<baseScale> {
    }
    /** type of mapping used in scales to extract values from a range palette. */
    enum ScaleType {
        /** use normalized input value to interplate between palette entries. */
        linear = 0,
        /** take log of input values before doing linear scale to range. */
        log = 1,
        /** take log of normalized input values before doing linear scale to range. */
        lowBias = 2,
        /** take exp of normalized input values before doing linear scale to range. */
        highBias = 3,
        /** use itemIndex as index into palette.  Caution: do NOT use with a filter, where your itemIndexes
         * are not consecutive.  */
        categoryIndex = 4,
        /** use a map to track unique values and use key index as index into palette. */
        categoryKey = 5,
        /** simliar to linear, but with support for nice date breaks and formatting on axis/legend. */
        dateTime = 6,
    }
    /** interface for using a scale from an axis, chart, etc. (vs. setting its properties). */
    interface IScaleRun {
        scaleName: string;
        scaleType(): ScaleType;
        scaleType(value: ScaleType): IScaleRun;
        domainMin(): number;
        domainMin(value: number): IScaleRun;
        domainMax(): number;
        domainMax(value: number): IScaleRun;
        rangeMin(): number;
        rangeMin(value: number): IScaleRun;
        range(min: number, max: number): any;
        palette(): any[];
        palette(min: any, max: any): IScaleRun;
        palette(value: string[]): IScaleRun;
        palette(value: any[]): IScaleRun;
        categoryKeys(): string[];
        categoryKeys(value: string[]): IScaleRun;
        expandSpace(): number;
        expandSpace(value: number): IScaleRun;
        scale(value: any, seriesIndex?: number): any;
    }
    interface ICategoryScale extends IScaleRun {
        stepSize(): number;
    }
    /** extract a numeric value from a discrete palette.  Does NOT do blending between entries. */
    function numberFromDiscretePalette(palette: any, index: any, firstPaletteIndex?: number): number;
    /** extract a numeric value from a continuous palette by blending the 2 closest enties as per the non-integer index. */
    function numberFromContinuousPalette(palette: any, index: any): number;
}
declare module vp.scales {
    class categoryScaleClass extends baseScale {
        _rangeBounds: number[];
        _stepSize: number;
        /** if scaleByIndex is true, the scale() function will be passed the index of the key at scale() usage
        time.  if false, it will pass the key value itself (which is RECOMMENDED when a filter can be used). */
        constructor(scaleByIndex?: boolean);
        stepSize(): number;
        /** setter can pass a single array argument, or a set of values. */
        domain(): any[];
        domain(...args: any[]): categoryScaleClass;
        /** setter can pass a single array argument, or a set of values. */
        rangeValues(): any[];
        rangeValues(...args: any[]): categoryScaleClass;
        /** create a palette of values from the range bounds. */
        range(min: number, max: number, computeRangeSteps?: boolean): categoryScaleClass;
        onRangeChanged(): void;
        computeRangeFromBounds(): void;
        map(value: string): any;
    }
    function createCategoryIndex(): categoryScaleClass;
    function createCategoryKey(): categoryScaleClass;
}
declare module vp.scales {
    class dateScaleClass extends baseScale {
        constructor();
        domain(): number[];
        domain(min: number, max: number): dateScaleClass[];
        range(): number[];
        range(min: number, max: number): dateScaleClass[];
        map(value: number): any;
    }
    function createDate(): dateScaleClass;
}
declare module vp.scales {
    class linearScaleClass extends baseScale {
        constructor();
        domain(): number[];
        domain(min: number, max: number): linearScaleClass[];
        range(): number[];
        range(min: number, max: number): linearScaleClass[];
        map(value: number): any;
    }
    function createLinear(): linearScaleClass;
}
declare module vp.scales {
    class logScaleClass extends baseScale {
        constructor();
        domain(): number[];
        domain(min: number, max: number): logScaleClass[];
        range(): number[];
        range(min: number, max: number): logScaleClass[];
        map(value: number): any;
        calcPercent(value: number): number;
    }
    function createLog(): logScaleClass;
}
declare module vp.scales {
    /** settings for an attribute (value, scaling, and legend data). */
    class niceNumbers {
        static niceUp(value: number): number;
        static niceUpAlt(value: number): number;
        /** Finds a nice number that is <= value. */
        static niceDown(value: number): number;
        static calcMinMaxGivenTickCount(min: number, max: number, tickCount: number): {
            min: number;
            max: number;
            increment: number;
            tickCount: number;
        };
        static calculate: (dataMin: number, dataMax: number, extendDomainToZero: boolean, useOnlyIntBreaks: boolean, callerMin?: number, callerMax?: number, callerTickCount?: number, addmaxHeadroom?: boolean) => any;
        private static calcIncr;
        private static calcMinMax;
    }
}
declare module vp.utils {
    /** a class that manages window messages for its associated window. */
    class msgMgrClass {
        _windowName: string;
        _parentWindow: Window;
        constructor(windowName: string);
        postMessageToParent(msgObj: any): void;
        getDomain(): string;
        onMessageFromParent(e: any): void;
        processMessageFromParent(e: any, msgObj: any): void;
    }
}
declare module vp.utils {
    function now(): number;
    var appStartTime: number;
    function mapEquals(map1: Object, map2: Object): boolean;
    function equals(any1: any, any2: any): boolean;
    function parseJsonIntoObj(json: string, obj: any): any;
    function addUnits(value: any, defaultUnits: string): any;
    function indexKeyFunc(dataRecord: any, index: any): any;
    function setDebugId(name: string): void;
    function debug(msg: any): void;
    function assert(cond: boolean, msg?: any): void;
    function hasKeys(obj: any): boolean;
    var computedStyles: {};
    function getComputedStyleFromClass(shapeName: string, parentClassName: string, className: string): any;
    function getShapeId(element: HTMLElement): string;
    function toArray(pseudoArray: any): any[];
    /** find HTML, SVG, or canvas elements that overlap with specificed rcBounds. */
    function getElementsInBounds(container: any, rcBounds: ClientRect, rcAdjusted: ClientRect): any[];
    function cb(thisObj: any, func: any): any;
    /** When set to a function, the function is called before an error is reported. */
    var onError: any;
    function error(msg: any, lineNum?: any): void;
    function jsonToStr(obj: any): string;
    function getFileExtension(name: string): string;
    function jsonFromStr(str: string): any;
    function float32Array(length: any): any;
    function int32Array(length: any): any;
    function toRadians(value: number): number;
    function toDegrees(value: number): number;
    function toHex2(value: number): string;
    function makeCtxColorStr(cr3: any): string;
    function cancelEventDefault(e: any): void;
    function cancelEventBubble(e: any): void;
    function argumentsAsArray(args: any): any[];
    function setTimer(interval: number, callback: any): number;
    function clearTimer(handle: number): void;
    function setOneShotTimer(interval: number, callback: any): number;
    function clearOneShotTimer(handle: number): void;
    function globalEval(js: any, wantReturn: any): any;
    function getCmdParams(cmd: any): any;
    function createXMLHttpRequest(): any;
    function getUrlParams(): any;
    function getUrlDirectory(): string;
    var epsilon: number;
    function floatLeq(a: any, b: any, eps?: number): boolean;
    function floatLess(a: any, b: any, eps?: number): boolean;
    function floatGeq(a: any, b: any, eps?: number): boolean;
    function floatEq(a: any, b: any, eps?: number): boolean;
    function unitsEq(a: any, b: any, eps?: number): boolean;
    function keys(obj: any): string[];
    function hasKey(obj: any): boolean;
    function numberOfKeys(theObject: any): number;
    function measureText(text: any, spanClass: any): {
        width: number;
        height: number;
    };
    function measureSvgText(svgNode: any, text: any, className: any): {
        width: number;
        height: number;
    };
    function routePropCalls(from: any, to: any): void;
    function routeFuncCalls(from: any, to: any): void;
    function routePropCallsPost(from: any, to: any, postCall: any): void;
    function generateFunc(args: any, body: any, maker: any): any;
    function deepCopy(objectToCopy: any): any;
    function copyArray(aray: any[]): any;
    function copyMap(map: any, copyArrays?: boolean): any;
    function copyMapIntoObj(from: any, to: any, copyArrays?: boolean): any;
    function getCanvasOrSvgParent(elem: any): any;
    /** adjust the x/y offset so that it has a .5/.5 fractional part. */
    function getRootCrispTranslate(container: any, x: number, y: number): {
        x: number;
        y: number;
    };
    function lineTypeToDashArray(lineType: any): string;
    enum LineType {
        blank = 0,
        solid = 1,
        dashed = 2,
        dotted = 3,
        dotDash = 4,
        longDash = 5,
        twoDash = 6,
    }
}
declare module vp.data {
    class aggNone implements IAggregate {
        init(): void;
        process(value: number): void;
        getResult(): number;
    }
}
declare module vp.geom {
    class quaternion {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
        static fromAngleAxis(theta: number, axis: number[]): quaternion;
        static rotateAngleAxis(quat: quaternion, theta: number, axis: number[]): quaternion;
        static multiply(a: quaternion, b: quaternion): quaternion;
        static toMatrix(q: quaternion): matrix4;
    }
}
declare module vp.colorPalettes {
    function blueRed(): any[];
    function redGreen(): any[];
    function surface(): string[];
    function grays(steps: any, startPercent: any, endPercent: any): any[];
    function reds(steps: any): any[];
    function greens(steps: any): any[];
    function rainbow(steps: any): any[];
    function rainbowPairs(steps: any): any[];
    function htmlColors(count: number): string[];
    function darkLight(color1: any): any[];
    function darkLightDark(cr: any, cr2: any): any[][];
    function lightDark(color1: any): any[];
    function hueSteps(color: any, steps: any): any[];
    function analogs(color: any): any[];
    function shades(color: any, count: any, startPercent?: any, endPercent?: any): any[];
}
declare module vp.scales {
    /** Transforms data by applying a normalized exponential function; has the effect of "openening up" the data at the high end. */
    class highBiasScaleClass extends baseScale {
        private exp4m1;
        constructor();
        domain(): number[];
        domain(min: number, max: number): highBiasScaleClass[];
        range(): number[];
        range(min: number, max: number): highBiasScaleClass[];
        map(value: number): any;
        calcPercent(value: number): number;
    }
    function createHighBias(): highBiasScaleClass;
}
declare module vp.scales {
    /** Transforms data by applying a normalized log; has the effect of "openening up" the data at the low end. */
    class lowBiasScaleClass extends baseScale {
        private log25;
        constructor();
        domain(): number[];
        domain(min: number, max: number): lowBiasScaleClass[];
        range(): number[];
        range(min: number, max: number): lowBiasScaleClass[];
        map(value: number): any;
        calcPercent(value: number): number;
    }
    function createLowBias(): lowBiasScaleClass;
}
declare module vp.dateHelper {
    function getDateScaleValues(minValue: number, maxValue: number, targetIntervals?: number): {
        units: TimeUnits;
        unitFactor: number;
        steps: any[];
        formatString: string;
    };
    enum TimeUnits {
        years = 0,
        quarters = 1,
        months = 2,
        days = 3,
        hours = 4,
        minutes = 5,
        seconds = 6,
        milliSeconds = 7,
    }
}
declare module vp.unitTests {
}
declare module vp.scales {
    /** settings for an attribute (value, scaling, and legend data). */
    class niceNumbersAlt {
        static niceNum(range: number, round: boolean): number;
        static calculate(min: number, max: number, steps?: number): {
            min: number;
            max: number;
            interval: number;
            steps: number;
        };
        static test(min: number, max: number, steps: number): void;
        static testRange(min: number, max: number): void;
        static testAll(): void;
    }
}
declare module vp.internal {
    interface ISmallWrapper<T> {
        background(): string;
        background(value: string): T;
        close(): T;
    }
    interface ISmallWrapper2<T> extends ISmallWrapper<T> {
        fill(): string;
        fill(value: string): T;
    }
    interface ISmallWrapper2End extends ISmallWrapper2<ISmallWrapper2End> {
    }
    class SmallWrapperImpl implements ISmallWrapper<SmallWrapperImpl> {
        background(): string;
        background(value: string): SmallWrapperImpl;
        close(): SmallWrapperImpl;
        foo(): SmallWrapperImpl;
    }
    function smallSelect(abc: string): ISmallWrapper2End;
    class SmallWrapper2Base<T> implements ISmallWrapper2<T> {
        background(): string;
        background(value: string): T;
        fill(): string;
        fill(value: string): T;
        close(): T;
        foobar(): T;
    }
    class SmallWrapper2Impl<T> extends SmallWrapper2Base<T> {
    }
    class SmallWrapper3Impl extends SmallWrapper2Impl<SmallWrapper3Impl> {
    }
}
declare module vp.marks {
    /** Supports data-based generation of SVG/Canvas group primitives.  Can be used with animations.  Core function
    is "update()". */
    class composerMarkClass extends markBaseClass<composerMarkClass> {
        _ctrCallback: any;
        _elemShaderInstances: any;
        constructor(container: HTMLElement, className: string, ctrCallback: any);
        localShader(elem: HTMLElement, data: any, index: number, isNew: boolean, context: any, transition: vp.animation.transitionClass): void;
    }
    function createComposerMark(container: HTMLElement, className: string, ctrCallback: any): composerMarkClass;
}
