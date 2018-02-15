/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
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

// 'no-any' used at 83 places because return type is object
module powerbi.extensibility.visual {
    'use strict';
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ISelectionId = powerbi.visuals.ISelectionId;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    interface IDataPoints {
        value: string[];
        index: number;
        selectionId: ISelectionId;
    }

    interface IViewModel {
        dataPoints: IDataPoints[];
        columns: DataViewMetadataColumn[];
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): IViewModel {
        const dataViews: DataView[] = options.dataViews;
        const viewModel: IViewModel = {
            dataPoints: [],
            columns: []
        };

        const category: DataViewCategoryColumn = dataViews[0].categorical.categories[0];
        const rows: DataViewTableRow[] = dataViews[0].table.rows;

        viewModel.columns = dataViews[0].metadata.columns;

        rows.forEach(function (row: DataViewTableRow, index: number): void {

            viewModel.dataPoints.push({
                value: <string[]>row,
                index: index,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, index)
                    .createSelectionId()
            });
        });

        return viewModel;
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;
        private selectionManager: ISelectionManager;
        private host: IVisualHost;
        private viewModel: IViewModel;
        // tslint:disable-next-line:no-any
        private topCont: any;
        // tslint:disable-next-line:no-any
        private mainCont: any;
        // tslint:disable-next-line:no-any
        private xAxisCont: any;
        // tslint:disable-next-line:no-any
        private yAxisCont: any;
        private groupedColumn: number;
        private targetColumn: number;
        private binColumn: number;
        private iColumn: number;
        private jColumn: number;
        private chartType: string;
        private maxValue: number = 0;
        private minValue: number = 0;
        private averageValue: number;
        private numberOfBins: number = 0;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        // tslint:disable-next-line:no-any
        private options: any;
        private iColumntext: number;
        private jColumntext: number;
        private previousLength: number = 0;
        private renderedTime: number = 0;
        private top: number = 40;

        //undo variables
        private groupedColumnOld: number[] = [];
        private targetColumnOld: number[] = [];
        private binColumnOld: number[] = [];
        private chartTypeOld: string[] = [];
        private actions: number[] = [];
        private iColumnold: number[] = [];
        private jColumnOld: number[] = [];
        private iColumntextold: number[] = [];
        private jColumntextOld: number[] = [];

        private margin: number;
        // tslint:disable-next-line:no-any
        private selectionIndexes: any[] = [];
        private dataView: DataView;
        private canUndo: boolean = false;
        private width: number;
        private numberCategory: boolean;
        private maxLineIsOn: boolean;
        private constantLineIsOn: boolean;
        private constantLineValue: string;
        private timesUpdateCalled: number;
        private chartRendered: boolean = false;
        private minLineIsOn: boolean;
        private avgLineIsOn: boolean;
        private maxLineStyle: string;
        private minLineStyle: string;
        private avgLineStyle: string;
        private maxLineFill: string;
        private minLineFill: string;
        private avgLineFill: string;
        private maxLineOpacity: number;
        private minLineOpacity: number;
        private avgLineOpacity: number;
        private maxLineDataLabel: boolean;
        private minLineDataLabel: boolean;
        private avgLineDataLabel: boolean;
        private constantLineStyle: string;
        private constantLineFill: string;
        private constantLineOpacity: number;
        private constantLineDataLabel: boolean;
        private value: string;
        private $mainCont: JQuery;
        private mainContWidth: number;
        private mainContHeight: number;
        private $binningCont: JQuery;
        private $groupingCont: JQuery;
        private $chartTypeMenu: JQuery;
        private $dynamicBinCont: JQuery;
        private $yAxis: JQuery;
        private $xAxis: JQuery;
        private $targetCont: JQuery;
        private $colorCont: JQuery;
        private $colorContShape: JQuery;
        private $colorContText: JQuery;
        private $columnSelector: JQuery;
        private $xAxisLabel: JQuery;
        private $yAxisLabel: JQuery;
        private flag: number = 0;
        private selectedColumnsString: string = '';
        private isCategory: boolean = true;
        private height: number;
        private previousDataLength: number = 0;
        private updateCalled: boolean = false;

        // ColumnSelector
        private dataColIndex: number[] = [];
        // Sorting in Grid
        private gridRow: d3.selection.Update<DataViewTableRow>[] = [];
        // tslint:disable-next-line:no-any
        private binData: any[] = [];
        // Arrays :  value for every bin
        private isSorted: boolean[] = [];
        private isSortAsc: boolean[] = [];
        private sortedColumnIndex: number[] = [];
        private space: string = ' ';
        // Sorting column names in dropdown
        private dropdown: d3.selection.Update<DataViewTableRow>[] = [];
        // Isolated points in Grid
        private keyColumnIndex: number;
        private selectedBins: number[] = [];
        private type: boolean = false;
        // Constants
        private dot: string = '.';
        private px: string = 'px';
        private prevChartType: string;
        private undoPressed: boolean = false;

        // Formatters
        //Value Formatter Creation
        private targetColumnformatter: IValueFormatter ;
        private binColumnformatter: IValueFormatter ;

        private dataPaneColumns : DataViewMetadataColumn[] = [];

        // Add colors to this array
        private colors: string[][] = [['#330000', '#331900', '#333300', '#193300', '#003300',
            '#003319', '#003333', '#001933', '#000033', '#190033', '#330033', '#330019', '#000000'],
        ['#660000', '#663300', '#666600', '#336600', '#006600', '#006633',
            '#006666', '#003366', '#000066', '#330066', '#660066', '#660033', '#202020'],
        ['#990000', '#994C00', '#999900', '#4C9900', '#009900', '#00994C', '#009999',
            '#004C99', '#000099', '#4C0099', '#990099', '#99004C', '#404040'],
        ['#CC0000', '#CC6600', '#CCCC00', '#66CC00', '#00CC00', '#00CC66', '#00CCCC', '#0066CC',
            '#0000CC', '#6600CC', '#CC00CC', '#CC0066', '#606060'],
        ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF',
            '#0080FF', '#0000FF', '#7F00FF', '#FF00FF', '#FF007F', '#808080'],
        ['#FF3333', '#FF9933', '#FFFF33', '#99FF33', '#33FF33', '#33FF99', '#33FFFF', '#3399FF', '#3333FF',
            '#9933FF', '#FF33FF', '#FF3399', '#A0A0A0'],
        ['#FF6666', '#FFB266', '#FFFF66', '#B2FF66', '#66FF66', '#66FFB2', '#66FFFF', '#66B2FF', '#6666FF',
            '#B266FF', '#FF66FF', '#FF66B2', '#C0C0C0'],
        ['#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FF99', '#99FFCC', '#99FFFF', '#99CCFF', '#9999FF', '#CC99FF', '#FF99FF',
            '#FF99CC', '#E0E0E0'],
        ['#FFCCCC', '#FFE5CC', '#FFFFCC', '#E5FFCC', '#CCFFCC', '#CCFFE5', '#CCFFFF', '#CCE5FF', '#CCCCFF', '#E5CCFF', '#FFCCFF',
            '#FFCCE5', '#FFFFFF']];

        private textSize: number;
        private textWidth: number;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.options = options;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                this.host.tooltipService,
                options.element);

            d3.select(this.target).style('cursor', 'default');

            this.topCont = d3.select(this.target).append('div')
                .classed('topCont', true);
            this.mainCont = d3.select(this.target).append('div')
                .classed('mainCont', true);
            this.xAxisCont = d3.select(this.target).append('div')
                .classed('xAxisCont', true);
            this.yAxisCont = d3.select(this.target).append('div')
                .classed('yAxisCont', true);
            this.$mainCont = $('.mainCont');
        }

        // tslint:disable-next-line:no-any
        private renderYAxis(container: any, contClass: any, labelClass: any, columnClass: any): void {
            const thisObj: this = this;

            /*For Y Axis*/
            // tslint:disable-next-line:no-any
            const yAxis: any = container.append('div').classed(`presentationCont ${contClass}`, true);
            if (contClass === 'groupingCont') {
                thisObj.$groupingCont = $('.groupingCont');
                const menuY: JQuery = $('.menuY');
                yAxis.style('left', menuY.position().left + this.px)
                    .style('top', ((menuY.position().top + thisObj.top) + this.px));
            } else {
                thisObj.$yAxis = $('.yAxis');
            }

            // tslint:disable-next-line:no-any
            const columns: any = yAxis.selectAll('p')
                .data(thisObj.viewModel.columns).enter()
                .append('p')
                .attr({
                    class: function (datum: DataViewMetadataColumn, index: number): string {
                        return `dropdown ${columnClass} ${datum.displayName} index${index}`; },
                    'data-id': function (datum: DataViewMetadataColumn, index: number): number { return index; }
                })
                .text(function (datum: DataViewMetadataColumn): string { return datum.displayName; });

            //Sorting the columns in Y Axis dropdown
            thisObj.dropdown = yAxis.selectAll(`.dropdown`).data(thisObj.viewModel.columns);
            thisObj.columnSorter();

            d3.select(`.${labelClass}`).on('click', function (): void {
                if ('yAxis' === contClass) {
                    thisObj.hideMenus(thisObj.$yAxis);
                } else if ('groupingCont' === contClass) {
                    thisObj.hideMenus(thisObj.$groupingCont);
                }
            });

            columns.on('click', function (): void {
                d3.selectAll(`.${columnClass}`).style('border', '0');
                thisObj.cacheOldMenuState();
                if (thisObj.chartType.toLowerCase() === 'bar') {
                    thisObj.groupedColumn = parseInt(d3.select(this).attr('data-id'), 10);
                } else {
                    thisObj.targetColumn = parseInt(d3.select(this).attr('data-id'), 10);
                }
                thisObj.persistOrient();
                thisObj.setOrient(thisObj.options);
                $(`.${contClass}`).hide();
            });

            $('.menuY p').text(thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                thisObj.groupedColumn : thisObj.targetColumn].displayName)
                .attr('title', thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                    thisObj.groupedColumn : thisObj.targetColumn].displayName);

            const names: string[] = thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                thisObj.groupedColumn : thisObj.targetColumn].displayName.split(' ', thisObj.viewModel.columns.length);
            const jointName: string = names.join('.');
            let column: number;
            if (thisObj.chartType.toLowerCase() === 'bar') {
                column = thisObj.groupedColumn;
            } else {
                column = thisObj.targetColumn;
            }

            d3.select(`.${contClass} .${jointName}.index${column}`).style('background-color', '#4c4c4c');
        }

        // tslint:disable-next-line:no-any
        private renderXAxis(container: any, contClass: string, labelClass: string, columnClass: string): void {
            const thisObj: this = this;
            const menuX: JQuery = $('.menuX');

            // tslint:disable-next-line:no-any
            const xAxis: any = container.append('div').classed(`presentationCont ${contClass}`, true);
            if (contClass === 'targetCont') {
                thisObj.$targetCont = $('.targetCont');
                xAxis.style('left', menuX.position().left + this.px)
                    .style('top', ((menuX.position().top + thisObj.top) + this.px));
            } else {
                thisObj.$xAxis = $('.xAxis');
            }
            // tslint:disable-next-line:no-any
            const columns: any = xAxis.selectAll('p')
                .data(thisObj.viewModel.columns).enter()
                .append('p')
                .attr({
                    class: function (datum: DataViewMetadataColumn, index: number): string {
                        return `dropdown ${columnClass} ${datum.displayName} index${index}`; },
                    'data-id': function (datum: DataViewMetadataColumn, index: number): number { return index; }
                })
                .text(function (datum: DataViewMetadataColumn): string { return datum.displayName; });

            // Sorting the columns in X Axis dropdown
            thisObj.dropdown = xAxis.selectAll(`.dropdown`).data(thisObj.viewModel.columns);
            thisObj.columnSorter();

            d3.select(`.${labelClass}`).on('click', function (): void {
                if ('xAxis' === contClass) {
                    thisObj.hideMenus(thisObj.$xAxis);
                } else if ('targetCont' === contClass) {
                    thisObj.hideMenus(thisObj.$targetCont);
                }
            });

            columns.on('click', function (): void {
                d3.selectAll(`.${columnClass}`).style('border', '0');
                thisObj.cacheOldMenuState();
                if (thisObj.chartType.toLowerCase() === 'bar') {
                    thisObj.targetColumn = parseInt(d3.select(this).attr('data-id'), 10);
                } else {
                    thisObj.groupedColumn = parseInt(d3.select(this).attr('data-id'), 10);
                }
                thisObj.persistOrient();
                thisObj.setOrient(thisObj.options);
                $(`.${contClass}`).hide();
            });
            $('.menuX p')
            .text(thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                thisObj.targetColumn : thisObj.groupedColumn].displayName)
                .attr('title', thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                    thisObj.targetColumn : thisObj.groupedColumn].displayName);
            const names: string[] = (thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                thisObj.targetColumn : thisObj.groupedColumn].displayName).split(' ', thisObj.viewModel.columns.length);
            const jointName: string = names.join('.'); let column: number;
            if (thisObj.chartType.toLowerCase() === 'bar') {
                column = thisObj.targetColumn;
            } else {
                column = thisObj.groupedColumn;
            }
            d3.select(`.${contClass} .${jointName}.index${column}`).style('background-color', '#4c4c4c');
        }

        // Function to sort columns in dropdowns
        private columnSorter(): void {
            // tslint:disable-next-line:no-any
            this.dropdown.sort(function (value1: any, value2: any): number {
                // tslint:disable-next-line:no-any
                const val1: any = isNaN(+value1.displayName) ?
                value1.displayName && value1.displayName.toString().toLowerCase() || '' : value1.displayName || '';
                // tslint:disable-next-line:no-any
                const val2: any = isNaN(+value2.displayName) ?
                value2.displayName && value2.displayName.toString().toLowerCase() || '' : value2.displayName || '';
                const result: number = val1 > val2 ? 1 : -1;

                return result;
            });
        }

        private renderMenu(): void {
            d3.select('.topCont').remove();
            let elem: HTMLElement;
            elem = document.createElement('div');
            elem.className = 'topCont';
            $(this.target).prepend(elem);
            const px: string = 'px';

            this.topCont = d3.select('.topCont');

            // Appending the tabs to menu
            const thisObj: this = this;

            d3.selectAll('.presentationCont').remove();

            // Tabs in Menu Pane
            const topMenuItems: string[] = ['View as', 'Binning by', 'X', 'Y',
            'Color', 'Label Color', 'Bin Size', 'Reset', 'Undo' ];
            const menuItemsClassNames: string[] =
                ['ViewAs', 'Binningby', 'X', 'Y', 'Color', 'TextColor', 'RangeforBinning', 'Reset', 'Undo'];
            if (thisObj.chartType === 'Brick') {
                topMenuItems[2] = 'Label';
                topMenuItems[3] = 'Value';
            }

            enum chartTypes { 'Brick', 'Bar', 'Table', 'Column' }

            const chartTypeIcons: string[] = ['brickIcon', 'barIcon', 'gridIcon', 'columnIcon'];
            // Appending the tabs to menu
            // tslint:disable-next-line:no-any
            const topMenu: any = thisObj.topCont.append('ul').classed('presentationCont topMenu', true);
            topMenu.selectAll('li')
                .data(topMenuItems).enter()
                .append('li')
                .attr({
                    class: function (datum: string, index: number): string { return `menu${menuItemsClassNames[index]} topMenuOptions`; },
                    'data-id': function (datum: string, index: number): number { return index; }
                })
                .style('display', 'table')
                .text(function (datum: string): string { return datum; });

            // No drop down icon for last 2 bttons
            for (let iterator: number = 0; iterator < topMenuItems.length - 2; iterator++) {
                topMenu.select(`.menu${menuItemsClassNames[iterator]}.topMenuOptions`)
                    .append('span')
                    .classed('dropdownIcon', true);

            }
            for (let iterator: number = 0; iterator < topMenuItems.length; iterator++) {
                topMenu.select(`.menu${menuItemsClassNames[iterator]}.topMenuOptions`)
                    .append('p')
                    .attr({
                        class: function (datum: string, index: number): string { return `label${index}`; },
                        'data-id': function (datum: string, index: number): number { return index; }
                    });
            }

            //Hide X and Y axis tabs from top menu pane when chart type is table
            if (thisObj.chartType === 'Table') {
                $('li.menuX').hide();
                $('li.menuY').hide();
            } else {
                $('li.menuX').show();
                $('li.menuY').show();
                // Remove column selector when chart type is not table
                $(`.columnSelectorLabel`).remove();
            }

            d3.select('.menuReset')
            .attr('title', 'Reset')
            .on('click', () => {
                thisObj.selectionManager.clear();
                thisObj.renderChart();
            })
            .append('span')
            .classed('reset', true)
            .attr('title', 'Reset');

            if (thisObj.selectionManager.getSelectionIds.length === 0) {
                $('.menuReset').hide();
            }

            d3.select('.menuUndo')
            .classed('undoCont', true)
            .on('click', () => {
                if (thisObj.actions.length === 0) {
                    return;
                }
                const action: number = thisObj.actions.pop();
                if (action === 1) {
                    thisObj.binColumn = thisObj.binColumnOld.pop();
                    thisObj.groupedColumn = thisObj.groupedColumnOld.pop();
                    thisObj.targetColumn = thisObj.targetColumnOld.pop();
                    thisObj.chartType = thisObj.chartTypeOld.pop();
                    thisObj.iColumn = thisObj.iColumnold.pop();
                    thisObj.jColumn = thisObj.jColumnOld.pop();
                    thisObj.iColumntext = thisObj.iColumntextold.pop();
                    thisObj.jColumntext = thisObj.jColumntextOld.pop();
                    thisObj.persistOrient();
                    thisObj.setOrient(this.options);
                }
            })
            .append('span')
            .classed('undo', true)
            .attr('title', 'Undo');

            // Views Menu- Appending Images to Views
            // tslint:disable-next-line:no-any
            const chartTypeCont: any = thisObj.topCont.append('div').classed('presentationCont chartTypeMenu', true);
            thisObj.$chartTypeMenu = $('.chartTypeMenu');

            chartTypeCont.selectAll('.chartTypeMenu')
                .data(chartTypeIcons).enter()
                .append('div')
                .attr({
                    class: function (datum: string, index: number): string { return `imageIcon ${datum} ${chartTypes[index]}`; },
                    'data-id': function (datum: string, index: number): number { return index; },
                    title: function (datum: string, index: number): string { return (`${chartTypes[index]} Chart`); }
                });

            thisObj.$chartTypeMenu.hide();

            d3.select('.menuViewAs').on('click', function (): void {
                thisObj.hideMenus(thisObj.$chartTypeMenu);
            });
            // tslint:disable-next-line:no-any
            const $imageIcon: any = d3.selectAll('.imageIcon');
            d3.select(`.${thisObj.chartType}`).style({ border: '1px solid' });
            $imageIcon.on('click', function (): void {
                $imageIcon.style({ border: '0', 'background-color': 'white' });
                d3.select(this).style({ border: '1px solid' });
                let index: number;
                index = parseInt(d3.select(this).attr('data-id'), 10);
                thisObj.cacheOldMenuState();
                thisObj.chartType = chartTypes[index];
                thisObj.persistOrient();
                thisObj.setOrient(thisObj.options);
            });

            /*For Binning Dropdown*/
            const $menuBinningBy: JQuery = $('.menuBinningby');
            // tslint:disable-next-line:no-any
            const binningCont: any = thisObj.topCont.append('div').classed('presentationCont binningCont', true)
                .style('left', $menuBinningBy.position().left + px)
                .style('top', (($menuBinningBy.position().top + thisObj.top) + px));
            thisObj.$binningCont = $('.binningCont');
            binningCont.selectAll('p')
                .data(thisObj.viewModel.columns).enter()
                .append('p')
                .attr({
                    class: function (datum: DataViewMetadataColumn, index: number): string {
                        return `dropdown binColumn ${datum.displayName} index${index}`;
                    },
                    'data-id': function (datum: DataViewMetadataColumn, index: number): number { return index; }
                })
                .text(function (datum: DataViewMetadataColumn): string { return datum.displayName; });

            //Sorting the columns in binning dropdown
            thisObj.dropdown = binningCont.selectAll(`.dropdown`).data(thisObj.viewModel.columns);
            thisObj.columnSorter();

            binningCont.insert('p', ':first-child').classed('dropdown binColumn none', true).attr('data-id', '-1').text('None');

            d3.select('.menuBinningby').on('click', function (): void {
                thisObj.hideMenus(thisObj.$binningCont);
            });

            d3.selectAll('.binColumn').on('click', function (): void {
                d3.selectAll('.binColumn').style('border', '0');
                thisObj.cacheOldMenuState();
                thisObj.binColumn = parseInt(d3.select(this).attr('data-id'), 10);
                thisObj.persistOrient();
                thisObj.setOrient(thisObj.options);

                thisObj.$binningCont.slideToggle();
            });
            $('.menuBinningby p').text(thisObj.viewModel.columns[thisObj.binColumn] ?
                thisObj.viewModel.columns[thisObj.binColumn].displayName : 'None')
                .attr('title', thisObj.viewModel.columns[thisObj.binColumn] ?
                    thisObj.viewModel.columns[thisObj.binColumn].displayName : 'None');
            if (thisObj.binColumn === -1) {
                d3.select('.binningCont .none').style('background-color', '#4c4c4c');
            } else {

                const names: string[] = thisObj.viewModel.columns[thisObj.binColumn]
                    .displayName.split(' ', thisObj.viewModel.columns.length);
                const jointName: string = names.join('.');
                d3.select(`.binningCont .${jointName}.index${thisObj.binColumn}`)
                .style('background-color', '#4c4c4c');
            }
            /*For Y Axis Dropdown*/
            thisObj.renderYAxis(thisObj.topCont, 'groupingCont', 'menuY', 'groupedColumn');

            /*For X Axis Dropdown*/
            thisObj.renderXAxis(thisObj.topCont, 'targetCont', 'menuX', 'targetColumn');

            /*For Y Axis*/
            thisObj.yAxisCont
                .append('p')
                .classed('presentationCont yAxisLabel', true)
                .style('max-width', `${$('.yAxisCont').height() - 10}px`)
                .append('p')
                .classed('yLabel', true)
                .text(`Y-axis: ${thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
                    thisObj.groupedColumn : thisObj.targetColumn].displayName}`);

            d3.select('.presentationCont.yAxisLabel')
                .append('p')
                .classed('ySymbol', true)
                .text('▼');

            d3.select('.presentationCont.yAxisLabel')
                .style('top', function(): string {
                    // tslint:disable-next-line:no-any
                    const scroll: any = $('.presentationCont.yAxisLabel').height();

                    return `${(thisObj.height / 2) - (scroll /  2)}px`;
                })
                .style('left', '20px')
                .style('width', `${$('.yLabel').width() + $('.ySymbol').width() + 30}px`);

            if ($('.presentationCont.yAxisLabel').width() === ($('.yAxisCont').height() - 10)) {
                    d3.select('.yLabel').style({
                        width: `${$('.yAxisCont').height() - 70}px`,
                        'text-overflow': 'ellipsis',
                        'white-space': 'nowrap',
                        overflow: 'hidden'
                    });
                    d3.select('.presentationCont.yAxisLabel').style('width', `${$('.yLabel').width() + $('.ySymbol').width() + 30}px`);
            }

            thisObj.$yAxisLabel = $('.yAxisLabel');
            thisObj.renderYAxis(thisObj.yAxisCont, 'yAxis', 'yAxisLabel', 'yAxisColumn');

            /*For X Axis*/
            thisObj.xAxisCont
                .append('p')
                .classed('presentationCont xAxisLabel', true)
                .append('p')
                .classed('xLabel', true)
                .text(`X-axis: ${thisObj.viewModel.columns[thisObj.chartType.toLowerCase() === 'bar' ?
               thisObj.targetColumn : thisObj.groupedColumn].displayName}`);

            d3.select('.presentationCont.xAxisLabel')
            .style('margin-left', function(): string {
                const parentWidth: number = $('.presentationCont.xAxisLabel').width();

                return `${(thisObj.width / 2) - (parentWidth /  2) - 40}px`;
            })
            .style('width', `${$('.xLabel').width() + $('.xSymbol').width() + 30}px`)
            .append('p')
                .classed('xSymbol', true)
                .text('▲');

            if ($('.presentationCont.xAxisLabel').width() === ($('.xAxisCont').width() - 40)) {
                d3.select('.xLabel').style({
                    width: `${$('.xAxisCont').width() - 70}px`,
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                    overflow: 'hidden'
                });
                d3.select('.presentationCont.xAxisLabel').style('width', `${$('.xLabel').width() + $('.xSymbol').width() + 30}px`);
            }

            thisObj.$xAxisLabel = $('.xAxisLabel');
            thisObj.renderXAxis(thisObj.xAxisCont, 'xAxis', 'xAxisLabel', 'xAxisColumn');

            d3.select('.menuColor').on('click', function (): void {
                thisObj.hideMenus(thisObj.$colorContShape);
            });

            d3.select('.menuTextColor').on('click', function (): void {
                thisObj.hideMenus(thisObj.$colorContText);
            });

            // Color Palette
            const $menuColor: JQuery = $('.menuColor');
            const $menuTextColor: JQuery = $('.menuTextColor');
            // tslint:disable-next-line:no-any
            const colorCont: any = thisObj.topCont.append('div').classed('colorCont shape', true)
                .style('left', $menuColor.position().left + px)
                .style('top', (($menuColor.position().top + thisObj.top) + px));
            // tslint:disable-next-line:no-any
            const colorCont2: any = thisObj.topCont.append('div').classed('colorCont text', true)
                .style('left', $menuTextColor.position().left + px)
                .style('top', (($menuTextColor.position().top + thisObj.top) + px));
            // tslint:disable-next-line:no-any
            const $colorCont: any = d3.selectAll('.colorCont');
            thisObj.$colorCont = $('.colorCont');
            thisObj.$colorContShape = $('.colorCont.shape');
            thisObj.$colorContText = $('.colorCont.text');
            const nospace: string = '';
            const cellName: string = 'cell';
            let iCounter: number;
            let jCounter: number;
            let kCounter: number;
            kCounter = 0;
            for (iCounter = 0; iCounter < 9; iCounter++) {
                $colorCont.append('tr');
                for (jCounter = 0; jCounter < 13; jCounter++) {
                    $colorCont.append('td').attr('class', cellName + iCounter + jCounter);
                    d3.selectAll(thisObj.dot + cellName + iCounter + jCounter)
                        .style('background-color', thisObj.colors[iCounter][jCounter])
                        .attr({
                            icounter: iCounter,
                            jcounter: jCounter
                        });
                    kCounter++;

                    colorCont.select(thisObj.dot + cellName + iCounter + jCounter)
                        .on('click', function (): void {
                            thisObj.cacheOldMenuState();
                            thisObj.iColumn = parseInt(d3.select(this).attr('icounter'), 10);
                            thisObj.jColumn = parseInt(d3.select(this).attr('jcounter'), 10);
                            thisObj.persistOrient();
                            thisObj.setOrient(thisObj.options);

                        });

                    colorCont2.select(thisObj.dot + cellName + iCounter + jCounter)
                        .on('click', function (): void {
                            thisObj.cacheOldMenuState();
                            thisObj.iColumntext = parseInt(d3.select(this).attr('icounter'), 10);
                            thisObj.jColumntext = parseInt(d3.select(this).attr('jcounter'), 10);
                            thisObj.persistOrient();
                            thisObj.setOrient(thisObj.options);

                        });
                }
            }

            //Highlighting selected colors
            colorCont.select(thisObj.dot + cellName + thisObj.iColumn + thisObj.jColumn)
                .style('border', '2px solid #000');

            colorCont2.select(thisObj.dot + cellName + thisObj.iColumntext + thisObj.jColumntext)
                .style('border', '2px solid #000');

            d3.selectAll('.menuColor p')
            .style('padding-top', '5px')
                .append('tr')
                .append('td')
                .style('height', '5px')
                .style({
                    'background-color': thisObj.colors[thisObj.iColumn][thisObj.jColumn]
                });

            d3.selectAll('.menuTextColor p')
            .style('padding-top', '5px')
                .append('tr')
                .append('td')
                .style('height', '5px')
                .style({
                    'background-color': thisObj.colors[thisObj.iColumntext][thisObj.jColumntext]
                });

            // Dynamic Binning UI part
            d3.select('.menuRangeforBinning').on('click', function (): void {
                thisObj.hideMenus(thisObj.$dynamicBinCont);
            });

            const $menuRangeforBinning: JQuery = $('.menuRangeforBinning');
            // tslint:disable-next-line:no-any
            const dynamicBinCont: any = thisObj.topCont.append('div').classed('dynamicBinCont', true)
                .style('left', $menuRangeforBinning.position().left + px)
                .style('top', (($menuRangeforBinning.position().top + thisObj.top) + px));
            thisObj.$dynamicBinCont = $('.dynamicBinCont');
            const colData: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            dynamicBinCont.selectAll('p')
                .data(colData).enter()
                .append('p')
                .attr({
                    class: function (datum: string, index: number): string { return `col${index + 1}`; },
                    'data-id': function (datum: string, index: number): number { return index + 1; }
                })
                .text(function (datum: string, index: number): number { return (index + 1); })
                .classed('dynamicBinColumn', true);

            d3.selectAll('.dynamicBinColumn').on('click', function (): void {
                d3.selectAll('.dynamicBinColumn').style('border', '0');
                thisObj.numberOfBins = parseInt(d3.select(this).attr('data-id'), 10);
                thisObj.persistOrient();
                thisObj.setOrient(thisObj.options);
                $('.menuRangeforBinning p').text(thisObj.numberOfBins);
                $('.dynamicBinCont').slideToggle();
                d3.select(`.dynamicBinCont .col${thisObj.numberOfBins}`).style('border', '1px solid');
            });
            $('.menuRangeforBinning p').text(thisObj.numberOfBins);
            d3.select(`.dynamicBinCont .col${thisObj.numberOfBins}`).style('background-color', '#4c4c4c');

        }

        private cacheOldMenuState(): void {
            const thisObj: this = this;
            thisObj.groupedColumnOld.push(thisObj.groupedColumn);
            thisObj.targetColumnOld.push(thisObj.targetColumn);
            thisObj.binColumnOld.push(thisObj.binColumn);
            thisObj.chartTypeOld.push(thisObj.chartType);
            thisObj.iColumnold.push(thisObj.iColumn);
            thisObj.jColumnOld.push(thisObj.jColumn);
            thisObj.iColumntextold.push(thisObj.iColumntext);
            thisObj.jColumntextOld.push(thisObj.jColumntext);
            if (!thisObj.type) {
            thisObj.actions.push(1);
            }
        }

        // tslint:disable-next-line:no-any
        private renderBrickChart(data: any, index: number, categories: any,
                                 prevLength: number, chartWidth: number, height: number, marginLeft: number): void {
            let thisObj: this;
            thisObj = this;
            const brick: string = 'brick';
            thisObj.$xAxisLabel.hide();
            thisObj.$yAxisLabel.hide();
            // tslint:disable-next-line:no-any
            const brickChart: any = thisObj.mainCont
                .append('div')
                .attr('class', 'brickChart')
                .style('width', chartWidth + thisObj.px)
                .style('height', Math.max(35 + 16 + 10, height + 5 + 10)  + thisObj.px)
                .style('margin-left', marginLeft + thisObj.px);
            let percentSign: string;
            percentSign = '%';
            let brickWidth: number;
            brickWidth = $('.brickChart').width();

            brickChart.append('label')
                .text(thisObj.returnLabelText(categories[index]));

            let increment: number;
            increment = thisObj.previousDataLength;
            brickChart.selectAll('div')
                .data(data)
                .enter().append('div')
                .classed(`brick index${index}`, true)
                // tslint:disable-next-line:no-any
                .each(function (datum: any): void {
                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bar', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);
                })
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: number): number { return iterator + increment; })
                .style({
                    height: `${thisObj.textSize * 2 - 2}px`,
                    width: `${thisObj.textWidth + 10}px`,
                    'background-color': thisObj.colors[thisObj.iColumn][thisObj.jColumn]
                })
                .append('p')
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): any { return datum[`key`].toString(); })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): any { return datum[`key`].toString().substr(0, 2); })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                .style('transform', 'scale(0)')
                .transition()
                .duration(2000)
                .style('transform', 'scale(1)');

            d3.selectAll(`.brick.index${index}`).append('p')
                .style('right', '1px')
                .style('top', `${thisObj.textSize}px`)
                .classed('brickVal', true)
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string {

                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });
                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                .style('background-color', 'transparent')
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext]);

            d3.selectAll('.brickChart div').style('transform', 'scale(0)').transition().duration(500).style('transform', 'scale(1)');
            brickChart.style('transform', 'scale(0)')
                .transition()
                .duration(1000)
                .style('transform', 'scale(1)');

            // tslint:disable-next-line:no-any
            const allBricks: any = d3.selectAll('.brickChart > div');

            // Cross Filtering
            // tslint:disable-next-line:no-any
            allBricks.on('click', function(d: any): void {
                thisObj.selectionManager.clear();
                $('.menuReset').show();
                thisObj.selectionManager.select(d.values.selectionId, true).then((ids: ISelectionId[]) => {
                    allBricks.style({
                        opacity: 0.5
                    });
                    d3.select(this).style({
                        opacity: 1
                    });
                });
            });
        }

        // tslint:disable-next-line:no-any
        private renderBinBrickChart(data: any, index: number, categories: any,
                                    chartWidth: number, height: number, marginLeft: number): void {
            let thisObj: this;
            thisObj = this;
            const brick: string = 'brick';

            thisObj.$xAxisLabel.hide();
            thisObj.$yAxisLabel.hide();
            // tslint:disable-next-line:no-any
            let brickChart: any;
            brickChart = thisObj.mainCont
                .append('div')
                .attr('class', 'brickChart')
                .style('width', chartWidth + thisObj.px)
                .style('height', Math.max(thisObj.textSize * 2 + 8 + 16 + 10 , height + 5 + 25) + thisObj.px)
                .style('margin-left', marginLeft + thisObj.px);
            let percentSign: string;
            percentSign = '%';
            const $brickChart: JQuery = $('.brickChart');
            const brickChartWidth: number = $brickChart.width();

            brickChart.append('label')
                .text(thisObj.returnLabelText(categories[index]));

            let increment: number;
            increment = thisObj.previousDataLength;
            brickChart.selectAll('div')
                .data(data)
                .enter().append('div')
                .classed(`brick index${index}`, true)
                // tslint:disable-next-line:no-any
                .each(function (datum: any): void {
                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bin', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);

                    // Cross Filtering
                    d3.select(this).on('click', function (): void {

                        thisObj.selectionManager.clear();
                        $('.menuReset').show();
                        // tslint:disable-next-line:no-any
                        const selectionIds: any[] = datum[`values`][`selectionId`];
                        // tslint:disable-next-line:no-any
                        const s: any = [];
                        const columnNumber: number = parseInt(d3.select(this).attr('brick-number'), 10);

                        let iIterator: number;
                        let jIterator: number;
                        for (iIterator = 0; iIterator < selectionIds[columnNumber].length; iIterator++) {
                            for (jIterator = 0; jIterator < selectionIds[columnNumber][iIterator].length; jIterator++) {
                                s.push(selectionIds[columnNumber][iIterator][jIterator]);
                            }
                        }
                        thisObj.selectionManager.select(s, true).then((ids: ISelectionId[]) => {
                            d3.selectAll('.brickChart > div').style({
                                opacity: 0.5
                            });

                            d3.select(this).style({
                                opacity: 1
                            });
                        });
                    });
                })
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: any): any { return iterator + increment; })
                // tslint:disable-next-line:no-any
                .attr('brick-number', function (datum: any, iterator: any): any { return iterator; })
                .style({
                    height: `${thisObj.textSize * 2 - 2}px`,
                    width: `${thisObj.textWidth}px`,
                    'background-color': thisObj.colors[thisObj.iColumn][thisObj.jColumn]
                })
                .append('p')
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): any { return datum[`key`].toString(); })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): any { return datum[`key`].toString().substr(0, 2); })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                .style('transform', 'scale(0)')
                .transition()
                .duration(2000)
                .style('transform', 'scale(1)');

            d3.selectAll(`.brick.index${index}`).append('p')
                .style('right', '1px')
                .style('top', `${thisObj.textSize}px`)
                .classed('brickVal', true)
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string {

                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });

                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                .style('background-color', 'transparent')
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext]);

            if (thisObj.renderedTime === 1) {
                d3.selectAll('.brickChart div')
                    .style('transform', 'scale(0)')
                    .transition().duration(500)
                    .style('transform', 'scale(1)');
            }
            brickChart.style('transform', 'scale(0)')
                .transition()
                .duration(1000)
                .style('transform', 'scale(1)');

        }

        // tslint:disable-next-line:no-any
        private createSelectionBox(parentCont: any, parentClass: any, elementClass: any): void {
            const thisObj : this = this;
            // tslint:disable-next-line:no-any
            d3.selectAll(elementClass).on('click', function(d: any): void {
                thisObj.selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                    d3.selectAll(elementClass).attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });

                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                });

                (<Event>d3.event).stopPropagation();
            });

            return;
        }

        // tslint:disable-next-line:no-any
        private renderBinBarChart(data: any, index: number,
                                  // tslint:disable-next-line:no-any
                                  categories: any, chartWidth: number, chartHeight: number, height: number, marginLeft: number): void {
            let thisObj: this;
            thisObj = this;
            thisObj.isCategory = true;
            // tslint:disable-next-line:no-any
            let chart: any;
            const indexString: string = 'index';
            const len: number = data.length;
            const categoriesLength: number = categories.length;
            // tslint:disable-next-line:no-any
            let subDiv: any;
            const labelHeight: number = 16;
            const labelMarginBottom: number = 10;
            const marginBottom: number = 10;
            const marginBetweenBars: number = 10;
            thisObj.getMaxValue(data);
            const margin: number = 30;

            chart = thisObj.mainCont
                .append('div')
                .attr('class', 'chart borderChart binChart')
                .style({
                    width: chartWidth + thisObj.px,
                    height: height + thisObj.px,
                    'margin-left': marginLeft + thisObj.px
                });
            subDiv = chart.append('div')
                .classed('subDiv', true)
                .classed('innerdiv', true)
                .style({
                    width: chartWidth - 20 + thisObj.px,
                    height: (data.length * 15) + (marginBetweenBars  * data.length) + labelHeight +
                                labelMarginBottom + marginBottom + thisObj.px,
                    padding: '0',
                    margin: '0'
                });
            let increment: number;
            increment = thisObj.previousDataLength;
            const percentSign: string = '%';
            const row: string = 'row';
            subDiv.append('label')
                .classed('label', true)
                .text(thisObj.returnLabelText(categories[index]));

            subDiv.selectAll('div')
                .data(data)
                .enter()
                .append('div')
                .classed(row + index, true)
                // tslint:disable-next-line:no-any
                .style('margin-bottom', function (datum: any, iterator: number): string {
                    if (iterator === data.length - 1) {
                        return '10px';
                    }

                    return '1px';
                })
                .style('margin-bottom', `10px`)
                .style('margin-top', `10px`);

            d3.selectAll(thisObj.dot + row + index)
                .append('p')
                .classed('categoryText', true)
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string { return datum[`key`].toString(); })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    top: `${10 - thisObj.textSize / 2}px`
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string { return datum[`key`].toString(); });

            d3.selectAll(thisObj.dot + row + index).append('div')
                .classed('thebar', true)
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: number): number { return iterator + increment; })
                // tslint:disable-next-line:no-any
                .attr('bar-number', function (datum: any, iterator: number): number { return iterator; })
                // tslint:disable-next-line:no-any
                .each(function (datum: any): any {

                    // tslint:disable-next-line:no-any
                    const value: any = datum[`values`][`value`];
                    if (value > 0) {
                        thisObj.isCategory = false;
                    }

                    d3.select(this)
                        .style('width', datum[`values`][`value`] <= 0 ? `0` :
                        `${(parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth))}px`);

                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bin', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);

                    // Cross Filtering
                    d3.select(this).on('click', function (): void {

                        thisObj.selectionManager.clear();
                        $('.menuReset').show();
                        // tslint:disable-next-line:no-any
                        const selectionIds: any[] = datum[`values`][`selectionId`];
                        // tslint:disable-next-line:no-any
                        const s: any = [];
                        const columnNumber: number = parseInt(d3.select(this).attr('bar-number'), 10);

                        let iIterator: number;
                        let jIterator: number;
                        for (iIterator = 0; iIterator < selectionIds[columnNumber].length; iIterator++) {
                            for (jIterator = 0; jIterator < selectionIds[columnNumber][iIterator].length; jIterator++) {
                                s.push(selectionIds[columnNumber][iIterator][jIterator]);
                            }
                        }
                        thisObj.selectionManager.select(s, true).then((ids: ISelectionId[]) => {
                            d3.selectAll('.subDiv > div > div').style({
                                opacity: 0.5
                            });

                            d3.select(this).style({
                                opacity: 1
                            });
                        });
                    });
                })
                .style('background-color', thisObj.colors[thisObj.iColumn][thisObj.jColumn])
                .style('height', '20px');

            d3.selectAll(thisObj.dot + row + index).append('p')
                .classed('valueText', true)
                // tslint:disable-next-line:no-any
                .each(function (datum: any, indexInner: number): void {
                    const barwidth: number = datum[`values`][`value`] <= 0 ? 0 :
                    (parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth));

                    let displayVal: number;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter[] = [];
                    for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                        const temp: IValueFormatter = ValueFormatter.create({
                            format: thisObj.dataView.metadata.columns[iterator].format,
                            value: displayVal
                        });
                        formatter.push(temp);
                    }

                    tempMeasureData = formatter[thisObj.targetColumn].format(datum[`values`][`value`].toFixed(2));
                    const textProperties: TextProperties = {
                        text: tempMeasureData,
                        fontFamily: thisObj.settings.fontSettings.fontFamily,
                        fontSize: `${thisObj.settings.fontSettings.fontSize}px`
                    };

                    const twidth: number = TextMeasurementService.measureSvgTextWidth(textProperties);
                    d3.select(this)
                        .style('left', datum[`values`][`value`] <= 0 ? '5px' :
                            `${parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth) +
                            (thisObj.value === 'outside' ? 5 : -(((twidth > barwidth) ? barwidth : twidth + 2)))}px`);
                })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    top: `${10 - thisObj.textSize / 2}px`,
                    // tslint:disable-next-line:no-any
                    'max-width': function(datum: any, indexInner: number): string {
                        const barwidth: number = datum[`values`][`value`] <= 0 ? 0 :
                        (parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth));

                        return `${Number(subDiv.style('width').split('p')[0]) - barwidth - 60}px`;
                    },
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis'
                })
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext])
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string {
                    if (datum[`values`][`value`] === 0) {
                        return `0`;
                    }
                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter[] = [];
                    for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                        const temp: IValueFormatter = ValueFormatter.create({
                            format: thisObj.dataView.metadata.columns[iterator].format,
                            value: displayVal
                        });
                        formatter.push(temp);
                    }
                    tempMeasureData = formatter[thisObj.targetColumn].format(datum[`values`][`value`].toFixed(2));

                    const val: number = parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (0.60 * chartWidth);
                    if (thisObj.value === 'inside' && val < 25) {
                        return '';
                    }

                    return tempMeasureData;
                });

            thisObj.renderLines('bar', subDiv, index, data, chartWidth, thisObj.maxValue, thisObj.minValue, thisObj.averageValue);
            if (thisObj.renderedTime === 1) {
                d3.selectAll('.chart .row')
                    .style('transform-origin', '0% 0%')
                    .style('transform', 'scale(0)')
                    .transition()
                    .duration(2000)
                    .style('transform', 'scale(1)');
            }
            chart.style('transform', 'scale(0)')
                .transition()
                .duration(500)
                .style('transform', 'scale(1)');

        }

        private ValueFormatter(valLen: number, tempMeasureData: number): string {
            let displayVal: string;
            const billion: string = 'B';
            const million: string = 'M';
            const thousand: string = 'K';
            if (valLen > 13) {
                displayVal = tempMeasureData.toString().substr(0, 3) + million;
            } else if (valLen === 12) {
                displayVal = tempMeasureData.toString().substr(0, 2) + million;
            } else if (valLen === 11) {
                displayVal = tempMeasureData.toString().substr(0, 1) + billion;
            } else if (valLen === 10) {
                displayVal = tempMeasureData.toString().substr(0, 3) + million;
            } else if (valLen === 9) {
                displayVal = tempMeasureData.toString().substr(0, 2) + million;
            } else if (valLen === 8) {
                displayVal = tempMeasureData.toString().substr(0, 1) + million;
            } else if (valLen === 7) {
                displayVal = tempMeasureData.toString().substr(0, 3) + thousand;
            } else if (valLen === 6) {
                displayVal = tempMeasureData.toString().substr(0, 2) + thousand;
            } else if (valLen === 5) {
                displayVal = tempMeasureData.toString().substr(0, 1) + thousand;
            } else {
                displayVal = tempMeasureData.toString();
            }

            return displayVal;
        }

        // tslint:disable-next-line:no-any
        private getMaxValue(data: any): void {
            let iCounter: number;
            let maxValue: number;
            maxValue = 0;
            let sum: number;
            sum = 0;
            let minValue: number;
            minValue = data[0].values.value;
            for (iCounter = 0; iCounter < data.length; iCounter++) {
                if (data[iCounter].values.value > maxValue) {
                    maxValue = data[iCounter].values.value;
                }
                if (data[iCounter].values.value < minValue) {
                    minValue = data[iCounter].values.value;
                }
                sum = sum + data[iCounter].values.value;

            }
            this.averageValue = sum / data.length;
            this.maxValue = maxValue;
            this.minValue = minValue;
        }

        // tslint:disable-next-line:no-any
        private renderBarChart(data: any, index: number, categories: any, chartWidth: number,
                               chartHeight: number, height: number, marginLeft: number): void {
            const thisObj: this = this;
            thisObj.isCategory = true;
            const indexString: string = 'index';
            // tslint:disable-next-line:no-any
            let subDiv: any;
            const len: number = data.length;
            const categoriesLength: number = categories.length;
            const labelHeight: number = 16;
            const labelMarginBottom: number = 10;
            const marginBottom: number = 10;
            const marginBetweenBars: number = 10;

            thisObj.getMaxValue(data);
            // tslint:disable-next-line:no-any
            let chart: any;

            if (thisObj.binColumn === -1) {
                chart = thisObj.mainCont.append(`div`).classed('chart', true);
                subDiv = chart.append('div')
                .classed('subDiv', true)
                .classed('innerdiv', true)
                .style({
                    width: $('.chart').width() - 20 + thisObj.px,
                    height: (Math.max((data.length * 15) + (marginBetweenBars  * data.length) + labelHeight +
    labelMarginBottom + marginBottom, height)) + thisObj.px,
                    padding: '0',
                    margin: '0'
                });

            } else {
                chart = thisObj.mainCont
                    .append('div')
                    .attr('class', 'chart borderChart')
                    .style({
                        width: chartWidth + thisObj.px,
                        height: height + thisObj.px,
                        'margin-left': marginLeft + thisObj.px
                    });

                subDiv = chart.append('div')
                .classed('subDiv', true)
                .classed('innerdiv', true)
                .style({
                    width: $('.chart').width() - 20 + thisObj.px,
                    height: (data.length * 15) + (marginBetweenBars  * data.length) + labelHeight +
    labelMarginBottom + marginBottom + thisObj.textSize + thisObj.px,
                    padding: '0',
                    margin: '0'
                });
            }
            let percentSign: string;
            percentSign = '%';
            subDiv.append('label')
                .text(thisObj.returnLabelText(categories[index]))
                .attr('title', thisObj.returnLabelText(categories[index]))
                .classed('label', true)
                .style({
                    'margin-bottom': `${thisObj.textSize}px`
                });
            let increment: number;
            increment = thisObj.previousDataLength;
            const row: string = 'row';
            // tslint:disable-next-line:no-any
            let tooltipchart: any;
            tooltipchart = subDiv.selectAll('div')
                .data(data)
                .enter()
                .append('div')
                .classed(row + index, true)
                .classed('row', true)
                .style('margin-bottom', `10px`)
                .style('margin-top', `10px`);

            d3.selectAll(thisObj.dot + row + index)
                .append('p')
                .classed('categoryText', true)
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string { return datum[`key`].toString(); })
                // tslint:disable-next-line:no-any
                .style('margin-bottom', function (datum: any, iterator: number): string {
                    if (iterator === data.length - 1) {
                        return marginBottom + thisObj.px;
                    }

                    return '1px';
                })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    top: `${10 - thisObj.textSize / 2}px`
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string { return datum[`key`].toString(); });

            d3.selectAll(thisObj.dot + row + index)
                .append('div')
                .classed('thebar', true)
                // tslint:disable-next-line:no-any
                .each(function (datum: any): any {
                    const value: number = datum[`values`][`value`];
                    if (value > 0) {
                        thisObj.isCategory = false;
                    }

                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bar', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);
                    d3.select(this)
                        .style('width', datum[`values`][`value`] <= 0 ? `0` :
                        `${(parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth))}px`);
                })
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: number): number { return iterator + increment; })
                .style('background-color', thisObj.colors[thisObj.iColumn][thisObj.jColumn])
                .style('height', '20px');

            d3.selectAll(thisObj.dot + row + index).append('p')
                .classed('valueText', true)
                // tslint:disable-next-line:no-any
                .each(function (datum: any, indexInner: number): void {
                    const barwidth: number = datum[`values`][`value`] <= 0 ? 0 :
                    (parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth));

                    let displayVal: number;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter[] = [];
                    for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                        const temp: IValueFormatter = ValueFormatter.create({
                            format: thisObj.dataView.metadata.columns[iterator].format,
                            value: displayVal
                        });
                        formatter.push(temp);
                    }

                    tempMeasureData = formatter[thisObj.targetColumn].format(datum[`values`][`value`].toFixed(2));
                    const textProperties: TextProperties = {
                        text: tempMeasureData,
                        fontFamily: thisObj.settings.fontSettings.fontFamily,
                        fontSize: `${thisObj.settings.fontSettings.fontSize}px`
                    };

                    const twidth: number = TextMeasurementService.measureSvgTextWidth(textProperties);
                    d3.select(this)
                        .style('left', datum[`values`][`value`] <= 0 ? '5px' :
                            `${parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth) +
                            (thisObj.value === 'outside' ? 5 : -(((twidth > barwidth) ? barwidth : twidth + 2)))}px`);
                })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    top: `${10 - thisObj.textSize / 2}px`,
                    // tslint:disable-next-line:no-any
                    'max-width': function(datum: any, indexInner: number): string {
                        const barwidth: number = datum[`values`][`value`] <= 0 ? 0 :
                        (parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth));

                        return (thisObj.settings.value.displayValue === 'outside' ?
                        `${Number(subDiv.style('width').split('p')[0]) - barwidth - 60}px` : `${barwidth}px`);
                    },
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis'
                })
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext])
                // tslint:disable-next-line:no-any
                .text(function (datum: any): any {
                    if (datum[`values`][`value`] === 0) {
                        return `0`;
                    }
                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter[] = [];
                    for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                        const temp: IValueFormatter = ValueFormatter.create({
                            format: thisObj.dataView.metadata.columns[iterator].format,
                            value: displayVal
                        });
                        formatter.push(temp);
                    }

                    tempMeasureData = formatter[thisObj.targetColumn].format(datum[`values`][`value`].toFixed(2));
                    const val: number = parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth);
                    if (thisObj.value === 'inside' && val < 40) {
                        return '';
                    }

                    return tempMeasureData;
                })
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): any {

                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter[] = [];
                    for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                        const temp: IValueFormatter = ValueFormatter.create({
                            format: thisObj.dataView.metadata.columns[iterator].format,
                            value: displayVal
                        });
                        formatter.push(temp);
                    }

                    tempMeasureData = formatter[thisObj.targetColumn].format(datum[`values`][`value`].toFixed(2));

                    if (datum[`values`][`value`] === 0) {
                        return `0`;
                    }
                    const val: number = parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        (thisObj.binColumn === -1 ? 0.85 : 0.60) * chartWidth);
                    if (thisObj.value === 'inside' && val < 25) {
                        return '';
                    }

                    return tempMeasureData;
                });

            thisObj.renderLines('bar', subDiv, index, data, chartWidth, thisObj.maxValue, thisObj.minValue, thisObj.averageValue);
            //On Load Animation
            d3.selectAll('.chart .row')
                .style('transform-origin', '0% 0%')
                .style('transform', 'scale(0)')
                .transition()
                .duration(2000)
                .style('transform', 'scale(1)');

            chart.style('transform', 'scale(0)')
                .transition()
                .duration(1)
                .style('transform', 'scale(1)');

            // tslint:disable-next-line:no-any
            const allBars: any = d3.selectAll('.subDiv> div > div');
            // Cross Filtering
            // tslint:disable-next-line:no-any
            allBars.on('click', function(d: any): void {
                thisObj.selectionManager.clear();
                $('.menuReset').show();
                thisObj.selectionManager.select(d.values.selectionId, true).then((ids: ISelectionId[]) => {
                    allBars.style({
                        opacity: 0.5
                    });
                    d3.select(this).style({
                        opacity: 1
                    });
                });
            });
        }

        private renderStyles(elementClass: string, styleDivClass: string, stylePClass: string,
                             lineStyle: string, lineFill: string, lineOpacity: number, lineValue: number): void {
            const thisObj: this = this;
            d3.select(thisObj.dot + elementClass).on('mouseover', () => {
                d3.select(thisObj.dot + elementClass)
                    // on hover line should be hightlighted hence 3
                    .style(elementClass.substr(0, 6) === 'column' ? 'border-top' : 'border-right',
                           3 + thisObj.px + thisObj.space + lineStyle + thisObj.space + lineFill);
            });
            d3.select(thisObj.dot + elementClass).on('mouseout', () => {
                d3.select(thisObj.dot + elementClass)
                    .style(elementClass.substr(0, 6) === 'column' ? 'border-top' : 'border-right',
                           1 + thisObj.px + thisObj.space + lineStyle +
                    thisObj.space + lineFill);
            });

            d3.selectAll(thisObj.dot + styleDivClass)
                .style(elementClass.substr(0, 6) === 'column' ? 'border-top' : 'border-right',
                       1 + thisObj.px + thisObj.space + lineStyle + thisObj.space + lineFill)
                .style('opacity', lineOpacity / 100)
                .style('position', 'absolute');

            d3.selectAll(thisObj.dot + stylePClass)
                .style('color', lineFill)
                .style('opacity', lineOpacity / 100);
        }

        private percentOfBar(): number {
            if (this.binColumn === -1) {
                return 0.85;
            }

            return 0.60;
        }

        private returnChartWidth(chartWidth: number): number {
            if (this.binColumn === -1) {
                return 0;
            } else {
                return chartWidth;
            }
        }
        private returnAdditionMargin(): number {
            if (this.binColumn === -1) {
                return -3;
            }

            return 0;
        }

        private returnLabelText(text: string): string {
            if (this.binColumn === -1) {
                return '';
            }
            if (text === null) {
                return 'Null';
            }

            return this.binColumnformatter.format(text);
        }
        private returnDisplayVal(valLen: number): number {
            if (valLen > 9) {
                return 1e9;
            } else if (valLen <= 9 && valLen > 6) {
                return 1e6;
            } else if (valLen <= 6 && valLen >= 4) {
                return 1e3;
            } else {
                return 10;
            }
        }

        private returnMarginForCenter(indexCounter: number, skip: number, chartWidth: number): number {
            return indexCounter % skip === 0 ? (this.mainContWidth - (chartWidth * skip) - (10 * skip)) / 2 : 5;

        }

        // tslint:disable-next-line:no-any
        private returnHeight(categories: any, chartHeight: number): number {
            if (categories >= 3) {
                return this.mainContHeight - 50;
            }

            return chartHeight;
        }

        private returnRenderHeight(subDivHeight: number, labelHeight: number,
                                   labelMarginBottom: number, colValueText: number, categoryHeight: number): number {
            if (this.binColumn === -1) {
                return this.mainContHeight - 30 - labelHeight - labelMarginBottom - colValueText - categoryHeight;
            }

            return subDivHeight - labelHeight - labelMarginBottom - colValueText - categoryHeight;
        }

        // tslint:disable-next-line:no-any
        private renderLines(chartType: string, chart: any, index: number, data: any,
                            chartWidth: number, maxValue: number, minValue: number, averageValue: number): void {
            const thisObj: this = this;
            const extraMargin: number = 5;
            const row: string = 'row';
            // tslint:disable-next-line:no-any
            const $label: any = d3.select('.label');
            // tslint:disable-next-line:no-any
            const $barDiv: any = d3.select('.thebar');
            // tslint:disable-next-line:no-any
            const $currentDiv: any = d3.select(thisObj.dot + row + index);
            const labelMarginBottom: number =
                parseInt(($label.style('margin-bottom').substr(0, $label.style('margin-bottom').length - 2)), 10);
            const labelPaddingTop: number = parseInt(($label.style('padding-top').substr(0, $label.style('padding-top').length - 2)), 10);
            const labelPaddingBottom: number =
                parseInt(($label.style('padding-bottom').substr(0, $label.style('padding-bottom').length - 2)), 10);
            const labelHeight: number = $('.label').height();
            let thebarHeight: number = $(thisObj.dot + row + index).height();
            thebarHeight = 35;
            const labelMarginTop: number = parseInt(($label.style('margin-top').substr(0, $label.style('margin-top').length - 2)), 10);
            const thebarMarginTop: number =
                parseInt(($currentDiv.style('margin-top').substr(0, $barDiv.style('margin-top').length - 2)), 10);
            const thebarMarginBottom: number =
                parseInt(($currentDiv.style('margin-bottom').substr(0, $barDiv.style('margin-bottom').length - 2)), 10);
            const thebarPaddingBottom: number =
                parseInt(($currentDiv.style('padding-bottom').substr(0, $barDiv.style('padding-bottom').length - 2)), 10);
            const thebarPaddingtop: number =
                parseInt(($currentDiv.style('padding-top').substr(0, $barDiv.style('padding-top').length - 2)), 10);
            const top: string = thisObj.binColumn === -1 ? labelHeight + labelMarginBottom + 3 * thebarMarginTop + 10 + thisObj.px
                : labelHeight + labelMarginBottom + 10 + thisObj.px;
            const chartHeight: number =
                labelMarginTop + labelHeight + labelMarginBottom + labelPaddingTop + labelPaddingBottom + thebarMarginTop
                + thebarMarginBottom * data.length + thebarHeight * data.length + thebarPaddingBottom + thebarMarginTop * data.length;

            const maxLine: string = 'maxLine';
            const divMaxLine: string = 'max';
            const pMaxLine: string = 'pMax';
            const divMinLine: string = 'min';
            const pMinLine: string = 'pMin';
            const divAvgLine: string = 'avg';
            const pAvgLine: string = 'pAvg';
            const divConstantLine: string = 'constant';
            const pConstantLine: string = 'pConstant';
            const barPercent: number = thisObj.percentOfBar();
            if (thisObj.maxLineIsOn) {
                chart.append('div')
                    .style('left', thisObj.isCategory ? 0 : barPercent * chartWidth + thisObj.px)
                    .classed(maxLine + index, true)
                    .classed(divMaxLine, true)
                    .style('height', (thebarMarginBottom * data.length)
                    - thebarMarginBottom + (thebarHeight * data.length) + thisObj.px)
                    .style('top', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Max', maxValue, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return top;
                    });
                if (thisObj.maxLineDataLabel) {
                    chart.append('p')
                        .classed(pMaxLine, true)
                        .style('left', barPercent * chartWidth + 45 + thisObj.px)
                        .classed('linesP', true)
                        .attr('title', thisObj.maxValue)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.maxValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.maxValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        })
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            top: `-${((thisObj.textSize / 4) - 25 + thisObj.textSize) }px`,
                            width: `${thisObj.textWidth}px`
                        });
                }
                thisObj.renderStyles(maxLine + index, divMaxLine, pMaxLine, thisObj.maxLineStyle,
                                     thisObj.maxLineFill, thisObj.maxLineOpacity, thisObj.maxValue);
            }
            // Render Min Line
            if (thisObj.minLineIsOn) {
                const minLine: string = 'minLine';
                chart.append('div')
                    .classed(minLine + index, true)
                    .classed(divMinLine, true)
                    .style('left', thisObj.isCategory ? 0 : thisObj.minValue / thisObj.maxValue
                        * barPercent * chartWidth + thisObj.px)
                    .style('height', (thebarMarginBottom * data.length)
                    - thebarMarginBottom + (thebarHeight * data.length) + thisObj.px)
                    .style('top', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Min', minValue, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return top;
                    });
                if (thisObj.minLineDataLabel) {
                    chart.append('p')
                        .classed(pMinLine, true)
                        .style('left', thisObj.minValue / thisObj.maxValue
                        * barPercent * chartWidth + 45 + thisObj.px)
                        .classed('linesP', true)
                        .attr('title', thisObj.minValue)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.minValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.minValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        })
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            top: `-${((thisObj.textSize / 4) - 25 + thisObj.textSize) }px`,
                            width: `${thisObj.textWidth}px`
                        });
                }
                thisObj.renderStyles(minLine + index, divMinLine, pMinLine, thisObj.minLineStyle,
                                     thisObj.minLineFill, thisObj.minLineOpacity, thisObj.minValue);
            }
            // Render Average Line
            if (thisObj.avgLineIsOn) {
                const averageLine: string = 'averageLine';
                chart.append('div')
                    .classed(averageLine + index, true)
                    .classed(divAvgLine, true)
                    .style('left', thisObj.isCategory ? 0 : thisObj.averageValue / thisObj.maxValue
                        * barPercent * chartWidth + thisObj.px)
                    .style('height', (thebarMarginBottom * data.length)
                    - thebarMarginBottom + (thebarHeight * data.length) + thisObj.px)
                    .style('top', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Average', averageValue, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return top;
                    });
                if (thisObj.avgLineDataLabel) {
                    chart.append('p')
                        .classed(pAvgLine, true)
                        .style('left', thisObj.averageValue / thisObj.maxValue
                        * barPercent * chartWidth + 45 + thisObj.px)
                        .classed('linesP', true)
                        .attr('title', thisObj.averageValue)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.averageValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.averageValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        })
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            top: `-${((thisObj.textSize / 4) - 25 + thisObj.textSize) }px`,
                            width: `${thisObj.textWidth}px`
                        });
                }
                thisObj.renderStyles(averageLine + index, divAvgLine, pAvgLine, thisObj.avgLineStyle,
                                     thisObj.avgLineFill, thisObj.avgLineOpacity, thisObj.averageValue);
            }
            // Render Constant Line
            if (thisObj.constantLineIsOn) {
                const constantLine: string = 'constantLine';
                chart.append('div')
                    .classed(divConstantLine, true)
                    .classed(constantLine + index, true)
                    .style('left', thisObj.isCategory ? 0 : parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue
                        * barPercent * chartWidth + thisObj.px)
                    .style('height', (thebarMarginBottom * data.length) - thebarMarginBottom
                    + (thebarHeight * data.length) + thisObj.px)
                    .style('top', top)
                    .each(function (): void {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Constant',
                                                       parseInt(thisObj.constantLineValue, 10), thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);
                    });
                if (thisObj.constantLineDataLabel) {
                    chart.append('p')
                        .classed(pConstantLine, true)
                        .style('left', (parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue)
                        * barPercent * chartWidth + 45 + thisObj.px)
                        .classed('linesP', true)
                        .attr('title', thisObj.constantLineValue)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.constantLineValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.constantLineValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        })
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            top: `-${((thisObj.textSize / 4)  - 25 + thisObj.textSize) }px`,
                            width: `${thisObj.textWidth}px`
                        });
                }
                thisObj.renderStyles(constantLine + index, divConstantLine, pConstantLine, thisObj.constantLineStyle,
                                     thisObj.constantLineFill, thisObj.constantLineOpacity, parseInt(thisObj.constantLineValue, 10));
            }
     }

     // tslint:disable-next-line:cyclomatic-complexity no-any
     private renderBinColumnChart(data: any, index: number, categories: any,
                                  chartWidth: number, chartHeight: number, marginLeft: number): void {
        let thisObj: this;
        thisObj = this;
        let indexString: string;
        thisObj.isCategory = true;
        // tslint:disable-next-line:no-any
        let subDiv: any;
        // tslint:disable-next-line:no-any
        let columnChart: any;
        thisObj.getMaxValue(data);
        let categoriesLength : number;
        categoriesLength = categories.length;
        let subDivHeight: number;
        let subDivWidth: number;
        let increment: number;
        const percentSign: string = '%';
        indexString = 'index';
        const divWidth: number = 50;
        const marginToFirstDiv: number = (thisObj.settings.analytics.maxLineDataLabel || thisObj.settings.analytics.minLineDataLabel ||
                thisObj.settings.analytics.avgLineDataLabel || thisObj.settings.analytics.constantLineDataLabel) ?
                thisObj.textWidth + 20 : 30;
        // tslint:disable-next-line:no-any
        let innerSubDiv: any;
        const firstDivMargin: number = 30;
        columnChart = thisObj.mainCont.append(`div`)
        .classed('columnChart', true)
        .classed('borderChart', true)
        .style({
            width: chartWidth + thisObj.px,
            height: (categories.length <= 3 && chartWidth * categories.length < thisObj.mainContWidth) ? thisObj.mainContHeight - 50 +
            thisObj.px : chartHeight + thisObj.px,
            'margin-left': marginLeft + thisObj.px
        });
        subDiv = columnChart.append('div')
        .classed('subDiv', true)
        .style({
            width: (Math.max((data.length * (divWidth + 4)) + marginToFirstDiv, chartWidth)) + thisObj.px,
            height: $('.borderChart').height() - 20 + thisObj.px,
            padding: '0',
            margin: '0'
        });
        const $subDiv: JQuery = $('.subDiv');
        subDivHeight = $subDiv.height();
        subDivWidth = $subDiv.width();
        subDiv.append('label')
            .text(thisObj.returnLabelText(categories[index]))
            .attr('title', thisObj.returnLabelText(categories[index]))
            .classed('label', true);
        const labelHeight: number = $('.label').height();
        const labelMarginBottom: number =
        parseInt((d3.select('.label').style('margin-bottom').substr(0, d3.select('.label').style('margin-bottom').length - 2)), 10);
        increment = thisObj.previousDataLength;
        innerSubDiv = subDiv.selectAll('div')
            .data(data)
            .enter()
            .append('div')
            .classed('mainColumn', true)
            .style('width', divWidth + thisObj.px)
            // tslint:disable-next-line:no-any
            .style('margin-left', function (datum: any, iterator: number): string {
                if (iterator === 0) {
                    return marginToFirstDiv + thisObj.px;
                }

                return '0';
            })
            .style({
                'margin-right': '4px'
            });
        let renderHeight: number;
        // 15 is height of colValueText and 16 is height of Category
        const colValueText: number = 15;
        const categoryHeight: number = 16;
        renderHeight = thisObj.returnRenderHeight(subDivHeight, labelHeight, labelMarginBottom, colValueText, categoryHeight);

        innerSubDiv.append('p')
            .classed('colValueText', true)
            // tslint:disable-next-line:no-any
            .style('margin-top', function (datum: any): string {
                // tslint:disable-next-line:no-any
                const value: any = datum[`values`][`value`];
                if (value > 0) {
                    thisObj.isCategory = false;
                }
                if (thisObj.binColumn === -1) {
                    return datum[`values`][`value`] <= 0 ? Math.floor(renderHeight) - 5 + thisObj.px :
                        `${Math.floor(renderHeight - (parseInt(datum[`values`][`value`], 10) /
                        thisObj.maxValue * 0.85 * renderHeight)) - thisObj.textSize - 5}px`;
                }

                return datum[`values`][`value`] === 0 ? `${Math.floor(renderHeight - thisObj.textSize)}px`
                    : `${Math.floor(renderHeight - (parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * 0.85 *
                    renderHeight) - thisObj.textSize)}px`;

                })
            .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    height: `${thisObj.textSize}px`
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string {
                    let displayVal: number;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });

                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string {
                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });

                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext]);

        innerSubDiv.append('div')
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: number): number { return iterator + increment; })
                // tslint:disable-next-line:no-any
                .attr('column-number', function (datum: any, iterator: number): number { return iterator; })
                .classed(`colDiv index${index}`, true)
                .style('width', '40px')
                .style('margin-left', '1px')
                // tslint:disable-next-line:no-any
                .style('height', function (datum: any): string {
                    if (thisObj.binColumn === -1) {
                        return datum[`values`][`value`] <= 0 ? `0` :
                        `${Math.floor((parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            0.85 * renderHeight)))}px`;
                    }

                    return datum[`values`][`value`] <= 0 ? `0` :
                    `${Math.floor((parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        0.85 * renderHeight)))}px`;

                })
                // tslint:disable-next-line:no-any
                .each(function (datum: any): void {
                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bar', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);

                    // Cross Filtering
                    d3.select(this).on('click', function (): void {

                        thisObj.selectionManager.clear();
                        $('.menuReset').show();
                        // tslint:disable-next-line:no-any
                        const selectionIds: any[] = datum[`values`][`selectionId`];
                        // tslint:disable-next-line:no-any
                        const s: any = [];
                        const columnNumber: number = parseInt(d3.select(this).attr('column-number'), 10);

                        let iIterator: number;
                        let jIterator: number;
                        for (iIterator = 0; iIterator < selectionIds[columnNumber].length; iIterator++) {
                            for (jIterator = 0; jIterator < selectionIds[columnNumber][iIterator].length; jIterator++) {
                                s.push(selectionIds[columnNumber][iIterator][jIterator]);
                            }
                        }
                        thisObj.selectionManager.select(s, true).then((ids: ISelectionId[]) => {
                            d3.selectAll('.columnChart > div > div > div').style({
                                opacity: 0.5
                            });

                            d3.select(this).style({
                                opacity: 1
                            });
                        });
                });
            })
                .style('background-color', thisObj.colors[thisObj.iColumn][thisObj.jColumn]);

        innerSubDiv.append('p')
                .classed('category', true)
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string { return datum[`key`].toString(); })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    height: `${thisObj.textSize}px`
                })
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string { return datum[`key`].toString(); });
        const border: number = 2;
        const colValueTextHeight: number = $('.colValueText').height();
        const minLine: string = 'columnMinLine';
        const maxLine: string = 'columnMaxLine';
        const constantLine: string = 'columnConstantLine';
        const avgLine: string = 'columnAvgLine';
        const divMaxLine: string = 'max';
        const pMaxLine: string = 'pMax';
        const divMinLine: string = 'min';
        const pMinLine: string = 'pMin';
        const divAvgLine: string = 'avg';
        const pAvgLine: string = 'pAvg';
        const divConstantLine: string = 'constant';
        const pConstantLine: string = 'pConstant';
        const max: number = thisObj.maxValue;
        const min: number = thisObj.minValue;
        const average: number = thisObj.averageValue;
        const chartWdth: number = thisObj.returnChartWidth(chartWidth);

        if (thisObj.maxLineIsOn) {
                if (thisObj.maxLineDataLabel) {
                    subDiv.append('p')
                        .classed(pMaxLine, true)
                        // subtract 25 to adjust label above the line
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - 0.85 * renderHeight)) - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: '0'
                        })
                        .text( function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.maxValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.maxValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(divMaxLine, true)
                    .classed(maxLine + index, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom +
                        (Math.floor(renderHeight - 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Max', max, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(maxLine + index, divMaxLine, pMaxLine, thisObj.maxLineStyle,
                                     thisObj.maxLineFill, thisObj.maxLineOpacity, thisObj.maxValue);
            }
        if (thisObj.minLineIsOn) {
                if (thisObj.minLineDataLabel) {
                    subDiv.append('p')
                        .classed(pMinLine, true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom + 25 -  thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom + 25 - thisObj.textSize +
                            (Math.floor(renderHeight - (thisObj.minValue / thisObj.maxValue) * 0.85 * renderHeight)) - 25 + thisObj.px)
                        .classed('linesP', true)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.minValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.minValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(divMinLine, true)
                    .classed(minLine + index, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom +
                        (Math.floor(renderHeight - (thisObj.minValue / thisObj.maxValue) * 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Min', min, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(minLine + index, divMinLine, pMinLine, thisObj.minLineStyle,
                                     thisObj.minLineFill, thisObj.minLineOpacity, thisObj.minValue);
            }
        if (thisObj.avgLineIsOn) {
                if (thisObj.avgLineDataLabel) {
                    subDiv.append('p')
                        .classed(pAvgLine, true)
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - (thisObj.averageValue / thisObj.maxValue) * 0.85 * renderHeight))
                             - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.averageValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.averageValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(avgLine + index, true)
                    .classed(divAvgLine, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom +
                        (Math.floor(renderHeight - (thisObj.averageValue / thisObj.maxValue) * 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Average', average, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(avgLine + index, divAvgLine, pAvgLine, thisObj.avgLineStyle,
                                     thisObj.avgLineFill, thisObj.avgLineOpacity, thisObj.averageValue);

            }
        if (thisObj.constantLineIsOn) {
                if (thisObj.constantLineDataLabel) {
                    subDiv.append('p')
                        .classed(pConstantLine, true)
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - (parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue) * 0.85 * renderHeight))
                            - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.constantLineValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.constantLineValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(constantLine + index, true)
                    .classed(divConstantLine, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom +
                        (Math.floor(renderHeight - (parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue) * 0.85 * renderHeight))
                        + thisObj.px)
                    .style('width', Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                             chartWdth) + thisObj.px)
                    .each(function (): void {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Max', thisObj.maxValue, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);
                    });
                thisObj.renderStyles(constantLine + index, divConstantLine, pConstantLine, thisObj.constantLineStyle,
                                     thisObj.constantLineFill, thisObj.constantLineOpacity, parseInt(thisObj.constantLineValue, 10));
            }
            // On Load Animation
        if (thisObj.renderedTime === 1) {
                d3.selectAll('.columnChart .myDiv .mainColumn')
                    .style('transform-origin', '0% 0%')
                    .style('transform', 'scale(0)')
                    .transition()
                    .duration(2000)
                    .style('transform', 'scale(1)');
            }
        subDiv.style('transform', 'scale(0)')
                .transition().duration(500)
                .style('transform', 'scale(1)');

        }

        // tslint:disable-next-line:cyclomatic-complexity no-any
        private renderColumnChart(data: any, index: number, categories: any,
                                  chartWidth: number, chartHeight: number, marginLeft: number): void {
            const thisObj: this = this;
            const indexString: string = 'index';
            thisObj.isCategory = true;
            // tslint:disable-next-line:no-any
            let subDiv: any;
            // tslint:disable-next-line:no-any
            let columnChart: any;
            thisObj.getMaxValue(data);
            const categoriesLength: number = categories.length;
            let subDivHeight: number;
            let subDivWidth: number;
            const percentSign: string = '%';
            const divWidth: number = 50;
            const marginToFirstDiv: number = (thisObj.settings.analytics.maxLineDataLabel || thisObj.settings.analytics.minLineDataLabel ||
                thisObj.settings.analytics.avgLineDataLabel || thisObj.settings.analytics.constantLineDataLabel) ?
                thisObj.textWidth + 20 : 30;
            const firstDivMargin: number = 30;
            if (thisObj.binColumn === -1) {
                columnChart = thisObj.mainCont.append(`div`).classed('columnChart', true);
                subDiv = columnChart.append('div')
                    .classed('subDiv', true)
                    .style({
                        width: (Math.max((data.length * (divWidth + 6)) + firstDivMargin, thisObj.mainContWidth - 20)) + thisObj.px,
                        height: thisObj.mainContHeight - $('.legend').height() - + thisObj.px,
                        padding: '0',
                        margin: '0'
                    });

            } else {
                columnChart = thisObj.mainCont.append(`div`)
                    .classed('columnChart', true)
                    .classed('borderChart', true)
                    .style({
                        width: chartWidth + thisObj.px,
                        height: thisObj.returnHeight(categories, chartHeight) + thisObj.px,
                        'margin-left': marginLeft + thisObj.px
                    });
                subDiv = columnChart.append('div')
                    .classed('subDiv', true)
                    .style({
                        width: (Math.max((data.length * (divWidth + 4)) + marginToFirstDiv, chartWidth)) + thisObj.px,
                        height: thisObj.returnHeight(categories, chartHeight) - 20 + thisObj.px,
                        padding: '0',
                        margin: '0'
                    });
            }
            const $subDiv: JQuery = $('.subDiv');
            subDivHeight = $subDiv.height();
            subDivWidth = $subDiv.width();

            subDiv.append('label')
                .text(thisObj.returnLabelText(categories[index]))
                .attr('title', thisObj.returnLabelText(categories[index]))
                .classed('label', true);
            const labelHeight: number = thisObj.binColumn === -1 ? -2 : $('.label').height();
            const labelMarginBottom: number = thisObj.binColumn === -1 ? 0 :
                parseInt((d3.select('.label').style('margin-bottom').substr(0, d3.select('.label').style('margin-bottom').length - 2)), 10);

            const increment: number = thisObj.previousDataLength;
            // tslint:disable-next-line:no-any
            const innerSubDiv: any = subDiv.selectAll('div')
                .data(data)
                .enter()
                .append('div')
                .classed('mainColumn', true)
                .style('width', divWidth + thisObj.px)
                // tslint:disable-next-line:no-any
                .style('margin-left', function (datum: any, iterator: number): string {
                    if (iterator === 0) {
                        return marginToFirstDiv + thisObj.px;
                    }

                    return '0';
                })
                .style({
                    'margin-right': '4px'
                });
            let renderHeight: number;
            // 15 is height of colValueText and 16 is height of Category
            const colValueText: number = 15;
            const categoryHeight: number = 16;
            renderHeight = thisObj.returnRenderHeight(subDivHeight, labelHeight, labelMarginBottom, colValueText, categoryHeight);
            innerSubDiv.append('p')
                .classed('colValueText', true)
                // tslint:disable-next-line:no-any
                .style('margin-top', function (datum: any): string {
                    const value: number = parseInt(datum[`values`][`value`], 10);
                    if (value > 0) {
                        thisObj.isCategory = false;
                    }
                    if (thisObj.binColumn === -1) {
                        return datum[`values`][`value`] <= 0 ? Math.floor(renderHeight  - thisObj.textSize) - 5 + thisObj.px :
                        `${Math.floor(renderHeight - (parseInt(datum[`values`][`value`], 10) /
                        thisObj.maxValue * 0.85 * renderHeight)  - thisObj.textSize) - 5}px`;
                    }

                    return datum[`values`][`value`] === 0 ? `${Math.floor(renderHeight  - thisObj.textSize)}px`
                        : `${Math.floor(renderHeight - (parseInt(datum[`values`][`value`], 10) /
                        thisObj.maxValue * 0.85 * renderHeight) - thisObj.textSize)}px`;

                })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    height: `${thisObj.textSize}px`
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string {
                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });
                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string {
                    // tslint:disable-next-line:no-any
                    let displayVal: any;
                    let tempMeasureData: string = datum[`values`][`value`].toString();
                    const valLen: number = tempMeasureData.split('.')[0].length;
                    displayVal = thisObj.returnDisplayVal(valLen);

                    //Value Formatter Creation
                    const formatter: IValueFormatter = ValueFormatter.create({
                        format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format,
                        value: displayVal
                    });

                    tempMeasureData = formatter.format(datum[`values`][`value`]);

                    return tempMeasureData;
                })
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext]);

            innerSubDiv.append('div')
                // tslint:disable-next-line:no-any
                .attr('data-selection', function (datum: any, iterator: number): number { return iterator + increment; })
                .classed('colDiv', true)
                .style('width', '40px')
                .style('margin-left', '1px')
                // tslint:disable-next-line:no-any
                .style('height', function (datum: any): string {

                    if (thisObj.binColumn === -1) {
                        return datum[`values`][`value`] <= 0 ? `0` :
                        `${Math.floor((parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                            0.85 * renderHeight)))}px`;
                    }

                    return datum[`values`][`value`] <= 0 ? `0` :
                    `${Math.floor((parseInt(datum[`values`][`value`], 10) / thisObj.maxValue * (
                        0.85 * renderHeight)))}px`;

                })
                // tslint:disable-next-line:no-any
                .each(function (datum: any): void {
                    thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                             (tooltipEvent: TooltipEventArgs<number>) =>
                            thisObj.getTooltipData(tooltipEvent.data, 'bar', '', 0, thisObj),
                                                             (tooltipEvent: TooltipEventArgs<number>) => null);
                })
                .style('background-color', thisObj.colors[thisObj.iColumn][thisObj.jColumn]);
            innerSubDiv.append('p')
                .classed('category', true)
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string { return datum[`key`].toString(); })
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily,
                    height: `${thisObj.textSize}px`
                })
                // tslint:disable-next-line:no-any
                .attr('title', function (datum: any): string { return datum[`key`].toString(); });
            const border: number = 2;
            const colValueTextHeight: number = $('.colValueText').height();
            const minLine: string = 'columnMinLine';
            const maxLine: string = 'columnMaxLine';
            const constantLine: string = 'columnConstantLine';
            const avgLine: string = 'columnAvgLine';
            const divMaxLine: string = 'max';
            const pMaxLine: string = 'pMax';
            const divMinLine: string = 'min';
            const pMinLine: string = 'pMin';
            const divAvgLine: string = 'avg';
            const pAvgLine: string = 'pAvg';
            const divConstantLine: string = 'constant';
            const pConstantLine: string = 'pConstant';
            let max: number;
            let min: number;
            let average: number;
            max = thisObj.maxValue;
            min = thisObj.minValue;
            average = thisObj.averageValue;
            const chartWdth: number = thisObj.returnChartWidth(chartWidth);
            const addMargin: number = thisObj.returnAdditionMargin();
            if (thisObj.maxLineIsOn) {
                if (thisObj.maxLineDataLabel) {
                    subDiv.append('p')
                        .classed(pMaxLine, true)
                        // subtract 25 to adjust label above the line
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - 0.85 * renderHeight)) - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: '0'
                        })
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.maxValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.maxValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(divMaxLine, true)
                    .classed(maxLine + index, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom + addMargin +
                        (Math.floor(renderHeight - 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Max', max, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(maxLine + index, divMaxLine, pMaxLine, thisObj.maxLineStyle,
                                     thisObj.maxLineFill, thisObj.maxLineOpacity, thisObj.maxValue);
            }

            if (thisObj.minLineIsOn) {
                if (thisObj.minLineDataLabel) {
                    subDiv.append('p')
                        .classed(pMinLine, true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom + 25 -  thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom + 25 - thisObj.textSize + addMargin +
                            (Math.floor(renderHeight - (thisObj.minValue / thisObj.maxValue) * 0.85 * renderHeight)) - 25 + thisObj.px)
                        .classed('linesP', true)
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.minValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.minValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(divMinLine, true)
                    .classed(minLine + index, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom + addMargin +
                        (Math.floor(renderHeight - (thisObj.minValue / thisObj.maxValue) * 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Min', min, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(minLine + index, divMinLine, pMinLine, thisObj.minLineStyle, thisObj.minLineFill,
                                     thisObj.minLineOpacity, thisObj.minValue);
            }
            if (thisObj.avgLineIsOn) {
                if (thisObj.avgLineDataLabel) {
                    subDiv.append('p')
                        .classed(pAvgLine, true)
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - (thisObj.averageValue / thisObj.maxValue) * 0.85 * renderHeight))
                            - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.averageValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.averageValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(avgLine + index, true)
                    .classed(divAvgLine, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom + addMargin +
                        (Math.floor(renderHeight - (thisObj.averageValue / thisObj.maxValue) * 0.85 * renderHeight)) + thisObj.px)
                    .style('width', function (): string {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Average', average, thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);

                        return Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                        chartWdth) + thisObj.px;
                    });
                thisObj.renderStyles(avgLine + index, divAvgLine, pAvgLine, thisObj.avgLineStyle, thisObj.avgLineFill,
                                     thisObj.avgLineOpacity, thisObj.averageValue);

            }
            if (thisObj.constantLineIsOn) {
                if (thisObj.constantLineDataLabel) {
                    subDiv.append('p')
                        .classed(pConstantLine, true)
                        .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                            labelHeight + labelMarginBottom - thisObj.textSize + thisObj.px
                            : labelHeight + labelMarginBottom +
                            (Math.floor(renderHeight - (parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue) * 0.85 * renderHeight))
                            - thisObj.textSize + thisObj.px)
                        .classed('linesP', true)
                        .style({
                            'font-size': `${this.settings.fontSettings.fontSize}px`,
                            'font-family': this.settings.fontSettings.fontFamily,
                            width: `${thisObj.textWidth}px`,
                            margin: 0
                        })
                        .text(function(): string {
                            let displayVal: number;
                            let tempMeasureData: string = thisObj.constantLineValue.toString();
                            const valLen: number = tempMeasureData.split('.')[0].length;
                            displayVal = thisObj.returnDisplayVal(valLen);

                            //Value Formatter Creation
                            const formatter: IValueFormatter = ValueFormatter.create({
                                value: displayVal
                            });

                            tempMeasureData = formatter.format(thisObj.constantLineValue);
                            $(this).attr('title', tempMeasureData);

                            return tempMeasureData;
                        });
                }
                subDiv.append('div')
                    .classed(constantLine + index, true)
                    .classed(divConstantLine, true)
                    .style('top', thisObj.isCategory ? Math.floor(renderHeight) +
                        labelHeight + labelMarginBottom + thisObj.px
                        : labelHeight + labelMarginBottom + addMargin +
                        (Math.floor(renderHeight - (parseInt(thisObj.constantLineValue, 10) / thisObj.maxValue) * 0.85 * renderHeight))
                        + thisObj.px)
                    .style('width', Math.max(data.length * (divWidth + 4) + marginToFirstDiv - 5,
                                             chartWdth ) + thisObj.px)
                    .each(function (): void {
                        thisObj.tooltipServiceWrapper.addTooltip(d3.select(this),
                                                                 (tooltipEvent: TooltipEventArgs<number>) =>
                                thisObj.getTooltipData(tooltipEvent.data, 'line', 'Constant',
                                                       parseInt(thisObj.constantLineValue, 10), thisObj),
                                                                 (tooltipEvent: TooltipEventArgs<number>) => null);
                    });
                thisObj.renderStyles(constantLine + index, divConstantLine, pConstantLine, thisObj.constantLineStyle,
                                     thisObj.constantLineFill, thisObj.constantLineOpacity, parseInt(thisObj.constantLineValue, 10));
            }
            // On Load Animation
            if (thisObj.renderedTime === 1) {
                d3.selectAll('.columnChart .myDiv .mainColumn')
                    .style('transform-origin', '0% 0%')
                    .style('transform', 'scale(0)')
                    .transition()
                    .duration(2000)
                    .style('transform', 'scale(1)');
            }
            subDiv.style('transform', 'scale(0)')
                .transition().duration(500)
                .style('transform', 'scale(1)');

            // tslint:disable-next-line:no-any
            const allColumns: any = d3.selectAll('.columnChart > div > div > div');
            // tslint:disable-next-line:no-any
            allColumns.on('click', function(d: any): void {
                thisObj.selectionManager.clear();
                $('.menuReset').show();
                thisObj.selectionManager.select(d.values.selectionId, true).then((ids: ISelectionId[]) => {
                    allColumns.style({
                        opacity: 0.5
                    });

                    d3.select(this).style({
                        opacity: 1
                    });
                });
            });
        }

        // tslint:disable-next-line:no-any
        private renderTable(data: any, index: number, categories: any, dataColumns: string[], options: any): void {
            const thisObj: this = this;
            // sort method
            const gridSorter: (loop: number, iterator: number) => void = function (loop: number, iterator: number): void {

                // tslint:disable-next-line:no-any
                const tableContainer: any = d3.selectAll(`.bin${iterator}`);

                // tslint:disable-next-line:no-any
                const $this: any = this || `.tableHeader.no${loop}`;

                // tslint:disable-next-line:no-any
                const sortActive: any = tableContainer.selectAll('.sortActive');
                sortActive.select(`.sortIcon${iterator}`).style('visibility', 'hidden');
                sortActive.classed('sortActive', false);

                thisObj.sortedColumnIndex[index] = parseInt((d3.select($this).attr('sequence')), 10);

                tableContainer.select($this)
                    .classed('sortActive', thisObj.isSorted[index]);

                tableContainer.select('.sortActive').select(`.sortIcon${index}`)
                    .text(thisObj.isSortAsc[index] ? '▼' : '▲')
                    .style('visibility', 'visible');

                if (thisObj.isSortAsc[index]) {
                    thisObj.gridRow[iterator].sort(function (value1: DataViewTableRow, value2: DataViewTableRow): number {
                        if (value1[loop] === 'null') {
                            return -1;
                        } else if (value2[loop] === 'null') {
                            return 1;
                        }
                        // tslint:disable-next-line:no-any
                        const val1: any = isNaN(+value1[loop]) ? value1[loop] && value1[loop].toString().toLowerCase()
                        || '' : value1[loop] || '';
                        // tslint:disable-next-line:no-any
                        const val2: any = isNaN(+value2[loop]) ? value2[loop] && value2[loop].toString().toLowerCase()
                        || '' : value2[loop] || '';
                        const result: number = val1 < val2 ? 1 : -1;

                        return result;
                    });
                    thisObj.isSortAsc[index] = false;
                } else {
                    thisObj.gridRow[iterator].sort(function (value1: DataViewTableRow, value2: DataViewTableRow): number {
                        if (value1[loop] === 'null') {
                            return 1;
                        } else if (value2[loop] === 'null') {
                            return -1;
                        }
                        // tslint:disable-next-line:no-any
                        const val1: any = isNaN(+value1[loop]) ? value1[loop] && value1[loop].toString().toLowerCase()
                        || '' : value1[loop] || '';
                        // tslint:disable-next-line:no-any
                        const val2: any = isNaN(+value2[loop]) ? value2[loop] && value2[loop].toString().toLowerCase()
                        || '' : value2[loop] || '';
                        const result: number = val1 > val2 ? 1 : -1;

                        return result;
                    });
                    thisObj.isSortAsc[index] = true;
                }
            };

            const rows: DataViewTableRow[] = [];
            // tslint:disable-next-line:no-any
            let array: any[] = [];

            // tslint:disable-next-line:no-any
            let table: any;
            table = thisObj.mainCont
                .append('table')
                .classed(`tableCont bin${index}`, true);

            if (thisObj.numberCategory) {
                let caption: string = '';
                let limit: number;

                limit =
                    ((index * thisObj.numberOfBins) + thisObj.numberOfBins) > categories.length ?
                        categories.length : ((index * thisObj.numberOfBins) + thisObj.numberOfBins);
                // No isolation;
                if ((thisObj.numberOfBins > 1) && (categories[index * thisObj.numberOfBins] !== categories[limit - 1])) {
                    caption = `(${thisObj.binColumnformatter.format
                        (categories[index * thisObj.numberOfBins])} - ${thisObj.binColumnformatter.format(categories[limit - 1])})`;
                } else {
                    caption = `(${thisObj.binColumnformatter.format(categories[index * thisObj.numberOfBins])})`;
                }
                table.append('caption')
                    .style('font-weight', 'bold')
                    .style({
                        'font-size': `${this.settings.fontSettings.fontSize}px`,
                        'font-family': this.settings.fontSettings.fontFamily
                    })
                    .text(caption)
                    .attr('title', caption);
            } else {
                table.append('caption')
                    .style('font-weight', 'bold')
                    .style({
                        'font-size': `${this.settings.fontSettings.fontSize}px`,
                        'font-family': this.settings.fontSettings.fontFamily
                    })
                    .text(data[0][thisObj.binColumn] === null ? 'Null' : data[0][thisObj.binColumn])
                    .attr('title', data[0][thisObj.binColumn] === null ? 'Null' : data[0][thisObj.binColumn]);
            }

            table.append('thead').append('tr')
                .selectAll('th')
                .data(dataColumns).enter()
                .append('th')
                .style('border-bottom', `1px solid ${thisObj.colors[thisObj.iColumn][thisObj.jColumn]}`)
                .attr('class', function (datum: string, id: number): string {
                    return `tableHeader no${id}`;
                })
                .on('click', function (datum: string, id: number): void {
                    // i is column number ; index is bin number
                    thisObj.isSorted[index] = true;
                    gridSorter(id, index);
                })
                .append('p')
                .style('padding-right', '2px')
                .style('margin', '0px')
                .style('max-width', '150px')
                .style('white-space', 'nowrap')
                .style('overflow', 'hidden')
                .style('text-overflow', 'ellipsis')
                .style('color', 'black')
                // Align left if text, else align right for numbers
                .style('text-align', function (datum: string, id: number): string {
                    if (isNaN(+(data[0][thisObj.dataColIndex[id]]))) {
                        return 'left';
                    } else {
                        return 'right';
                    }
                })
                 .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                .attr('class', function (datum: string, iterator: number): string {
                    return `column headercell header-${iterator}`;
                })
                .attr('sequence', function (datum: string, iterator: number): number {
                    return iterator;
                })
                .text(function (datum: string): string { return datum; })
                .attr('title', (function (datum: string): string { return datum; }));

            table.selectAll('.tableHeader')
                .append('span')
                .text(thisObj.isSortAsc[index] ? '▼' : '▲')
                .style('font-size', '8px')
                .style('color', 'black')
                .style('margin-left', '5px')
                .classed(`sortIcon${index}`, true)
                .style('float', 'left');

            d3.selectAll(`.sortIcon${index}`)
                .style('visibility', 'hidden');

            //Value Formatter Creation
            const formatter: IValueFormatter[] = [];
            for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                const temp: IValueFormatter = ValueFormatter.create({
                    format: thisObj.dataView.metadata.columns[iterator].format
                });
                formatter.push(temp);
            }

            table.append('tbody')
                .selectAll('tr')
                .data(data).enter()
                .append('tr')
                .classed(`gridRow${index}`, true)
                .selectAll('td')
                // tslint:disable-next-line:no-any
                .data(function (datum: any): Object[] {
                    const arr: Object[] = [];
                    let cell: Object = {};
                    for (let iterator: number = 0; iterator < thisObj.dataColIndex.length; iterator++) {
                        cell = {};
                        cell[datum[thisObj.dataColIndex[iterator]]] =
                            (datum[thisObj.dataColIndex[iterator]] === null ? 'Null' :
                            formatter[thisObj.dataColIndex[iterator]].format(datum[thisObj.dataColIndex[iterator]]));
                        arr.push(cell);
                    }

                    return arr;
                })
                .enter()
                .append('td')
                .style({
                    'font-size': `${this.settings.fontSettings.fontSize}px`,
                    'font-family': this.settings.fontSettings.fontFamily
                })
                .style('max-width', '150px')
                .style('overflow', 'hidden')
                .style('text-overflow', 'ellipsis')
                .classed('gridcell', true)
                .style('color', thisObj.colors[thisObj.iColumntext][thisObj.jColumntext])
                .text(function (datum: Object): string {

                    // Creating array for sorting (non formatted values)
                    array.push(isNaN(Number(Object.keys(datum)[0])) ? //string or number
                    (isNaN(Date.parse(Object.keys(datum)[0])) ? Object.keys(datum)[0] :
                    Date.parse(Object.keys(datum)[0])) : //if string - date or not
                        (parseFloat(Object.keys(datum)[0])));

                    if (array.length === dataColumns.length) {
                        rows.push(array);
                        array = [];
                    }

                    // returning formatted values for display
                    return datum[Object.keys(datum)[0]];
                })
                // Text left aligned and Numbers right aligned
                .style('text-align', function (datum: Object): string {
                    if (isNaN(+(Object.keys(datum)[0]))) {
                        return 'left';
                    } else {
                        return 'right';
                    }
                })
                .attr({
                    class: 'rows',
                    title: function (datum: Object): string { return datum[Object.keys(datum)[0]]; }
                });

            thisObj.binData[index] = rows;
            thisObj.gridRow[index] = table.selectAll(`.gridRow${index}`).data(thisObj.binData[index]);
            thisObj.isSorted[index] = true;
            gridSorter(0, index);
            table.style('transform', 'scale(0)').transition().duration(500).style('transform', 'scale(1)');
        }
        // Render Legend
        private renderLegend(): void {
            const thisObj: this = this;
            $('.legend').remove();
            // tslint:disable-next-line:no-any
            let legend: any;
            if ((thisObj.maxLineIsOn || thisObj.minLineIsOn || thisObj.avgLineIsOn || thisObj.constantLineIsOn)
                && (thisObj.chartType === 'Bar' || thisObj.chartType === 'Column')) {
                legend = thisObj.mainCont.append('div')
                    .classed('legend', true);
                if (thisObj.maxLineIsOn) {
                    legend.append('div')
                        .style('background-color', thisObj.maxLineFill)
                        .classed('maxLegend', true);
                    legend.append('div')
                        .text('Max')
                        .classed('maxNameLegend', true);
                }
                if (thisObj.minLineIsOn) {
                    legend.append('div')
                        .style('background-color', thisObj.minLineFill)
                        .classed('minLegend', true);
                    legend.append('div')
                        .text('Min')
                        .classed('minNameLegend', true);
                }
                if (thisObj.avgLineIsOn) {
                    legend.append('div')
                        .style('background-color', thisObj.avgLineFill)
                        .classed('avgLegend', true);
                    legend.append('div')
                        .text('Average')
                        .classed('avgNameLegend', true);
                }
                if (thisObj.constantLineIsOn) {
                    legend.append('div')
                        .style('background-color', thisObj.constantLineFill)
                        .classed('constantLegend', true);
                    legend.append('div')
                        .text('Constant')
                        .classed('constantNameLegend', true);
                }
            }
        }

        private calculateTableColumns(): string[] {
            const thisObj : this = this;
            const dataColumns: string[] = [];
            thisObj.dataColIndex = [];
            if (thisObj.selectedColumnsString === '') {
                return dataColumns;
            }
            const selectedColumnsStringArray: string[] = thisObj.selectedColumnsString.split('-', thisObj.viewModel.columns.length);
            for (let it: number = 0; it < selectedColumnsStringArray.length; it++) {
                dataColumns.push(thisObj.viewModel.columns[parseInt(selectedColumnsStringArray[it], 10)].displayName);
                thisObj.dataColIndex.push(parseInt(selectedColumnsStringArray[it], 10));
            }

            return dataColumns;
        }

        // tslint:disable-next-line:no-any
        private calculateDistinctBinValues(): any[] {
            const thisObj : this = this;
            // tslint:disable-next-line:no-any
            const arrayofbinvalues: any = [];
            for (let iterator: number = 0; iterator < thisObj.viewModel.dataPoints.length; iterator++) {
                if (arrayofbinvalues.indexOf(thisObj.viewModel.dataPoints[iterator].value[thisObj.binColumn]) === -1) {
                    arrayofbinvalues.push(thisObj.viewModel.dataPoints[iterator].value[thisObj.binColumn]);
                }
            }

            return arrayofbinvalues;
        }

        // Mapping data to table data for four cases : Isolation (Categorical, Numeric), No Isolation (categorical, Numeric)
        // tslint:disable-next-line:cyclomatic-complexity no-any
        private calculateTableData(binData: any, finalData: any, categories: string[]): any[] {
            const thisObj: this = this;
            // tslint:disable-next-line:no-any
            let tableData: any = [];
            // tslint:disable-next-line:no-any
            const tabledata1: any = [];
            // tslint:disable-next-line:no-any
            const arrayofbinvalues: any = thisObj.calculateDistinctBinValues();
            // No Isolation
            for (let iterator: number = 0; iterator < binData.length; iterator++) {
                // tslint:disable-next-line:no-any
                const bins: any[] = [];
                for (let innerIterator: number = 0; innerIterator < binData[iterator].values.length; innerIterator++) {
                    // tslint:disable-next-line:no-any
                    const values: any[] = [];
                    for (let dataIterator: number = 0; dataIterator < binData[iterator].values[innerIterator].value.length;
                        dataIterator++) {
                        values.push(binData[iterator].values[innerIterator].value[dataIterator]);
                    }
                    bins.push(values);
                }
                tableData.push(bins);
            }

            if (thisObj.numberCategory) {
                // Displaying in bin range
                // tslint:disable-next-line:no-any
                let temp: any[] = [];
                for (let iterator: number = 0; iterator < (arrayofbinvalues.length); iterator++) {
                    if (iterator !== 0 && ((iterator % thisObj.numberOfBins) === 0)) {
                        tabledata1.push(temp);
                        temp = [];
                    }
                    for (let innerIterator: number = 0; innerIterator < tableData[iterator].length; innerIterator++) {
                        temp.push(tableData[iterator][innerIterator]);
                    }
                }
                tabledata1.push(temp);
                tableData = tabledata1;
            }

            return tableData;
        }

        private drawColumnSelector(dataColumns: string[]): void {
            const thisObj: this = this;
            thisObj.$xAxisLabel.hide();
            thisObj.$yAxisLabel.hide();
            $('.columnSelector').remove();
            $('.columnSelectorLabel').remove();
            //Column Selector
            // tslint:disable-next-line:no-any
            const columnSelectorLabel: any = thisObj.xAxisCont.append('p')
                .classed('columnSelectorLabel', true)
                .text(`Column selector ▲`)
                .style('display', 'table')
                .style('margin-left', function(): string {
                    const parentWidth: number = $(this).width();

                    return `${(thisObj.width / 2) - (parentWidth /  2) - 40}px`;
                });
            // tslint:disable-next-line:no-any
            const cont: any = thisObj.xAxisCont.append('div')
                .classed(`columnSelector`, true);

            thisObj.$columnSelector = $('.columnSelector');
            // tslint:disable-next-line:no-any
            const form: any = cont.append('form');
            // tslint:disable-next-line:no-any
            const columns: any = cont.selectAll('input')
                .data(thisObj.viewModel.columns).enter()
                .append('div')
                //tslint:disable-next-line:no-any
                .on('click', function(datum: any, indx: number): void {
                    const temp: JQuery = $(`input[data-id=${indx}]`);

                    $(temp).attr({checked: !temp.attr('checked') });

                    if ($(temp).attr('checked') === 'checked') {

                        // If element is checked add to dataColumns
                        $(temp).prop('checked', true);
                        $(temp).attr('value', 'true');

                        dataColumns.push(temp.attr('name'));
                        thisObj.dataColIndex.push(indx);

                    } else {

                        // If element is unchecked remove from dataColumns
                        $(temp).attr('value', 'false');
                        $(temp).prop('checked', false);
                        // tslint:disable-next-line:no-any
                        const pop: any = function remove(array: any, element: any): any {
                            // tslint:disable-next-line:typedef
                            return array.filter(newElement => newElement !== element);
                        };

                        dataColumns = pop(dataColumns, temp.attr('name'));
                        thisObj.dataColIndex = pop(thisObj.dataColIndex, indx);
                    }
                    // Flag indicates that changes are made in column selector dropdown,
                    // hence now on hiding this dropdown, the chart must be redrawn
                    thisObj.flag = 1;
                })
                .classed('selector', true)
                // tslint:disable-next-line:no-any
                .text(function (datum: any, indx: number): string {
                    return datum.displayName;
                })
                .style('display', 'table')
                .append('input')
                .attr({
                    type: 'checkbox',
                    // tslint:disable-next-line:no-any
                    class: function (datum: any, indx: number): string {
                        return `dropdown.column.data${indx}`;
                    },
                    // tslint:disable-next-line:no-any
                    'data-id': function (datum: any, indx: number): any {
                        return indx;
                    },
                    value: 'false',
                    // tslint:disable-next-line:no-any
                    name: function (datum: any, indx: number): string {
                        return datum.displayName;
                    },
                    // tslint:disable-next-line:no-any
                    checked: function (datum: any, indx: number): any {
                        if (thisObj.dataColIndex.indexOf(indx) !== -1) {
                            return true;
                        }
                    }
                })
                // tslint:disable-next-line:no-any
                .text(function (datum: any): string { return `${datum.displayName}`; })
                .style('float', 'left');
            // Sorting the columns in X Axis dropdown
            thisObj.dropdown = cont.selectAll(`.selector`).data(thisObj.viewModel.columns);
            thisObj.columnSorter();

            d3.select('.columnSelector').style('margin-left', function(): string {
                const parentWidth: number = $(this).width();

                return `${(thisObj.width / 2) - (parentWidth /  2) - 40}px`;
            });

            columnSelectorLabel.on('click', function (): void {
                thisObj.hideMenus(thisObj.$columnSelector);
            });
        }
        // tslint:disable-next-line:no-any
        private createBinData(categories: any): any {
            const thisObj: this = this;
            // tslint:disable-next-line:no-any
            const binData: any = d3.nest()
                // tslint:disable-next-line:no-any
                .key(function (datum: IDataPoints): any {
                    return datum[`value`][thisObj.binColumn];
                })
                // tslint:disable-next-line:no-any
                .rollup(function (datum: any): any {
                    categories.push(datum[0][`value`][thisObj.binColumn]);

                    return datum;
                }).entries(thisObj.viewModel.dataPoints);

            return binData;
        }

        private getHeight(currentHeight: number, countOfFirstBox: number): number {

            if (currentHeight <= (this.mainContHeight / countOfFirstBox)) {

                return $('.chart').height() - 20;
            }

            return (this.mainContHeight / countOfFirstBox -
                (60 / countOfFirstBox)) - 20;
        }

        private returnSkip(chartWidth: number): number {
            if ((chartWidth + 12) * 3 < this.mainContWidth) {
                return 3;

            } else if ((chartWidth + 12) * 2 < this.mainContWidth) {
                return 2;
            } else {
                return 1;
            }
        }

        // tslint:disable-next-line:cyclomatic-complexity
        private renderChart(): void {
            const thisObj: this = this;

            // Formatter values
            thisObj.binColumnformatter = ValueFormatter.create({
                    format: (thisObj.binColumn !== -1 ? thisObj.dataView.metadata.columns[thisObj.binColumn].format : '')
            });

            thisObj.targetColumnformatter = ValueFormatter.create({
                format: thisObj.dataView.metadata.columns[thisObj.targetColumn].format
            });

            if (!thisObj.settings.presentation.show) {
                thisObj.renderMenu();
            } else {
                thisObj.renderMenu();
                d3.select('.topMenu').remove();
                d3.select('.topCont').remove();
            }
            d3.selectAll('.tableCont,.chart,.brickChart, .columnChart').remove();
            let dataColumns: string[] = [];
            dataColumns = thisObj.calculateTableColumns();

            if (0 === thisObj.actions.length) {
                $('.undoCont').hide();
            } else {
                $('.undoCont').show();
            }

            const categories: string[] = [];
            // tslint:disable-next-line:no-any
            const binData: any = thisObj.createBinData(categories);

            // Limit on number of rows
            if (thisObj.viewModel.dataPoints.length > 20000) {
                thisObj.mainCont.append('div')
                     .classed('tableCont', true)
                     .text('Current visual supports up to 20K rows. Please filter the dataset and reduce the number of rows.')
                     .style('margin-top', '40px');
                d3.select('.label0').text('None');

                return;
            }
            // Limit on unique values of binning category
            if (categories.length > 1200) {
                thisObj.mainCont.append('div')
                     .classed('tableCont', true)
                     .text('Please use a different binning category as this one has many unique values')
                     .style('margin-top', '40px');
                d3.select('.label0').text('None');

                return;
            }

            const numberString: string = 'number';
            // tslint:disable-next-line:no-any
            const finalData: any = [];
            thisObj.numberCategory = typeof categories[0] === numberString ? true : false;
            thisObj.mainContWidth = thisObj.$mainCont.width();
            thisObj.mainContHeight = thisObj.$mainCont.height();
            thisObj.renderLegend();

            // Facets

            // tslint:disable-next-line:no-any
            binData.forEach(function (data: any): any {
                finalData.push(d3.nest()
                    // tslint:disable-next-line:no-any
                    .key(function (datum: any): any {
                        thisObj.keyColumnIndex = thisObj.groupedColumn;

                        return datum[`value`][thisObj.groupedColumn];
                    })
                    // tslint:disable-next-line:no-any
                    .rollup(function (datum: any): any {
                        let value: number;
                        // tslint:disable-next-line:no-any
                        value = d3.sum(datum, function (dataIterator: any): number {

                            if (dataIterator[`value`][thisObj.targetColumn] === null ||
                                isNaN(Number(dataIterator[`value`][thisObj.targetColumn].toString()))) {
                                return 0;
                            } else {

                                return dataIterator[`value`][thisObj.targetColumn];
                            }
                        });
                        if (value > 0) {
                            thisObj.isCategory = false;
                        }
                        // tslint:disable-next-line:no-any
                        const selectionIds: any = [];
                        // tslint:disable-next-line:no-any
                        datum.forEach(function (innerdata: any): void {
                            selectionIds.push(innerdata[`selectionId`]);
                        });

                        return {
                            value: value,
                            selectionId: selectionIds
                        };
                    }).entries(data.values));
            });

            let totalCategories: number;
            const margin: number = 30;
            totalCategories = categories.length;
            let chartWidth: number = totalCategories <= 2 ? Math.max(Math.floor(thisObj.mainContWidth /
                totalCategories) - margin,                           350)
                : Math.max(Math.floor((thisObj.mainContWidth / 3)) - margin, 350);
            let skip: number;
            skip = thisObj.returnSkip(chartWidth);
            let countOfFirstBox: number = 0;
            let indexCounter: number = 0;
            const isLegend : number = (thisObj.maxLineIsOn || thisObj.minLineIsOn || thisObj.avgLineIsOn || thisObj.constantLineIsOn)
            ? $('.legend').height() : 0;
            const chartHeight: number = totalCategories <= skip ? thisObj.mainContHeight - $('.topCont').height() - isLegend :
            Math.floor(thisObj.mainContHeight / 2) - 30;
            $('.menuRangeforBinning').hide();
            $('.menuViewAs p').text(thisObj.chartType);
            if (thisObj.numberCategory) {
                $('.menuRangeforBinning').show();
                // tslint:disable-next-line:prefer-const
                let countValues: {};
                const binSize: number = finalData.length % thisObj.numberOfBins === 0 ?
                    finalData.length / thisObj.numberOfBins : Math.floor(finalData.length / thisObj.numberOfBins);
                let counter: number;
                let count: number;
                // tslint:disable-next-line:no-any
                let binRangeData: any = [];
                // tslint:disable-next-line:no-any
                const catData: any = [];
                let iCounter: number;
                let jCounter: number;

                // tslint:disable-next-line:max-line-length
                for (counter = 0, count = thisObj.numberOfBins; finalData.length % thisObj.numberOfBins === 0 ? counter < binSize : counter <= binSize; count = count + thisObj.numberOfBins, counter++) {
                    // tslint:disable-next-line:no-any
                    const array: any[] = [];
                    // tslint:disable-next-line:no-any
                    const keys: any = [];
                    // tslint:disable-next-line:no-any
                    let uniqueKeys: any;
                    uniqueKeys = [];
                    const sum: number[] = [];
                    const selectionIDs: ISelectionId[] = [];
                    // tslint:disable-next-line:no-any
                    finalData.forEach(function (data: any, index: number): any {
                        if (index >= count - thisObj.numberOfBins && index < count) {
                            // tslint:disable-next-line:no-any
                            data.forEach(function (datum: any): any {
                                if (datum.key !== '') {
                                    array.push(datum);
                                    keys.push(datum.key);
                                    selectionIDs.push(datum.values[`selectionId`]);
                                }
                            });
                        }
                    });

                    // tslint:disable-next-line:no-any
                    uniqueKeys = keys.filter(function (item: any, pos: any): any {
                        return keys.indexOf(item) === pos;
                    });
                    // tslint:disable-next-line:no-any
                    const selec: any = [];
                    let sumCount: number;
                    // tslint:disable-next-line:no-any
                    let s: any = [];
                    for (iCounter = 0; iCounter < uniqueKeys.length; iCounter++) {
                        sumCount = 0;
                        s = [];
                        for (jCounter = 0; jCounter < array.length; jCounter++) {
                            if (uniqueKeys[iCounter] === array[jCounter].key) {
                                sumCount = sumCount + array[jCounter].values[`value`];
                                s.push(array[jCounter].values[`selectionId`]);
                            }
                        }
                        selec.push(s);
                        sum.push(sumCount);
                    }
                    // tslint:disable-next-line:no-any
                    countValues = uniqueKeys.map(function (element: any, index: any): any {
                        return { key: element, values: { value: sum[index], selectionId: selec } };
                    });

                    const secondName: string = (counter === binSize ?
                        categories[categories.length - 1] : categories[count - 1]);
                    const cat: string = thisObj.numberOfBins === 1 ? categories[count - thisObj.numberOfBins] :
                        `(${(categories[count - thisObj.numberOfBins] === null ? 'Null' :
                            thisObj.binColumnformatter.format(categories[count - thisObj.numberOfBins]))} - ${secondName === null ?
                                'Null' : thisObj.binColumnformatter.format(secondName)})`;
                    binRangeData.push(countValues);
                    catData.push(cat);
                }

                // tslint:disable-next-line:no-any
                binRangeData = binRangeData.map(function (element: any, index: number): any {
                    return {
                        data: element,
                        cat: catData[index]
                    };
                });
                let lCounter: number;
                lCounter = 0;
                thisObj.previousDataLength = 0;
                let totalBinData: number;
                totalBinData = 0;
                totalCategories = catData.length;
                chartWidth = totalCategories <= 2 ? Math.max(Math.floor(thisObj.mainContWidth /
                    totalCategories) - margin,               350)
                    : Math.max(Math.floor((thisObj.mainContWidth / 3)) - margin, 350);
                skip = thisObj.returnSkip(chartWidth);
                // tslint:disable-next-line:no-any
                binRangeData.forEach(function (data: any, index: number): any {
                    if (index % skip === 0) {
                        countOfFirstBox++;
                        totalBinData = 0;
                        let rowIndex: number;
                        for (rowIndex = index; rowIndex < index + skip; rowIndex++) {
                            if (rowIndex < binRangeData.length) {
                                totalBinData = totalBinData + binRangeData[rowIndex].data.length;
                            }
                        }
                        totalBinData = totalBinData / skip;

                        // 15 is bar height; 16 is label Height; 10 is label margin-bottom
                        if (thisObj.chartType.toLowerCase() === 'bar') {
                        totalBinData = Math.min((totalBinData * 15) + 16 + 10, thisObj.mainContHeight);
                        }
                        if (thisObj.chartType.toLowerCase() === 'brick') {
                            totalBinData = Math.min(((totalBinData / Math.floor(chartWidth / 60)) * 35) + 16 + 10, thisObj.mainContHeight);
                        }
                    }
                    thisObj.previousDataLength = lCounter === 0 ? 0 : thisObj.previousDataLength + binRangeData[lCounter - 1].data.length;
                    lCounter++;
                    const marginForCenter: number = thisObj.returnMarginForCenter(index, skip, chartWidth);
                    if ('bar' === thisObj.chartType.toLowerCase()) {
                        thisObj.renderBinBarChart(data.data, index, catData, chartWidth, chartHeight, totalBinData,
                                                  marginForCenter);
                    }
                    if ('brick' === thisObj.chartType.toLowerCase()) {
                        thisObj.renderBinBrickChart(data.data, index, catData, chartWidth, totalBinData,
                                                    marginForCenter);
                    }
                    if ('column' === thisObj.chartType.toLowerCase()) {
                        thisObj.renderBinColumnChart(data.data, index, catData, chartWidth, chartHeight,
                                                     marginForCenter);
                    }
                });
            }
            if (!thisObj.canUndo) {
                thisObj.canUndo = true;
            }

            let length: number;
            const categoriesLength: number = categories.length;
            let totalData: number = 0;
            let kCounter: number = 0;
            const prevDataLength: number = 0;
            thisObj.previousDataLength = 0;
            if (!thisObj.numberCategory && thisObj.chartType.toLowerCase() !== 'none') {
                // tslint:disable-next-line:no-any
                finalData.forEach(function (data: any, index: number): {} {
                        if (thisObj.chartType.toLowerCase() === 'bar' || thisObj.chartType.toLowerCase() === 'brick') {
                            if (finalData[index] === undefined) {
                                return;
                            }
                            if (indexCounter % skip === 0) {
                                countOfFirstBox++;
                                totalData = 0;
                                let rowIndex: number;
                                for (rowIndex = indexCounter; rowIndex < indexCounter + skip; rowIndex++) {
                                    if (rowIndex < finalData.length) {
                                        if (finalData[rowIndex] !== undefined) {
                                            totalData = totalData + finalData[rowIndex].length;
                                        }
                                    }
                                }

                                totalData = totalData / skip;
                                // 15 is bar height; 16 is label Height; 10 is label margin-bottom
                                if (thisObj.chartType.toLowerCase() === 'bar') {
                                totalData = Math.min((totalData * 15) + 16 + 10, thisObj.mainContHeight);
                                }
                                if (thisObj.chartType.toLowerCase() === 'brick') {
                                    totalData = Math.min(((totalData / Math.floor(chartWidth / 60)) *
                                    (thisObj.textSize * 2) + 20) + 16 + 10,
                                                         thisObj.mainContHeight);
                                }
                            }
                        }
                        if (categories.length <= 3 && thisObj.chartType.toLowerCase() === 'bar') {
                            totalData = thisObj.mainContHeight - 50;
                        }
                        thisObj.previousDataLength = kCounter === 0 ? 0 : thisObj.previousDataLength + finalData[kCounter - 1].length;

                        kCounter++;
                        const marginForCenter: number = thisObj.returnMarginForCenter(indexCounter, skip, chartWidth);
                        /***************BRICK CHART*******************/
                        if ('brick' === thisObj.chartType.toLowerCase()) {
                            length = data.length;
                            thisObj.previousLength = thisObj.previousLength < length
                                ? length : thisObj.previousLength;
                            thisObj.renderBrickChart(data, index, categories, length, chartWidth, totalData, marginForCenter);
                        }
                        /***************HTML BAR CHART*******************/
                        if ('bar' === thisObj.chartType.toLowerCase()) {
                                thisObj.renderBarChart(data, index, categories, chartWidth, chartHeight, totalData, marginForCenter);
                        }

                        /*********** COLUMN CHART *************/
                        if ('column' === thisObj.chartType.toLowerCase()) {
                                thisObj.renderColumnChart(data, index, categories, chartWidth, chartHeight, marginForCenter);
                        }
                        indexCounter++;
                });
            }
            if (thisObj.chartType.toLowerCase() === 'bar') {
                if (thisObj.mainContHeight > (countOfFirstBox * chartHeight) - skip * 10) {
                    d3.selectAll('.chart').style('height', thisObj.mainContHeight / countOfFirstBox - (60 / countOfFirstBox) + thisObj.px);
                    // tslint:disable-next-line:no-any
                    d3.selectAll('.subDiv').each(function(datum: any, index: number): void {
                        const currentHeight: number = $(this).height();
                        d3.select(this).classed(`subDiv${index}`);
                        d3.select(`.subDiv${index}`).style('height', thisObj.getHeight(currentHeight, countOfFirstBox) + thisObj.px);
                    }
                    );
                }
            }
            if (thisObj.chartType.toLowerCase() === 'brick') {
                if (thisObj.mainContHeight > (countOfFirstBox * chartHeight) - skip * 10) {
                    d3.selectAll('.brickChart').style('height', thisObj.mainContHeight / countOfFirstBox -
                        (60 / countOfFirstBox) + thisObj.px);
                }
            }

            /**************TABLE********************/
            if ('table' === thisObj.chartType.toLowerCase()) {
                   thisObj.drawColumnSelector(dataColumns);
                   // tslint:disable-next-line:no-any
                   const tableData: any = thisObj.calculateTableData(binData, finalData, categories);
                    // tslint:disable-next-line:no-any
                   if (dataColumns.length !== 0) {
                    // tslint:disable-next-line:no-any
                    tableData.forEach(function (data: any, index: number): any {
                        thisObj.renderTable(data, index, categories, dataColumns, thisObj.options);
                    });
                }
            }
            if (thisObj.binColumn === -1 && thisObj.chartType.toLowerCase() !== 'bar') {
                 $('.label').hide();
             }
        }

        //Use persisted properties
        public setOrient(options: VisualUpdateOptions): void {
            let objects: DataViewObjects = null;
            objects = this.dataView.metadata.objects;
            const chartTypeValue: string = this.settings.orient.prop;
            const xAxisValue: number = this.settings.orient.xaxis;
            const yAxisValue: number = this.settings.orient.yaxis;
            const binColumnValue: number = this.settings.orient.bin;
            const icolorValue: number = this.settings.orient.icolor;
            const jcolorValue: number = this.settings.orient.jcolor;
            const icolorValuetext: number = this.settings.orient.icolortext;
            const jcolorValuetext: number = this.settings.orient.jcolortext;
            const numberOfBins: number = this.settings.orient.noOfBins;
            const selectedColumns: string = this.settings.orient.columns;

            this.chartType = String(chartTypeValue);
            this.groupedColumn = yAxisValue;
            this.targetColumn = xAxisValue;
            this.binColumn = binColumnValue;
            this.iColumn = icolorValue;
            this.jColumn = jcolorValue;
            this.iColumntext = icolorValuetext;
            this.jColumntext = jcolorValuetext;
            this.numberOfBins = numberOfBins;
            this.selectedColumnsString = selectedColumns;
        }

        //Persist Properties
        public persistOrient(): void {
            let thisObj: this;
            thisObj = this;
            let properties: { [propertyName: string]: DataViewPropertyValue };
            properties = {};
            properties[`prop`] = thisObj.chartType;
            properties[`yaxis`] = thisObj.groupedColumn;
            properties[`xaxis`] = thisObj.targetColumn;
            properties[`bin`] = thisObj.binColumn;
            properties[`icolor`] = thisObj.iColumn;
            properties[`jcolor`] = thisObj.jColumn;
            properties[`icolortext`] = thisObj.iColumntext;
            properties[`jcolortext`] = thisObj.jColumntext;
            properties[`noOfBins`] = thisObj.numberOfBins;
            properties[`columns`] = thisObj.selectedColumnsString;
            let orient: VisualObjectInstancesToPersist;
            orient = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: 'orient',
                        selector: null,
                        properties: properties
                    }]
            };
            this.host.persistProperties(orient);
        }

        public setColumns(column: string, value: number): void {
            const thisObj: this = this;
            if (thisObj.dataPaneColumns.length !== 0 && thisObj.dataPaneColumns.length !== thisObj.dataView.metadata.columns.length) {
                    let newIndex: number = value;
                    // After update, selected column is undefined or not at same position
                    if ( (thisObj.dataView.metadata.columns[value] === undefined) ||
                    thisObj.dataPaneColumns[value].displayName !==
                    thisObj.dataView.metadata.columns[value].displayName) {
                        let flag: number = 0;
                        // Find its new position
                        for (let iterator: number = 0; iterator < thisObj.dataView.metadata.columns.length; iterator++) {
                            // Find based on its display name
                            if (thisObj.dataPaneColumns[value].displayName ===
                                thisObj.dataView.metadata.columns[iterator].displayName) {
                                // Found the column. Assign its new index to local variable
                                flag = 1;
                                newIndex = iterator;
                                break;
                            }
                        }

                        if (flag === 0 ) {
                            // If that column is not found then assign first as column
                            newIndex = 0;
                        }
                    }

                    if (column === 'bin') {
                        thisObj.binColumn = newIndex;
                    } else {
                        if (column === 'target') {
                            thisObj.targetColumn = newIndex;
                        } else {
                            thisObj.groupedColumn = newIndex;
                        }
                    }
                    thisObj.persistOrient();
            }
        }

        public update(options: VisualUpdateOptions): void {

            const thisObj: this = this;
            thisObj.isCategory = true;
            thisObj.renderedTime++;
            thisObj.viewModel = visualTransform(options, thisObj.host);
            thisObj.width = options.viewport.width;
            thisObj.height = options.viewport.height;
            thisObj.dataView = options.dataViews[0];

            const defaultColor: Fill = {
                solid: {
                    color: '#000000'
                }
            };
            if (options.type === 4 || options.type === 2 || options.type === 36) {
                thisObj.updateCalled = true;
                thisObj.type = true;
            }
            thisObj.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            if (thisObj.settings.fontSettings.fontSize > 25) {
                thisObj.settings.fontSettings.fontSize = 25;
            }

            const textProperties: TextProperties = {
                text: '$123.55',
                fontFamily: thisObj.settings.fontSettings.fontFamily,
                fontSize: `${thisObj.settings.fontSettings.fontSize}px`
            };
            thisObj.textSize = TextMeasurementService.measureSvgTextHeight(textProperties);
            thisObj.textWidth = TextMeasurementService.measureSvgTextWidth(textProperties);

            d3.selectAll('.topCont').remove();

            thisObj.maxLineIsOn = this.settings.analytics.maxLine;
            thisObj.minLineIsOn = this.settings.analytics.minLine;
            thisObj.avgLineIsOn = this.settings.analytics.avgLine;
            thisObj.maxLineStyle = this.settings.analytics.maxLineStyle;
            thisObj.minLineStyle = this.settings.analytics.minLineStyle;
            thisObj.avgLineStyle = this.settings.analytics.avgLineStyle;
            thisObj.maxLineFill = this.settings.analytics.maxLineFill;
            thisObj.minLineFill = this.settings.analytics.minLineFill;
            thisObj.avgLineFill = this.settings.analytics.avgLineFill;
            thisObj.maxLineOpacity = this.settings.analytics.maxLineOpacity;
            thisObj.minLineOpacity = this.settings.analytics.minLineOpacity;
            thisObj.avgLineOpacity = this.settings.analytics.avgLineOpacity;
            thisObj.maxLineDataLabel = this.settings.analytics.maxLineDataLabel;
            thisObj.minLineDataLabel = this.settings.analytics.minLineDataLabel;
            thisObj.avgLineDataLabel = this.settings.analytics.avgLineDataLabel;
            thisObj.constantLineIsOn = this.settings.analytics.constantLine;
            thisObj.constantLineValue = this.settings.analytics.constantLineValue;
            thisObj.constantLineStyle = this.settings.analytics.constantLineStyle;
            thisObj.constantLineFill = this.settings.analytics.constantLineFill;
            thisObj.constantLineOpacity = this.settings.analytics.constantLineOpacity;
            thisObj.constantLineDataLabel = this.settings.analytics.constantLineDataLabel;
            thisObj.value = this.settings.value.displayValue;

            // To manage removal of columns from data pane
            thisObj.setColumns('bin', thisObj.binColumn);
            thisObj.setColumns('target', thisObj.targetColumn);
            thisObj.setColumns('group', thisObj.groupedColumn);
            thisObj.dataPaneColumns = options.dataViews[0].metadata.columns;

            if (null === thisObj.groupedColumn || undefined === thisObj.groupedColumn) {
                $('.chartTypeMenu').hide();
                thisObj.groupedColumn = 0;
            }
            if (null === thisObj.binColumn || undefined === thisObj.binColumn) {
                thisObj.binColumn = 1;
            }
            if (null === thisObj.targetColumn || undefined === thisObj.targetColumn) {
                thisObj.targetColumn = 2;
            }
            if (null === thisObj.chartType || undefined === thisObj.chartType) {
                thisObj.chartType = 'Bar';
            }

            thisObj.setOrient(options);
            this.renderChart();
            this.setMargin();
            if (thisObj.width < $('.chart').width() || thisObj.width < $('.brickChart').width()
            || thisObj.width < $('.columnChart').width()) {
                d3.selectAll('.chart, .brickChart, columnChart').style('margin-left', '10px');
            }

            d3.selectAll('.mainCont, .chart, .columChart, .brickChart').on('click', function (): void {
                thisObj.hideMenus('none');
            });
            thisObj.type = false;
            d3.select('.presentationCont.xAxis').style('margin-left', function(): string {
                const parentWidth: number = $(this).width();

                return `${(thisObj.width / 2) - (parentWidth /  2) - 30}px`;
            });
        }

        private setMargin(): void {
            let thisObj: this;
            thisObj = this;
            if (!thisObj.settings.presentation.show) {
                let widthofTop9Elements: number = 0;
                let widthofTop6Elements: number = 0;
                let widthofTop4Elements: number = 0;
                let widthofTop3Elements: number = 0;
                let widthofTop2Elements: number = 0;
                let widthofTop1Elements: number = 0;

                const topMenuOptions: string[] = ['menuViewAs', 'menuBinningby', 'menuX', 'menuY',
                'menuColor', 'menuTextColor', 'menuRangeforBinning', 'menuUndo'];
                // tslint:disable-next-line:no-any
                let widthArray: any;
                widthArray = [];
                let kCounter: number = 0;
                let iCounter: number;

                for (iCounter = 0; iCounter < topMenuOptions.length; iCounter++) {
                    if ($(thisObj.dot + topMenuOptions[iCounter]).is(':visible')) {
                        widthArray[kCounter] = Math.floor($(thisObj.dot + topMenuOptions[iCounter]).width()  + 10);
                        if (kCounter < 9) {
                            widthofTop9Elements = widthofTop9Elements +  widthArray[kCounter];
                        }
                        if (kCounter < 6) {
                            widthofTop6Elements = widthofTop6Elements +  widthArray[kCounter];
                        }
                        if (kCounter < 4) {
                            widthofTop4Elements = widthofTop4Elements +  widthArray[kCounter];
                        }
                        if (kCounter < 3) {
                            widthofTop3Elements = widthofTop3Elements +  widthArray[kCounter];
                        }
                        if (kCounter < 2) {
                            widthofTop2Elements = widthofTop2Elements +  widthArray[kCounter];
                        }
                        if (kCounter < 1) {
                            widthofTop1Elements = widthofTop1Elements +  widthArray[kCounter];
                        }
                        kCounter++;
                    }
                }
                d3.select('.mainCont').style({
                    height : thisObj.width >=  widthofTop9Elements
                            ? thisObj.height - 80 + thisObj.px  : thisObj.width >= widthofTop4Elements
                            ? thisObj.height - 120 + thisObj.px :  thisObj.width >= widthofTop3Elements
                            ? thisObj.height - 160 + thisObj.px : thisObj.width >= widthofTop2Elements
                            ? thisObj.height - 200 + thisObj.px : thisObj.height - (widthArray.length * 40) + thisObj.px
                });
                d3.select('.mainCont').style({
                    'margin-top' : thisObj.width >=  widthofTop9Elements
                            ? 0 + thisObj.px  : thisObj.width >= widthofTop4Elements
                            ? 40 + thisObj.px :  thisObj.width >= widthofTop3Elements
                            ? 80 + thisObj.px : thisObj.width >= widthofTop2Elements
                            ? 120 + thisObj.px : thisObj.height - (widthArray.length - 1) * 40 + thisObj.px
                });
            }
        }
       // tslint:disable-next-line:no-any
       private hideMenus(menu: any): void {
        const thisObj: this = this;
        if (thisObj.flag === 1) {
            thisObj.flag = 0;
            thisObj.selectedColumnsString = thisObj.dataColIndex.join('-');
            thisObj.persistOrient();
            thisObj.setOrient(thisObj.options);
        }
        menu === thisObj.$binningCont ? thisObj.$binningCont.slideToggle() : thisObj.$binningCont.hide();
        menu === thisObj.$groupingCont ? thisObj.$groupingCont.slideToggle() : thisObj.$groupingCont.hide();
        menu === thisObj.$targetCont ? thisObj.$targetCont.slideToggle() : thisObj.$targetCont.hide();
        menu === thisObj.$chartTypeMenu ? thisObj.$chartTypeMenu.slideToggle() : thisObj.$chartTypeMenu.hide();
        $('.targetMenu').hide();
        menu === thisObj.$xAxis ? thisObj.$xAxis.slideToggle() : thisObj.$xAxis.hide();
        menu === thisObj.$yAxis ? thisObj.$yAxis.toggle('slide') : thisObj.$yAxis.hide();
        menu === thisObj.$colorContText ? thisObj.$colorContText.slideToggle() : thisObj.$colorContText.hide();
        menu === thisObj.$colorContShape ? thisObj.$colorContShape.slideToggle() : thisObj.$colorContShape.hide();
        menu === thisObj.$dynamicBinCont ? thisObj.$dynamicBinCont.slideToggle() : thisObj.$dynamicBinCont.hide();
        if (thisObj.$columnSelector !== undefined) {
            menu === thisObj.$columnSelector ? thisObj.$columnSelector.slideToggle() : thisObj.$columnSelector.hide();
        }
}

        // tslint:disable-next-line:no-any
        private getTooltipData(val: any, type: string, display: string, text: number, thisObj: this): VisualTooltipDataItem[] {
            let displayName: string;
            let value: string;

            if (type === 'line') {
                displayName = display;
                value = text === 0 ? text.toString() : thisObj.targetColumnformatter.format(text).toString();
            } else {
                displayName = val[`key`].toString();
                value = thisObj.targetColumnformatter.format(val[`values`][`value`]).toString();
            }

            return [{
                displayName: displayName,
                value: value.toString()
            }];
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            const objectEnumeration: VisualObjectInstance[] = [];
            if (options.objectName === 'presentation') {
                objectEnumeration.push({
                    objectName: options.objectName,
                    properties:
                        {
                            show: this.settings.presentation.show
                        },
                    selector: null
                });
            } else if (options.objectName === 'analytics') {
                if (this.chartType.toLowerCase() === 'bar' || this.chartType.toLowerCase() === 'column') {
                     // tslint:disable-next-line:no-any
                    const objProps: any = {};
                    objProps[`maxLine`] = this.settings.analytics.maxLine;
                    if (this.settings.analytics.maxLine) {
                        objProps[`maxLineStyle`] = this.settings.analytics.maxLineStyle;
                        objProps[`maxLineFill`] = this.settings.analytics.maxLineFill;
                        objProps[`maxLineOpacity`] = this.settings.analytics.maxLineOpacity;
                        objProps[`maxLineDataLabel`] = this.settings.analytics.maxLineDataLabel;
                    }

                    objProps[`minLine`] = this.settings.analytics.minLine;
                    if (this.settings.analytics.minLine) {
                        objProps[`minLineStyle`] = this.settings.analytics.minLineStyle;
                        objProps[`minLineFill`] = this.settings.analytics.minLineFill;
                        objProps[`minLineOpacity`] = this.settings.analytics.minLineOpacity;
                        objProps[`minLineDataLabel`] = this.settings.analytics.minLineDataLabel;
                    }
                    objProps[`avgLine`] = this.settings.analytics.avgLine;
                    if (this.settings.analytics.avgLine) {
                        objProps[`avgLineStyle`] = this.settings.analytics.avgLineStyle;
                        objProps[`avgLineFill`] = this.settings.analytics.avgLineFill;
                        objProps[`avgLineOpacity`] = this.settings.analytics.avgLineOpacity;
                        objProps[`avgLineDataLabel`] = this.settings.analytics.avgLineDataLabel;
                    }
                    objProps[`constantLine`] = this.settings.analytics.constantLine;
                    if (this.settings.analytics.constantLine) {
                        objProps[`constantLineValue`] = this.settings.analytics.constantLineValue;
                        objProps[`constantLineStyle`] = this.settings.analytics.constantLineStyle;
                        objProps[`constantLineFill`] = this.settings.analytics.constantLineFill;
                        objProps[`constantLineOpacity`] = this.settings.analytics.constantLineOpacity;
                        objProps[`constantLineDataLabel`] = this.settings.analytics.constantLineDataLabel;
                    }
                    objectEnumeration.push({
                        objectName: options.objectName,
                        properties: objProps,
                        selector: null
                    });
            }
            } else if (options.objectName === 'value') {
                if (this.chartType.toLowerCase() === 'bar') {
                objectEnumeration.push({
                    objectName: options.objectName,
                    properties:
                        {
                            displayValue: this.settings.value.displayValue
                        },
                    selector: null
                });
                }
            } else if (options.objectName === 'fontSettings') {
                objectEnumeration.push({
                    objectName: options.objectName,
                    properties:
                    {
                        fontSize: this.settings.fontSettings.fontSize,
                        fontFamily: this.settings.fontSettings.fontFamily
                    },
                    selector: null
                });
            }

            return objectEnumeration;
        }
    }
}
