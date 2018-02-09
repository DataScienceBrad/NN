/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
module powerbi.extensibility.visual {

    // d3
    import Selection = d3.Selection;
    import UpdateSelection = d3.selection.Update;

    // powerbi
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import DataViewObjects = powerbi.DataViewObjects;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;
    let selectionIds: ISelectionId[];

    // powerbi.extensibility
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

    // powerbi.extensibility.visual
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

    // powerbi.extensibility.utils.svg
    import SVGUtil = powerbi.extensibility.utils.svg;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import translate = powerbi.extensibility.utils.svg.translate;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import PrimitiveType = powerbi.extensibility.utils.type.PrimitiveType;
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    // powerbi.extensibility.utils.formatting
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    // powerbi.extensibility.utils.interactivity
    import appendClearCatcher = powerbi.extensibility.utils.interactivity.appendClearCatcher;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    // powerbi.extensibility.utils.chart
    import AxisHelper = powerbi.extensibility.utils.chart.axis;
    import axisScale = powerbi.extensibility.utils.chart.axis.scale;
    import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;

    // powerbi.extensibility.utils.chart.legend
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import Legend = powerbi.extensibility.utils.chart.legend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;

    import DateTimeSequence = powerbi.extensibility.utils.formatting.DateTimeSequence;
    import VisualDataRoleKind = powerbi.VisualDataRoleKind;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewTableRow = powerbi.DataViewTableRow;
    import timeScale = d3.time.Scale;

    const percentFormat: string = '0.00 %;-0.00 %;0.00 %';
    const millisecondsInADay: number = 24 * 60 * 60 * 1000;
    const millisecondsInWeek: number = 7 * millisecondsInADay;
    const millisecondsInAMonth: number = 30 * millisecondsInADay;
    const millisecondsInAQuarter: number = 92 * millisecondsInADay;
    const millisecondsInAYear: number = 365 * millisecondsInADay;
    const chartLineHeight: number = 25;
    const paddingTasks: number = 5;
    const numberFormat: string = '#';
    const dataformat: string = '$';
    const headerCellClassLiteral: string = '.headerCell';
    const nullStringLiteral: string = '';
    const taskColumnClassLiteral: string = '.task-column';
    const taskColumnLiteral: string = 'task-column';
    const startDateLiteral: string = 'StartDate';
    const endDateLiteral: string = 'EndDate';
    const sortOrderLiteral: string = 'sortOrder';
    const sortLevelLiteral: string = 'sortLevel';
    const prevSortedColumnLiteral: string = 'prevSortedColumn';
    const semiColonLiteral: string = ';';
    const verticalLineLiteral: string = 'vertical-line';
    const zeroLiteral: string = '0';
    const slashLiteral: string = '/';
    const colonLiteral: string = ':';
    const spaceLiteral: string = ' ';
    const verticalLineClassLiteral: string = '.verticalLine';
    const horizontalLineClassLiteral: string = '.horizontalLine';
    const pxLiteral: string = 'px';
    const categoryIdLiteral: string = '#gantt_category';
    const horizontalLineLiteral: string = 'horizontal-line';
    const columnLiteral: string = 'column';
    const legendLiteral: string = 'legend';
    const clickedTypeLiteral: string = 'clickedType';
    const phaseNamesLiteral: string = 'phaseNames';
    const milestoneNamesLiteral: string = 'milestoneNames';
    const stopPropagationLiteral: string = 'stopPropagation';
    const categoryClassLiteral: string = '.gantt_category';
    const taskRowClassLiteral: string = '.task-row';
    const ellipsisLiteral: string = '...';
    const categoryLiteral: string = 'gantt_category';
    const dotLiteral: string = '.';
    const headerCellLiteral: string = 'headerCell';
    const verticalLineSimpleLiteral: string = 'verticalLine';
    const horizontalLineSimpleLiteral: string = 'horizontalLine';
    const taskRowLiteral: string = 'task-row';
    const kpiClassLiteral: string = 'gantt_kpiClass';
    const paranthesisStartLiteral: string = '(';
    const paranthesisEndLiteral: string = ')';
    const commaLiteral: string = ',';

    // tslint:disable-next-line:interface-name
    export interface Task extends SelectableDataPoint {
        id: number;
        name: string[];
        start: Date;
        end: Date;
        numStart: number;
        numEnd: number;
        resource: string;
        color: string;
        KPIValues: KPIValues[];
        tooltipInfo: VisualTooltipDataItem[];
        selectionId: ISelectionId;
    }

    // tslint:disable-next-line:interface-name
    export interface KPIValues {
        name: string;
        value: string;
    }

    // tslint:disable-next-line:interface-name
    export interface GanttChartFormatters {
        startDataFormatter: IValueFormatter;
        endDataFormatter: IValueFormatter;
        completionFormatter: IValueFormatter;
        durationFormatter: IValueFormatter;
    }

    // tslint:disable-next-line:interface-name
    export interface KPIConfig {
        name: string;
        type: string;
        identity: {};
    }

    // tslint:disable-next-line:interface-name
    export interface GanttViewModel {
        dataView: DataView;
        settings: IGanttSettings;
        tasksNew: Task[];
        kpiData: KPIConfig[];
    }

    // tslint:disable-next-line:interface-name
    export interface TooltipOptions {
        opacity: number;
        animationDuration: number;
        offsetX: number;
        offsetY: number;
    }

    // tslint:disable-next-line:interface-name
    export interface GanttCalculateScaleAndDomainOptions {
        viewport: IViewport;
        margin: IMargin;
        showCategoryAxisLabel: boolean;
        showValueAxisLabel: boolean;
        forceMerge: boolean;
        categoryAxisScaleType: string;
        valueAxisScaleType: string;
        trimOrdinalDataOnOverflow: boolean;
        forcedTickCount?: number;
        // tslint:disable-next-line:no-any
        forcedYDomain?: any[];
        // tslint:disable-next-line:no-any
        forcedXDomain?: any[];
        // tslint:disable-next-line:no-any
        ensureXDomain?: any;
        // tslint:disable-next-line:no-any
        ensureYDomain?: any;
        categoryAxisDisplayUnits?: number;
        categoryAxisPrecision?: number;
        valueAxisDisplayUnits?: number;
        valueAxisPrecision?: number;
    }

    // tslint:disable-next-line:interface-name
    interface Line {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        tooltipInfo: VisualTooltipDataItem[];
    }

    // tslint:disable-next-line:interface-name
    interface VisualProperty {
        width: number;
        height: number;
    }

    // tslint:disable-next-line:interface-name
    interface AxisPropertiesParameter {
        viewportIn: IViewport;
        textProperties: TextProperties;
        startDate: Date;
        endDate: Date;
        datamin: number;
        datamax: number;
        axisLength: number;
        ticks: number;
    }

    // tslint:disable-next-line:interface-name
    export interface GanttBehaviorOptions {
        // tslint:disable-next-line:no-any
        clearCatcher: Selection<SelectableDataPoint>;
        // tslint:disable-next-line:no-any
        taskSelection: Selection<SelectableDataPoint>;
        // tslint:disable-next-line:no-any
        legendSelection: Selection<SelectableDataPoint>;
        interactivityService: IInteractivityService;
    }

    /**
     * Gets property value for a particular object.
     *
     * @function
     * @param {DataViewObjects} objects - Map of defined objects.
     * @param {string} objectName       - Name of desired object.
     * @param {string} propertyName     - Name of desired property.
     * @param {T} defaultValue          - Default value of desired property.
     */
    export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object: DataViewObject;
            object = objects[objectName];
            if (object) {
                let property: T;
                property = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }

        return defaultValue;
    }

    module Selectors {
        export const className: ClassAndSelector = createClassAndSelector('gantt');
        export const chart: ClassAndSelector = createClassAndSelector('gantt_chart');
        export const chartLine: ClassAndSelector = createClassAndSelector('gantt_chart-line');
        export const body: ClassAndSelector = createClassAndSelector('gantt-body');
        export const axisGroup: ClassAndSelector = createClassAndSelector('gantt_axis');
        export const domain: ClassAndSelector = createClassAndSelector('gantt_domain');
        export const axisTick: ClassAndSelector = createClassAndSelector('gantt_tick');
        export const tasks: ClassAndSelector = createClassAndSelector('gantt_tasks');
        export const taskGroup: ClassAndSelector = createClassAndSelector('gantt_task-group');
        export const singleTask: ClassAndSelector = createClassAndSelector('gantt_task');
        export const singlePhase: ClassAndSelector = createClassAndSelector('gantt_phase');
        export const taskRect: ClassAndSelector = createClassAndSelector('gantt_task-rect');
        export const taskResource: ClassAndSelector = createClassAndSelector('gantt_task-resource');
        export const errorPanel: ClassAndSelector = createClassAndSelector('gantt_errorPanel');
        export const taskLines: ClassAndSelector = createClassAndSelector('gantt_task-lines');
        export const kpiLines: ClassAndSelector = createClassAndSelector('gantt_kpi-lines');
        export const label: ClassAndSelector = createClassAndSelector('gantt_label');
        export const legendItems: ClassAndSelector = createClassAndSelector('gantt_legendItem');
        export const legendTitle: ClassAndSelector = createClassAndSelector('gantt_legendTitle');
        export const toggleTask: ClassAndSelector = createClassAndSelector('gantt_toggle-task');
        export const toggleTaskGroup: ClassAndSelector = createClassAndSelector('gantt_toggle-task-group');
        export const barPanel: ClassAndSelector = createClassAndSelector('gantt_barPanel');
        export const taskPanel: ClassAndSelector = createClassAndSelector('gantt_taskPanel');
        export const kpiPanel: ClassAndSelector = createClassAndSelector('gantt_kpiPanel');
        export const timeLinePanel: ClassAndSelector = createClassAndSelector('gantt_timelinePanel');
        export const bottomPannel: ClassAndSelector = createClassAndSelector('gantt_bottomPanel');
        export const imagePanel: ClassAndSelector = createClassAndSelector('gantt_imagePanel');
        export const kpiImagePanel: ClassAndSelector = createClassAndSelector('gantt_kpiImagePanel');
        export const drillAllPanel: ClassAndSelector = createClassAndSelector('gantt_drillAllPanel');
        export const drillAllPanel2: ClassAndSelector = createClassAndSelector('gantt_drillAllPanel2');
        export const drillAllSvg: ClassAndSelector = createClassAndSelector('gantt_drillAllSvg');
        export const drillAllSvg2: ClassAndSelector = createClassAndSelector('gantt_drillAllSvg2');
        export const kpiTitlePanel: ClassAndSelector = createClassAndSelector('gantt_kpiTitlePanel');
        export const bottomMilestonePanel: ClassAndSelector = createClassAndSelector('gantt_bottomMilestonePanel');
        export const kpiSvg: ClassAndSelector = createClassAndSelector('gantt_kpiSvg');
        export const backgroundBoxSvg: ClassAndSelector = createClassAndSelector('gantt_backgroundBox');
        export const taskSvg: ClassAndSelector = createClassAndSelector('gantt_taskSvg');
        export const barSvg: ClassAndSelector = createClassAndSelector('gantt_barSvg');
        export const timeLineSvg: ClassAndSelector = createClassAndSelector('gantt_timelineSvg');
        export const imageSvg: ClassAndSelector = createClassAndSelector('gantt_imageSvg');
        export const bottomMilestoneSvg: ClassAndSelector = createClassAndSelector('gantt_bottomMilestoneSvg');
        export const bottomMilestoneGroup: ClassAndSelector = createClassAndSelector('gantt_bottom-milestone-group');
        export const bottomTaskDiv: ClassAndSelector = createClassAndSelector('gantt_bottomTaskDiv');
        export const bottomTaskSvg: ClassAndSelector = createClassAndSelector('gantt_bottomTaskSvg');
        export const gridGroup: ClassAndSelector = createClassAndSelector('gantt_grids');
        export const todayIndicator: ClassAndSelector = createClassAndSelector('gantt_today-indicator');
        export const todayText: ClassAndSelector = createClassAndSelector('gantt_today-text');
        export const todayGroup: ClassAndSelector = createClassAndSelector('gantt_today-group');
        export const legendPanel: ClassAndSelector = createClassAndSelector('gantt_legendPanel');
        export const legendSvg: ClassAndSelector = createClassAndSelector('gantt_legendSvg');
        export const legendGroup: ClassAndSelector = createClassAndSelector('gantt_legendGroup');
        export const legendText: ClassAndSelector = createClassAndSelector('gantt_legendText');
        export const legendIndicatorPanel: ClassAndSelector = createClassAndSelector('gantt_legendIndicatorPanel');
        export const legendIndicatorTitlePanel: ClassAndSelector = createClassAndSelector('gantt_legendIndicatorTitlePanel');
        export const legendIndicatorTitleSvg: ClassAndSelector = createClassAndSelector('gantt_legendIndicatorTitleSvg');
        export const kpiIndicatorPanel: ClassAndSelector = createClassAndSelector('gantt_kpiIndicatorPanel');
        export const kpiIndicatorSvg: ClassAndSelector = createClassAndSelector('gantt_kpiIndicatorSvg');
        export const milestoneIndicatorPanel: ClassAndSelector = createClassAndSelector('gantt_milestoneIndicatorPanel');
        export const milestoneIndicatorSvg: ClassAndSelector = createClassAndSelector('gantt_milestoneIndicatorSvg');
        export const phaseIndicatorPanel: ClassAndSelector = createClassAndSelector('gantt_phaseIndicatorPanel');
        export const phaseIndicatorSvg: ClassAndSelector = createClassAndSelector('gantt_phaseIndicatorSvg');
    }

    module GanttRoles {
        export const category: string = 'Category';
        export const startDate: string = 'StartDate';
        export const endDate: string = 'EndDate';
        export const kpiValueBag: string = 'KPIValueBag';
        export const resource: string = 'Resource';
        export const tooltip: string = 'Tooltip';
    }

    export class Gantt implements IVisual {
        private viewport: IViewport;
        private colors: IColorPalette;
        private legend: ILegend;
        private textProperties: TextProperties = {
            fontFamily: 'wf_segoe-ui_normal',
            fontSize: PixelConverter.toString(9)
        };

        // tslint:disable-next-line:no-any
        public static defaultValues: any = {
            AxisTickSize: 6,
            MaxTaskOpacity: 1,
            MinTaskOpacity: 0.4,
            ProgressBarHeight: 4,
            ResourceWidth: 100,
            TaskColor: '#00B099',
            TaskLineWidth: 15,
            DefaultDateType: 'Month',
            DateFormatStrings: {
                Day: 'MMM dd hh:mm tt',
                Week: 'MMM dd',
                Month: 'MMM yyyy',
                Quarter: 'MMM yyyy',
                Year: 'yyyy'
            }
        };

        private static selectionIdHash: boolean[] = [];
        private static globalOptions: VisualUpdateOptions;
        private static previousSel: string;
        private static typeColors: string[] = ['#2c84c6', '#4c4d4e', '#4d4d00', '#cd6600', '#f08080',
            '#cea48b', '#8f4c65', '#af9768', '#42637f', '#491f1c', '#8e201f', '#20b2aa', '#999966', '#bd543f', '#996600'];
        private static axisHeight: number = 43;
        private static bottomMilestoneHeight: number = 23;
        private static scrollHeight: number = 17;
        private static defaultTicksLength: number = 45;
        private static defaultDuration: number = 250;
        private static taskLineCoordinateX: number = 15;
        private static axisLabelClip: number = 20;
        private static axisLabelStrokeWidth: number = 1;
        private static taskResourcePadding: number = 4;
        private static barHeightMargin: number = 5;
        private static chartLineHeightDivider: number = 4;
        private static resourceWidthPadding: number = 10;
        private static taskLabelsMarginTop: number = 15;
        private static complectionMax: number = 1;
        private static complectionMin: number = 0;
        private static complectionTotal: number = 100;
        private static minTasks: number = 1;
        private static chartLineProportion: number = 1.5;
        private static milestoneTop: number = 0;
        private static taskLabelWidth: number = 0;
        private static kpiLabelWidth: number;
        private static taskLabelWidthOriginal: number = 0;
        private static kpiLabelWidthOriginal: number = 0;
        private static visualWidth: number = 0;
        private static isPhaseHighlighted: boolean = false;
        private static isMilestoneHighlighted: boolean = false;
        private static isLegendHighlighted: boolean = false;
        private static xAxisPropertiesParamter: AxisPropertiesParameter;
        private static visualCoordinates: VisualProperty;
        private static earliestStartDate: Date = new Date();
        private static lastestEndDate: Date = new Date();
        private static maxSafeInteger: number = 9007199254740991;
        private static minSafeInteger: number = -9007199254740991;
        private static dataMIN: number = Gantt.maxSafeInteger;
        private static dataMAX: number = Gantt.minSafeInteger;
        private static drillLevelPadding: number = 10;
        private static totalTasksNumber: number = 0;
        private static currentTasksNumber: number = 0;
        private static minTasksNumber: number = 0;
        private static singleCharacterWidth: number = 0;
        private static maxTaskNameLength: number = 0;
        private static totalDrillLevel: number = 0;
        private static totalTicks: number = 0;
        private static isAllExpanded: boolean = true;
        private static isSubRegionFilteredData: boolean = false;
        private static isProjectFilteredData: boolean = false;
        private static isIncorrectHierarchy: boolean = false;
        private static isPlannedBarPresent: boolean = false;
        private static phaseNames: string[] = [];
        private static milestoneNames: string[] = [];
        private static milestoneShapes: string[] = ['circle', 'diamond', 'star', 'triangle'];
        private static milestoneColor: string[] = ['#0000ff', '#cd00ff', '#78f4ff', '#ff0099'];
        private static milestoneSize: number[] = [20, 14, 18, 16];
        private static isScrolled: boolean = false;
        // tslint:disable-next-line:no-any
        private static currentSelectionState: any = {};
        private static totalLegendSelected: number = 0;
        private static totalLegendPresent: number = 0;
        private static formatters: GanttChartFormatters;
        private static multipleSelectFlag: boolean = false;
        private static prevSelectionCount: number = 0;
        private static isDateData: boolean = false;
        private static expandImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsSAAALEgHS'
            + '3X78AAAA10lEQVQoz5WRwVHDUAxE3zfcyY0jdICpIM6NW9wBLiEd7GwH7gBTAaED04HpIOnAVPC5yJmPhwPoJD3NalZ'
            + 'Syjnzn7i2vQGOUc9AB2yAYWGS2kVQSZqjuQX2QC/pFEO2wN72cBEASBqA12DPtg+S+hXrAFK5g+0JeIhyB0zAWLDHarV'
            + 'TU+THsNsWbFwLDkU+/ML6iyXbLfAWjQ9JTfh+CfYuqU05Z2zX4fUGOAM1cF+wT6CRNF+llJY/3AFfwFP8YwRug7Vxaqr'
            + 'C5y6mTMG6YHXBfp71L/EN44hU/TumF5gAAAAASUVORK5CYII=';
        private static collapseImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBI'
            + 'WXMAAAsSAAALEgHS3X78AAAA3ElEQVQoz5WSwVHDQAxF3xru5MYROkjowLlxdAcxHZgKfn4H7g'
            + 'BTAaGD0IHTQejAVLBctDM7vkW3/yTtH0mbcs7cEve1sD0AXchR0sn2EWgLS8XBdgd8ReJHUmu7'
            + ' Bz6CfUvqUs4Z2zvgDDwAv8AOeK7YBWglLXcppQ1wAp6AP+AVWKL4MVgn6QrQACOwDdujpBmY4g'
            + ' GAIRh1Q4ne9mbFhnoxTXS/hd7Gds7Ae2G2p9oBSRPwGexge5A0rlgPkOrD2Z6refbAHMMX9tKs'
            + ' DtlG4R64SlrikIUt6dav8Q99qlfX01xJpAAAAABJRU5ErkJggg==';
        private static drillDownImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFW'
            + 'HRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAA'
            + 'AAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8'
            + '+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUC'
            + 'BDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gP'
            + 'HJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50'
            + 'YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8'
            + 'vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS'
            + '94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zV'
            + 'HlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIw'
            + 'MTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc'
            + '5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc3MkFFQkJCM0JFOD'
            + 'ExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlS'
            + 'UQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiIHN0UmVmOmRvY3Vt'
            + 'ZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5MUVGNDgiLz4gPC9yZGY'
            + '6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz'
            + '4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5AjDsQm+BTPm'
            + 'jXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAASUVORK5CYII=';
        private static drillUpImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWH'
            + 'RTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAA'
            + 'AAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+ID'
            + 'x4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3'
            + 'JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZj'
            + 'pSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbn'
            + 'MjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYW'
            + 'RvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS'
            + '4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZX'
            + 'NvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbm'
            + 'Rvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjREMjk2MDhDM0JFODExRTc4QTVFODdENT'
            + 'ZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjREMjk2MDhEM0JFODExRTc4QTVFOD'
            + 'dENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paW'
            + 'Q6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC'
            + '5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC9yZGY6RGVzY3JpcHRpb2'
            + '4+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5N9DX0AAAATElEQV'
            + 'R42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxIxHMVZNjAQUI4'
            + 'MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==';
        private static drillDownAllImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMA'
            + 'AAsSAAALEgHS3X78AAAA00lEQVQoz22PUY0CQRBE3xH+QQIOwAFIwAGcAvYUVLcC1sHuOeAcIGElIG'
            + 'EdNB/XkwwDnUwynaqamkdEYGadmZ0jgk/HzM5mZhHBgv9ZA4O79zTj7iMwlH3Z6Bd33wHH3O/AtjaU'
            + 'hh74y/semIBHZf5ND18RUdcboKb1R1L/8qU0PiSZu0/AmPpR0t3dO2AtyRbVS4O7j5JuwC7PlNDXlq'
            + 'HMKRvmCvpUG5YV9CbFbQIDrAq0JPsE3dX1Od+SCtNrIEMH4JbrQdJU62+BDG2AWdLcak/tkG3X3uJZ'
            + 'XAAAAABJRU5ErkJggg==';
        private static drillUpAllImage: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAA'
            + 'AsSAAALEgHS3X78AAAA10lEQVQoz32Q0W3CUAxFD4j/dIRs0LJBOkGzQcMGdIIbb8AGfRuUTlA6QekG'
            + 'ZQMygfnAAet91JIlyzr21b0LdyeXmT0AOwBJA1Ut8oGZPQEFeIzVL9BJOs/MMsE9cEgwMf/Fo/tBwB9'
            + 'AE/sN8BZzA/wEc1OYP5yAtaQiaQc8A1NmVkn+G+hDcQ+cgW2A+9pDkdQBLXAEXoDX8ATQRRj3lMxsiD'
            + 'ibKskJ6CUdsukBeA94CtObZPqrNt1WuRdJBVjXppdJ+jPg47yIuY1H13J3xnFs3Z3/emYuR+Rr0nbFP'
            + 'j4AAAAASUVORK5CYII=';
        private static legendIcon: string =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciI'
            + 'HZpZXdCb3g9IjAgMCA1NC41IDQ2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6Z3JheTt9PC9zdHls'
            + 'ZT48L2RlZnM+PHRpdGxlPkFzc2V0IDI8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9Ikx'
            + 'heWVyIDIiPjxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PHJlY3QgY2xhc3M9Im'
            + 'Nscy0xIiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjE4L'
            + 'jg1IiB3aWR0aD0iNTQuNSIgaGVpZ2h0PSI4LjMiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHk9IjM3Ljci'
            + 'IHdpZHRoPSI1NC41IiBoZWlnaHQ9IjguMyIvPjwvZz48L2c+PC9zdmc+';
        private static iHeaderSingleCharWidth: number = 4;
        private static iKPIHeaderSingleCharWidth: number = 4;
        private static categoriesTitle: string[] = [];
        private static columnWidth: number;
        private static categoryColumnsWidth: string;
        private static minDisplayRatio: number;
        private static currentDisplayRatio: number;
        private static prevDisplayRatio: number;
        private static numberOfCategories: number;
        private static isKpiPresent: boolean;
        private static viewModelNew: GanttViewModel;
        private static sortLevel: number = 0;
        private static sortOrder: string = 'asc';
        private static sortDescOrder: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb'
            + '2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/'
            + 'eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1'
            + 'ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMT'
            + 'M4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6c'
            + 'mRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNj'
            + 'cmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjA'
            + 'vIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZW'
            + 'Y9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhd'
            + 'G9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlE'
            + 'PSJ4bXAuaWlkOjc3MkFFQkJBM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4IiB4bXBNTTpEb2N1bWVudEl'
            + 'EPSJ4bXAuZGlkOjc3MkFFQkJCM0JFODExRTc5NTJDOUZDRTZDOTFFRjQ4Ij4gPHhtcE1NOkRlcml2ZW'
            + 'RGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzcyQUVCQjgzQkU4MTFFNzk1MkM5RkNFNkM5M'
            + 'UVGNDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzcyQUVCQjkzQkU4MTFFNzk1MkM5RkNFNkM5'
            + 'MUVGNDgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2t'
            + 'ldCBlbmQ9InIiPz4K7pvnAAAAVklEQVR42mJMS0ubzsDAkMFAHJjBBCSyQAxiFIPUMp89e5bB2Nh4G5'
            + 'AjDsQm+BTPmjXrPzOIR0ATXDGIwwwTxaEJRTEIMKLbDQwEkNg0KBdFMQgABBgAaoAhSxcNKH0AAAAAS'
            + 'UVORK5CYII=';
        private static sortAscOrder: string =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAYAAAD37n+BAAAAGXRFWHRTb2'
            + 'Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eH'
            + 'BhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldG'
            + 'EgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4ID'
            + 'c5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPS'
            + 'JodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdG'
            + 'lvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bW'
            + 'xuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dH'
            + 'A6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD'
            + '0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaW'
            + 'lkOjREMjk2MDhDM0JFODExRTc4QTVFODdENTZDMzAyQjJEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZG'
            + 'lkOjREMjk2MDhEM0JFODExRTc4QTVFODdENTZDMzAyQjJEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0Um'
            + 'VmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEQyOTYwOEEzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiIHN0Um'
            + 'VmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEQyOTYwOEIzQkU4MTFFNzhBNUU4N0Q1NkMzMDJCMkQiLz4gPC'
            + '9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz'
            + '5N9DX0AAAATElEQVR42mJkwALS0tI6gBQ/EGfNmjXrP7IcMw7F5UBsAsTixsbG286ePYtdA5JiGMDQxI'
            + 'xHMVZNjAQUI4MZID+xEKkYBDJABECAAQB/1x1ybiu+cQAAAABJRU5ErkJggg==';
        private static sortDefaultIcon: string = Gantt.sortAscOrder;
        private static prevSortedColumn: number = -1;
        private static legendWidth: number = 90;
        private static maximumNormalizedFontSize: number = 19;
        private static maximumFontSize: number = 40;
        private static isSelected: boolean = false;
        private static regionValueFormatter: IValueFormatter;
        private static metroValueFormatter: IValueFormatter;
        private static projectValueFormatter: IValueFormatter;
        private static trancheValueFormatter: IValueFormatter;
        private static get DefaultMargin(): IMargin {
            return {
                top: 50,
                right: 40,
                bottom: 40,
                left: 20
            };
        }

        private margin: IMargin = Gantt.DefaultMargin;
        private body: Selection<HTMLElement>;
        private ganttSvg: Selection<HTMLElement>;
        private viewModel: GanttViewModel;
        // tslint:disable-next-line:no-any
        private timeScale: timeScale<any, any>;
        private axisGroup: Selection<HTMLElement>;
        private timelineDiv: Selection<HTMLElement>;
        private taskDiv: Selection<HTMLElement>;
        private kpiDiv: Selection<HTMLElement>;
        private barDiv: Selection<HTMLElement>;
        private taskSvg: Selection<HTMLElement>;
        private kpiSvg: Selection<HTMLElement>;
        private timelineSvg: Selection<HTMLElement>;
        private bottomDiv: Selection<HTMLElement>;
        private imageDiv: Selection<HTMLElement>;
        private kpiImageDiv: Selection<HTMLElement>;
        private kpiTitleDiv: Selection<HTMLElement>;
        private drillAllDiv: Selection<HTMLElement>;
        private drillAllDiv2: Selection<HTMLElement>;
        private imageSvg: Selection<HTMLElement>;
        private kpiImageSvg: Selection<HTMLElement>;
        private drillAllSvg: Selection<HTMLElement>;
        private drillAllSvg2: Selection<HTMLElement>;
        private drillAllGroup: Selection<HTMLElement>;
        private kpiTitleSvg: Selection<HTMLElement>;
        private bottommilestoneDiv: Selection<HTMLElement>;
        private bottommilestoneSvg: Selection<HTMLElement>;
        private bottommilestoneGroup: Selection<HTMLElement>;
        private bottomTaskDiv: Selection<HTMLElement>;
        private bottomTaskSvg: Selection<HTMLElement>;
        private backgroundGroupTask: Selection<HTMLElement>;
        private backgroundGroupKPI: Selection<HTMLElement>;
        private backgroundGroupBar: Selection<HTMLElement>;
        private errorDiv: Selection<HTMLElement>;
        private errorText: Selection<HTMLElement>;
        private chartGroup: Selection<HTMLElement>;
        private taskGroup: Selection<HTMLElement>;
        private lineGroup: Selection<HTMLElement>;
        private kpiGroup: Selection<HTMLElement>;
        private kpiTitleGroup: Selection<HTMLElement>;
        private toggleTaskGroup: Selection<HTMLElement>;
        private legendDiv: Selection<HTMLElement>;
        private legendSvg: Selection<HTMLElement>;
        private legendGroup: Selection<HTMLElement>;
        private legendIndicatorDiv: Selection<HTMLElement>;
        private arrowDiv: Selection<HTMLElement>;
        private legendIndicatorTitleDiv: Selection<HTMLElement>;
        private legendIndicatorTitleSvg: Selection<HTMLElement>;
        private kpiIndicatorDiv: Selection<HTMLElement>;
        private kpiIndicatorSvg: Selection<HTMLElement>;
        private milestoneIndicatorDiv: Selection<HTMLElement>;
        private milestoneIndicatorSvg: Selection<HTMLElement>;
        private phaseIndicatorDiv: Selection<HTMLElement>;
        private phaseIndicatorSvg: Selection<HTMLElement>;
        private gridGroup: Selection<HTMLElement>;
        private todayGroup: Selection<HTMLElement>;
        private todayindicator: Selection<HTMLElement>;
        private todaytext: Selection<HTMLElement>;
        // tslint:disable-next-line:no-any
        private clearCatcher: Selection<any>;
        private ganttDiv: Selection<HTMLElement>;
        private selectionManager: ISelectionManager;
        private behavior: GanttChartBehavior;
        private interactivityService: IInteractivityService;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private isInteractiveChart: boolean = false;
        private offset: number;

        constructor(options: VisualConstructorOptions) {
            this.init(options);
        }

        private init(options: VisualConstructorOptions): void {
            this.host = options.host;
            this.colors = options.host.colorPalette;
            this.selectionManager = options.host.createSelectionManager();
            this.body = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                this.host.tooltipService,
                options.element);
            this.behavior = new GanttChartBehavior();
            this.interactivityService = createInteractivityService(this.host);
            this.createViewport($(options.element));
            this.clearViewport();
            this.ganttDiv.classed('gantt_hidden', true);
            this.errorDiv.classed('gantt_hidden', false);
            this.errorText.text('');
        }

        /**
         * Create the viewport area of the gantt chart
         */
        private createViewport(element: JQuery): void {
            // create div container to the whole viewport area
            this.errorDiv = this.body.append('div')
                .classed(Selectors.errorPanel.class, true)
                .classed('gantt_hidden', true);
            this.errorText = this.errorDiv.append('p');

            this.ganttDiv = this.body.append('div')
                .classed(Selectors.body.class, true);

            this.legendDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.legendPanel.class, true);

            this.legendSvg = this.legendDiv
                .append('svg')
                .classed(Selectors.legendSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.legendSvg);

            this.legendGroup = this.legendSvg
                .append('g')
                .classed(Selectors.legendGroup.class, true);

            this.legendGroup.append('image')
                .attr({
                    class: 'gantt_legendToggle',
                    'xlink:href': Gantt.legendIcon,
                    width: 13,
                    height: 13,
                    x: 0
                });

            this.legendGroup
                .append('text')
                .attr({
                    class: 'gantt_legendToggle gantt_legendText',
                    x: 18,
                    y: 10,
                    stroke: '#212121',
                    'stroke-width': 0.5
                })
                .text('Legend');

            this.legendGroup.append('image')
                .attr({
                    id: 'LegendToggleImage',
                    class: 'gantt_legendToggle notVisible',
                    'xlink:href': Gantt.drillDownImage,
                    width: 12,
                    height: 12,
                    x: 62
                });

            this.addLegendHideShowEvents(this);

            this.arrowDiv = this.ganttDiv
                .append('div')
                .attr({
                    class: 'gantt_arrow-up arrow'
                });

            this.legendIndicatorDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.legendIndicatorPanel.class, true);

            this.legendIndicatorTitleDiv = this.legendIndicatorDiv
                .append('div')
                .classed(Selectors.legendIndicatorTitlePanel.class, true);

            this.legendIndicatorTitleSvg = this.legendIndicatorTitleDiv
                .append('svg')
                .classed(Selectors.legendIndicatorTitleSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.legendIndicatorTitleSvg);

            this.kpiIndicatorDiv = this.legendIndicatorDiv
                .append('div')
                .classed(Selectors.kpiIndicatorPanel.class, true);

            this.kpiIndicatorSvg = this.kpiIndicatorDiv
                .append('svg')
                .classed(Selectors.kpiIndicatorSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.kpiIndicatorSvg);

            this.milestoneIndicatorDiv = this.legendIndicatorDiv
                .append('div')
                .classed(Selectors.milestoneIndicatorPanel.class, true);

            this.milestoneIndicatorSvg = this.milestoneIndicatorDiv
                .append('svg')
                .classed(Selectors.milestoneIndicatorSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.milestoneIndicatorSvg);

            this.phaseIndicatorDiv = this.legendIndicatorDiv
                .append('div')
                .classed(Selectors.phaseIndicatorPanel.class, true);

            this.phaseIndicatorSvg = this.phaseIndicatorDiv
                .append('svg')
                .classed(Selectors.phaseIndicatorSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.phaseIndicatorSvg);

            this.timelineDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.timeLinePanel.class, true);

            this.timelineSvg = this.timelineDiv
                .append('svg')
                .classed(Selectors.className.class, true);

            this.clearCatcher = appendClearCatcher(this.timelineSvg);

            this.axisGroup = this.timelineSvg
                .append('g')
                .classed(Selectors.axisGroup.class, true);

            this.kpiTitleDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.kpiTitlePanel.class, true);

            this.kpiTitleSvg = this.kpiTitleDiv
                .append('svg');

            this.clearCatcher = appendClearCatcher(this.kpiTitleSvg);

            this.kpiTitleGroup = this.kpiTitleSvg
                .append('g')
                .classed(Selectors.kpiLines.class, true);

            this.drillAllDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.drillAllPanel.class, true);

            this.drillAllDiv2 = this.ganttDiv
                .append('div')
                .classed(Selectors.drillAllPanel2.class, true);

            this.drillAllSvg = this.drillAllDiv
                .append('svg')
                .classed(Selectors.drillAllSvg.class, true);

            this.drillAllSvg2 = this.drillAllDiv2
                .append('svg')
                .classed(Selectors.drillAllSvg2.class, true);

            this.drillAllGroup = this.drillAllSvg2
                .append('g');

            this.imageDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.imagePanel.class, true);

            this.imageSvg = this.imageDiv
                .append('svg');

            this.clearCatcher = appendClearCatcher(this.imageSvg);

            this.imageSvg.append('image')
                .attr('id', 'gantt_ToggleIcon')
                .attr('class', 'collapse')
                .attr('xlink:href', Gantt.collapseImage)
                .attr('width', 12)
                .attr('height', 12);

            this.kpiImageDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.kpiImagePanel.class, true);

            this.kpiImageSvg = this.kpiImageDiv
                .append('svg');

            this.clearCatcher = appendClearCatcher(this.kpiImageSvg);

            this.kpiImageSvg.append('image')
                .attr('id', 'gantt_KPIToggle')
                .attr('class', 'collapse')
                .attr('xlink:href', Gantt.collapseImage)
                .attr('width', 12)
                .attr('height', 12);

            this.addExpandCollapseEvent(this);

            this.bottomDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.bottomPannel.class, true);

            this.kpiDiv = this.bottomDiv
                .append('div')
                .classed(Selectors.kpiPanel.class, true);

            this.kpiSvg = this.kpiDiv
                .append('svg')
                .classed(Selectors.kpiSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.kpiSvg);

            this.backgroundGroupKPI = this.kpiSvg
                .append('g')
                .classed(Selectors.backgroundBoxSvg.class, true);

            this.kpiGroup = this.kpiSvg
                .append('g')
                .classed(Selectors.kpiLines.class, true);

            this.taskDiv = this.bottomDiv
                .append('div')
                .classed(Selectors.taskPanel.class, true);

            this.taskSvg = this.taskDiv
                .append('svg')
                .classed(Selectors.taskSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.taskSvg);

            this.backgroundGroupTask = this.taskSvg
                .append('g')
                .classed(Selectors.backgroundBoxSvg.class, true);

            this.lineGroup = this.taskSvg
                .append('g')
                .classed(Selectors.taskLines.class, true);

            this.toggleTaskGroup = this.taskSvg
                .append('g')
                .classed(Selectors.toggleTaskGroup.class, true);

            this.barDiv = this.bottomDiv
                .append('div')
                .classed(Selectors.barPanel.class, true);

            this.ganttSvg = this.barDiv
                .append('svg')
                .classed(Selectors.barSvg.class, true);

            this.backgroundGroupBar = this.ganttSvg
                .append('g')
                .classed(Selectors.backgroundBoxSvg.class, true);

            this.gridGroup = this.ganttSvg
                .append('g')
                .classed(Selectors.gridGroup.class, true);

            this.chartGroup = this.ganttSvg
                .append('g')
                .classed(Selectors.chart.class, true);

            this.taskGroup = this.chartGroup
                .append('g')
                .classed(Selectors.tasks.class, true);

            this.bottommilestoneDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.bottomMilestonePanel.class, true);

            this.bottommilestoneSvg = this.bottommilestoneDiv
                .append('svg')
                .classed(Selectors.bottomMilestoneSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.bottommilestoneSvg);

            this.todayGroup = this.bottommilestoneSvg
                .append('g')
                .classed(Selectors.todayGroup.class, true);

            this.bottommilestoneGroup = this.bottommilestoneSvg
                .append('g')
                .classed(Selectors.bottomMilestoneGroup.class, true);

            this.bottomTaskDiv = this.ganttDiv
                .append('div')
                .classed(Selectors.bottomTaskDiv.class, true);

            this.bottomTaskSvg = this.bottomTaskDiv
                .append('svg')
                .classed(Selectors.bottomTaskSvg.class, true);

            this.clearCatcher = appendClearCatcher(this.bottomTaskSvg);
        }

        /**
         * Clear the viewport area
         */
        private clearViewport(): void {
            this.body.selectAll(Selectors.legendItems.selector).remove();
            this.body.selectAll(Selectors.legendTitle.selector).remove();
            this.axisGroup.selectAll(Selectors.axisTick.selector).remove();
            this.axisGroup.selectAll(Selectors.domain.selector).remove();
            this.gridGroup.selectAll('*').remove();
            this.bottommilestoneGroup.selectAll('*').remove();
            this.lineGroup.selectAll('*').remove();
            this.kpiTitleGroup.selectAll('*').remove();
            this.kpiGroup.selectAll('*').remove();
            this.chartGroup.selectAll(Selectors.chartLine.selector).remove();
            this.chartGroup.selectAll(Selectors.taskGroup.selector).remove();
            this.chartGroup.selectAll(Selectors.singlePhase.selector).remove();
        }

        /**
         * Update div container size to the whole viewport area
         * @param viewport The vieport to change it size
         */
        private updateChartSize(): void {
            this.viewport.width = Math.ceil(this.viewport.width);
            this.viewport.height = Math.ceil(this.viewport.height);

            this.ganttDiv.style({
                height: PixelConverter.toString(this.viewport.height),
                width: PixelConverter.toString(this.viewport.width)
            });

            this.legendDiv.style({
                left: PixelConverter.toString(this.viewport.width - Gantt.legendWidth)
            });

            this.bottomDiv.style({
                width: PixelConverter.toString(this.viewport.width),
                top: PixelConverter.toString(Gantt.axisHeight)
            });

            this.taskDiv.style({
                width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
            });

            this.kpiDiv.style({
                width: PixelConverter.toString(Gantt.kpiLabelWidth),
                left: PixelConverter.toString(Gantt.taskLabelWidth + 20)
            });

            this.kpiTitleDiv.style({
                width: PixelConverter.toString(Gantt.kpiLabelWidth),
                height: PixelConverter.toString(23),
                top: PixelConverter.toString(20),
                left: PixelConverter.toString(Gantt.taskLabelWidth + 20)
            });

            this.barDiv.style({
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20)
            });

            this.timelineDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.scrollHeight - Gantt.kpiLabelWidth),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20)
            });

            this.imageDiv.style({
                height: PixelConverter.toString(21),
                width: PixelConverter.toString(15),
                left: PixelConverter.toString(Gantt.taskLabelWidth + 5)
            });

            this.kpiImageDiv.style({
                height: PixelConverter.toString(21),
                width: PixelConverter.toString(15),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 5)
            });

            this.drillAllDiv.style({
                height: PixelConverter.toString(Gantt.axisHeight),
                width: PixelConverter.toString(Gantt.taskLabelWidth + 20),
                top: PixelConverter.toString(0)
            });

            this.bottommilestoneDiv.style({
                height: PixelConverter.toString(Gantt.bottomMilestoneHeight + Gantt.scrollHeight),
                width: PixelConverter.toString(this.viewport.width - Gantt.taskLabelWidth - Gantt.kpiLabelWidth - 20),
                left: PixelConverter.toString(Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 20)
            });

            let thisObj: this;
            thisObj = this;
            this.bottommilestoneDiv.on('scroll', function (): void {
                let bottomMilestoneScrollPosition: number = 0;
                // tslint:disable-next-line:no-any
                let bottomMilestonePanel: any;
                bottomMilestonePanel = document.getElementsByClassName('gantt_bottomMilestonePanel');
                Gantt.isScrolled = true;
                if (bottomMilestonePanel) {
                    bottomMilestoneScrollPosition = bottomMilestonePanel[0].scrollLeft;
                    thisObj.setBottomScrollPosition(bottomMilestoneScrollPosition);
                }
            });

            this.bottomTaskDiv.style({
                height: PixelConverter.toString(30),
                width: PixelConverter.toString(700),
                left: PixelConverter.toString(0),
                bottom: PixelConverter.toString(0),
                position: 'absolute',
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            }).on('scroll', function (): void {
                let bottomTaskScrollPosition: number = 0;
                // tslint:disable-next-line:no-any
                let bottomTaskDiv: any;
                bottomTaskDiv = document.getElementsByClassName('gantt_bottomTaskDiv');
                Gantt.isScrolled = true;
                if (bottomTaskDiv) {
                    bottomTaskScrollPosition = bottomTaskDiv[0].scrollLeft;
                    thisObj.setBottomTaskScrollPosition(bottomTaskScrollPosition);
                }
            });

            this.bottomTaskSvg.style({
                height: PixelConverter.toString(Gantt.scrollHeight + 10),
                width: PixelConverter.toString(700),
                left: PixelConverter.toString(0),
                bottom: PixelConverter.toString(0),
                position: 'absolute'
            });
        }

        /**
         * Check if dataView has a given role
         * @param column The dataView headers
         * @param name The role to find
         */
        private static hasRole(column: DataViewMetadataColumn, name: string): boolean {
            // tslint:disable-next-line:no-any
            let roles: any;
            roles = column.roles;

            return roles && roles[name];
        }

        /**
         * Determines whether the actual date is forecast date or a past date
         * @param actualDate date which is actual date
         */
        private static isDateForecast(actualDate: Date): boolean {
            let todayDate: Date;
            todayDate = new Date();

            return (todayDate < actualDate ? true : false);
        }

        /**
         * Get the tooltip info (data display names & formated values)
         * @param task All task attributes.
         * @param formatters Formatting options for gantt attributes.
         */
        private static getTooltipInfo(
            phase: Task, formatters: GanttChartFormatters,
            dataView: DataView, taskIndex: number, timeInterval: string = 'Days'): VisualTooltipDataItem[] {
            let tooltipDataArray: VisualTooltipDataItem[] = [];
            let formattedDate: string = '';
            let prefixStartText: string;
            let prefixEndText: string;
            let prefixDurationText: string;
            let tooltipIndex: string[];
            let oColumns: DataViewMetadataColumn[];
            let categorical: DataViewCategorical;
            let displayName: string;
            // tslint:disable-next-line:no-any
            let oMap: any;
            prefixStartText = 'Actual';
            prefixEndText = 'Actual';
            prefixDurationText = 'Forecast';
            tooltipIndex = [];
            categorical = dataView.categorical;
            oColumns = dataView.metadata.columns;
            oMap = {};
            let iColumnLength: number;
            iColumnLength = oColumns.length;
            for (let iColumnCount: number = 0; iColumnCount < iColumnLength; iColumnCount++) {
                if (oColumns[iColumnCount].roles[GanttRoles.tooltip]) {
                    displayName = oColumns[iColumnCount].displayName;
                    if (!oMap[displayName]) {
                        tooltipIndex.push(displayName);
                        oMap[displayName] = 1;
                    }
                }
            }
            tooltipDataArray = [];
            let tooltipIndexLength: number;
            tooltipIndexLength = tooltipIndex.length;
            for (let iTooltipIndexCount: number = 0; iTooltipIndexCount < tooltipIndexLength; iTooltipIndexCount++) {
                let iCatLength: number;
                iCatLength = categorical.categories.length;
                for (let iCatCount: number = 0; iCatCount < iCatLength; iCatCount++) {
                    if (categorical.categories[iCatCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                        if (categorical.categories[iCatCount].values[taskIndex]
                            && categorical.categories[iCatCount].values[taskIndex] !== null
                            && oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                            let iValueFormatter: IValueFormatter;
                            if (categorical.categories[iCatCount].source.format) {
                                iValueFormatter = ValueFormatter.create({ format: categorical.categories[iCatCount].source.format });
                                tooltipDataArray.push({
                                    displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                    value: iValueFormatter.format(categorical.categories[iCatCount].values[taskIndex])
                                });
                            } else {
                                tooltipDataArray.push({
                                    displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                    value: categorical.categories[iCatCount].values[taskIndex].toString()
                                });
                            }
                            oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                        }
                    }
                }
                let iValLength: number;
                iValLength = categorical.values.length;
                for (let iValCount: number = 0; iValCount < iValLength; iValCount++) {
                    if (categorical.values[iValCount].source.displayName === tooltipIndex[iTooltipIndexCount]) {
                        if (categorical.values[iValCount].values[taskIndex] &&
                            categorical.values[iValCount].values[taskIndex] !== null &&
                            oMap[tooltipIndex[iTooltipIndexCount]] === 1) {
                            let iValueFormatter: IValueFormatter;

                            if (categorical.values[iValCount].source.format) {
                                iValueFormatter = ValueFormatter.create({ format: categorical.values[iValCount].source.format });
                                tooltipDataArray.push({
                                    displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                    value: iValueFormatter.format(categorical.values[iValCount].values[taskIndex])
                                });
                            } else {
                                tooltipDataArray.push({
                                    displayName: tooltipIndex[iTooltipIndexCount].toString(),
                                    value: <string>categorical.values[iValCount].values[taskIndex].toString()
                                });
                            }
                            oMap[tooltipIndex[iTooltipIndexCount]] = 0;
                        }
                    }
                }
            }

            if (phase.start != null) {

                formattedDate = (zeroLiteral + (phase.start.getMonth() + 1)).slice(-2)
                    + slashLiteral + (zeroLiteral + phase.start.getDate()).slice(-2) +
                    slashLiteral + phase.start.getFullYear() + spaceLiteral +
                    (zeroLiteral + phase.start.getHours()).slice(-2) + colonLiteral
                    + (zeroLiteral + phase.start.getMinutes()).slice(-2);
                tooltipDataArray.push({ displayName: 'Start', value: formattedDate });
                formattedDate = (zeroLiteral + (phase.end.getMonth() + 1)).slice(-2)
                    + slashLiteral + (zeroLiteral + phase.end.getDate()).slice(-2)
                    + slashLiteral + phase.end.getFullYear() + spaceLiteral
                    + (zeroLiteral + phase.end.getHours()).slice(-2) + colonLiteral
                    + (zeroLiteral + phase.end.getMinutes()).slice(-2);
                tooltipDataArray.push({ displayName: 'End', value: formattedDate });
            } else if (phase.start === null) {
                tooltipDataArray.push({ displayName: 'Start', value: formatters.startDataFormatter.format(phase.numStart) });
                tooltipDataArray.push({ displayName: 'End', value: formatters.endDataFormatter.format(phase.numEnd) });
            }

            return tooltipDataArray;
        }

        /**
         * Check if task has data for task
         * @param dataView
         */
        private static isChartHasTask(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn;
                column = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.category)) {
                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * Check if task has data for data labels
         * @param dataView
         */
        private static isChartHasDataLabels(dataView: DataView): boolean {
            if (dataView.metadata &&
                dataView.metadata.columns) {
                let column: DataViewMetadataColumn;
                column = null;
                for (column of dataView.metadata.columns) {
                    if (Gantt.hasRole(column, GanttRoles.resource)) {
                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * Returns the chart formatters
         * @param dataView The data Model
         */
        private static getFormatters(dataView: DataView): GanttChartFormatters {
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns) {
                return null;
            }

            let startDataFormat: string = 'd';
            let endDataFormat: string = 'd';

            if (dataView.categorical.values) {
                let dvValues: DataViewValueColumn;
                dvValues = null;
                for (dvValues of dataView.categorical.values) {
                    if (Gantt.hasRole(dvValues.source, GanttRoles.startDate)) {
                        startDataFormat = dvValues.source.format;
                    }
                    if (Gantt.hasRole(dvValues.source, GanttRoles.endDate)) {
                        endDataFormat = dvValues.source.format;
                    }
                }
            }

            return <GanttChartFormatters>{
                startDataFormatter: ValueFormatter.create({ format: startDataFormat }),
                endDataFormatter: ValueFormatter.create({ format: endDataFormat }),
                durationFormatter: ValueFormatter.create({ format: numberFormat }),
                completionFormatter: ValueFormatter.create({ format: percentFormat, value: 1, allowFormatBeautification: true })
            };
        }

        private static getCategoricalTaskProperty<T>(
            columnSource: DataViewMetadataColumn[],
            // tslint:disable-next-line:no-any
            child: any, propertyName: string, currentCounter: number, sortOrder: number = 0): T {
            if (!child ||
                !columnSource ||
                !(columnSource.length > 0) ||
                !columnSource[0].roles) {
                return null;
            }

            // tslint:disable-next-line:typedef
            let finalindex: number = child.indexOf(child.filter(x => x.source.roles[propertyName])[0]);
            if (-1 !== sortOrder) {
                // tslint:disable-next-line:typedef
                finalindex = child.indexOf(child.filter(x => x.source.roles[propertyName] && x.source.sortOrder === sortOrder)[0]);
            }
            if (finalindex === -1) {
                return null;
            }

            return child[finalindex].values[currentCounter];
        }

        /**
         * Create task objects dataView
         * @param dataView The data Model.
         * @param formatters task attributes represented format.
         * @param series An array that holds the color data of different task groups.
         */
        private static createTasks(dataView: DataView, host: IVisualHost,
                                   formatters: GanttChartFormatters, colors: IColorPalette, settings: IGanttSettings): Task[] {
            const metadataColumns: GanttColumns<DataViewMetadataColumn> = GanttColumns.getColumnSources(dataView);
            let columns: GanttColumns<GanttCategoricalColumns>;
            columns = GanttColumns.getCategoricalColumns(dataView);
            const columnSource: DataViewMetadataColumn[] = dataView.metadata.columns;
            // tslint:disable-next-line:no-any
            let categoriesdata: any;
            categoriesdata = dataView.categorical.categories;
            let valuesdata: DataViewValueColumn[];
            valuesdata = dataView.categorical.values;
            let kpiRoles: number[];
            kpiRoles = [];
            let categoryRoles: number[];
            categoryRoles = [];

            if (!categoriesdata || categoriesdata.length === 0) { return; }

            Gantt.categoriesTitle = [];
            let tasks: Task[] = [];
            let hashArr: Task[];

            // tslint:disable-next-line:no-any
            categoriesdata.map((child: any, index: number) => {
                if (child.source.roles[GanttRoles.kpiValueBag]) {
                    kpiRoles.push(index);
                } else if (child.source.roles[GanttRoles.category]) {
                    categoryRoles.push(index);
                    Gantt.categoriesTitle.push(categoriesdata[index].source.displayName);
                }
            });

            if (kpiRoles && kpiRoles.length === 0) {
                Gantt.isKpiPresent = false;
            } else {
                Gantt.isKpiPresent = true;
            }

            let largest: number = 0;
            let firstVisit: number = 1;
            let orderOfSorting: string = Gantt.sortOrder;
            Gantt.totalTasksNumber = 0;
            Gantt.maxTaskNameLength = 0;
            Gantt.earliestStartDate = new Date();
            Gantt.lastestEndDate = new Date();
            let regionindex: number;
            regionindex = -1;
            let subregionindex: number;
            subregionindex = -1;
            let projectindex: number;
            projectindex = -1;
            let trancheIndex: number;
            trancheIndex = -1;
            let phaseIndex: number;
            phaseIndex = -1;

            // tslint:disable-next-line:cyclomatic-complexity no-any
            categoriesdata[0].values.map((child: any, index: number) => {
                let startDate: Date = null;
                let endDate: Date = null;
                let datamin: number = null;
                let datamax: number = null;

                if ((Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1)
                    && typeof Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1)
                    === typeof this.earliestStartDate) ||
                    (Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)
                        && typeof Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)
                        === typeof this.earliestStartDate)) {
                    startDate = Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    endDate = Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1);

                    startDate = startDate ? startDate : new Date();
                    endDate = endDate ? endDate : new Date();
                    Gantt.isDateData = true;
                } else {
                    datamin = Gantt.getCategoricalTaskProperty<number>(columnSource, valuesdata, GanttRoles.startDate, index, -1);
                    datamax = Gantt.getCategoricalTaskProperty<number>(columnSource, valuesdata, GanttRoles.endDate, index, -1);
                    if (datamax == null || datamin > datamax) {
                        datamax = datamin;
                    }
                    if (datamin == null || datamin > datamax) {
                        datamin = datamax;
                    }
                    if (Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.startDate, index, -1)
                        || Gantt.getCategoricalTaskProperty<Date>(columnSource, valuesdata, GanttRoles.endDate, index, -1)) {
                        Gantt.isDateData = false;
                    }
                }
                let resource: string;
                resource = Gantt.getCategoricalTaskProperty<string>(columnSource, valuesdata, GanttRoles.resource, index, -1);
                let kpiValues: KPIValues[];
                kpiValues = [];
                let taskValues: string[];
                taskValues = [];
                let duration: number = 0;

                for (let kpiValueCounter: number = 0; kpiValueCounter < categoryRoles.length; kpiValueCounter++) {
                    let value: string = '';
                    value = <string>categoriesdata[categoryRoles[kpiValueCounter]].values[index];
                    if (value && value !== '0') {
                        value = value ? value : '';
                    } else if (parseInt(value, 10) === 0) {
                        value = '0';
                    } else {
                        value = value ? value : '';
                    }

                    if (kpiValueCounter === 0) {
                        Gantt.regionValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else if (kpiValueCounter === 1) {
                        Gantt.metroValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else if (kpiValueCounter === 2) {
                        Gantt.projectValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    } else {
                        Gantt.trancheValueFormatter = ValueFormatter.create({
                            format: categoriesdata[categoryRoles[kpiValueCounter]].source.format
                        });
                    }

                    taskValues.push(value);
                    value = (value === '' ? 'N/A' : value);

                    if (typeof (value) === 'object' &&
                        categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length > Gantt.maxTaskNameLength) {
                        Gantt.maxTaskNameLength = categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length < 15 ?
                            categoriesdata[categoryRoles[kpiValueCounter]].values[index].toString().length : 14;
                    }

                    if (value.length > Gantt.maxTaskNameLength) {
                        Gantt.maxTaskNameLength = value.length < 15 ? value.length : 14;
                    }
                }

                let kpiRolesLength: number;
                kpiRolesLength = kpiRoles.length;
                for (let kpiValueCounter: number = 0; kpiValueCounter < kpiRolesLength; kpiValueCounter++) {
                    let name: string;
                    name = <string>categoriesdata[kpiRoles[kpiValueCounter]].source.displayName;
                    let value: string;
                    value = <string>categoriesdata[kpiRoles[kpiValueCounter]].values[index];

                    kpiValues.push({
                        name: name,
                        value: value
                    });
                }

                if (startDate < Gantt.earliestStartDate && startDate !== null) {
                    Gantt.earliestStartDate = startDate;
                }
                if (endDate > Gantt.lastestEndDate && endDate !== null) {
                    Gantt.lastestEndDate = endDate;
                }

                if (datamin !== null && datamin < Gantt.dataMIN) {
                    Gantt.dataMIN = datamin;
                }
                if (datamax !== null && datamax > Gantt.dataMAX) {
                    Gantt.dataMAX = datamax;
                }

                if (startDate != null) {
                    let timeDiff: number;
                    timeDiff = endDate.getTime() - startDate.getTime();
                    duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (0 > duration) {
                        duration = 0;
                    } else if (0 === duration) {
                        duration = 1;
                    }

                } else if (datamin != null) {
                    let valuediffer: number;
                    valuediffer = datamax - datamin;
                    duration = valuediffer;
                }

                const defaultColor: Fill = {
                    solid: {
                        color: colors.getColor(index.toString()).value
                    }
                };

                if (settings.barColor.showall) {
                    tasks.push({
                        id: index,
                        name: taskValues,
                        start: startDate,
                        end: endDate,
                        numStart: datamin,
                        numEnd: datamax,
                        resource: resource,
                        color: this.getCategoricalObjectValue<Fill>(dataView.categorical.categories[0], index,
                                                                    'barColor', 'fillColor', defaultColor).solid.color,
                        KPIValues: kpiValues,
                        identity: null,
                        selected: false,
                        tooltipInfo: null,
                        selectionId: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId()
                    });
                } else {
                    tasks.push({
                        id: index,
                        name: taskValues,
                        start: startDate,
                        end: endDate,
                        numStart: datamin,
                        numEnd: datamax,
                        resource: resource,
                        color: settings.barColor.defaultColor,
                        KPIValues: kpiValues,
                        identity: null,
                        selected: false,
                        tooltipInfo: null,
                        selectionId: host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], index)
                            .createSelectionId()
                    });
                }
                Gantt.selectionIdHash[index] = false;
                tasks[index].tooltipInfo = Gantt.getTooltipInfo(tasks[index], formatters, dataView, index);
                largest = index;
            });

            let levelofSorting: number = Gantt.sortLevel;
            Gantt.numberOfCategories = categoryRoles.length;
            let iIterator: number = 0;

            while (iIterator < levelofSorting) {
                hashArr = [];
                const hyphenLiteral: string = '-';
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral + tasks[index].name[iIterator - 2] + hyphenLiteral
                        + tasks[index].name[iIterator - 1]] === undefined) {
                        hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral
                            + tasks[index].name[iIterator - 2] + hyphenLiteral + tasks[index].name[iIterator - 1]] = [];
                    }
                    hashArr[tasks[index].name[iIterator - 3] + hyphenLiteral + tasks[index].name[iIterator - 2] + hyphenLiteral
                        + tasks[index].name[iIterator - 1]].push(tasks[index]);
                }

                Object.keys(hashArr).forEach(function (i: string): void {
                    // tslint:disable-next-line:no-any
                    hashArr[i].sort(function (m: any, n: any): number {
                        if (m.name[iIterator] === '') {
                            return -1;
                        } else if (n.name[iIterator] === '') {
                            return 1;
                        } else {
                            if (m.name[iIterator] < n.name[iIterator]) { return -1; }
                            if (m.name[iIterator] > n.name[iIterator]) { return 1; }

                            return 0;
                        }
                    });
                });
                tasks = [];
                Object.keys(hashArr).forEach(function (i: string): void {
                    Object.keys(hashArr[i]).forEach(function (j: string): void {
                        tasks.push(hashArr[i][j]);
                    });
                });
                iIterator++;
            }

            while (levelofSorting < categoryRoles.length) {
                hashArr = [];
                const hyphenLiteral: string = '-';
                for (let index: number = 0; index <= largest; index++) {
                    if (hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral
                        + tasks[index].name[levelofSorting - 2] + hyphenLiteral + tasks[index].name[levelofSorting - 1]] === undefined) {
                        hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                            + hyphenLiteral + tasks[index].name[levelofSorting - 1]] = [];
                    }
                    hashArr[tasks[index].name[levelofSorting - 3] + hyphenLiteral + tasks[index].name[levelofSorting - 2]
                        + hyphenLiteral + tasks[index].name[levelofSorting - 1]].push(tasks[index]);
                }
                if (!firstVisit) {
                    orderOfSorting = 'asc';
                }

                Object.keys(hashArr).forEach(function (i: string): void {
                    // tslint:disable-next-line:no-any
                    hashArr[i].sort(function (m: any, n: any): number {
                        if (orderOfSorting === 'asc') {
                            if (m.name[levelofSorting] === '') {
                                return -1;
                            } else if (n.name[levelofSorting] === '') {
                                return 1;
                            } else {
                                if (m.name[levelofSorting] < n.name[levelofSorting]) { return -1; }
                                if (m.name[levelofSorting] > n.name[levelofSorting]) { return 1; }

                                return 0;
                            }
                        } else {
                            if (m.name[levelofSorting] === '') {
                                return 1;
                            } else if (n.name[levelofSorting] === '') {
                                return -1;
                            } else {
                                if (m.name[levelofSorting] > n.name[levelofSorting]) { return -1; }
                                if (m.name[levelofSorting] < n.name[levelofSorting]) { return 1; }

                                return 0;
                            }
                        }
                    });
                });
                if (firstVisit) { firstVisit = 0; }
                tasks = [];
                Object.keys(hashArr).forEach(function (i: string): void {
                    Object.keys(hashArr[i]).forEach(function (j: string): void {
                        tasks.push(hashArr[i][j]);
                    });
                });
                levelofSorting++;
            }
            selectionIds = [];
            for (let iCounter: number = 0; iCounter <= largest; iCounter++) {
                selectionIds.push(tasks[iCounter].selectionId);
            }

            return tasks;
        }

        private adjustResizing(tasks: Task[], taskLabelwidth: number, viewModel: GanttViewModel): void {
            let pressed: boolean;
            pressed = false;
            let moved: boolean;
            moved = false;
            let start: JQuery;
            start = undefined;
            let columnClass: string;
            let startX: number;
            let lastRectStartX: number;
            let startWidth: number;
            let xDiff: number;
            let calculateWidth: number;
            let calculatedLastRectX: number;
            let thisObj: this;
            thisObj = this;
            let columnNumber: number;
            columnNumber = 0;
            let categoriesLength: number;
            categoriesLength = tasks[0].name.length;
            const resizerClassLiteral: string = '.gantt_resizer';

            $(resizerClassLiteral).mousedown(function (e: JQueryMouseEventObject): void {
                Gantt.isResizeStarted = true;
                columnClass = this.getAttribute('columnId');
                start = $(dotLiteral + columnClass);
                pressed = true;
                startX = e.pageX;
                startWidth = this.x.animVal.value;
                lastRectStartX = parseFloat($(headerCellClassLiteral + (tasks[0].name.length - 1)).attr('x'));
            });

            let columnX: string[];
            columnX = [];
            let scrollerX: string[];
            scrollerX = [];
            let verticalLinesX1: string[];
            verticalLinesX1 = [];
            let horizontalLinesX1: string[];
            horizontalLinesX1 = [];
            let horizontalLinesX2: string[];
            horizontalLinesX2 = [];
            let kpiLeft: string;
            kpiLeft = d3.select('.gantt_kpiPanel').style('left');
            let barLeft: string;
            barLeft = d3.select('.gantt_barPanel').style('left');
            let scroller: number;
            for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10); iIterator < tasks[0].name.length; iIterator++) {
                columnX[iIterator] = d3.select(taskColumnClassLiteral + iIterator).attr('x');
                if (iIterator !== 0) {
                    scrollerX[iIterator] = d3.select(headerCellClassLiteral + iIterator).attr('x');
                }
            }
            let highestLabelLength: number = 0;
            $(document).mousemove(function (e: JQueryMouseEventObject): void {
                if (pressed) {
                    moved = true;
                    xDiff = (e.pageX - startX);
                    xDiff = xDiff < (-startWidth + 23) ? (-startWidth + 23) : xDiff;
                    calculateWidth = startWidth + xDiff;
                    calculatedLastRectX = lastRectStartX + xDiff;
                    columnNumber = parseInt(columnClass.substr(10, columnClass.length - 10), 10);

                    let columns: Selection<SVGAElement>;
                    columns = d3.selectAll(taskColumnClassLiteral + (columnNumber - 1));
                    let taskLabelsFontSize: number;
                    taskLabelsFontSize = viewModel.settings.taskLabels.fontSize;
                    let taskLabelsFontFamily: string;
                    taskLabelsFontFamily = viewModel.settings.taskLabels.fontFamily;
                    let reflectChange: boolean;
                    reflectChange = true;
                    let rightMovement: boolean;
                    rightMovement = true;
                    highestLabelLength = 0;
                    let lastRectX: number;
                    lastRectX = 0;
                    let allowLeftMove: boolean;
                    allowLeftMove = true;
                    let allowRightMove: boolean;
                    allowRightMove = true;
                    lastRectX = parseFloat(d3.select(headerCellClassLiteral + (categoriesLength - 1)).attr('x'));
                    let lastColumns: Selection<SVGAElement>;
                    lastColumns = d3.selectAll(taskColumnClassLiteral + (categoriesLength - 1));
                    columns.each(function (): void {

                        let prevColumnStart: number;
                        let currColumnStart: number;

                        if (columnNumber === 1) {
                            prevColumnStart = 15;
                        } else {
                            prevColumnStart = parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr('x'));
                        }
                        currColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr('x'));

                        let textProperties: TextProperties;
                        textProperties = {
                            text: '',
                            fontFamily: taskLabelsFontFamily,
                            fontSize: (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral
                        };
                        this.textContent = textMeasurementService
                            .getTailoredTextOrDefault(textProperties, (currColumnStart - prevColumnStart));
                    });

                    scroller = parseInt(columnNumber + nullStringLiteral, 10);
                    let scrollAdd: number;
                    scroller++;
                    let previousColumnStart: number;
                    let currentColumnStart: number;

                    if (columnNumber === 1) {
                        previousColumnStart = 15;
                    } else {
                        previousColumnStart = parseFloat(d3.select(headerCellClassLiteral + (columnNumber - 1)).attr('x'));
                    }
                    currentColumnStart = parseFloat(d3.select(headerCellClassLiteral + columnNumber).attr('x'));
                    if (reflectChange) {
                        if (calculateWidth >= previousColumnStart) {
                            d3.select(dotLiteral + columnClass).attr('x', calculateWidth);
                            for (let iIterator: number = scroller; iIterator < tasks[0].name.length; iIterator++) {
                                scrollAdd = parseFloat(scrollerX[iIterator]) + parseFloat(xDiff.toString());
                                d3.select(headerCellClassLiteral + iIterator).attr('x', scrollAdd);
                            }

                            let sum: number;
                            for (let iIterator: number = parseInt(columnNumber + nullStringLiteral, 10);
                                iIterator < tasks[0].name.length; iIterator++) {
                                sum = parseFloat(columnX[iIterator]) + parseFloat(xDiff.toString());
                                d3.selectAll(taskColumnClassLiteral + iIterator).attr('x', sum);
                                d3.selectAll(categoryIdLiteral + iIterator).attr('x', sum);
                            }
                        }
                    }
                }
            });

            $(document).mouseup(function (): void {
                if (pressed) {
                    pressed = false;
                    thisObj.persistResizeData(tasks[0].name.length, viewModel);
                }
                if (moved && columnClass) {
                    columnClass = undefined;
                    moved = false;
                }
            });

            let taskSvgWidth: number;
            taskSvgWidth = $(dotLiteral + Selectors.taskPanel.class).width();
            Gantt.columnWidth = taskSvgWidth / tasks[0].name.length;
            let toggleTasks: Selection<SVGAElement>;
            toggleTasks = d3.selectAll(dotLiteral + Selectors.toggleTask.class);
        }

        public persistSortState(): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            properties[sortOrderLiteral] = Gantt.sortOrder;
            properties[sortLevelLiteral] = Gantt.sortLevel;
            properties[prevSortedColumnLiteral] = Gantt.prevSortedColumn;

            let persistSettings: VisualObjectInstancesToPersist;
            persistSettings = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: 'sortAttributes',
                        selector: null,
                        properties: properties
                    }]
            };
            this.host.persistProperties(persistSettings);
        }

        public persistResizeData(categoryLength: number, viewModel: GanttViewModel): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = '';
            let iColumnWidth: number = 0;
            let objects: DataViewObjects;
            objects = this.viewModel.dataView.metadata.objects;
            let categoryLengthPrev: number;
            const hyphenX1Colon: string = '-x1:';
            const hyphenX2Colon: string = '-x2:';
            const hyphenX1Colon0SemiColon: string = '-x1:0;';
            const hyphenX2Colon0SemiColon: string = '-x2:0;';
            const hyphenX2Colon100SemiColon: string = '-x2:100;';
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            barPanelLeft = parseFloat(d3.select('.gantt_barPanel').style('left'));
            kpiPanelWidth = parseFloat(d3.select('.gantt_kpiPanel').style('left'));

            categoryLengthPrev = getValue<number>(objects, 'categoryColumnsWidth', 'categoryLength', 0);
            if (categoryLengthPrev && categoryLengthPrev !== 0 && categoryLengthPrev === categoryLength) {
                for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {
                    lastRectX = parseFloat($(headerCellClassLiteral + iIterator).attr('x'));
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + d3.select(taskColumnClassLiteral + iIterator).attr('x') + semiColonLiteral;

                    if (iIterator === 0) {
                        if (categoryLength === 1) {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($('.gantt_kpiPanel').css('left')) + semiColonLiteral;
                        } else {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral
                                + parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr('x')) + semiColonLiteral;
                        }
                    } else if (iIterator === categoryLength - 1) {
                        if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 10) || lastRectX > barPanelLeft - 10) {
                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral + 100 + semiColonLiteral;
                        } else {
                            if (kpiPanelWidth > 0) {
                                iColumnWidth = (parseFloat(d3.select('.gantt_kpiPanel').style('left'))
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr('x')));
                            } else {
                                iColumnWidth = (this.viewport.width * this.viewModel.settings.displayRatio.ratio / 100) + 20
                                    - parseFloat($(headerCellClassLiteral + (iIterator)).attr('x'));
                            }

                            Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                        }
                    } else {
                        iColumnWidth = parseFloat($(headerCellClassLiteral + (iIterator + 1)).attr('x'))
                            - parseFloat($(headerCellClassLiteral + (iIterator)).attr('x'));
                        Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral + iColumnWidth + semiColonLiteral;
                    }
                }
                properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName] = categoryLength.toString();
            }
            properties[ganttProperties.categoryColumnsWidth.width.propertyName] = JSON.stringify(Gantt.categoryColumnsWidth);

            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        selector: null,
                        properties: properties
                    }]
            };
            this.host.persistProperties(width);
        }

        public resetResizeData(categoryLength: number, viewModel: GanttViewModel): void {
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            Gantt.categoryColumnsWidth = '';
            const taskSvgWidth: number = parseInt(this.taskSvg.attr('width'), 10);
            const singleColumnWidth: number = taskSvgWidth / categoryLength;
            const literalFifteen: string = '15';
            const literalFive: string = '5';
            let lastRectX: number;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            const hyphenX1Colon: string = '-x1:';
            const hyphenX2Colon: string = '-x2:';
            const hyphenX1Colon0SemiColon: string = '-x1:0;';
            const hyphenX2Colon0SemiColon: string = '-x2:0;';
            const hyphenX2Colon100SemiColon: string = '-x2:100;';
            barPanelLeft = parseFloat(d3.select('.gantt_barPanel').style('left'));
            kpiPanelWidth = parseFloat(d3.select('.gantt_kpiPanel').style('left'));
            lastRectX = (categoryLength - 1) * singleColumnWidth;
            for (let iIterator: number = 0; iIterator < categoryLength; iIterator++) {

                if (iIterator === 0) {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + literalFifteen + semiColonLiteral;
                } else {
                    Gantt.categoryColumnsWidth += taskColumnLiteral + iIterator + colonLiteral
                        + (iIterator * singleColumnWidth) + semiColonLiteral;
                }
                Gantt.categoryColumnsWidth += columnLiteral + iIterator + colonLiteral + singleColumnWidth + semiColonLiteral;
            }
            properties[ganttProperties.categoryColumnsWidth.categoryLength.propertyName] = categoryLength;

            properties[ganttProperties.categoryColumnsWidth.width.propertyName] = JSON.stringify(Gantt.categoryColumnsWidth);

            let totalCategories: number;
            totalCategories = this.viewModel.tasksNew[0].name.length;
            let width: VisualObjectInstancesToPersist;
            width = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: ganttProperties.categoryColumnsWidth.width.objectName,
                        selector: null,
                        properties: properties
                    }]
            };
            this.host.persistProperties(width);
        }

        private static updateCount: number = 0;
        private static isResizeStarted: boolean = false;

        /**
         * Convert the dataView to view model
         * @param dataView The data Model
         */
        public static converter(dataView: DataView, host: IVisualHost, colors: IColorPalette): GanttViewModel {
            if (!dataView
                || !dataView.categorical
                || !Gantt.isChartHasTask(dataView)) {
                return null;
            }

            const settings: IGanttSettings = GanttSettings.parse(dataView.metadata.objects, colors);
            let metadata: DataViewMetadata;
            metadata = dataView.metadata;
            let kpiData: KPIConfig[];
            kpiData = [];
            const metadataColumnsLength: number = metadata.columns.length;
            for (let iIterator: number = 0; iIterator < metadataColumnsLength; iIterator++) {
                if (metadata.columns[iIterator].roles[GanttRoles.kpiValueBag]) {
                    let currentColumn: DataViewMetadataColumn;
                    currentColumn = metadata.columns[iIterator];
                    kpiData.push({
                        name: currentColumn.displayName,
                        type: getValue<string>(currentColumn.objects, 'kpiColumnType', 'type', 'Value'),
                        identity: { metadata: currentColumn.queryName }
                    });
                }
            }

            Gantt.formatters = this.getFormatters(dataView);
            const tasksNew: Task[] = Gantt.createTasks(dataView, host, Gantt.formatters, colors, settings);

            return {
                dataView: dataView,
                settings: settings,
                tasksNew: tasksNew,
                kpiData: kpiData
            };
        }

        private static isValidDate(date: Date): boolean {
            if (Object.prototype.toString.call(date) !== '[object Date]') {
                return false;
            }

            return !isNaN(date.getTime());
        }

        private static convertToDecimal(value: number): number {
            if (!((value >= Gantt.complectionMin) && (value <= Gantt.complectionMax))) {
                return (value / Gantt.complectionTotal);
            }

            return value;
        }

        private static getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number,
                                                    objectName: string, propertyName: string, defaultValue: T): T {
            const categoryObjects: DataViewObjects[] = category.objects;

            if (categoryObjects) {
                const categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    const object: DataViewPropertyValue = categoryObject[objectName];
                    if (object) {
                        const property: T = object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }

            return defaultValue;
        }
        /**
         * Called on data change or resizing
         * @param options The visual option that contains the dataview and the viewport
         */

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            Gantt.kpiLabelWidth = 75;
            Gantt.globalOptions = options;
            if (!options.dataViews || !options.dataViews[0]) {
                this.clearViewport();

                return;
            }
            let hasStart: boolean = false;
            let hasEnd: boolean = false;
            if (options.dataViews[0].categorical.values) {
                let iValuesLength: number;
                iValuesLength = options.dataViews[0].categorical.values.length;
                for (let iCounter: number = 0; iCounter < iValuesLength; iCounter++) {
                    if (options.dataViews[0].categorical.values[iCounter].source.roles[startDateLiteral]) {
                        hasStart = true;
                    }
                    if (options.dataViews[0].categorical.values[iCounter].source.roles[endDateLiteral]) {
                        hasEnd = true;
                    }
                }
            }

            let objects: DataViewObjects = null;
            objects = options.dataViews[0].metadata.objects;
            let getJSONString1: string;
            getJSONString1 = getValue<string>(objects, 'sortAttributes', 'sortOrder', 'asc');
            let getJSONString2: number;
            getJSONString2 = getValue<number>(objects, 'sortAttributes', 'sortLevel', 0);
            let getJSONString3: number;
            getJSONString3 = getValue<number>(objects, 'sortAttributes', 'prevSortedColumn', -1);
            Gantt.sortOrder = getJSONString1;
            Gantt.sortLevel = getJSONString2;
            Gantt.prevSortedColumn = getJSONString2;
            const thisObj: this = this;

            this.viewModel = Gantt.converter(options.dataViews[0], this.host, this.colors);

            Gantt.viewModelNew = this.viewModel;
            if (!this.viewModel || !this.viewModel.tasksNew) {
                this.clearViewport();
                this.ganttDiv.classed('gantt_hidden', true);
                this.errorDiv.classed('gantt_hidden', false);
                let errorStatement: string;
                errorStatement = 'Please add data to the Category field to load the visual';
                this.errorText.text(errorStatement);

                return;
            } else if (this.viewModel.tasksNew.length === 0) {
                this.clearViewport();
                this.ganttDiv.classed('gantt_hidden', true);
                this.errorDiv.classed('gantt_hidden', false);
                let errorStatement: string;
                errorStatement = 'There is no data to display';
                this.errorText.text(errorStatement);

                return;
            } else if (!hasStart && !hasEnd) {
                this.clearViewport();
                this.ganttDiv.classed('gantt_hidden', true);
                this.errorDiv.classed('gantt_hidden', false);
                let errorStatement: string;
                errorStatement = 'Please add data to the Start and End field to load the visual';
                this.errorText.text(errorStatement);

                return;
            } else if (!hasStart) {
                this.clearViewport();
                this.ganttDiv.classed('gantt_hidden', true);
                this.errorDiv.classed('gantt_hidden', false);
                let errorStatement: string;
                errorStatement = 'Please add data to the Start field to load the visual';
                this.errorText.text(errorStatement);

                return;
            } else if (!hasEnd) {
                this.clearViewport();
                this.ganttDiv.classed('gantt_hidden', true);
                this.errorDiv.classed('gantt_hidden', false);
                let errorStatement: string;
                errorStatement = 'Please add data to the End field to load the visual';
                this.errorText.text(errorStatement);

                return;
            } else {
                this.errorDiv.classed('gantt_hidden', true);
                this.ganttDiv.classed('gantt_hidden', false);
            }

            Gantt.isPhaseHighlighted = false;
            d3.selectAll('.tooltip-content-container').style('visibility', 'hidden');
            let flagProject: boolean;
            flagProject = false;
            let flagTranche: boolean;
            flagTranche = false;
            let flagSubregion: boolean;
            flagSubregion = false;
            Gantt.milestoneNames = Gantt.milestoneNames.sort();
            Gantt.currentTasksNumber = Gantt.totalTasksNumber = this.viewModel.tasksNew.length;
            $('#gantt_DrillAll').show();
            let width: number = 0;
            let widthFromPercent: number = 0;
            let normalizer: number;
            normalizer = (this.viewModel.settings.taskLabels.fontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize;
            this.body.append('text')
                .text('M')
                .classed('singleCharacter', true)
                .style({
                    'font-size': normalizer + pxLiteral,
                    'font-family': 'Segoe UI'
                });

            let taskLabelsFontSize: number;
            taskLabelsFontSize = this.viewModel.settings.taskLabels.fontSize;
            let taskLabelsFontFamily: string;
            taskLabelsFontFamily = this.viewModel.settings.taskLabels.fontFamily;
            let iTextWidth: number = 0;
            let textProperties: TextProperties;
            textProperties = {
                text: 'W',
                fontFamily: taskLabelsFontFamily,
                fontSize: (taskLabelsFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral
            };
            let headerFontSize: number;
            headerFontSize = this.viewModel.settings.columnHeader.fontSize;
            let headerFontFamily: string;
            headerFontFamily = this.viewModel.settings.columnHeader.fontFamily;
            let iHeaderWidth: number;
            iHeaderWidth = 0;
            let headerProperties: TextProperties;
            headerProperties = {
                text: 'W',
                fontFamily: headerFontFamily,
                fontSize: (headerFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral
            };

            iTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iHeaderWidth = textMeasurementService.measureSvgTextWidth(headerProperties);
            Gantt.iHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.iKPIHeaderSingleCharWidth = iHeaderWidth * 0.8;
            Gantt.singleCharacterWidth = iTextWidth * 0.74;
            if (this.viewModel.settings.taskLabels.width <= 1) {
                Gantt.iHeaderSingleCharWidth = iHeaderWidth * 1.5;
            }
            if (this.viewModel.settings.taskLabels.width <= 5) {
                Gantt.singleCharacterWidth = iTextWidth * 0.8;
            }
            d3.selectAll('.singleCharacter').remove();
            if (this.viewModel.settings.taskLabels.width < 0) {
                this.viewModel.settings.taskLabels.width = 0;
            } else if (this.viewModel.settings.taskLabels.width > Gantt.maxTaskNameLength) {
                this.viewModel.settings.taskLabels.width = Gantt.maxTaskNameLength;
            }

            if (isNaN(this.viewModel.settings.taskGridlines.interval) ||
                this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) < 0) {
                this.viewModel.settings.taskGridlines.interval = 0;
            } else if (isNaN(this.viewModel.settings.taskGridlines.interval) ||
                this.viewModel.settings.taskGridlines.interval.toString().length === 0 ||
                parseInt(this.viewModel.settings.taskGridlines.interval.toString(), 10) > 100) {
                this.viewModel.settings.taskGridlines.interval = 100;
            }

            if (this.viewModel.tasksNew[0].name.length === 1) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width * this.viewModel.tasksNew[0].name.length + 15;
            } else if (this.viewModel.tasksNew[0].name.length === 2) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width * this.viewModel.tasksNew[0].name.length + 40;
            } else if (this.viewModel.tasksNew[0].name.length === 3) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width * this.viewModel.tasksNew[0].name.length + 65;
            } else if (this.viewModel.tasksNew[0].name.length === 4) {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width * this.viewModel.tasksNew[0].name.length + 90;
            } else {
                width = Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width
                    * this.viewModel.tasksNew[0].name.length + 114;
            }

            Gantt.taskLabelWidthOriginal = width;
            this.viewport = _.clone(options.viewport);
            let viewportWidth: number;
            viewportWidth = this.viewport.width;
            Gantt.prevDisplayRatio = Gantt.currentDisplayRatio;
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;

            Gantt.kpiLabelWidthOriginal = Gantt.kpiLabelWidth * this.viewModel.kpiData.length;
            Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
            Gantt.taskLabelWidthOriginal = (this.viewport.width - Gantt.kpiLabelWidthOriginal) * Gantt.currentDisplayRatio / 100;

            Gantt.minDisplayRatio = Math.ceil((100 * ((0.01 * this.viewport.width) + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            if (Gantt.currentDisplayRatio < Gantt.minDisplayRatio && Gantt.minDisplayRatio <= 80) {
                this.viewModel.settings.displayRatio.ratio = Gantt.minDisplayRatio;
            } else if (Gantt.currentDisplayRatio > 80 || Gantt.minDisplayRatio > 80) {
                this.viewModel.settings.displayRatio.ratio = 80;
            }
            Gantt.currentDisplayRatio = this.viewModel.settings.displayRatio.ratio;
            let defaultGanttRatio: number;
            defaultGanttRatio = Math.ceil((100 * (Gantt.taskLabelWidthOriginal + Gantt.kpiLabelWidthOriginal)) / this.viewport.width);
            if (Gantt.minDisplayRatio > Gantt.currentDisplayRatio) {
                Gantt.minDisplayRatio = 80;
            }
            Gantt.taskLabelWidthOriginal = (Gantt.currentDisplayRatio - Gantt.minDisplayRatio) * this.viewport.width / 100;

            let toggleIconId: Selection<SVGAElement>;
            toggleIconId = d3.select('#gantt_ToggleIcon');
            if (options.type === 2) {
                if (this.viewModel.settings.taskLabels.isExpanded) {
                    d3.select('.gantt_task-lines').attr('visibility', 'visible');
                    d3.select('.gantt_toggle-task-group').attr('visibility', 'visible');
                    $('.gantt_bottomTaskDiv').show();
                    toggleIconId.attr('href', Gantt.collapseImage);
                    toggleIconId.classed('collapse', true);
                    toggleIconId.classed('expand', false);
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    d3.select('.gantt_task-lines').attr('visibility', 'hidden');
                    d3.select('.gantt_toggle-task-group').attr('visibility', 'hidden');
                    $('.gantt_bottomTaskDiv').hide();
                    toggleIconId.attr('href', Gantt.expandImage);
                    toggleIconId.classed('collapse', false);
                    toggleIconId.classed('expand', true);
                }
            }

            if (toggleIconId.classed('collapse')) {
                Gantt.taskLabelWidth = width;
            } else {
                Gantt.taskLabelWidth = 20;
            }

            if (Gantt.kpiLabelWidth === 0) {
                $('.gantt_kpiImagePanel').hide();
            } else {
                if (d3.select('#gantt_KPIToggle').classed('expand')) {
                    Gantt.kpiLabelWidth = 20;
                }
                $('.gantt_kpiImagePanel').show();
            }

            Gantt.visualCoordinates = {
                width: this.viewport.width,
                height: this.viewport.height
            };

            if (this.viewModel.settings.taskLabels.show) {
                if (d3.select('#gantt_ToggleIcon').classed('collapse')) {
                    Gantt.taskLabelWidth = Gantt.taskLabelWidthOriginal;
                } else {
                    Gantt.taskLabelWidth = 0;
                }
                d3.selectAll('.gantt_timelinePanel, .gantt_barPanel').style({ 'border-left-width': '1px' });
            } else {
                Gantt.taskLabelWidth = -20;
            }

            Gantt.visualWidth = this.viewport.width;

            if (this.viewport.width < Gantt.taskLabelWidth + Gantt.kpiLabelWidth + 50) {
                Gantt.taskLabelWidth = -10;
                Gantt.kpiLabelWidth = 0;
                $('.gantt_taskPanel, .gantt_imagePanel , .gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv')
                    .hide();
            } else {
                $('.gantt_taskPanel, .gantt_imagePanel').show();
                if (!this.viewModel.settings.taskLabels.show) {
                    Gantt.taskLabelWidth = -20;
                }
                if (Gantt.kpiLabelWidth !== 0) {
                    $('.gantt_kpiPanel, .gantt_kpiTitlePanel, .gantt_kpiImagePanel, .gantt_bottomTaskDiv').show();
                }
            }
            if (d3.select('#gantt_ToggleIcon').classed('expand')) {
                $('.gantt_bottomTaskDiv').hide();
            }

            widthFromPercent = this.viewport.width * Gantt.currentDisplayRatio / 100;
            if (widthFromPercent > width) {
                this.offset = (widthFromPercent - width) / this.viewModel.dataView.categorical.categories.length;
            }

            this.margin = Gantt.DefaultMargin;
            if (this.viewModel.settings.dateType.enableToday) {
                Gantt.bottomMilestoneHeight = 23;
            } else {
                Gantt.bottomMilestoneHeight = 5;
            }

            if (this.interactivityService) {
                this.interactivityService.applySelectionStateToData(this.viewModel.tasksNew);
            }

            let dateTypeMilliseconds: number;
            dateTypeMilliseconds = Gantt.getDateType(this.viewModel.settings.dateType.type);
            let startDate: Date;
            let endDate: Date;
            let ticks: number;
            let monthNum: number;
            let yearNum: number;
            let datamin: number;
            let datamax: number;
            let categoryLengthPrev: number;
            if (Gantt.dataMIN !== Gantt.maxSafeInteger) { datamin = Gantt.dataMIN; }
            if (Gantt.dataMAX !== Gantt.minSafeInteger) { datamax = Gantt.dataMAX; }
            startDate = Gantt.earliestStartDate;
            endDate = Gantt.lastestEndDate;
            categoryLengthPrev = getValue<number>(objects, 'categoryColumnsWidth', 'categoryLength', 0);

            if (datamax === undefined && Gantt.isDateData === false) {
                datamin = 0;
                datamax = 1;
                ticks = 2;
                Gantt.totalTicks = ticks;
                let axisLength: number;
                axisLength = ticks * Gantt.defaultTicksLength;
                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                    - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    viewportIn: viewportIn,
                    textProperties: this.textProperties,
                    startDate: startDate,
                    endDate: endDate,
                    datamax: datamax,
                    datamin: datamin,
                    axisLength: axisLength,
                    ticks: ticks
                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, null, null, axisLength, ticks, false);
                this.timeScale = <timeScale<number, number>>xAxisProperties.scale;
                let ganttWidth: number;
                ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }

                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }

                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.class).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }
                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
                this.updateElementsPositions(this.viewport, this.margin);
            } else if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                ticks = 15;
                if (datamin === datamax) {
                    datamax = datamin + 1;
                    ticks = 2;
                } else if (datamax > 1) {
                    ticks = Math.ceil(Math.round(datamax.valueOf() - datamin.valueOf()));
                    ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                    if (ticks > 15) {
                        ticks = 15;
                    }
                } else if (datamax > 0 && datamax < 1) {
                    ticks = datamax.valueOf() - datamin.valueOf();
                    ticks = ticks * 10;
                }

                Gantt.totalTicks = ticks;
                let axisLength: number = ticks * Gantt.defaultTicksLength;
                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth - this.margin.left
                    - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    viewportIn: viewportIn,
                    textProperties: this.textProperties,
                    startDate: startDate,
                    endDate: endDate,
                    datamax: datamax,
                    datamin: datamin,
                    axisLength: axisLength,
                    ticks: ticks
                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, null, null, axisLength, ticks, false);
                this.timeScale = <timeScale<number, number>>xAxisProperties.scale;
                let ganttWidth: number;
                ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }

                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }

                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.class).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }
                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
                this.updateElementsPositions(this.viewport, this.margin);
            } else if (startDate && Gantt.isDateData) {
                let startDate1: Date;
                startDate1 = new Date(startDate.toString());
                let endDate1: Date;
                endDate1 = new Date(endDate.toString());
                yearNum = 0;
                // Set both start and end dates for day
                if ('Day' === this.viewModel.settings.dateType.type) {
                    startDate1.setHours(0, 0, 0, 0);
                    endDate1.setDate(endDate1.getDate() + 1);
                    endDate1.setHours(0, 0, 0, 0);
                } else { // If type is not day
                    // handle start date for tick label
                    if ('Week' === this.viewModel.settings.dateType.type) {
                        startDate1.setHours(0, 0, 0, 0);
                        startDate1.setDate(startDate1.getDate() - 1);
                    } else {
                        monthNum = startDate1.getMonth();
                        if ('Year' === this.viewModel.settings.dateType.type) {
                            monthNum = 0;
                        } else if ('Quarter' === this.viewModel.settings.dateType.type) {
                            if (monthNum < 3) {
                                monthNum = 0;
                            } else if (monthNum < 6) {
                                monthNum = 3;
                            } else if (monthNum < 9) {
                                monthNum = 6;
                            } else {
                                monthNum = 9;
                            }
                        }
                        startDate1 = new Date(startDate1.getFullYear(), monthNum);
                    }

                    // handle end date for tick label
                    monthNum = endDate1.getMonth();

                    if ('Week' === this.viewModel.settings.dateType.type) {
                        endDate1.setHours(0, 0, 0, 0);
                        endDate1.setDate(endDate1.getDate() + 1);
                        let daysToAdd: number = 0;
                        daysToAdd = 7 - (Math.round(Math.abs((endDate1.getTime() - startDate1.getTime()) / (24 * 60 * 60 * 1000)))) % 7;
                        endDate1.setDate(endDate1.getDate() + daysToAdd);
                    } else {
                        if ('Year' === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 12;
                        } else if ('Quarter' === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 3;
                            monthNum = monthNum - monthNum % 3;
                        } else if ('Month' === this.viewModel.settings.dateType.type) {
                            monthNum = monthNum + 1;
                        }
                        if (monthNum >= 12) {
                            yearNum = 1;
                            monthNum = 0;
                        }

                        endDate1 = new Date(endDate1.getFullYear() + yearNum, monthNum);
                    }
                }
                ticks = Math.ceil(Math.round(endDate1.valueOf() - startDate1.valueOf()) / dateTypeMilliseconds);
                ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                Gantt.totalTicks = ticks;
                let axisLength: number = ticks * Gantt.defaultTicksLength;

                if (this.viewModel.settings.dateType.type === 'Day') {

                    ticks = 2 * (Math.ceil(Math.round(endDate1.valueOf() - startDate1.valueOf()) / dateTypeMilliseconds));
                    ticks = (ticks === 0 || ticks === 1) ? 2 : ticks;
                    axisLength = 2 * ticks * Gantt.defaultTicksLength;
                }

                let rightSectionWidth: number;
                rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                    - this.margin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
                if (rightSectionWidth > axisLength) {
                    axisLength = rightSectionWidth;
                }

                let viewportIn: IViewport;
                viewportIn = {
                    height: this.viewport.height,
                    width: axisLength
                };

                Gantt.xAxisPropertiesParamter = {
                    viewportIn: viewportIn,
                    textProperties: this.textProperties,
                    startDate: startDate1,
                    datamax: datamax,
                    endDate: endDate1,
                    datamin: datamin,
                    axisLength: axisLength,
                    ticks: ticks
                };

                let xAxisProperties: IAxisProperties;
                xAxisProperties =
                    this.calculateAxes(viewportIn, this.textProperties, datamin, datamax, startDate1, endDate1, axisLength, ticks, false);
                this.timeScale = <timeScale<Date, Date>>xAxisProperties.scale;
                let ganttWidth: number;
                ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
                if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > this.viewport.width) {
                    Gantt.scrollHeight = 17;
                } else {
                    Gantt.scrollHeight = 0;
                }
                this.updateChartSize();
                this.renderCustomLegendIndicator();
                this.updateSvgSize(this, axisLength);
                this.renderAxis(xAxisProperties);
                this.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
                if (Gantt.isDateData) {
                    this.createTodayLine(Gantt.currentTasksNumber);
                }
                let taskSvgWidth: number;
                taskSvgWidth = $(dotLiteral + Selectors.taskPanel.class).width();
                Gantt.columnWidth = taskSvgWidth / this.viewModel.tasksNew[0].name.length;
                if (categoryLengthPrev === 0 || categoryLengthPrev !== this.viewModel.tasksNew[0].name.length) {
                    this.resetResizeData(this.viewModel.tasksNew[0].name.length, this.viewModel);
                }
                this.updateTaskLabels(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width);
                this.updateElementsPositions(this.viewport, this.margin);
            }

            this.adjustResizing(this.viewModel.tasksNew, this.viewModel.settings.taskLabels.width, this.viewModel);

            if ((this.viewModel.settings.legend.show
                && (this.viewport.width > $('.gantt_legendIndicatorPanel').innerWidth() + 100)
                && this.viewport.height > $('.gantt_legendIndicatorPanel').innerHeight() + 50
                && this.viewModel.kpiData.length > 0)
                && (parseFloat(d3.select('.gantt_legendPanel').style('left')) > parseFloat(d3.select('.gantt_barPanel').style('left')))) {
                $('.gantt_legendPanel').show();
                if ($('#LegendToggleImage').hasClass('visible')) {
                    $('.gantt_legendIndicatorPanel').show();
                    $('.arrow').show();
                } else {
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
            } else {
                $('.arrow').hide();
                $('.gantt_legendPanel').hide();
                $('.gantt_legendIndicatorPanel').hide();
            }

            if (this.interactivityService) {
                let behaviorOptions: GanttBehaviorOptions;
                behaviorOptions = {
                    clearCatcher: this.clearCatcher,
                    taskSelection: this.taskGroup.selectAll(Selectors.singlePhase.selector),
                    legendSelection: this.body.selectAll(Selectors.legendItems.selector),
                    interactivityService: this.interactivityService
                };
                this.interactivityService.bind(this.viewModel.tasksNew, this.behavior, behaviorOptions);
            }

            if (this.viewModel.settings.columnHeader.columnOutline === 'leftOnly' ||
                this.viewModel.settings.columnHeader.columnOutline === 'leftRight' ||
                this.viewModel.settings.columnHeader.columnOutline === 'frame') {
                const drillAllPanelWidth: number = $('.gantt_drillAllPanel2').width();
                $('.gantt_drillAllPanel2').width((drillAllPanelWidth - 1) + pxLiteral);
            }
            this.sortCategories(this);
            if (d3.select('#gantt_ToggleIcon').classed('expand')) {
                $('.gantt_category0').hide();
            }
        }

        private renderCustomLegendIndicator(): void {
            this.legendIndicatorTitleSvg.selectAll('*').remove();
            this.phaseIndicatorSvg.selectAll('*').remove();
            this.kpiIndicatorSvg.selectAll('*').remove();
            this.milestoneIndicatorSvg.selectAll('*').remove();
            let indicatorTitleGroup: Selection<HTMLElement>;
            let indicatorTitle: Selection<HTMLElement>;
            let kpiGroup: Selection<HTMLElement>;
            let eachKPI: Selection<HTMLElement>;
            let kpiCircle: Selection<HTMLElement>;
            let kpiCircleText: Selection<HTMLElement>;
            let kpiDescText: Selection<HTMLElement>;
            let milestoneGroup: Selection<HTMLElement>;
            let eachMilestone: Selection<HTMLElement>;
            let milestoneIcon: Selection<HTMLElement>;
            let milestoneDescText: Selection<HTMLElement>;
            let phaseGroup: Selection<HTMLElement>;
            let eachPhase: Selection<HTMLElement>;
            let phaseIcon: Selection<HTMLElement>;
            let phaseDescText: Selection<HTMLElement>;
            let rowCounter: number = 0;
            let indicatorTitleXCoordinate: number;
            indicatorTitleXCoordinate = 7;
            let indicatorTitleYCoordinate: number;
            indicatorTitleYCoordinate = 17;
            let indicatorTitleColor: string;
            indicatorTitleColor = '#404040';
            let eachIndicatorGroupStartYCoordinate: number;
            eachIndicatorGroupStartYCoordinate = 10;
            let eachIndiactorRowHeight: number;
            eachIndiactorRowHeight = 25;
            let descTextColor: string;
            descTextColor = '#8c8c8c';
            let descTextXCoordinate: number;
            descTextXCoordinate = 25;
            let kpiCircleXCoordinate: number;
            kpiCircleXCoordinate = 15;
            let kpiCircleRadius: number;
            kpiCircleRadius = 8;
            let kpiCircleTextXCoordinate: number;
            kpiCircleTextXCoordinate = 11;
            let milestoneIconDimension: number;
            milestoneIconDimension = 14;
            let milestoneIconXCoordinate: number;
            milestoneIconXCoordinate = 12;
            let phaseIconWidth: number;
            phaseIconWidth = 15;
            let phaseIconHeight: number;
            phaseIconHeight = 10;
            let phaseIconXCoordinate: number;
            phaseIconXCoordinate = 5;
            let legendIndicatorHeight: number;
            legendIndicatorHeight = 150;
            let totalKPIs: number;
            totalKPIs = this.viewModel.kpiData.length;
            let totalMilestones: number;
            totalMilestones = Gantt.milestoneNames.length;
            let totalPhases: number;
            totalPhases = Gantt.phaseNames.length;
            let kpiIndicatorWidth: number;
            kpiIndicatorWidth = totalKPIs !== 0 ? 75 : 0;
            let milestoneIndicatorWidth: number = totalMilestones !== 0 ? 120 : 0;
            let phaseIndicatorWidth: number = totalPhases !== 0 ? 120 : 0;
            let legendIndicatorTitleHeight: number;
            legendIndicatorTitleHeight = 25;
            let width: number = 0;

            if (totalMilestones > 0) {
                for (let iCount: number = 0; iCount < totalMilestones; iCount++) {
                    let textProperties: TextProperties;
                    textProperties = {
                        text: Gantt.milestoneNames[iCount],
                        fontFamily: 'Segoe UI',
                        fontSize: 12 + pxLiteral
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 40;
                    milestoneIndicatorWidth = width > milestoneIndicatorWidth ? width : milestoneIndicatorWidth;
                }
            }

            if (totalPhases > 0) {
                for (let iCount: number = 0; iCount < totalPhases; iCount++) {
                    let textProperties: TextProperties;
                    textProperties = {
                        text: Gantt.phaseNames[iCount],
                        fontFamily: 'Segoe UI',
                        fontSize: 12 + pxLiteral
                    };
                    width = Math.ceil(textMeasurementService.measureSvgTextWidth(textProperties)) + 60;
                    phaseIndicatorWidth = width > phaseIndicatorWidth ? width : phaseIndicatorWidth;
                }
            }

            let legendIndicatorWidth: number;
            legendIndicatorWidth = kpiIndicatorWidth + milestoneIndicatorWidth + phaseIndicatorWidth + 12;

            this.legendIndicatorDiv.style({
                height: PixelConverter.toString(legendIndicatorHeight),
                width: PixelConverter.toString(legendIndicatorWidth),
                left: PixelConverter.toString(this.viewport.width - legendIndicatorWidth - 25),
                top: PixelConverter.toString(Gantt.axisHeight - 16)
            });

            this.legendIndicatorTitleDiv.style({
                width: PixelConverter.toString(legendIndicatorWidth)
            });

            this.legendIndicatorTitleSvg
                .attr({
                    height: PixelConverter.toString(legendIndicatorTitleHeight),
                    width: PixelConverter.toString(legendIndicatorWidth)
                });

            this.arrowDiv.style({
                left: PixelConverter.toString(this.viewport.width - 60),
                top: PixelConverter.toString(Gantt.axisHeight - 22)
            });

            this.kpiIndicatorDiv.style({
                width: PixelConverter.toString(kpiIndicatorWidth + 12),
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight)
            });

            this.kpiIndicatorSvg
                .attr({
                    height: PixelConverter.toString(4 * eachIndiactorRowHeight),
                    width: PixelConverter.toString(kpiIndicatorWidth + 12)
                });

            this.milestoneIndicatorDiv.style({
                width: PixelConverter.toString(milestoneIndicatorWidth),
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight)
            });

            this.milestoneIndicatorSvg
                .attr({
                    height: PixelConverter.toString(totalMilestones * eachIndiactorRowHeight),
                    width: PixelConverter.toString(milestoneIndicatorWidth)
                });

            this.phaseIndicatorDiv.style({
                width: PixelConverter.toString(phaseIndicatorWidth),
                height: PixelConverter.toString(legendIndicatorHeight - legendIndicatorTitleHeight)
            });

            this.phaseIndicatorSvg
                .attr({
                    height: PixelConverter.toString(totalPhases * eachIndiactorRowHeight),
                    width: PixelConverter.toString(phaseIndicatorWidth)
                });

            indicatorTitleGroup = this.legendIndicatorTitleSvg
                .append('g')
                .classed('gantt_indicatorTitle', true);

            if (totalKPIs !== 0) {
                indicatorTitle = indicatorTitleGroup
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate,
                        fill: indicatorTitleColor
                    })
                    .text('KPIs');

                kpiGroup = this.kpiIndicatorSvg
                    .append('g')
                    .classed('kpiIndicatorGroup', true);

                eachKPI = kpiGroup
                    .append('g')
                    .classed('eachKPIRow', true);

                kpiCircle = eachKPI
                    .append('circle')
                    .classed('kpiCircle', true)
                    .attr({
                        cx: kpiCircleXCoordinate,
                        cy: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        r: kpiCircleRadius,
                        fill: '#116836',
                        'stroke-width': Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiCircleTextXCoordinate - 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 4,
                        fill: '#fff'
                    })
                    .text('G');

                kpiDescText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: descTextColor
                    })
                    .text('Green (4)');

                rowCounter++;

                eachKPI = kpiGroup
                    .append('g')
                    .classed('eachKPIRow', true);

                kpiCircle = eachKPI
                    .append('circle')
                    .classed('kpiCircle', true)
                    .attr({
                        cx: kpiCircleXCoordinate,
                        cy: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        r: kpiCircleRadius,
                        fill: '#ff9d00',
                        'stroke-width': Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiCircleTextXCoordinate + 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: '#fff'
                    })
                    .text('Y');

                kpiDescText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: descTextColor,
                        'stroke-width': 5
                    })
                    .text('Yellow (3)');
                rowCounter++;

                eachKPI = kpiGroup
                    .append('g')
                    .classed('eachKPIRow', true);

                kpiCircle = eachKPI
                    .append('circle')
                    .classed('kpiCircle', true)
                    .attr({
                        cx: kpiCircleXCoordinate,
                        cy: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        r: kpiCircleRadius,
                        fill: '#d15d0d',
                        'stroke-width': Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiCircleTextXCoordinate - 0.5,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: '#fff'
                    })
                    .text('O');

                kpiDescText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: descTextColor
                    })
                    .text('Orange (2)');
                rowCounter++;

                eachKPI = kpiGroup
                    .append('g')
                    .classed('eachKPIRow', true);

                kpiCircle = eachKPI
                    .append('circle')
                    .classed('kpiCircle', true)
                    .attr({
                        cx: kpiCircleXCoordinate,
                        cy: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter,
                        r: kpiCircleRadius,
                        fill: '#ad1717',
                        'stroke-width': Gantt.axisLabelStrokeWidth
                    });

                kpiCircleText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiCircleTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: '#fff'
                    })
                    .text('R');

                kpiDescText = eachKPI
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: descTextXCoordinate,
                        y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * rowCounter + 5,
                        fill: descTextColor
                    })
                    .text('Red (1)');
            }

            if (0 !== totalMilestones) {
                indicatorTitle = indicatorTitleGroup
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiIndicatorWidth + indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate,
                        fill: indicatorTitleColor
                    })
                    .text('Milestones');

                milestoneGroup = this.milestoneIndicatorSvg
                    .append('g')
                    .classed('milestoneIndicatorGroup', true);

                for (let milestoneCounter: number = 0; milestoneCounter < totalMilestones; milestoneCounter++) {
                    eachMilestone = milestoneGroup
                        .append('g')
                        .classed('eachMilestone', true);

                    milestoneIcon = eachMilestone;
                    this.drawMilestoneShape(
                        milestoneIcon, milestoneIconXCoordinate,
                        eachIndiactorRowHeight * milestoneCounter - 5, milestoneCounter, true);
                    milestoneDescText = eachMilestone
                        .append('text')
                        .attr({
                            class: 'gantt_milestoneLegend milestoneDescText',
                            'data-milestonenamelegend': Gantt.milestoneNames[milestoneCounter],
                            x: descTextXCoordinate,
                            y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * milestoneCounter + 5,
                            fill: descTextColor
                        })
                        .text(Gantt.milestoneNames[milestoneCounter]);

                    milestoneDescText.append('title').text(Gantt.milestoneNames[milestoneCounter]);
                }
            }

            if (0 !== totalPhases) {
                indicatorTitle = indicatorTitleGroup
                    .append('text')
                    .classed(Selectors.label.class, true)
                    .attr({
                        x: kpiIndicatorWidth + milestoneIndicatorWidth + indicatorTitleXCoordinate,
                        y: indicatorTitleYCoordinate,
                        fill: indicatorTitleColor
                    })
                    .text('Phases');

                phaseGroup = this.phaseIndicatorSvg
                    .append('g')
                    .classed('phaseIndicatorGroup', true);

                for (let phaseCounter: number = 0; phaseCounter < totalPhases; phaseCounter++) {
                    eachPhase = phaseGroup
                        .append('g')
                        .classed('eachPhase', true);

                    phaseIcon = eachPhase
                        .append('rect')
                        .attr({
                            class: 'gantt_phaseLegend phaseIcon',
                            'data-phasenamelegend': Gantt.phaseNames[phaseCounter],
                            x: phaseIconXCoordinate,
                            y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * phaseCounter - 5,
                            width: phaseIconWidth + pxLiteral,
                            height: phaseIconHeight + pxLiteral,
                            fill: Gantt.typeColors[phaseCounter % Gantt.typeColors.length]
                        });

                    phaseDescText = eachPhase
                        .append('text')
                        .attr({
                            class: 'gantt_phaseLegend phaseDescText',
                            'data-phasenamelegend': Gantt.phaseNames[phaseCounter],
                            x: descTextXCoordinate,
                            y: eachIndicatorGroupStartYCoordinate + eachIndiactorRowHeight * phaseCounter + 5,
                            fill: descTextColor
                        })
                        .text(Gantt.phaseNames[phaseCounter]);

                    phaseDescText.append('title').text(Gantt.phaseNames[phaseCounter]);
                }
            }

            Gantt.totalLegendPresent = totalMilestones + totalPhases;
            this.addLegendInteractiveEvent(this);
        }

        private updateSvgSize(thisObj: Gantt, axisLength: number): void {
            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                axisLength -= 20;
            }

            thisObj.legendSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(75)
                });

            thisObj.ganttSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(thisObj.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            thisObj.taskSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            thisObj.kpiTitleSvg
                .attr({
                    height: 20,
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });

            thisObj.kpiSvg
                .attr({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 8),
                    width: PixelConverter.toString(Gantt.kpiLabelWidth)
                });

            if ((thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                < (Gantt.currentTasksNumber * chartLineHeight + 20)) {
                thisObj.bottomDiv.style({
                    height: PixelConverter
                        .toString(thisObj.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight)
                });

                thisObj.bottommilestoneDiv.style({
                    bottom: PixelConverter.toString(0)
                });

                thisObj.bottomTaskDiv.style({
                    bottom: PixelConverter.toString(0)
                });

                thisObj.barDiv.style('height', 'auto');
            } else {
                thisObj.bottomDiv.style({
                    height: PixelConverter.toString(Gantt.currentTasksNumber * chartLineHeight + 20)
                });

                this.bottommilestoneDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight
                        - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });

                this.bottomTaskDiv.style({
                    bottom: PixelConverter
                        .toString(this.viewport.height - Gantt.axisHeight - Gantt.bottomMilestoneHeight - Gantt.scrollHeight
                        - (Gantt.currentTasksNumber * chartLineHeight + 20))
                });

                thisObj.barDiv.style('height', '100%');
            }

            thisObj.timelineSvg
                .attr({
                    height: PixelConverter.toString(Gantt.axisHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            thisObj.imageSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(20)
                });

            thisObj.kpiImageSvg
                .attr({
                    height: PixelConverter.toString(20),
                    width: PixelConverter.toString(20)
                });

            thisObj.drillAllSvg
                .attr({
                    height: 20,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            thisObj.drillAllSvg2
                .attr({
                    height: 30,
                    width: PixelConverter.toString(Gantt.taskLabelWidth + 20)
                });

            d3.select('.hierarchyTitle')
                .attr({
                    width: PixelConverter.toString(Gantt.taskLabelWidth - 30)
                });

            thisObj.bottommilestoneSvg
                .attr({
                    height: PixelConverter.toString(Gantt.bottomMilestoneHeight),
                    width: PixelConverter.toString(this.margin.left + axisLength + Gantt.defaultValues.ResourceWidth)
                });

            if ($('.gantt_bottomPanel').innerHeight() < $('.gantt_barPanel').innerHeight()) {
                $('.gantt_barPanel').css('width', $('.gantt_barPanel').innerWidth() - 20);
            }
            let currentScrollPosition: string;
            if ($('.gantt_barPanel').innerWidth() < thisObj.margin.left + axisLength + Gantt.defaultValues.ResourceWidth) {
                let bottomMilestoneScrollPosition: number = 0;
                if (Gantt.isDateData) {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position.toLowerCase();
                } else {
                    currentScrollPosition = thisObj.viewModel.settings.scrollPosition.position2.toLowerCase();
                }
                switch (currentScrollPosition) {
                    case 'start':
                        bottomMilestoneScrollPosition = 0;
                        break;
                    case 'today':
                        bottomMilestoneScrollPosition = thisObj.timeScale(new Date());
                        break;
                    case 'end':
                        bottomMilestoneScrollPosition = $('.gantt_barSvg').innerWidth();
                        break;
                    default:
                }
                document.getElementsByClassName('gantt_bottomMilestonePanel')[0].scrollLeft = bottomMilestoneScrollPosition;
                this.setBottomScrollPosition(bottomMilestoneScrollPosition);
            }
        }
        private setBottomScrollPosition(bottomMilestoneScrollPosition: number): void {
            if (document.getElementsByClassName('gantt_barPanel')) {
                document.getElementsByClassName('gantt_barPanel')[0].scrollLeft = bottomMilestoneScrollPosition;
            }
            if (document.getElementsByClassName('gantt_timelinePanel')) {
                document.getElementsByClassName('gantt_timelinePanel')[0].scrollLeft = bottomMilestoneScrollPosition;
            }
        }

        private setBottomTaskScrollPosition(bottomTaskScrollPosition: number): void {
            if (document.getElementsByClassName('gantt_taskPanel')) {
                document.getElementsByClassName('gantt_taskPanel')[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName('gantt_drillAllPanel')) {
                document.getElementsByClassName('gantt_drillAllPanel')[0].scrollLeft = bottomTaskScrollPosition;
            }
            if (document.getElementsByClassName('gantt_drillAllPanel2')) {
                document.getElementsByClassName('gantt_drillAllPanel2')[0].scrollLeft = bottomTaskScrollPosition;
            }
        }

        private addLegendInteractiveEvent(thisObj: Gantt): void {
            $('.gantt_phaseLegend').on('click', function (event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, 'data-phasename');
            });

            $('.gantt_milestoneLegend').on('click', function (event: JQueryMouseEventObject): void {
                event.stopPropagation();
                thisObj.legendSelection(this, thisObj, 'data-milestonename');
            });
        }

        private legendSelection(thisCurrent: Gantt, thisGlobal: Gantt, dataAttribute: string): void {
            let legendDataAttrName: string;
            const legendEqualsQuote: string = 'legend="';
            const openingSquareBracket: string = '[';
            const quoteClosingSquareBracket: string = '"]';
            const equalsQuote: string = '="';

            legendDataAttrName = $(thisCurrent).attr(dataAttribute + legendLiteral);
            if ($(thisCurrent).parent().hasClass('activeLegend')) {
                Gantt.totalLegendSelected--;
                if (Gantt.totalLegendSelected === 0) {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                } else {
                    $(thisCurrent).parent().removeClass('activeLegend');
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote + legendDataAttrName + quoteClosingSquareBracket)
                        .addClass('gantt_loweropacityLegend').removeClass('gantt_higheropacityLegend');
                    $(openingSquareBracket + dataAttribute + equalsQuote + legendDataAttrName + quoteClosingSquareBracket)
                        .children().addClass('gantt_loweropacity').removeClass('gantt_higheropacity');
                    let index: number;
                    index = Gantt.currentSelectionState[milestoneNamesLiteral].indexOf(legendDataAttrName);
                    Gantt.currentSelectionState[milestoneNamesLiteral].splice(index, 1, 0);
                }
            } else {
                Gantt.isLegendHighlighted = true;
                if (Gantt.totalLegendSelected === 0) {
                    thisGlobal.moveAllTOBackground();
                    Gantt.currentSelectionState = {};
                    $('.gantt_phaseLegend, .gantt_milestoneLegend')
                        .removeClass('gantt_higheropacityLegend').addClass('gantt_loweropacityLegend');
                    Gantt.currentSelectionState[clickedTypeLiteral] = 'legend';
                    Gantt.currentSelectionState[phaseNamesLiteral] = [];
                    Gantt.currentSelectionState[milestoneNamesLiteral] = [];
                }
                Gantt.totalLegendSelected++;
                if (Gantt.totalLegendSelected !== Gantt.totalLegendPresent) {
                    $(thisCurrent).parent().addClass('activeLegend');
                    $(openingSquareBracket + dataAttribute + legendEqualsQuote + legendDataAttrName + quoteClosingSquareBracket)
                        .removeClass('gantt_loweropacityLegend').addClass('gantt_higheropacityLegend');
                    $(openingSquareBracket + dataAttribute + equalsQuote + legendDataAttrName + quoteClosingSquareBracket)
                        .children().removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                    if (dataAttribute === 'data-milestonename') {
                        Gantt.currentSelectionState[milestoneNamesLiteral].push(legendDataAttrName);
                    } else {
                        Gantt.currentSelectionState[phaseNamesLiteral].push(legendDataAttrName);
                    }
                } else {
                    Gantt.isLegendHighlighted = false;
                    thisGlobal.removeAllHighlight();
                }
            }
        }

        private addLegendHideShowEvents(thisObj: Gantt): void {
            let $LegendToggleImageId: JQuery;
            $LegendToggleImageId = $('#LegendToggleImage');
            $('.gantt_legendToggle').on('click', function (event: JQueryMouseEventObject): void {
                event.stopPropagation();
                if ($LegendToggleImageId.hasClass('notVisible')) {
                    $LegendToggleImageId.removeClass('notVisible').addClass('visible');
                    $LegendToggleImageId.attr('href', Gantt.drillUpImage);
                    $('.gantt_legendIndicatorPanel').show();
                    $('.arrow').show();
                } else {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
            });
        }

        private addExpandCollapseEvent(thisObj: Gantt): void {
            d3.selectAll('#gantt_ToggleIcon').on('click', function (): void {
                thisObj.expandCollapseTaskKPIPanel(thisObj, '#gantt_ToggleIcon', '.gantt_task-lines', '.gantt_toggle-task-group', true);
                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $('#LegendToggleImage');
                if ($LegendToggleImageId.hasClass('visible')) {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
            });

            d3.selectAll('#gantt_KPIToggle').on('click', function (): void {
                thisObj.expandCollapseTaskKPIPanel(thisObj, '#gantt_KPIToggle', '.gantt_kpi-lines', '.toggle-kpi-group', false);
                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $('#LegendToggleImage');
                if ($LegendToggleImageId.hasClass('visible')) {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
            });
        }

        private expandCollapseTaskKPIPanel(
            thisObj: Gantt, elementId: string, elementClass: string,
            elementGroupClass: string, isTaskLabel: boolean): void {
            d3.event[stopPropagationLiteral]();
            let element: Selection<SVGAElement>;
            element = d3.select(elementId);
            if (element.classed('collapse')) {
                d3.selectAll(elementClass).attr('visibility', 'hidden');
                element.attr('href', Gantt.expandImage);
                element.classed('collapse', false);
                element.classed('expand', true);
                if (elementId === '#gantt_ToggleIcon') {
                    $('.gantt_bottomTaskDiv').hide();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = -4;
                } else {
                    Gantt.kpiLabelWidth = 20;
                }
            } else {
                d3.selectAll(elementClass).attr('visibility', 'visible');
                d3.select(elementGroupClass).attr('visibility', 'visible');
                element.attr('href', Gantt.collapseImage);
                element.classed('collapse', true);
                element.classed('expand', false);
                if (elementId === '#gantt_ToggleIcon') {
                    $('.gantt_bottomTaskDiv').show();
                }
                if (isTaskLabel) {
                    Gantt.taskLabelWidth = (Gantt.currentDisplayRatio - Gantt.minDisplayRatio) * this.viewport.width / 100;
                } else {
                    Gantt.kpiLabelWidth = Gantt.kpiLabelWidthOriginal;
                }
            }
            thisObj.redrawChart(thisObj);
            if (d3.select('#gantt_ToggleIcon').classed('expand')) {
                $('.gantt_category0').hide();
                $('.gantt_bottomTaskDiv').hide();
            }
            if (d3.select('.gantt_drillAllPanel2')[0][0] &&
                d3.select('.gantt_taskPanel')[0][0] &&
                parseInt(d3.select('.gantt_taskPanel').style('width'), 10) >= 1) {
                d3.select('.gantt_drillAllPanel2').style('width', PixelConverter.toString($('.gantt_taskPanel').width() - 1));
            }
        }

        private sortCategories(thisObj: Gantt): void {
            for (let iCounter: number = 0; iCounter < Gantt.numberOfCategories; iCounter++) {
                $(categoryClassLiteral + iCounter).on('click', function (event: JQueryMouseEventObject): void {
                    let categoryId: Selection<SVGAElement>;
                    categoryId = d3.select(categoryIdLiteral + iCounter);
                    if (Gantt.prevSortedColumn === iCounter) {
                        Gantt.sortOrder = (Gantt.sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                        Gantt.sortOrder = 'asc';
                    }
                    Gantt.sortLevel = iCounter;
                    thisObj.viewModel = Gantt.converter(Gantt.globalOptions.dataViews[0], thisObj.host, thisObj.colors);

                    for (let jCounter: number = 0; jCounter < Gantt.numberOfCategories; jCounter++) {
                        if (jCounter !== iCounter) {
                            d3.select(categoryIdLiteral + jCounter).attr('href', Gantt.sortAscOrder);
                        }
                    }
                    if (Gantt.sortOrder === 'asc') {
                        categoryId.attr('href', Gantt.sortAscOrder);
                    } else {
                        categoryId.attr('href', Gantt.sortDescOrder);
                    }
                    thisObj.persistSortState();
                    Gantt.prevSortedColumn = iCounter;
                });
            }
        }

        private removeAllHighlight(): void {
            Gantt.totalLegendSelected = 0;
            Gantt.currentSelectionState = {};
            $('.milestoneHighlighted').removeClass('milestoneHighlighted');
            $('.phaseHighlighted').removeClass('phaseHighlighted');
            $('.activeLegend').removeClass('activeLegend');
            $('.gantt_task-rect').removeClass('gantt_loweropacity').removeClass('gantt_higheropacity').removeClass('gantt_activeRect');
            $('.gantt_task-progress').removeClass('gantt_loweropacity')
                .removeClass('gantt_higheropacity').removeClass('gantt_activeProgress');
            $('.gantt_actual-milestone').removeClass('gantt_loweropacity')
                .removeClass('gantt_higheropacity').removeClass('gantt_activeMilestone');
            $('.gantt_phaseLegend, .gantt_milestoneLegend')
                .removeClass('gantt_higheropacityLegend').removeClass('gantt_loweropacityLegend');
        }

        private moveAllTOBackground(): void {
            Gantt.totalLegendSelected = 0;
            $('.milestoneHighlighted').removeClass('milestoneHighlighted');
            $('.phaseHighlighted').removeClass('phaseHighlighted');
            $('.activeLegend').removeClass('activeLegend');
            $('.gantt_task-rect').addClass('gantt_loweropacity').removeClass('gantt_higheropacity').removeClass('gantt_activeRect');
            $('.gantt_task-progress').addClass('gantt_loweropacity').removeClass('gantt_higheropacity').removeClass('gantt_activeProgress');
            $('.gantt_actual-milestone').addClass('gantt_loweropacity')
                .removeClass('gantt_higheropacity').removeClass('gantt_activeMilestone');
            $('.gantt_phaseLegend, .gantt_milestoneLegend')
                .removeClass('gantt_higheropacityLegend').removeClass('gantt_loweropacityLegend');
        }

        private redrawChart(thisObj: Gantt): void {
            let rightSectionWidth: number;
            rightSectionWidth = Gantt.visualWidth - Gantt.taskLabelWidth
                - Gantt.DefaultMargin.left - Gantt.defaultValues.ResourceWidth - Gantt.kpiLabelWidth;
            let newAxisLength: number = Gantt.xAxisPropertiesParamter.axisLength;
            if (rightSectionWidth > newAxisLength) {
                newAxisLength = rightSectionWidth;
                Gantt.xAxisPropertiesParamter.axisLength = rightSectionWidth;
            }

            let ganttWidth: number;
            ganttWidth = this.margin.left + Gantt.xAxisPropertiesParamter.axisLength + Gantt.defaultValues.ResourceWidth;
            if (ganttWidth + Gantt.taskLabelWidth + Gantt.kpiLabelWidth > thisObj.viewport.width) {
                Gantt.scrollHeight = 17;
            } else {
                Gantt.scrollHeight = 0;
            }

            thisObj.updateChartSize();
            thisObj.updateSvgSize(thisObj, newAxisLength);
            let viewportIn: IViewport;
            viewportIn = {
                height: thisObj.viewport.height,
                width: newAxisLength
            };
            let xAxisProperties: IAxisProperties;
            xAxisProperties = thisObj.calculateAxes(
                viewportIn, Gantt.xAxisPropertiesParamter.textProperties,
                Gantt.xAxisPropertiesParamter.datamin, Gantt.xAxisPropertiesParamter.datamax,
                Gantt.xAxisPropertiesParamter.startDate, Gantt.xAxisPropertiesParamter.endDate,
                newAxisLength, Gantt.xAxisPropertiesParamter.ticks, false);
            thisObj.timeScale = <timeScale<number, number>>xAxisProperties.scale;
            thisObj.renderAxis(xAxisProperties);
            thisObj.rendergrids(xAxisProperties, Gantt.currentTasksNumber);
            thisObj.updateTaskLabels(thisObj.viewModel.tasksNew, thisObj.viewModel.settings.taskLabels.width);

            if (Gantt.isDateData) {
                thisObj.createTodayLine(Gantt.currentTasksNumber);
            }
            thisObj.updateElementsPositions(thisObj.viewport, thisObj.margin);
            thisObj.adjustResizing(thisObj.viewModel.tasksNew, thisObj.viewModel.settings.taskLabels.width, thisObj.viewModel);
            thisObj.sortCategories(thisObj);

        }

        private static getDateType(type: string): number {
            switch (type) {
                case 'Day':
                    return millisecondsInADay;

                case 'Week':
                    return millisecondsInWeek;

                case 'Month':
                    return millisecondsInAMonth;

                case 'Quarter':
                    return millisecondsInAQuarter;

                case 'Year':
                    return millisecondsInAYear;

                default:
                    return millisecondsInWeek;
            }
        }

        private static getQuarterName(timeinmilliseconds: number): string {
            let date: Date;
            date = new Date(timeinmilliseconds);
            let month: number;
            month = date.getMonth() + 1;
            let year: number;
            year = date.getFullYear();
            let quarter: string = '';

            // Find quarter number of the date based on month number
            if (month <= 3) {
                quarter = 'Q1';
            } else if (month <= 6) {
                quarter = 'Q2';
            } else if (month <= 9) {
                quarter = 'Q3';
            } else {
                quarter = 'Q4';
            }

            return quarter + spaceLiteral + year;
        }

        private calculateAxes(
            viewportIn: IViewport,
            textProperties: TextProperties,
            datamin: number,
            datamax: number,
            startDate: Date,
            endDate: Date,
            axisLength: number,
            ticksCount: number,
            scrollbarVisible: boolean): IAxisProperties {
            if (datamax !== undefined && datamax !== null && datamax !== Gantt.minSafeInteger) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: 'Start Value',
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime,
                    index: 0
                };

                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    viewport: viewportIn,
                    margin: this.margin,
                    forcedXDomain: [datamin, datamax],
                    forceMerge: false,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    categoryAxisScaleType: axisScale.linear,
                    valueAxisScaleType: null,
                    valueAxisDisplayUnits: 0,
                    categoryAxisDisplayUnits: 0,
                    trimOrdinalDataOnOverflow: false,
                    forcedTickCount: ticksCount
                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties1(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);

                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                    textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                    textProperties);

                return axes;

            } else if (startDate) {
                let dataTypeDatetime: ValueType;
                dataTypeDatetime = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.DateTime);
                let category: DataViewMetadataColumn;
                category = {
                    displayName: 'Start Date',
                    queryName: GanttRoles.startDate,
                    type: dataTypeDatetime,
                    index: 0
                };

                let visualOptions: GanttCalculateScaleAndDomainOptions;
                visualOptions = {
                    viewport: viewportIn,
                    margin: this.margin,
                    forcedXDomain: [startDate, endDate],
                    forceMerge: false,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    categoryAxisScaleType: axisScale.linear,
                    valueAxisScaleType: null,
                    valueAxisDisplayUnits: 0,
                    categoryAxisDisplayUnits: 0,
                    trimOrdinalDataOnOverflow: false,
                    forcedTickCount: ticksCount
                };
                const width: number = viewportIn.width;
                let axes: IAxisProperties;
                axes = this.calculateAxesProperties(viewportIn, visualOptions, axisLength, category);
                axes.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    axes,
                    width,
                    textMeasurementService.measureSvgTextWidth,
                    textProperties);

                // If labels do not fit and we are not scrolling, try word breaking
                axes.willLabelsWordBreak = (!axes.willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    axes, this.margin, width, textMeasurementService.measureSvgTextWidth,
                    textMeasurementService.estimateSvgTextHeight, textMeasurementService.getTailoredTextOrDefault,
                    textProperties);

                return axes;
            }
        }

        private calculateAxesProperties(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions,
            axisLength: number, metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties: IAxisProperties;
            xAxisProperties = AxisHelper.createAxis({
                pixelSpan: viewportIn.width,
                dataDomain: options.forcedXDomain,
                metaDataColumn: metaDataColumn,
                formatString: Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type],
                outerPadding: 0,
                isScalar: true,
                isVertical: false,
                forcedTickCount: options.forcedTickCount,
                useTickIntervalForDisplayUnits: true,
                isCategoryAxis: true,
                // tslint:disable-next-line:typedef
                getValueFn: (index, type) => {
                    let dateType: string;
                    dateType = this.viewModel.settings.dateType.type;
                    if (dateType === 'Quarter') {
                        return Gantt.getQuarterName(index);
                    } else if (dateType === 'Day' || dateType === 'Week' || dateType === 'Month' || dateType === 'Year') {
                        return ValueFormatter.format(
                            new Date(index),
                            Gantt.defaultValues.DateFormatStrings[this.viewModel.settings.dateType.type]);
                    }
                },
                scaleType: options.categoryAxisScaleType,
                axisDisplayUnits: options.categoryAxisDisplayUnits
            });
            xAxisProperties.axisLabel = metaDataColumn.displayName;

            return xAxisProperties;
        }

        private calculateAxesProperties1(
            viewportIn: IViewport, options: GanttCalculateScaleAndDomainOptions, axisLength: number,
            metaDataColumn: DataViewMetadataColumn): IAxisProperties {
            let xAxisProperties1: IAxisProperties;
            xAxisProperties1 = AxisHelper.createAxis({
                pixelSpan: viewportIn.width,
                dataDomain: options.forcedXDomain,
                metaDataColumn: metaDataColumn,
                formatString: this.viewModel.dataView.categorical.values[0].source.format,
                outerPadding: 0,
                isScalar: true,
                isVertical: false,
                forcedTickCount: options.forcedTickCount,
                useTickIntervalForDisplayUnits: true,
                isCategoryAxis: true,
                // tslint:disable-next-line:typedef
                getValueFn: (index, type) => {
                    let datatype: string;
                    datatype = this.viewModel.settings.datatype.type;
                    if (datatype === 'Integer') {
                        return index;
                    }
                },
                scaleType: options.categoryAxisScaleType,
                axisDisplayUnits: options.categoryAxisDisplayUnits
            });
            xAxisProperties1.axisLabel = metaDataColumn.displayName;

            return xAxisProperties1;
        }

        private renderAxis(xAxisProperties: IAxisProperties, duration: number = Gantt.defaultDuration): void {
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.orient('bottom');

            this.axisGroup
                .call(xAxis);
        }

        private rendergrids(xAxisProperties: IAxisProperties, totaltasks: number): void {
            let taskGridLinesShow: boolean;
            let taskGridLinesInterval: number;
            let taskGridLinesColor: string;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            this.gridGroup.selectAll('*').remove();
            let xAxis: d3.svg.Axis;
            xAxis = xAxisProperties.axis;
            xAxis.tickSize(this.getTodayLineLength(totaltasks));

            if (taskGridLinesShow) {
                this.gridGroup
                    .call(xAxis);

                this.gridGroup.selectAll('line').style({ stroke: taskGridLinesColor });
                this.gridGroup.selectAll('text').remove();
                for (let i: number = 0; i < xAxisProperties.values.length; i++) {
                    if (i % taskGridLinesInterval !== 0) {
                        d3.select(this.gridGroup.selectAll('line')[0][i]).attr('visibility', 'hidden');
                    }
                }
            }

            this.gridGroup.selectAll('line').attr({
                y1: -20   // to extend the line
            });
        }

        /**
         * Get task labels values
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getLabelValuesNew(value: string, property: string, width: number): string {
            let imageString: string;
            let classNAme: string;
            imageString = '';
            classNAme = '';

            if (property === 'text') {
                let taskName: string;
                taskName = value ? value : '';
                if (taskName.length > width) {
                    return taskName.substring(0, width) + ellipsisLiteral;
                }

                return taskName;
            }

            return value ? value : '';
        }

        /**
         * Get KPI labels values
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getKPIValues(kpiValue: KPIValues, property: string): string {
            let singleTask: string = kpiValue.value ? kpiValue.value.toString() : '';
            if (property === 'text') {
                if (singleTask.length > 8) {
                    singleTask = singleTask.substring(0, 8) + ellipsisLiteral;
                }

                return singleTask;
            } else if (property === 'title') {
                return singleTask;
            } else {
                return '';
            }
        }

        /**
         * Get left padding for different levels
         * @param task current task
         * @param property : property name for which the value is required
         * @param width : number of characters to be displayed
         */
        private static getLeftPadding(iDrillLevel: number): number {
            let iCount: number;
            iCount = Gantt.totalDrillLevel;

            return (iDrillLevel - 1) * Gantt.drillLevelPadding;
        }

        /**
         * Update task labels and add its tooltips
         * @param tasks All tasks array
         * @param width The task label width
         */
        private updateTaskLabels(tasks: Task[], width: number): void {
            let axisLabel: Selection<HTMLElement>;
            let columnHeaderColor: string;
            let columnHeaderBgColor: string;
            let columnHeaderFontSize: number;
            let columnHeaderFontFamily: string;
            let columnHeaderOutline: string;
            let dataLabelsFontFamily: string;
            let taskLabelsShow: boolean;
            let taskLabelsColor: string;
            let taskLabelsFontSize: number;
            let taskLabelsFontFamily: string;
            let totalKPIs: number;
            let totalCategories: number;
            let normalizer: number;
            let kpiFontSize: number;
            let kpiFontColor: string;
            let types: string[];
            let typeColor: string;
            let taskResourceShow: boolean;
            let taskResourceColor: string;
            let taskResourceFontSize: number;
            let valueKPI: string;
            let indicatorKPI: string;
            let taskGridLinesShow: boolean;
            let taskGridLinesColor: string;
            let taskGridLinesInterval: number;
            let isTaskLabelHierarchyView: boolean;
            let thisObj: Gantt;
            let barPanelLeft: number;
            let kpiPanelWidth: number;
            let lastRectX: number;

            thisObj = this;
            columnHeaderColor = this.viewModel.settings.columnHeader.fill;
            columnHeaderBgColor = this.viewModel.settings.columnHeader.fill2;
            columnHeaderFontSize = this.viewModel.settings.columnHeader.fontSize;
            columnHeaderFontFamily = this.viewModel.settings.columnHeader.fontFamily;
            columnHeaderOutline = this.viewModel.settings.columnHeader.columnOutline;
            dataLabelsFontFamily = this.viewModel.settings.taskResource.fontFamily;
            taskLabelsShow = this.viewModel.settings.taskLabels.show;
            taskLabelsColor = this.viewModel.settings.taskLabels.fill;
            taskLabelsFontSize = this.viewModel.settings.taskLabels.fontSize;
            taskLabelsFontFamily = this.viewModel.settings.taskLabels.fontFamily;
            totalKPIs = this.viewModel.kpiData.length;
            totalCategories = tasks[0].name.length;
            normalizer = (this.viewModel.settings.taskLabels.fontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize;
            kpiFontSize = 23 * Gantt.maximumNormalizedFontSize / Gantt.maximumFontSize;
            kpiFontColor = '#000';
            this.kpiTitleGroup.selectAll('*').remove();
            this.kpiGroup.selectAll('*').remove();
            this.lineGroup.selectAll('*').remove();
            this.drillAllGroup.selectAll('*').remove();
            this.toggleTaskGroup.selectAll('*').remove();
            this.taskGroup.selectAll('*').remove();
            this.backgroundGroupTask.selectAll('*').remove();
            this.backgroundGroupKPI.selectAll('*').remove();
            this.backgroundGroupBar.selectAll('*').remove();
            types = [];
            typeColor = '';
            taskResourceShow = this.viewModel.settings.taskResource.show;
            taskResourceColor = this.viewModel.settings.taskResource.fill;
            taskResourceFontSize = this.viewModel.settings.taskResource.fontSize;
            valueKPI = this.viewModel.settings.kpiColumnType.value;
            indicatorKPI = this.viewModel.settings.kpiColumnType.indicator;
            taskGridLinesShow = this.viewModel.settings.taskGridlines.show;
            taskGridLinesColor = this.viewModel.settings.taskGridlines.fill;
            taskGridLinesInterval = this.viewModel.settings.taskGridlines.interval;
            isTaskLabelHierarchyView = this.viewModel.settings.taskLabels.isHierarchy;

            let $DrillAllPanel2Class: JQuery;
            $DrillAllPanel2Class = $('.gantt_drillAllPanel2');
            let $KpiTitlePanelClass: JQuery;
            $KpiTitlePanelClass = $('.gantt_kpiTitlePanel');
            let $TaskSvg: JQuery;
            $TaskSvg = $('.gantt_taskSvg');

            $KpiTitlePanelClass.css('background-color', columnHeaderBgColor);
            $DrillAllPanel2Class.css('background-color', columnHeaderBgColor);

            if (columnHeaderOutline === 'none') {
                $KpiTitlePanelClass.css('border-top', 'solid white 0px');
                $DrillAllPanel2Class.css('border-top', 'solid white 0px');
                $KpiTitlePanelClass.css('border-bottom', 'solid white 0px');
                $DrillAllPanel2Class.css('border-bottom', 'solid white 0px');
                $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                $DrillAllPanel2Class.css('border-left', 'solid white 0px');
                $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                $TaskSvg.css('margin-left', '0px');
            } else if (columnHeaderOutline === 'bottomOnly') {
                $KpiTitlePanelClass.css('border-top', 'solid white 0px');
                $DrillAllPanel2Class.css('border-top', 'solid white 0px');
                $KpiTitlePanelClass.css('border-bottom', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-bottom', 'solid #02B8AB 1px');
                $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                $DrillAllPanel2Class.css('border-left', 'solid white 0px');
                $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                $TaskSvg.css('margin-left', '0px');
            } else if (columnHeaderOutline === 'topOnly') {
                $KpiTitlePanelClass.css('border-top', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-top', 'solid #02B8AB 1px');
                $KpiTitlePanelClass.css('border-bottom', 'solid white 0px');
                $DrillAllPanel2Class.css('border-bottom', 'solid white 0px');
                $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                $DrillAllPanel2Class.css('border-left', 'solid white 0px');
                $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                $TaskSvg.css('margin-left', '0px');
            } else if (columnHeaderOutline === 'leftOnly') {
                $KpiTitlePanelClass.css('border-top', 'solid white 0px');
                $DrillAllPanel2Class.css('border-top', 'solid white 0px');
                $KpiTitlePanelClass.css('border-bottom', 'solid white 0px');
                $DrillAllPanel2Class.css('border-bottom', 'solid white 0px');
                $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                $DrillAllPanel2Class.css('border-left', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                $TaskSvg.css('margin-left', '1px');
            } else if (columnHeaderOutline === 'rightOnly') {
                $KpiTitlePanelClass.css('border-top', 'solid white 0px');
                $DrillAllPanel2Class.css('border-top', 'solid white 0px');
                $KpiTitlePanelClass.css('border-bottom', 'solid white 0px');
                $DrillAllPanel2Class.css('border-bottom', 'solid white 0px');
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css('border-right', 'solid #02B8AB 1px');
                    $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                } else {
                    $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                    $DrillAllPanel2Class.css('border-right', 'solid #02B8AB 1px');
                }
                $DrillAllPanel2Class.css('border-left', 'solid white 0px');
                $TaskSvg.css('margin-left', '0px');
            } else if (columnHeaderOutline === 'leftRight') {
                $KpiTitlePanelClass.css('border-top', 'solid white 0px');
                $DrillAllPanel2Class.css('border-top', 'solid white 0px');
                $KpiTitlePanelClass.css('border-bottom', 'solid white 0px');
                $DrillAllPanel2Class.css('border-bottom', 'solid white 0px');
                $KpiTitlePanelClass.css('border-right', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-left', 'solid #02B8AB 1px');
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css('border-right', 'solid #02B8AB 1px');
                    $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                } else {
                    $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                    $DrillAllPanel2Class.css('border-right', 'solid #02B8AB 1px');
                }
                $TaskSvg.css('margin-left', '1px');
            } else if (columnHeaderOutline === 'frame') {
                $KpiTitlePanelClass.css('border-top', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-top', 'solid #02B8AB 1px');
                $KpiTitlePanelClass.css('border-bottom', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-bottom', 'solid #02B8AB 1px');
                $KpiTitlePanelClass.css('border-right', 'solid #02B8AB 1px');
                $DrillAllPanel2Class.css('border-left', 'solid #02B8AB 1px');
                if (Gantt.isKpiPresent) {
                    $KpiTitlePanelClass.css('border-right', 'solid #02B8AB 1px');
                    $DrillAllPanel2Class.css('border-right', 'solid grey 1px');
                } else {
                    $KpiTitlePanelClass.css('border-right', 'solid white 0px');
                    $DrillAllPanel2Class.css('border-right', 'solid #02B8AB 1px');
                }
                $TaskSvg.css('margin-left', '1px');
            }

            let objects: DataViewObjects = null;
            let getJSONString: string;
            let columnWidth: number;
            let columnWidthsArr: number[];
            let taskColumnArr: number[];
            let horizGridX1Arr: number[];
            let horizGridX2Arr: number[];
            let vertGridArr: number[];
            objects = this.viewModel.dataView.metadata.objects;
            columnWidth = 0;
            columnWidthsArr = [];
            taskColumnArr = [];
            horizGridX1Arr = [];
            horizGridX2Arr = [];
            vertGridArr = [];
            getJSONString = getValue<string>(objects, 'categoryColumnsWidth', 'width', 'text');
            let numOfCharsAllowedHeader: number = 0;
            numOfCharsAllowedHeader = Gantt.taskLabelWidth / (Gantt.iHeaderSingleCharWidth * this.viewModel.tasksNew[0].name.length);
            kpiPanelWidth = parseFloat(d3.select('.gantt_kpiPanel').style('left'));

            for (let iIterator: number = 0; iIterator <= 3; iIterator++) {
                columnWidthsArr[iIterator] = 0;
                taskColumnArr[iIterator] = 0;
                horizGridX1Arr[iIterator] = 0;
                horizGridX2Arr[iIterator] = 0;
                vertGridArr[iIterator] = 0;
            }

            for (let jCount: number = 0; jCount < totalCategories; jCount++) {

                objects = this.viewModel.dataView.metadata.objects;
                getJSONString = getValue<string>(objects, 'categoryColumnsWidth', 'width', 'text');
                columnWidth = 0;
                if (getJSONString && getJSONString.length !== 0 && getJSONString.indexOf('text') === -1) {
                    let splittedJSON: string[];
                    let columnName: string;
                    let taskColumnName: string;
                    let horizGridX1: string;
                    let horizGridX2: string;
                    let vertGrid: string;
                    let oSplittedLength: string[];
                    splittedJSON = getJSONString.split(';');
                    columnName = columnLiteral + jCount;
                    taskColumnName = taskColumnLiteral + jCount;
                    horizGridX1 = 'horizontal-line';
                    horizGridX1 += jCount;
                    horizGridX1 += '-x1';
                    horizGridX2 = 'horizontal-line';
                    horizGridX2 += jCount;
                    horizGridX2 += '-x2';
                    vertGrid = verticalLineLiteral + jCount;
                    for (let iIterator: number = 0; iIterator < splittedJSON.length; iIterator++) {
                        if (splittedJSON[iIterator].indexOf(taskColumnName) !== -1) {
                            oSplittedLength = splittedJSON[iIterator].split(':');
                            columnWidth = parseFloat(oSplittedLength[1]);
                            taskColumnArr[jCount] = columnWidth;
                        } else if (splittedJSON[iIterator].indexOf(vertGrid) !== -1) {
                            oSplittedLength = splittedJSON[iIterator].split(':');
                            columnWidth = parseFloat(oSplittedLength[1]);
                            vertGridArr[jCount] = columnWidth;
                        } else if (splittedJSON[iIterator].indexOf(horizGridX1) !== -1) {
                            oSplittedLength = splittedJSON[iIterator].split(':');
                            columnWidth = parseFloat(oSplittedLength[1]);
                            horizGridX1Arr[jCount] = columnWidth;
                        } else if (splittedJSON[iIterator].indexOf(horizGridX2) !== -1) {
                            oSplittedLength = splittedJSON[iIterator].split(':');
                            columnWidth = parseFloat(oSplittedLength[1]);
                            horizGridX2Arr[jCount] = columnWidth;
                        } else if (splittedJSON[iIterator].indexOf(columnName) !== -1) {
                            oSplittedLength = splittedJSON[iIterator].split(':');
                            columnWidth = parseFloat(oSplittedLength[1]);
                            columnWidthsArr[jCount] = columnWidth;
                        }
                    }
                }
                const textElement: Selection<HTMLElement> = this.drillAllGroup.append('text')
                    .attr('class', categoryLiteral + jCount + spaceLiteral + taskColumnLiteral + jCount)
                    .attr('x', 15)
                    .attr('y', 10);

                const sortIconImage: Selection<HTMLElement> = this.drillAllGroup.append('image')
                    .attr('class', 'sortAsc')
                    .attr('class', categoryLiteral + jCount)
                    .attr('id', categoryLiteral + jCount)
                    .attr('y', 10)
                    .attr('height', 7)
                    .attr('width', 7);

                if (Gantt.numberOfCategories !== 1) {
                    if (jCount === 0) {
                        textElement.attr('x', 15);

                        if (Gantt.sortOrder === 'asc' || Gantt.sortLevel !== jCount) {
                            sortIconImage
                                .attr('x', 15)
                                .attr('xlink:href', Gantt.sortAscOrder);
                        } else {
                            sortIconImage
                                .attr('x', 15)
                                .attr('xlink:href', Gantt.sortDescOrder);
                        }
                    } else {
                        textElement.attr('x', taskColumnArr[jCount]);

                        if (Gantt.sortOrder === 'asc' || Gantt.sortLevel !== jCount) {
                            sortIconImage
                                .attr('x', taskColumnArr[jCount])
                                .attr('xlink:href', Gantt.sortAscOrder);
                        } else {
                            sortIconImage
                                .attr('x', taskColumnArr[jCount])
                                .attr('xlink:href', Gantt.sortDescOrder);
                        }
                    }
                } else {
                    textElement.attr('x', taskColumnArr[jCount]);
                    if (Gantt.sortOrder === 'asc' || Gantt.sortLevel !== jCount) {
                        sortIconImage
                            .attr('x', taskColumnArr[jCount])
                            .attr('xlink:href', Gantt.sortAscOrder);
                    } else {
                        sortIconImage
                            .attr('x', taskColumnArr[jCount])
                            .attr('xlink:href', Gantt.sortDescOrder);
                    }
                }
                if (jCount === totalCategories - 1) {
                    kpiPanelWidth = parseInt(d3.select('.gantt_kpiPanel').style('left'), 10);
                    lastRectX = parseInt(d3.select(categoryClassLiteral + jCount).attr('x'), 10);
                    if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                        d3.select(categoryClassLiteral + jCount)
                            .text(Gantt.categoriesTitle[jCount])
                            .style({
                                'font-size': (columnHeaderFontSize * Gantt.maximumNormalizedFontSize) /
                                    Gantt.maximumFontSize + pxLiteral,
                                'font-family': columnHeaderFontFamily,
                                fill: columnHeaderColor,
                                'background-color': columnHeaderBgColor
                            })
                            .call(
                            AxisHelper.LabelLayoutStrategy.clip,
                            100,
                            textMeasurementService.svgEllipsis);
                    } else {
                        d3.select(categoryClassLiteral + jCount)
                            .text(Gantt.categoriesTitle[jCount])
                            .style({
                                'font-size': (columnHeaderFontSize * Gantt.maximumNormalizedFontSize) /
                                    Gantt.maximumFontSize + pxLiteral,
                                'font-family': columnHeaderFontFamily,
                                fill: columnHeaderColor,
                                'background-color': columnHeaderBgColor
                            })
                            .call(
                            AxisHelper.LabelLayoutStrategy.clip,
                            kpiPanelWidth -
                            lastRectX,
                            textMeasurementService.svgEllipsis);
                    }

                } else {
                    if (jCount === 0) {
                        d3.select(categoryClassLiteral + jCount)
                            .text(Gantt.categoriesTitle[jCount])
                            .style({
                                'font-size': (columnHeaderFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                                'font-family': columnHeaderFontFamily,
                                fill: columnHeaderColor,
                                'background-color': columnHeaderBgColor
                            })
                            .call(AxisHelper.LabelLayoutStrategy.clip, columnWidthsArr[jCount] - 15, textMeasurementService.svgEllipsis);
                    } else {
                        d3.select(categoryClassLiteral + jCount)
                            .text(Gantt.categoriesTitle[jCount])
                            .style({
                                'font-size': (columnHeaderFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                                'font-family': columnHeaderFontFamily,
                                fill: columnHeaderColor,
                                'background-color': columnHeaderBgColor
                            })
                            .call(AxisHelper.LabelLayoutStrategy.clip, columnWidthsArr[jCount] - 10, textMeasurementService.svgEllipsis);
                    }

                }

                d3.select(categoryClassLiteral + jCount)
                    .append('title').text(Gantt.getLabelValuesNew(Gantt.categoriesTitle[jCount].toString(), 'text', 50));

                if (jCount !== 0) {
                    let resizer: Selection<HTMLElement>;
                    resizer = this.drillAllGroup.append('rect').classed('gantt_resizer', true).classed(headerCellLiteral + jCount, true);
                    resizer.attr({
                        x: taskColumnArr[jCount] - 10,
                        y: 0,
                        height: '30px',
                        width: '5px',
                        fill: columnHeaderBgColor,
                        columnId: headerCellLiteral + jCount
                    });

                }
            }

            for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                let axisKPILabel: Selection<HTMLElement>;
                axisKPILabel = this.kpiTitleGroup.append('text').classed(Selectors.label.class, true);
                axisKPILabel.attr({
                    x: 3 + (Gantt.kpiLabelWidth / totalKPIs * jCount),
                    y: 15,
                    'font-size': (columnHeaderFontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize + pxLiteral,
                    'font-family': columnHeaderFontFamily,
                    fill: columnHeaderColor,
                    background: columnHeaderBgColor,
                    'stroke-width': Gantt.axisLabelStrokeWidth
                });

                let sKPITitle: string;
                sKPITitle = this.viewModel.kpiData[jCount].name;
                let sFirstWord: string;
                sFirstWord = sKPITitle.substr(0, sKPITitle.indexOf(' '));
                switch (sFirstWord) {
                    case 'First':
                    case 'Last':
                    case 'Earliest':
                    case 'Latest':
                        sKPITitle = sKPITitle.substr(sKPITitle.indexOf(' ') + 1, sKPITitle.length);
                        break;
                    case 'Count':
                    case 'Average':
                    case 'Min':
                    case 'Max':
                    case 'Variance':
                    case 'Median':
                        sKPITitle = sKPITitle.substr(sKPITitle.indexOf(' ') + 4, sKPITitle.length);
                        break;
                    case 'Standard':
                        sKPITitle = sKPITitle.substr(sKPITitle.indexOf(' ') + 14, sKPITitle.length);
                    default:
                }
                let numberOfCharsAllowed: number;
                numberOfCharsAllowed = 75 / (Gantt.iKPIHeaderSingleCharWidth);
                axisKPILabel.text(Gantt.getLabelValuesNew(sKPITitle, 'text', numberOfCharsAllowed));
                axisKPILabel.append('title').text(sKPITitle);

                if (jCount !== 0) {
                    let kpiTitleVerticleLine: Selection<HTMLElement>;
                    kpiTitleVerticleLine = this.kpiTitleGroup.append('line').classed(verticalLineSimpleLiteral, true);
                    kpiTitleVerticleLine.attr({
                        x1: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        y1: 0,
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount),
                        y2: 30,
                        stroke: '#f2f2f2'
                    });

                    let kpiVerticleLine: Selection<HTMLElement>;
                    kpiVerticleLine = this.kpiGroup.append('line').classed(verticalLineSimpleLiteral, true);
                    kpiVerticleLine.attr({
                        x1: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                        y1: 0,
                        x2: (Gantt.kpiLabelWidth / totalKPIs * jCount) - 1,
                        y2: Gantt.currentTasksNumber * chartLineHeight + 8,
                        stroke: '#f2f2f2'
                    });
                }
            }
            let categoryObject: string[];
            categoryObject = [];
            const tasksLength: number = tasks.length;
            let yVal: number = -1;
            let opacityValue: number = 0;
            for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                let currentLevel: Task;
                currentLevel = tasks[tasknumber];
                thisObj = this;
                let regionAttr: string = '';
                let metroAttr: string = '';
                let projectAttr: string = '';
                let trancheAttr: string = '';
                for (let jCount: number = 0; jCount < totalCategories; jCount++) {
                    if (jCount === 0) {
                        regionAttr = tasks[tasknumber].name[jCount];
                    } else if (jCount === 1) {
                        metroAttr = tasks[tasknumber].name[jCount];
                    } else if (jCount === 2) {
                        projectAttr = tasks[tasknumber].name[jCount];
                    } else if (jCount === 3) {
                        trancheAttr = tasks[tasknumber].name[jCount];
                    }
                    if (taskLabelsShow) {
                        if (isTaskLabelHierarchyView) {
                            if (categoryObject[jCount] === tasks[tasknumber].name[jCount] && (totalCategories - 1) !== jCount) {
                                continue;
                            }
                            if (tasknumber !== 0) {
                                axisLabel = this.lineGroup
                                    .append('line')
                                    .classed(horizontalLineSimpleLiteral + jCount, true);
                                let x1Val: number = Gantt.taskLineCoordinateX
                                    + ((Gantt.singleCharacterWidth * this.viewModel.settings.taskLabels.width + 25) * jCount) - 5;

                                if (0 === jCount) {
                                    x1Val -= 10;
                                }
                            }
                        }
                        categoryObject[jCount] = tasks[tasknumber].name[jCount];
                        opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                        if (yVal !== thisObj.getTaskLabelCoordinateY(tasknumber)) {
                            const greyRect: Selection<HTMLElement> = this.lineGroup.append('rect').attr({
                                x: 0,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                                width: $('.gantt_taskSvg').width(),
                                height: 24,
                                fill: '#ccc',
                                class: 'gantt_backgroundRect',
                                opacity: opacityValue
                            });
                            yVal = thisObj.getTaskLabelCoordinateY(tasknumber);
                        }
                        axisLabel = this.lineGroup
                            .append('text')
                            .classed(Selectors.label.class, true).classed('gantt_kpiClass', true);

                        if (jCount === 0) {
                            axisLabel.attr({
                                x: taskColumnArr[jCount],
                                y: this.getTaskLabelCoordinateY(tasknumber),
                                class: Selectors.toggleTask.class + spaceLiteral
                                    + taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                                fill: taskLabelsColor,
                                'stroke-width': Gantt.axisLabelStrokeWidth,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            }).style('font-size', normalizer + pxLiteral).style('font-family', taskLabelsFontFamily);
                        } else {

                            axisLabel.attr({
                                x: taskColumnArr[jCount],
                                y: this.getTaskLabelCoordinateY(tasknumber),
                                class: Selectors.toggleTask.class + spaceLiteral +
                                    taskRowLiteral + tasknumber + spaceLiteral + taskColumnLiteral + jCount,
                                fill: taskLabelsColor,
                                'stroke-width': Gantt.axisLabelStrokeWidth,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            }).style('font-size', normalizer + pxLiteral).style('font-family', taskLabelsFontFamily);
                        }

                        let categoryLabel: string = tasks[tasknumber].name[jCount].toString();

                        if (jCount === 0) {
                            categoryLabel = Gantt.regionValueFormatter.format(tasks[tasknumber].name[jCount]);
                        } else if (jCount === 1) {
                            categoryLabel = Gantt.metroValueFormatter.format(tasks[tasknumber].name[jCount]);
                        } else if (jCount === 2) {
                            categoryLabel = Gantt.projectValueFormatter.format(tasks[tasknumber].name[jCount]);
                        } else if (jCount === 3) {
                            categoryLabel = Gantt.trancheValueFormatter.format(tasks[tasknumber].name[jCount]);
                        }
                        if (categoryLabel === '') {
                            categoryLabel = 'N/A';
                        }

                        if (jCount === totalCategories - 1) {
                            lastRectX = parseInt(d3.select(dotLiteral + categoryLiteral + jCount).attr('x'), 10);
                            if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 1) || lastRectX > barPanelLeft - 1) {
                                axisLabel.text(categoryLabel)
                                    .call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    100,
                                    textMeasurementService.svgEllipsis);
                            } else {
                                axisLabel.text(categoryLabel)
                                    .call(
                                    AxisHelper.LabelLayoutStrategy.clip,
                                    parseInt(d3.select('.gantt_kpiPanel').style('left'), 10) - lastRectX - 10,
                                    textMeasurementService.svgEllipsis);
                            }

                        } else {
                            axisLabel.text(categoryLabel)
                                .call(
                                AxisHelper.LabelLayoutStrategy.clip,
                                columnWidthsArr[jCount] - 20,
                                textMeasurementService.svgEllipsis);
                        }

                        axisLabel.append('title').text(Gantt.getLabelValuesNew(categoryLabel, 'title', width));

                    }
                }

                if (0 !== currentLevel.KPIValues.length) {
                    for (let jCount: number = 0; jCount < totalKPIs; jCount++) {
                        if (jCount === 0) {
                            thisObj.kpiGroup.append('rect').attr({
                                x: 0,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                                height: 24,
                                width: parseInt(d3.select('.gantt_kpiSvg').attr('width'), 10),
                                fill: '#ccc',
                                opacity: opacityValue
                            })
                                .attr('x', 0)
                                .attr('y', thisObj.getTaskLabelCoordinateY(tasknumber) - 17)
                                .attr('height', 24)
                                .attr('width', parseInt(d3.select('.gantt_kpiSvg').attr('width'), 10))
                                .attr('fill', '#ccc');
                        }
                        if (this.viewModel.kpiData[jCount].type.toLowerCase() === 'indicator') {
                            let axisKPILabel: Selection<HTMLElement>;
                            axisKPILabel = thisObj.kpiGroup
                                .append('circle').classed(Selectors.label.class, true)
                                .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);
                            let color: string = kpiFontColor;
                            let text: string = '';
                            let titleText: string;
                            titleText = currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : '';
                            let showCircle: boolean = true;
                            let extraLeftPadding: number = 0;
                            switch (currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : '') {
                                case '1':
                                    color = '#ad1717';
                                    text = 'R';
                                    extraLeftPadding = 1.5;
                                    break;
                                case '2':
                                    color = '#d15d0d';
                                    text = 'O';
                                    extraLeftPadding = 1;
                                    break;
                                case '3':
                                    color = '#ff9d00';
                                    text = 'Y';
                                    extraLeftPadding = 2;

                                    break;
                                case '4':
                                    color = '#116836';
                                    text = 'G';
                                    extraLeftPadding = 0.5;
                                    break;
                                default:
                                    showCircle = false;
                                    break;
                            }

                            if (showCircle) {
                                axisKPILabel.attr({
                                    cx: (Gantt.kpiLabelWidth / totalKPIs * jCount) + 37.5,
                                    cy: thisObj.getTaskLabelCoordinateY(tasknumber) - 4,
                                    r: 8,
                                    fill: color,
                                    'stroke-width': Gantt.axisLabelStrokeWidth,
                                    regionAttr: regionAttr,
                                    metroAttr: metroAttr,
                                    projectAttr: projectAttr,
                                    trancheAttr: trancheAttr
                                }).style('font-size', normalizer + pxLiteral);
                                axisKPILabel.append('title').text(titleText);

                                axisKPILabel = thisObj.kpiGroup.append('text').classed(Selectors.label.class, true);
                                axisKPILabel.attr({
                                    x: (Gantt.kpiLabelWidth / totalKPIs * jCount) + 32.5 + extraLeftPadding,
                                    y: thisObj.getTaskLabelCoordinateY(tasknumber),
                                    fill: '#fff',
                                    'stroke-width': 5,
                                    regionAttr: regionAttr,
                                    metroAttr: metroAttr,
                                    projectAttr: projectAttr,
                                    trancheAttr: trancheAttr
                                }).style('font-size', kpiFontSize + pxLiteral);

                                axisKPILabel.text(text);
                                axisKPILabel.append('title').text(titleText);
                            }
                        } else if (thisObj.viewModel.kpiData[jCount].type.toLowerCase() === 'type') {
                            let axisKPILabel: Selection<HTMLElement>;
                            axisKPILabel = thisObj.kpiGroup
                                .append('rect').classed(Selectors.label.class, true)
                                .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);

                            let color: string;
                            color = '#fff';
                            let text: string = currentLevel.KPIValues[jCount].value ? currentLevel.KPIValues[jCount].value.toString() : '';
                            if (!text) { continue; }
                            let titleText: string;
                            titleText = text;
                            if (-1 === types.indexOf(text)) {
                                types.push(text);
                            }
                            let index: number;
                            index = types.indexOf(text);
                            typeColor = Gantt.typeColors[index % Gantt.typeColors.length];
                            text = text.charAt(0) + text.charAt(-1 !== text.indexOf(' ') ? text.indexOf(' ') + 1 : -1);

                            axisKPILabel.attr({
                                x: Gantt.taskLineCoordinateX + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 9.5,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber) - 12,
                                width: 24,
                                height: 16,
                                fill: typeColor,
                                'stroke-width': Gantt.axisLabelStrokeWidth,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            }).style('font-size', kpiFontSize + pxLiteral);
                            axisKPILabel.append('title').text(titleText);
                            axisKPILabel = thisObj.kpiGroup.append('text').classed(Selectors.label.class, true);
                            axisKPILabel.attr({
                                x: Gantt.taskLineCoordinateX + (Gantt.kpiLabelWidth / totalKPIs * jCount) + 12.5,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber),
                                fill: color,
                                'stroke-width': 5,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            }).style('font-size', kpiFontSize + pxLiteral);

                            axisKPILabel.text(text.toUpperCase());
                            axisKPILabel.append('title').text(titleText);
                        } else {
                            let axisKPILabel: Selection<HTMLElement>;
                            axisKPILabel = thisObj.kpiGroup
                                .append('text').classed(Selectors.label.class, true)
                                .classed(kpiClassLiteral + spaceLiteral + taskRowLiteral + tasknumber, true);

                            let iLeftSpacing: number = 5;
                            if (typeof currentLevel.KPIValues[jCount].value === 'number') {
                                let clippedText: string;
                                clippedText = currentLevel.KPIValues[jCount].value.toString();
                                thisObj.body.append('text')
                                    .text(clippedText)
                                    .classed('singleCharacter', true)
                                    .style({
                                        'font-size': kpiFontSize + pxLiteral,
                                        'font-family': 'Segoe UI'
                                    });
                                let textTotalWidth: number;
                                textTotalWidth = $('.singleCharacter').innerWidth();
                                let numberOfCharactersAllowed: number;
                                numberOfCharactersAllowed = Math.floor(
                                    (Gantt.kpiLabelWidth / totalKPIs) / (textTotalWidth / clippedText.length));
                                if (clippedText.length > numberOfCharactersAllowed) {
                                    $('.singleCharacter').text(clippedText.substring(0, numberOfCharactersAllowed - 2) + ellipsisLiteral);
                                    textTotalWidth = $('.singleCharacter').innerWidth();
                                    let iCount: number = 0;
                                    while (textTotalWidth < width) {
                                        iCount++;
                                        $('.singleCharacter')
                                            .text(clippedText.substring(0, numberOfCharactersAllowed - 2 + iCount) + ellipsisLiteral);
                                        textTotalWidth = $('.singleCharacter').innerWidth();
                                    }
                                } else {
                                    iLeftSpacing = Gantt.kpiLabelWidth / totalKPIs - textTotalWidth - 5;
                                }
                                d3.selectAll('.singleCharacter').remove();
                            }

                            axisKPILabel.attr({
                                x: (Gantt.kpiLabelWidth / totalKPIs * jCount) + iLeftSpacing,
                                y: thisObj.getTaskLabelCoordinateY(tasknumber),
                                fill: kpiFontColor,
                                'stroke-width': Gantt.axisLabelStrokeWidth,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            }).style('font-size', kpiFontSize + pxLiteral);

                            axisKPILabel.text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], 'text'));
                            axisKPILabel.append('title').text(Gantt.getKPIValues(currentLevel.KPIValues[jCount], 'title'));
                        }
                    }
                }
            }
            //Render bars
            if (!Gantt.isDateData) {
                for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                    let currentLevel: Task;
                    currentLevel = tasks[tasknumber];
                    const regionAttr: string = '';
                    const metroAttr: string = '';
                    const projectAttr: string = '';
                    const trancheAttr: string = '';
                    let taskGroupSelection: Selection<HTMLElement>;

                    opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                    const backgroundRectBar: Selection<HTMLElement> = thisObj.backgroundGroupBar.append('rect').attr({
                        x: 0,
                        y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                        height: 24,
                        width: parseInt(d3.select('.gantt_barSvg').attr('width'), 10),
                        fill: '#ccc',
                        opacity: opacityValue
                    });

                    taskGroupSelection = thisObj.taskGroup
                        .append('g')
                        .classed(Selectors.taskGroup.class, true);

                    let taskSelection: Selection<HTMLElement>;
                    taskSelection = taskGroupSelection
                        .append('g')
                        .classed(Selectors.singleTask.class, true);

                    let yPos: number = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                    let xPos: number = 0;
                    let xPosStart: number = 0;
                    let eachPhaseSelection: Selection<Task>;
                    eachPhaseSelection = taskSelection
                        .datum(currentLevel)
                        .append('g')
                        .classed(Selectors.singlePhase.class, true);

                    let taskRect: Selection<Task>;
                    taskRect = eachPhaseSelection
                        .append('rect')
                        .classed(Selectors.taskRect.class, true)
                        .classed(taskRowLiteral + tasknumber, true);

                    if (currentLevel.numEnd !== null || currentLevel.numStart !== null) {
                        // tslint:disable-next-line:no-any
                        if (isNaN(thisObj.taskDurationToWidth1(currentLevel)) || isNaN(thisObj.timeScale(<any>currentLevel.numStart))) {
                            taskRect
                                .attr({
                                    // tslint:disable-next-line:no-any
                                    x: 0,
                                    y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3,
                                    width: 0,
                                    height: Gantt.getBarHeight() / 1.5,
                                    regionAttr: regionAttr,
                                    metroAttr: metroAttr,
                                    projectAttr: projectAttr,
                                    trancheAttr: trancheAttr
                                })
                                .style('fill', currentLevel.color);
                        } else {
                            taskRect
                                .attr({
                                    // tslint:disable-next-line:no-any
                                    x: thisObj.timeScale(<any>currentLevel.numStart),
                                    y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3,
                                    width: 0 === thisObj.taskDurationToWidth1(currentLevel) ? 3 :
                                        thisObj.taskDurationToWidth1(currentLevel),
                                    height: Gantt.getBarHeight() / 1.5,
                                    regionAttr: regionAttr,
                                    metroAttr: metroAttr,
                                    projectAttr: projectAttr,
                                    trancheAttr: trancheAttr
                                })
                                .style('fill', currentLevel.color);
                        }

                        yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                        // tslint:disable-next-line:no-any
                        if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                            // tslint:disable-next-line:no-any
                            xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                            // tslint:disable-next-line:no-any
                            xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                        }
                        // tslint:disable-next-line:no-any
                        if (xPos < thisObj.timeScale(<any>currentLevel.numEnd)) {
                            // tslint:disable-next-line:no-any
                            xPos = thisObj.timeScale(<any>currentLevel.numEnd);
                            // tslint:disable-next-line:no-any
                            xPosStart = thisObj.timeScale(<any>currentLevel.numStart);
                        }
                    }
                    thisObj.renderTooltip(eachPhaseSelection);
                    if (currentLevel.numStart === null && currentLevel.numEnd === null) {
                        continue;
                    }
                    let labelnormalizer: number;
                    labelnormalizer = (thisObj.viewModel.settings.taskResource.fontSize * Gantt.maximumNormalizedFontSize)
                        / Gantt.maximumFontSize;
                    if (taskResourceShow) {
                        let taskResource: Selection<HTMLElement>;
                        taskResource = taskSelection
                            .append('text')
                            .classed(Selectors.taskResource.class + spaceLiteral + taskRowLiteral + tasknumber, true);

                        d3.select('body').append('text')
                            .text(currentLevel.resource)
                            .classed('resourceLabelText', true)
                            .style({
                                'font-size': normalizer + pxLiteral,
                                'font-family': dataLabelsFontFamily
                            });

                        let titleWidth: number;
                        titleWidth = $('.resourceLabelText').innerWidth() * 0.7;
                        d3.selectAll('.resourceLabelText').remove();
                        let xPosVal: number = 0;
                        switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                            case 'top':
                                xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                                break;
                            case 'left':
                                xPosVal = ((xPosStart - titleWidth) > 0 ? (xPosStart - titleWidth - 30) : (-20));
                                break;
                            case 'right':
                            default:
                                xPosVal = xPos + 5;
                                break;
                        }
                        taskResource
                            .attr({
                                x: xPosVal,
                                y: yPos + labelnormalizer / 3,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            })
                            .text(currentLevel.resource)
                            .style({
                                fill: taskResourceColor,
                                'font-size': labelnormalizer + pxLiteral,
                                'font-family': dataLabelsFontFamily
                            }).call(
                            AxisHelper.LabelLayoutStrategy.clip,
                            Gantt.defaultValues.ResourceWidth - Gantt.resourceWidthPadding - 20,
                            textMeasurementService.svgEllipsis);
                        taskResource.append('title').text(currentLevel.resource);
                    }
                }
            } else {
                for (let tasknumber: number = 0; tasknumber < tasksLength; tasknumber++) {
                    let currentLevel: Task;
                    currentLevel = tasks[tasknumber];
                    const regionAttr: string = '';
                    const metroAttr: string = '';
                    const projectAttr: string = '';
                    const trancheAttr: string = '';

                    opacityValue = tasknumber % 2 === 0 ? 0.2 : 0.6;
                    const backgroundRectBar: Selection<HTMLElement> = thisObj.backgroundGroupBar.append('rect').attr({
                        x: 0,
                        y: thisObj.getTaskLabelCoordinateY(tasknumber) - 17,
                        height: 24,
                        width: parseInt(d3.select('.gantt_barSvg').attr('width'), 10),
                        fill: '#ccc',
                        opacity: opacityValue
                    });

                    let taskGroupSelection: Selection<HTMLElement>;
                    taskGroupSelection = thisObj.taskGroup
                        .append('g')
                        .classed(Selectors.taskGroup.class, true);

                    let taskSelection: Selection<HTMLElement>;
                    taskSelection = taskGroupSelection
                        .append('g')
                        .classed(Selectors.singleTask.class, true);

                    let yPos: number;
                    yPos = Gantt.getBarYCoordinate(tasknumber) + 13 + Gantt.taskResourcePadding;
                    let xPos: number;
                    xPos = 0;
                    let xPosStart: number;
                    xPosStart = 0;
                    let eachPhaseSelection: Selection<Task>;
                    eachPhaseSelection = taskSelection
                        .datum(currentLevel)
                        .append('g')
                        .classed(Selectors.singlePhase.class, true);

                    let taskRect: Selection<Task>;
                    taskRect = eachPhaseSelection
                        .append('rect')
                        .classed(Selectors.taskRect.class, true)
                        .classed(taskRowLiteral + tasknumber, true);

                    taskRect
                        .attr({
                            x: thisObj.timeScale(currentLevel.start),
                            y: Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 3,
                            width: 0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel),
                            height: Gantt.getBarHeight() / 1.5,
                            regionAttr: regionAttr,
                            metroAttr: metroAttr,
                            projectAttr: projectAttr,
                            trancheAttr: trancheAttr
                        })
                        .style('fill', currentLevel.color);

                    yPos = Gantt.getBarYCoordinate(tasknumber) + Gantt.getBarHeight() / 2 + Gantt.taskResourcePadding;
                    if (xPos < thisObj.timeScale(currentLevel.end)) {
                        xPos = thisObj.timeScale(currentLevel.start) +
                            (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                        xPosStart = thisObj.timeScale(currentLevel.start);
                    }
                    if (xPos < thisObj.timeScale(currentLevel.end)) {
                        xPos = thisObj.timeScale(currentLevel.start) +
                            (0 === thisObj.taskDurationToWidth(currentLevel) ? 3 : thisObj.taskDurationToWidth(currentLevel));
                        xPosStart = thisObj.timeScale(currentLevel.start);
                    }

                    thisObj.renderTooltip(eachPhaseSelection);
                    let labelnormalizer: number;
                    labelnormalizer =
                        (thisObj.viewModel.settings.taskResource.fontSize * Gantt.maximumNormalizedFontSize) / Gantt.maximumFontSize;
                    if (taskResourceShow) {
                        let taskResource: Selection<HTMLElement>;
                        taskResource = taskSelection
                            .append('text')
                            .classed(Selectors.taskResource.class + spaceLiteral + taskRowLiteral + tasknumber, true);

                        d3.select('body').append('text')
                            .text(currentLevel.resource)
                            .classed('resourceLabelText', true)
                            .style({
                                'font-size': normalizer + pxLiteral,
                                'font-family': dataLabelsFontFamily
                            });

                        let titleWidth: number;
                        titleWidth = $('.resourceLabelText').innerWidth() * 0.7;
                        d3.selectAll('.resourceLabelText').remove();
                        let xPosVal: number = 0;
                        switch (thisObj.viewModel.settings.taskResource.position.toLowerCase()) {
                            case 'top':
                                xPosVal = ((xPosStart + xPos) / 2) - (titleWidth / 2);
                                break;
                            case 'left':
                                xPosVal = ((xPosStart - titleWidth) > 0 ? (xPosStart - titleWidth - 30) : (-20));
                                break;
                            case 'right':
                            default:
                                xPosVal = xPos + 5;
                                break;
                        }
                        taskResource
                            .attr({
                                x: xPosVal,
                                y: yPos + labelnormalizer / 3,
                                regionAttr: regionAttr,
                                metroAttr: metroAttr,
                                projectAttr: projectAttr,
                                trancheAttr: trancheAttr
                            })
                            .text(currentLevel.resource)
                            .style({
                                fill: taskResourceColor,
                                'font-size': labelnormalizer + pxLiteral,
                                'font-family': dataLabelsFontFamily
                            }).call(
                            AxisHelper.LabelLayoutStrategy.clip,
                            Gantt.defaultValues.ResourceWidth - Gantt.resourceWidthPadding - 20,
                            textMeasurementService.svgEllipsis);
                        taskResource.append('title').text(currentLevel.resource);
                    }
                    let selectionManager: ISelectionManager;
                    selectionManager = this.selectionManager;
                }
            }

            let bars: UpdateSelection<Task>;
            bars = d3.selectAll(dotLiteral + Selectors.taskRect.class).data(tasks);

            bars.on('click', function (d: Task): void {
                // tslint:disable-next-line:no-any
                let sClass: any;
                sClass = this.className;
                let oSplittedClassNames: string[];
                let rowNumber: string;
                oSplittedClassNames = sClass.animVal.split(' ');
                for (let iIterator: number = 0; iIterator < oSplittedClassNames.length; iIterator++) {
                    let className: string;
                    className = oSplittedClassNames[iIterator];
                    if (className.indexOf('task-row') !== -1) {
                        rowNumber = className.substr(8, className.length - 8);
                        $(taskRowClassLiteral + rowNumber).addClass('gantt_higheropacity').removeClass('gantt_loweropacity');
                    }
                }

                thisObj.selectionManager.select(d.selectionId, false).then((ids: ISelectionId[]) => {
                    if (ids.length === 0) {
                        $('.gantt_task-rect').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_toggle-task').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_kpiClass').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_task-resource').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        Gantt.isSelected = false;

                    } else {
                        $('.gantt_task-rect').removeClass('gantt_higheropacity').addClass('gantt_loweropacity');
                        $('.gantt_toggle-task').removeClass('gantt_higheropacity').addClass('gantt_loweropacity');
                        $('.gantt_kpiClass').removeClass('gantt_higheropacity').addClass('gantt_loweropacity');
                        $('.gantt_task-resource').removeClass('gantt_higheropacity').addClass('gantt_loweropacity');

                        let sString: string;
                        sString = '';
                        let sStr: string;
                        sStr = '';
                        if ($('.gantt_task-rect').attr('trancheAttr')) {
                            sString = 'trancheAttr';
                        } else if ($('.gantt_task-rect').attr('projectAttr')) {
                            sString = 'projectAttr';
                        } else if ($('.gantt_task-rect').attr('metroAttr')) {
                            sString = 'metroAttr';
                        } else if ($('.gantt_task-rect').attr('regionAttr')) {
                            sString = 'regionAttr';
                        }
                        if (sString) {
                            sStr = $(this).attr(sString);
                        }
                        $('.gantt_toggle-task').addClass('gantt_loweropacity').removeClass('gantt_higheropacity');
                        $(taskRowClassLiteral + rowNumber).addClass('gantt_higheropacity').removeClass('gantt_loweropacity');
                        Gantt.isSelected = true;
                    }
                });

                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $('#LegendToggleImage');
                if ($LegendToggleImageId.hasClass('visible')) {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
                (<Event>d3.event).stopPropagation();
            });

            let textsHierarchy: Selection<SVGAElement>;
            textsHierarchy = d3.selectAll(dotLiteral + Selectors.toggleTask.class);
            // tslint:disable-next-line:cyclomatic-complexity no-any
            textsHierarchy.on('click', function (d: any): void {
                $('.gantt_toggle-task').addClass('gantt_loweropacity');
                $('.gantt_task-rect').addClass('gantt_loweropacity');
                $('.gantt_kpiClass').addClass('gantt_loweropacity');
                $('.gantt_task-resource').addClass('gantt_loweropacity');

                let sString: string;
                sString = '';
                let sStr: string;
                sStr = '';

                if ($(this).attr('regionAttr') === '') {
                    sString = '';
                } else if ($(this).attr('metroAttr') === '') {
                    sString = 'regionAttr';
                } else if ($(this).attr('projectAttr') === '') {
                    sString = 'metroAttr';
                } else if ($(this).attr('trancheAttr') === '') {
                    sString = 'projectAttr';
                } else {
                    sString = 'trancheAttr';
                }
                sStr = $(this).attr(sString);
                let flag: boolean;
                flag = false;
                let categoryName: string;
                categoryName = $(this).find('title').text();
                let selectedSelID: ISelectionId[];
                selectedSelID = [];
                const tasksLength2: number = tasks.length;
                for (let i: number = 0; i < tasksLength2; i++) {
                    for (let j: number = tasks[0].name.length - 1; j >= 0; j--) {
                        if (!(tasks[i].name[j])) { continue; }
                        let currentcategory: string;
                        if (j === 0) {
                            currentcategory = Gantt.regionValueFormatter.format(tasks[i].name[j]);
                        } else if (j === 1) {
                            currentcategory = Gantt.metroValueFormatter.format(tasks[i].name[j]);
                        } else if (j === 2) {
                            currentcategory = Gantt.projectValueFormatter.format(tasks[i].name[j]);
                        } else {
                            currentcategory = Gantt.trancheValueFormatter.format(tasks[i].name[j]);
                        }
                        let k: number = i;
                        if (currentcategory === categoryName || currentcategory.toString() === categoryName) {
                            if (Gantt.previousSel === categoryName) {
                                for (let m: number = 0; m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; m++) {
                                    Gantt.selectionIdHash[m] = true;
                                    Gantt.previousSel = null;
                                }
                                $('.gantt_toggle-task').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                                $('.gantt_task-rect').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                                $('.gantt_kpiClass').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                                $('.gantt_task-resource').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                                Gantt.isSelected = true;
                            } else {
                                for (let m: number = 0; m < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; m++) {
                                    Gantt.selectionIdHash[m] = false;
                                }
                                k = 0;
                                let categoryLength: number;
                                let categoryValFormatted: string;
                                for (categoryLength =
                                    Gantt.globalOptions.dataViews[0].categorical.categories[j].values.length; k < categoryLength; k++) {
                                    if (j === 0) {
                                        categoryValFormatted = Gantt.regionValueFormatter.format(tasks[k].name[j]);
                                    } else if (j === 1) {
                                        categoryValFormatted = Gantt.metroValueFormatter.format(tasks[k].name[j]);
                                    } else if (j === 2) {
                                        categoryValFormatted = Gantt.projectValueFormatter.format(tasks[k].name[j]);
                                    } else {
                                        categoryValFormatted = Gantt.trancheValueFormatter.format(tasks[k].name[j]);
                                    }
                                    if (categoryValFormatted === categoryName || categoryValFormatted.toString() === categoryName) {
                                        Gantt.selectionIdHash[k] = true;
                                    }
                                }
                                Gantt.previousSel = currentcategory.toString();
                            }
                            flag = true;
                        }
                        if (flag) { break; }
                    }
                    if (flag) { break; }
                }

                selectedSelID = [];
                for (let i: number = 0; i < Gantt.globalOptions.dataViews[0].categorical.categories[0].values.length; i++) {
                    if (Gantt.selectionIdHash[i] && selectionIds[i]) {
                        selectedSelID.push(selectionIds[i]);
                        $(taskRowClassLiteral + i).addClass('gantt_higheropacity').removeClass('gantt_loweropacity');
                        Gantt.isSelected = true;
                    }
                    if (selectedSelID.length === selectionIds.length || selectedSelID.length === 0) {
                        Gantt.isSelected = false;
                    }
                }
                thisObj.selectionManager.select(selectedSelID).then((ids: ISelectionId[]) => {
                    if (ids.length === 0) {
                        $('.gantt_task-rect').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_toggle-task').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_kpiClass').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        $('.gantt_task-resource').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                        Gantt.isSelected = false;
                    }
                });

                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $('#LegendToggleImage');
                if ($LegendToggleImageId.hasClass('visible')) {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
                (<Event>d3.event).stopPropagation();
            });

            d3.select('html').on('click', function (): void {
                if (!Gantt.isSelected) {
                    (<Event>d3.event).stopPropagation();
                } else {
                    thisObj.selectionManager.clear();
                    bars.attr({
                        opacity: 1
                    });
                    $('.gantt_toggle-task').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                    $('.gantt_task-rect').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                    $('.gantt_kpiClass').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                    $('.gantt_task-resource').removeClass('gantt_loweropacity').addClass('gantt_higheropacity');
                    Gantt.isSelected = false;
                }

                let $LegendToggleImageId: JQuery;
                $LegendToggleImageId = $('#LegendToggleImage');
                if ($LegendToggleImageId.hasClass('visible')) {
                    $LegendToggleImageId.removeClass('visible').addClass('notVisible');
                    $LegendToggleImageId.attr('href', Gantt.drillDownImage);
                    $('.gantt_legendIndicatorPanel').hide();
                    $('.arrow').hide();
                }
            });

            bars.exit()
                .remove();

            let taskPanelWidth: number;
            taskPanelWidth = $('.gantt_taskPanel').width();
            let totalCategoryLength: number;
            totalCategoryLength = this.viewModel.tasksNew[0].name.length;
            lastRectX = parseFloat($(headerCellClassLiteral + (totalCategoryLength - 1)).attr('x'));
            barPanelLeft = parseFloat(d3.select('.gantt_barPanel').style('left'));
            kpiPanelWidth = parseFloat(d3.select('.gantt_kpiPanel').style('left'));

            d3.select(dotLiteral + Selectors.bottomTaskDiv.class).style({
                width: PixelConverter.toString(taskPanelWidth)
            });

            d3.select('.gantt_drillAllPanel2').style('width', PixelConverter.toString(taskPanelWidth));
            if ((kpiPanelWidth > 0 && lastRectX > kpiPanelWidth - 12) || lastRectX > barPanelLeft - 12) {
                d3.select(dotLiteral + Selectors.bottomTaskSvg.class).style({
                    width: PixelConverter.toString(lastRectX + 100)
                });
                d3.select('.gantt_taskSvg').style({
                    width: PixelConverter.toString(lastRectX + 100)
                });
                d3.selectAll('.gantt_backgroundRect').attr({ width: lastRectX + 100 });
                d3.select('.gantt_drillAllSvg2').style({
                    width: PixelConverter.toString(lastRectX + 100)
                });
                d3.selectAll(horizontalLineClassLiteral + (totalCategoryLength - 1)).attr('x2', lastRectX + 100);
            } else {
                d3.select(dotLiteral + Selectors.bottomTaskSvg.class).style({
                    width: PixelConverter.toString(taskPanelWidth)
                });
                d3.select('.gantt_taskSvg').style({
                    width: PixelConverter.toString(taskPanelWidth)
                });
                d3.selectAll('.gantt_backgroundRect').attr({ width: taskPanelWidth });
                d3.select('.gantt_drillAllSvg2').style({
                    width: PixelConverter.toString(taskPanelWidth)
                });
            }
        }

        private drawMilestoneShape(
            selection: Selection<HTMLElement>, xStartPosition: number, yStartPosition: number, index: number, isForLegend: boolean): void {
            let shapeName: string;
            let color: string;
            let size: number;
            let className: string;
            let milestoneShapeSelection: Selection<HTMLElement>;
            let rotateLieral: string;
            let minusLieral: string;
            minusLieral = '-';
            rotateLieral = 'rotate';
            shapeName = Gantt.milestoneShapes[index];
            color = Gantt.milestoneColor[index];
            size = isForLegend ? 16 : Gantt.milestoneSize[index];
            className = isForLegend ? 'gantt_milestoneLegend gantt_milestoneIcon' : 'gantt_actual-milestone';
            switch (shapeName) {
                case 'circle':
                    milestoneShapeSelection = selection.append('circle')
                        .attr({
                            class: className,
                            cx: xStartPosition,
                            cy: yStartPosition + Gantt.getBarHeight() / 2 + Gantt.defaultValues.ProgressBarHeight,
                            r: size / 2,
                            fill: color,
                            stroke: 'black'
                        });
                    break;
                case 'diamond':
                    if (isForLegend) {
                        size -= 4;
                    }
                    milestoneShapeSelection = selection.append('rect')
                        .attr({
                            class: className,
                            x: xStartPosition - size / 2,
                            y: yStartPosition + Gantt.getBarHeight() / 2 + Gantt.defaultValues.ProgressBarHeight - size / 2,
                            width: size,
                            height: size,
                            stroke: 'black',
                            fill: color,
                            transform: rotateLieral + paranthesisStartLiteral + 45 +
                                commaLiteral + (xStartPosition) + commaLiteral + (yStartPosition + Gantt.getBarHeight() / 2 +
                                    Gantt.defaultValues.ProgressBarHeight) + paranthesisEndLiteral
                        });
                    break;
                case 'star':
                    milestoneShapeSelection = selection.append('polygon')
                        .attr({
                            class: className,
                            points: CalculateStarPoints(xStartPosition, yStartPosition + Gantt.getBarHeight() - 8, 5, size / 2, 5),
                            transform: rotateLieral + paranthesisStartLiteral + minusLieral + 17.5 + commaLiteral + (xStartPosition) +
                                commaLiteral + (yStartPosition + Gantt.getBarHeight() - 8) + paranthesisEndLiteral,
                            fill: color,
                            stroke: 'black'
                        });
                    break;
                case 'triangle':
                    milestoneShapeSelection = selection.append('path')
                        .attr({
                            class: className,
                            d: getTriangleCoords(xStartPosition, yStartPosition + Gantt.getBarHeight() - 5, size),
                            fill: color,
                            stroke: 'black'
                        });
                    break;
                default:
            }

            if (isForLegend) {
                milestoneShapeSelection.attr({
                    'data-milestonenamelegend': Gantt.milestoneNames[index]
                });
            } else {
                milestoneShapeSelection.attr({
                    'data-milestonename': Gantt.milestoneNames[index]
                });
            }

            function getTriangleCoords(xStart: number, yStart: number, length: number): string {
                let x1: number;
                let x2: number;
                let x3: number;
                let y1: number;
                let y2: number;
                let y3: number;
                let mLiteral: string;
                let lLiteral: string;
                let zLiteral: string;
                x1 = xStart - length / 2;
                y1 = yStart;
                x2 = xStart + length / 2;
                y2 = yStart;
                x3 = xStart;
                y3 = yStart - length / 2;
                mLiteral = 'M';
                lLiteral = 'L';
                zLiteral = 'Z';

                return mLiteral + x1 + spaceLiteral + y1 + spaceLiteral + lLiteral + x2 +
                    spaceLiteral + y2 + spaceLiteral + lLiteral + x3 + spaceLiteral + y3 + spaceLiteral + zLiteral;
            }

            function CalculateStarPoints(centerX: number, centerY: number, arms: number, outerRadius: number, innerRadius: number): string {
                let results: string;
                results = '';
                let angle: number;
                angle = Math.PI / arms;
                let i: number;
                for (i = 0; i < 2 * arms; i++) {
                    let r: number;
                    r = (i % 2) === 0 ? outerRadius : innerRadius;
                    let currX: number;
                    currX = centerX + Math.cos(i * angle) * r;
                    let currY: number;
                    currY = centerY + Math.sin(i * angle) * r;

                    if (i === 0) {
                        results = currX + commaLiteral + currY;
                    } else {
                        results += commaLiteral + spaceLiteral + currX + commaLiteral + currY;
                    }
                }

                return results;
            }
        }

        private static getMilestoneIcon(phaseName: string): number {
            let milestoneIndex: number = Gantt.milestoneNames.indexOf(phaseName);
            if (-1 === milestoneIndex || milestoneIndex >= Gantt.milestoneShapes.length) {
                milestoneIndex = 0;
            }

            return milestoneIndex;
        }

        /**
         * Returns the matching Y coordinate for a given task index
         * @param taskIndex Task Number
         */
        private getTaskLabelCoordinateY(taskIndex: number): number {
            const fontSize: number = + (this.viewModel.settings.taskLabels.fontSize * Gantt.maximumNormalizedFontSize)
                / Gantt.maximumFontSize;

            return (chartLineHeight * taskIndex) + (Gantt.getBarHeight() +
                Gantt.barHeightMargin - (chartLineHeight - fontSize) / Gantt.chartLineHeightDivider) - 3.5;
        }

        /**
         * Set the task progress bar in the gantt
         * @param lineNumber Line number that represents the task number
         */
        private static getBarYCoordinate(lineNumber: number): number {
            return (chartLineHeight * lineNumber) + (paddingTasks) - 3;
        }

        private static getBarHeight(): number {
            return chartLineHeight / Gantt.chartLineProportion + 8;
        }

        /**
         * convert task duration to width in the time scale
         * @param task The task to convert
         */
        private taskDurationToWidth(task: Task): number {
            if (this.timeScale(task.end) - this.timeScale(task.start) < 0) {
                return 0;
            }

            return this.timeScale(task.end) - this.timeScale(task.start);
        }

        // tslint:disable-next-line:no-any
        private taskDurationToWidth1(task: any): number {
            if (this.timeScale(task.numEnd) - this.timeScale(task.numStart) < 0) {
                return 0;
            }

            return this.timeScale(task.numEnd) - this.timeScale(task.numStart);
        }

        private getTooltipForTodayLine(timestamp: number, milestoneTitle: string): VisualTooltipDataItem[] {
            let today: Date;
            today = new Date();
            let stringDate: string;
            stringDate = (zeroLiteral + (today.getMonth() + 1)).slice(-2)
                + slashLiteral + (zeroLiteral + today.getDate()).slice(-2) +
                slashLiteral + today.getFullYear() + spaceLiteral + (zeroLiteral + today.getHours()).slice(-2) +
                colonLiteral + (zeroLiteral + today.getMinutes()).slice(-2);
            let tooltip: VisualTooltipDataItem[];
            tooltip = [{ displayName: milestoneTitle, value: stringDate }];

            return tooltip;
        }

        /**
         * Create vertical dotted line that represent milestone in the time axis (by default it shows not time)
         * @param tasks All tasks array
         * @param timestamp the milestone to be shown in the time axis (default Date.now())
         */
        private createTodayLine(totalTasks: number, milestoneTitle: string = 'Today', timestamp: number = Date.now()): void {
            let todayDate: string;
            todayDate = new Date().toString();
            let line: Line[];
            line = [{
                x1: this.timeScale(new Date(todayDate)),
                y1: Gantt.milestoneTop,
                x2: this.timeScale(new Date(todayDate)),
                y2: this.getTodayLineLength(totalTasks) + 15,
                tooltipInfo: this.getTooltipForTodayLine(timestamp, milestoneTitle)
            }];

            let chartLineSelection: UpdateSelection<Line>;
            chartLineSelection = this.chartGroup.selectAll(Selectors.chartLine.selector).data(line);
            if (this.viewModel.settings.dateType.enableToday) {
                chartLineSelection
                    .enter()
                    .append('line')
                    .classed(Selectors.chartLine.class, true);
                chartLineSelection.attr({
                    // tslint:disable-next-line:typedef
                    x1: (lines: Line) => lines.x1,
                    // tslint:disable-next-line:typedef
                    y1: (lines: Line) => lines.y1,
                    // tslint:disable-next-line:typedef
                    x2: (lines: Line) => lines.x2,
                    // tslint:disable-next-line:typedef
                    y2: (lines: Line) => lines.y2
                });
                this.renderTooltip(chartLineSelection);
                chartLineSelection.exit().remove();
            } else {
                chartLineSelection.remove();
            }

            // today's indicator
            let xposition: number;
            xposition = this.timeScale(new Date(todayDate)) + 21;
            let yposition: number;
            yposition = 11;
            let trianglewidth: number;
            trianglewidth = 16;
            let x1: number;
            let y1: number;
            let x2: number;
            let y2: number;
            let x3: number;
            let y3: number;
            let mLiteral: string;
            let lLiteral: string;
            let zLiteral: string;
            let minusLiteral: string;
            let rotateLieral: string;
            x1 = xposition;
            y1 = yposition - trianglewidth / 3.5;
            x2 = xposition;
            y2 = yposition + trianglewidth / 3.5;
            x3 = xposition + trianglewidth / 2;
            y3 = yposition;
            mLiteral = 'M';
            lLiteral = 'L';
            zLiteral = 'Z';
            minusLiteral = '-';
            rotateLieral = 'rotate';
            this.todayGroup.selectAll('*').remove();
            if (this.viewModel.settings.dateType.enableToday) {
                let x: number;
                x = this.timeScale(new Date(todayDate)) + 10;
                this.todayindicator = this.todayGroup
                    .append('path')
                    .classed(Selectors.todayIndicator.class, true)
                    .attr({
                        d: mLiteral + x1 + spaceLiteral + y1 + spaceLiteral + lLiteral + x2 + spaceLiteral +
                            y2 + spaceLiteral + lLiteral + x3 + spaceLiteral + y3 + spaceLiteral + zLiteral,
                        transform: rotateLieral + paranthesisStartLiteral + minusLiteral + 90 + commaLiteral +
                            xposition + commaLiteral + yposition + paranthesisEndLiteral
                    })
                    .style({
                        fill: 'red'
                    });
                this.todaytext = this.todayGroup
                    .append('text')
                    .attr({
                        x: this.timeScale(new Date(todayDate)) + 8,
                        y: 20
                    })
                    .text('Today')
                    .classed(Selectors.todayText.class, true);
            }
        }

        // tslint:disable-next-line:no-any
        private renderTooltip(selection: Selection<any>): void {
            this.tooltipServiceWrapper.addTooltip(
                selection,
                (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                    return tooltipEvent.data.tooltipInfo;
                });
        }

        private updateElementsPositions(viewport: IViewport, margin: IMargin): void {
            const taskLabelsWidth: number = this.viewModel.settings.taskLabels.show ? this.viewModel.settings.taskLabels.width : 0;

            this.gridGroup.attr('transform', SVGUtil.translate(margin.left + 18, Gantt.taskLabelsMarginTop)); // added for gridlines
            this.axisGroup.attr('transform', SVGUtil.translate(margin.left + 18, Gantt.taskLabelsMarginTop + 3));
            this.chartGroup.attr('transform', SVGUtil.translate(margin.left + 18, 0));
            this.lineGroup.attr('transform', SVGUtil.translate(0, 0));
            this.bottommilestoneGroup.attr('transform', SVGUtil.translate(margin.left + 18, 0));
            this.todayGroup.attr('transform', SVGUtil.translate(18, 0));
            this.drillAllGroup.attr('transform', SVGUtil.translate(0, 5));
            this.legendGroup.attr('transform', SVGUtil.translate(0, 0));
        }

        private getTodayLineLength(numOfTasks: number): number {
            return numOfTasks * chartLineHeight;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            if (!this.viewModel ||
                !this.viewModel.settings) {
                return [];
            }
            let settings: IGanttSettings;
            settings = this.viewModel.settings;
            switch (options.objectName) {
                case 'legend': {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateLegend(settings);
                    } else {
                        return null;
                    }
                }
                case 'taskLabels': {
                    return Gantt.enumerateTaskLabels(settings);
                }
                case 'columnHeader': {
                    return Gantt.enumerateColumnHeader(settings);
                }
                case 'taskResource': {
                    if (Gantt.isChartHasDataLabels(this.viewModel.dataView)) {
                        return Gantt.enumerateTaskResource(settings);
                    } else {
                        return null;
                    }
                }
                case 'dateType': {
                    if (Gantt.isDateData) {
                        return Gantt.enumerateDateType(settings);
                    }

                    return null;
                }
                case 'scrollPosition': {
                    return Gantt.enumerateScrollPosition(settings);
                }
                case 'kpiColumnType': {
                    if (Gantt.isKpiPresent) {
                        return Gantt.enumerateKPIColumnTypePosition(settings, this.viewModel.kpiData);
                    } else {
                        return null;
                    }
                }
                case 'taskGridlines': {
                    return Gantt.enumerateTaskGridLines(settings);
                }
                case 'displayRatio': {
                    return Gantt.enumerateDisplayRatio(settings);
                }
                case 'barColor': {
                    return Gantt.enumerateBarColor(settings);
                }
                default: {
                    return [];
                }
            }
        }

        private static enumerateLegend(settings: IGanttSettings): VisualObjectInstance[] {
            const legendSettings: ILegendSettings = settings.legend;
            const instances: VisualObjectInstance[] = [{
                objectName: 'legend',
                displayName: 'Legend',
                selector: null,
                properties: {
                    show: legendSettings.show
                }
            }];

            return instances;
        }

        private static enumerateBarColor(settings: IGanttSettings): VisualObjectInstance[] {
            const barSettings: IBarColor = settings.barColor;
            const limiter: number = this.viewModelNew.tasksNew.length;
            const instances: VisualObjectInstance[] = [];

            if (settings.barColor.showall) {
                instances.push({
                    objectName: 'barColor',
                    displayName: `Show All`,
                    properties: {
                    showall: settings.barColor.showall
                    },
                    selector: null
                });
                for (let iterator: number  = 0; iterator < limiter; iterator++) {
                    instances.push({
                        objectName: 'barColor',
                        displayName: `Bar ${iterator + 1}`,
                        properties: {
                        fillColor: this.viewModelNew.tasksNew[iterator].color
                        },
                        selector: this.viewModelNew.tasksNew[iterator].selectionId.getSelector()
                    });
                }
            } else {
                instances.push({
                    objectName: 'barColor',
                    displayName: `Default color`,
                    properties: {
                    defaultColor: settings.barColor.defaultColor
                    },
                    selector: null
                });

                instances.push({
                    objectName: 'barColor',
                    displayName: `Show All`,
                    properties: {
                    showall: settings.barColor.showall
                    },
                    selector: null
                });

            }

            return instances;
        }

        private static enumerateTaskLabels(settings: IGanttSettings): VisualObjectInstance[] {
            const taskLabelsSettings: ITaskLabelsSettings = settings.taskLabels;
            const instances: VisualObjectInstance[] = [{
                objectName: 'taskLabels',
                displayName: 'Category Labels',
                selector: null,
                properties: {
                    show: taskLabelsSettings.show,
                    fill: taskLabelsSettings.fill,
                    fontSize: taskLabelsSettings.fontSize,
                    fontFamily: taskLabelsSettings.fontFamily,
                    isExpanded: taskLabelsSettings.isExpanded,
                    isHierarchy: taskLabelsSettings.isHierarchy
                }
            }];

            instances[0].properties = {
                show: taskLabelsSettings.show,
                fill: taskLabelsSettings.fill,
                fontSize: taskLabelsSettings.fontSize,
                fontFamily: taskLabelsSettings.fontFamily,
                isExpanded: taskLabelsSettings.isExpanded,
                isHierarchy: taskLabelsSettings.isHierarchy

            };

            return instances;
        }

        private static enumerateColumnHeader(settings: IGanttSettings): VisualObjectInstance[] {
            const columnHeaderSettings: IColumnHeaderSettings = settings.columnHeader;
            const instances: VisualObjectInstance[] = [{
                objectName: 'columnHeader',
                displayName: 'Column Header',
                selector: null,
                properties: {
                    fill: columnHeaderSettings.fill,
                    fill2: columnHeaderSettings.fill2,
                    columnOutline: columnHeaderSettings.columnOutline,
                    fontFamily: columnHeaderSettings.fontFamily,
                    fontSize: columnHeaderSettings.fontSize
                }
            }];

            return instances;
        }

        private static enumerateTaskResource(settings: IGanttSettings): VisualObjectInstance[] {
            const taskResourceSettings: ITaskResourceSettings = settings.taskResource;
            const instances: VisualObjectInstance[] = [{
                objectName: 'taskResource',
                displayName: 'Data Labels',
                selector: null,
                properties: {
                    show: taskResourceSettings.show,
                    position: taskResourceSettings.position,
                    fill: taskResourceSettings.fill,
                    fontSize: taskResourceSettings.fontSize,
                    fontFamily: taskResourceSettings.fontFamily
                }
            }];

            return instances;
        }

        private static enumerateTaskGridLines(settings: IGanttSettings): VisualObjectInstance[] {
            const taskGridLinesSettings: ITaskGridLinesSettings = settings.taskGridlines;
            const instances: VisualObjectInstance[] = [{
                objectName: 'taskGridLines',
                displayName: 'Grid Lines',
                selector: null,
                properties: {
                    show: taskGridLinesSettings.show,
                    fill: taskGridLinesSettings.fill,
                    interval: taskGridLinesSettings.interval
                }
            }];

            return instances;
        }

        private static enumerateDateType(settings: IGanttSettings): VisualObjectInstance[] {
            const dateTypeSettings: IDateTypeSettings = settings.dateType;
            const instances: VisualObjectInstance[] = [{
                objectName: 'dateType',
                displayName: 'Gantt Date Type',
                selector: null,
                properties: {
                    type: dateTypeSettings.type,
                    enableToday: dateTypeSettings.enableToday
                }
            }];

            return instances;
        }

        private static enumerateKPIColumnTypePosition(settings: IGanttSettings, kpiData: KPIConfig[]): VisualObjectInstance[] {
            const kpiColumnTypeSettings: IKPIColumnTypeSettings = settings.kpiColumnType;
            const instances: VisualObjectInstance[] = [];
            let counter: number;
            for (counter = 0; counter < kpiData.length; counter++) {
                let inst: VisualObjectInstance;
                inst = {
                    objectName: 'kpiColumnType',
                    displayName: kpiData[counter].name,
                    selector: kpiData[counter].identity,
                    properties: {
                        type: kpiData[counter].type
                    }
                };
                instances.push(inst);
            }

            return instances;
        }

        private static enumerateScrollPosition(settings: IGanttSettings): VisualObjectInstance[] {
            const scrollPositionSettings: IScrollPositionSettings = settings.scrollPosition;
            const instances: VisualObjectInstance[] = [{
                objectName: 'scrollPosition',
                displayName: 'Position',
                selector: null,
                properties: {
                }
            }];
            if (Gantt.isDateData) {
                instances[0].properties = {
                    position: scrollPositionSettings.position
                };
            } else {
                instances[0].properties = {
                    position2: scrollPositionSettings.position2
                };
            }

            return instances;
        }

        private static enumerateDisplayRatio(settings: IGanttSettings): VisualObjectInstance[] {
            const displayRatioSettings: IDisplayRatioSettings = settings.displayRatio;
            const instances: VisualObjectInstance[] = [{
                objectName: 'displayRatio',
                displayName: 'ratio',
                selector: null,
                properties: {
                    ratio: displayRatioSettings.ratio
                }
            }];

            return instances;
        }
    }
}
