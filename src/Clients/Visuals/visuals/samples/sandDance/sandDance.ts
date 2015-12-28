/*
 *  Power BI Visualizations
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

/// <reference path="app/_references.ts" />
/// <reference path="../../../_references.ts" />

//--------- SandDance End.

module powerbi.visuals.samples {
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;

    module IdAndSelector {
        let idSelector: string = "#";

        export interface IdAndSelector {
            id: string;
            selector: string;
        }

        export function createIdAndSelector(id: string): IdAndSelector {
            return {
                id: id,
                selector: `${idSelector}${id}`
            }
        } 
    }

    export interface SandDanceData {
        [columnName: string]: any[];
    }

    export interface SandDanceDataView {
        data: SandDanceData;
    }

    export interface SandDanceConstructorOptions {
        margin?: IMargin;
    }

    interface PanelTable {
        ids: string[];
    }

    export class SandDance implements IVisual {
        private static ClassName: string = "sandDance";

        private static FileInfoSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("fileInfo");

        private static PlayAndIconBarSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("playAndIconBar");
        private static PlayPanelSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("playPanel");
        private static PlayExButtonSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("playExButton");
        private static StopButtonSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("stopButton");

        private static TextButtonSelector: ClassAndSelector = createClassAndSelector("textButton");

        private static IconBarSelector: ClassAndSelector = createClassAndSelector("iconBar");

        private static SearchPanelSelector: ClassAndSelector = createClassAndSelector("searchPanel");
        private static BtSearchColSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("btSearchCol");
        private static SearchColSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("searchCol");
        private static SearchTextSelector: ClassAndSelector = createClassAndSelector("searchText");

        private static LeftPanelSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("leftPanel");
        private static YStuffSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("yStuff");
        private static YButtonSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("yButton");
        private static YBinsSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("yBins");
        private static ZStuffSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("zStuff");
        private static ZButtonSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("zButton");
        private static ZBinsSelecotr: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("zBins");

        private static BigBarSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("bigBar");
        private static NoSpaceTableSelector: ClassAndSelector = createClassAndSelector("noSpaceTable");

        private static ChartSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("myChart");

        private static Canvas3DSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("canvas3d");
        private static Canvas2DSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("canvas2d");
        private static SvgSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("svgDoc");

        private static CanvasElementSelector: ClassAndSelector = createClassAndSelector("canvasElem");
        private static CanvasSelector: ClassAndSelector = createClassAndSelector("canvas");

        private static ChartUxDivSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("chartUxDiv");

        private static FacetLabelHolderSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("facetLabelHolder");

        private static RightPanelSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("rightPanel");
        private static ButtonLegendComboSelector: ClassAndSelector = createClassAndSelector("buttonLegendCombo");
        private static LegendSelector: ClassAndSelector = createClassAndSelector("legend");

        private static BottomPanelSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("bottomPanel");
        private static XStuffSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("xStuff");
        private static XButtonSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("xButton");
        private static XBinsSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("xBins");

        private static DebugPanelSelector: IdAndSelector.IdAndSelector = IdAndSelector.createIdAndSelector("debugPanel");
        private static DebugPanelItemSelector: ClassAndSelector = createClassAndSelector("debugPanel-item");

        private static Units: string = "px";

        private static DebugPanelItems: string[] = [
            "visStats",
            "gpuStats",
            "hitTestStats",
            "moveStats",
            "drawStats"
        ];

        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: "Values",
                kind: VisualDataRoleKind.GroupingOrMeasure
            }],
            dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 500 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                }
            }],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter("Visual_General"),
                    properties: {
                        formatString: { type: { formatting: { formatString: true } } }
                    }
                }
            }
        };

        private margin: IMargin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        private viewport: IViewport;

        private rootElement: D3.Selection;
        private mainElement: D3.Selection;
        private viewElement: D3.Selection;

        private canvas3dElement: D3.Selection;
        private canvas2dElement: D3.Selection;
        private svgElement: D3.Selection;

        //TODO: add other elements.

        private coreApplication: beachParty.appMgrClass;
        private application: beachPartyApp.appClass;

        private dataView: SandDanceDataView;

        constructor(constructorOptions?: SandDanceConstructorOptions) {
            if (constructorOptions) {
                this.margin = constructorOptions.margin || this.margin;
            }
        }

        public init(visualsOptions: VisualInitOptions): void {
            this.addElements(visualsOptions.element.get(0));

            this.setSize(visualsOptions.viewport);

            this.rootElement.style("margin", shapes.Thickness.toCssString(this.margin));

            this.application = new beachPartyApp.appClass();
            this.application.setViewport(this.viewport.width, this.viewport.height);
            this.application.run();

            this.coreApplication = new beachParty.appMgrClass();

            this.coreApplication.init(
                SandDance.Canvas3DSelector.id,
                SandDance.Canvas2DSelector.id,
                SandDance.SvgSelector.id,
                SandDance.FileInfoSelector.id,
                this.viewport.width,
                this.viewport.height,
                SandDance.DebugPanelItems[0],
                SandDance.DebugPanelItems[1],
                SandDance.DebugPanelItems[2],
                SandDance.DebugPanelItems[3],
                SandDance.DebugPanelItems[4]);

            this.application.coreApplication = this.coreApplication;
        }

        private addElements(element: HTMLElement): void {
            this.rootElement = d3.select(element)
                .append("div")
                .classed(SandDance.ClassName, true);

            this.mainElement = this.rootElement
                .append("div");

            this.addFileInfo();
            this.addPlayAndIconBarElement();
            //TODO: insightPanel ?
            this.addBigBarElement();
            this.addLeftPanelElement();
            this.addSearchPanelElement();
            this.addViewElement();
            this.addChartUxDivElement();
            this.addFacetLabelHolderElement();
            this.addRightPanelElement();
            this.addBottomPanelElement();
            //TODO: infoMsgBox ?
            this.addDebugPanelElement();
        }

        private addFileInfo(): void {
            this.mainElement
                .append("div")
                .attr("id", SandDance.FileInfoSelector.id);
        }

        private addPlayAndIconBarElement(): void {
            let trElement: D3.Selection,
                tdElement: D3.Selection;

            trElement = this.mainElement
                .append("table")
                .attr("id", SandDance.PlayAndIconBarSelector.id)
                .append("tr");

            tdElement = trElement
                .append("td")
                .attr("id", SandDance.PlayPanelSelector.id);

            tdElement
                .append("span")
                .attr("id", SandDance.StopButtonSelector.id)
                .classed(SandDance.TextButtonSelector.class, true);

            tdElement
                .append("span")
                .attr("id", SandDance.PlayExButtonSelector.id)
                .classed(SandDance.TextButtonSelector.class, true);

            trElement
                .append("td")
                .attr("id", SandDance.IconBarSelector.class)
                .classed(SandDance.IconBarSelector.class, true);
        }

        private addBigBarElement(): void {
            this.mainElement
                .append("div")
                .append("table")
                .attr("id", SandDance.BigBarSelector.id)
                .classed(SandDance.BigBarSelector.id, true)
                .classed(SandDance.NoSpaceTableSelector.class, true);
        }

        private addSearchPanelElement(): void {
            let searchPanel: D3.Selection,
                tr: D3.Selection;

            searchPanel = this.mainElement
                .append("table")
                .attr({
                    "id": SandDance.SearchPanelSelector.class,
                    "data-disabled": false
                })
                .classed(SandDance.SearchPanelSelector.class, true)
                .classed(SandDance.NoSpaceTableSelector.class, true);

            tr = searchPanel.append("tr");

            tr.append("td")
                .attr("id", SandDance.BtSearchColSelector.id)
                .append("span")
                .attr("id", SandDance.SearchColSelector.id);

            tr.append("td")
                .append("input")
                .attr({
                    "id": SandDance.SearchTextSelector.class,
                    "type": "text",
                    "title": "search for the specified text in the selected column (to the left)",
                    "placeholder": "Search",
                    "tabindex": 0
                })
                .classed(SandDance.SearchTextSelector.class, true);
        }

        private addLeftPanelElement(): void {
            let leftPanelElement: D3.Selection,
                yStuffElement: D3.Selection,
                yBinsElement: D3.Selection,
                zStuffElement: D3.Selection;

            leftPanelElement = this.mainElement
                .append("div")
                .attr("id", SandDance.LeftPanelSelector.id);

            yStuffElement = leftPanelElement
                .append("div")
                .attr("id", SandDance.YStuffSelector.id);

            yStuffElement
                .append("div")
                .attr("id", SandDance.YButtonSelector.id);

            yStuffElement
                .append("div")
                .attr("id", SandDance.YBinsSelector.id);

            zStuffElement = leftPanelElement
                .append("span")
                .attr("id", SandDance.ZStuffSelector.id);

            zStuffElement
                .append("span")
                .attr("id", SandDance.ZButtonSelector.id);

            zStuffElement
                .append("span")
                .attr("id", SandDance.ZBinsSelecotr.id);
        }

        private addViewElement(): void {
            this.viewElement = this.mainElement
                .append("div")
                .attr("id", SandDance.ChartSelector.id);

            this.canvas3dElement = this.viewElement
                .append("canvas")
                .attr("id", SandDance.Canvas3DSelector.id)
                .classed(SandDance.CanvasElementSelector.class, true)
                .classed(SandDance.CanvasSelector.class, true);

            this.canvas2dElement = this.viewElement
                .append("canvas")
                .attr("id", SandDance.Canvas2DSelector.id)
                .classed(SandDance.CanvasElementSelector.class, true)
                .classed(SandDance.CanvasSelector.class, true);

            this.svgElement = this.viewElement
                .append("svg")
                .attr("id", SandDance.SvgSelector.id)
                .classed(SandDance.CanvasSelector.class, true);
        }

        private addChartUxDivElement(): void {
            this.viewElement
                .append("div")
                .attr("id", SandDance.ChartUxDivSelector.id);
        }

        private addFacetLabelHolderElement(): void {
            this.mainElement
                .append("div")
                .attr("id", SandDance.FacetLabelHolderSelector.id);
        }

        private addRightPanelElement(): void {
            let rightPanel: D3.Selection,
                tables: PanelTable[] = [
                    {
                        ids: [ null, "colorButton", "opacityAdj", "colorLegend" ]
                    }, {
                        ids: [ null, "sizeButton", "sizeFactorAdj", "sizeLegend" ]
                    }, {
                        ids: [ "imageMapper", "imageButton", "imageAdj", "imageLegend" ]
                    }, {
                        ids: [ null, "facetButton", "facetBins", "facetLegend" ]
                    }
                ];

            rightPanel = this.mainElement
                .append("div")
                .attr("id", SandDance.RightPanelSelector.id);

            tables.forEach((table: PanelTable) => {
                this.addRightPanelItem(rightPanel, table.ids);
            });
        }

        private addRightPanelItem(element: D3.Selection, ids: string[] = []): void {
            let table: D3.Selection,
                firstTr: D3.Selection,
                secondTr: D3.Selection;

            table = element
                .append("div")
                .classed(SandDance.ButtonLegendComboSelector.class, true);

            firstTr = table
                .append("tr")
                .attr("id", () => ids[0] === undefined ? "" : ids[0])

            secondTr = table
                .append("tr");

            firstTr
                .append("td")
                .attr("id", ids[1]);

            firstTr
                .append("td")
                .attr("id", ids[2])
                .style("display", "none");

            secondTr
                .append("td")
                .attr("colspan", 2)
                .append("div")
                .attr("id", ids[3])
                .classed(SandDance.LegendSelector.class, true)
                .style("display", "none");
        }

        private addBottomPanelElement(): void {
            let bottomPanel: D3.Selection,
                table: D3.Selection,
                tr: D3.Selection;

            bottomPanel = this.mainElement
                .append("div")
                .attr("id", SandDance.BottomPanelSelector.id);

            table = bottomPanel
                .append("table")
                .attr("id", SandDance.XStuffSelector.id);

            tr = table.append("tr");

            tr.append("td")
                .attr("id", SandDance.XButtonSelector.id);

            tr.append("td")
                .attr("id", SandDance.XBinsSelector.id);
        }

        private addDebugPanelElement(): void {
            let debugPanel: D3.Selection;

            debugPanel = this.mainElement
                .append("div")
                .attr("id", SandDance.DebugPanelSelector.id);

            SandDance.DebugPanelItems.forEach((debugPanelItem: string) => {
                debugPanel
                    .append("div")
                    .attr("id", debugPanelItem)
                    .classed(SandDance.DebugPanelItemSelector.class, true);
            });
        }

        public update(visualUpdateOptions: VisualUpdateOptions): void {
            if (!visualUpdateOptions ||
                !visualUpdateOptions.dataViews ||
                !visualUpdateOptions.dataViews[0]){
                return;
            }

            let dataView: SandDanceDataView = this.converter(visualUpdateOptions.dataViews[0]);;

            this.setSize(visualUpdateOptions.viewport);
            this.updateElements();

            this.application.update(this.viewport.width, this.viewport.height);

            if (JSON.stringify(this.dataView) !== JSON.stringify(dataView)) {
                this.application.updateDataView(dataView.data);
            }

            this.dataView = dataView;
        }

        public converter(dataView: DataView): SandDanceDataView {
            let data: SandDanceData = {};

            if (dataView &&
                dataView.table &&
                dataView.table.columns &&
                dataView.table.columns.length > 0&&
                dataView.table.rows) {
                dataView.table.columns.forEach((column: DataViewMetadataColumn, index: number) => {
                    data[column.displayName] = dataView.table.rows.map((row: any[]) => {
                        return row[index];
                    });
                });
            }

            return { data };
        }

        private setSize(viewport: IViewport): void {
            let height: number,
                width: number;

            height =
                viewport.height -
                this.margin.top -
                this.margin.bottom;

            width =
                viewport.width -
                this.margin.left -
                this.margin.right;

            this.viewport = {
                height: height,
                width: width
            };
        }

        private updateElements(): void {
            let width: number = 0,
                height: number = 0;

            if (this.viewport) {
                width = this.viewport.width;
                height = this.viewport.height;
            }

            this.rootElement.style({
                width: `${width}${SandDance.Units}`,
                height: `${height}${SandDance.Units}`
            });
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration  {
            let enumeration = new ObjectEnumerationBuilder();

            return enumeration.complete();
        }

        public destroy(): void {
            this.rootElement = null;

            this.coreApplication = null;
            this.application = null;
        }
    }
}