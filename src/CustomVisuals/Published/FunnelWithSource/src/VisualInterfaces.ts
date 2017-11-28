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

module powerbi.extensibility.visual {
    import SelectionId = powerbi.visuals.ISelectionId;
    export interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface ILegendDataPoints {
        category: string;
        color: string;
        identity: visuals.ISelectionId;
    }
    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }
    export interface ITooltipDataPoints {
        name: string;
        value: string;
        formatter: string;
    }

    export interface ILabelSettings {
        color: string;
        displayUnits: number;
        decimalPlaces: number;
    }

    export interface IFunnelTitle {
        show: boolean;
        titleText: string;
        tooltipText: string;
        color: string;
        bkColor: string;
        fontSize: number;
    }

    export interface IHFDataPoint {
        primaryVal: number;
        secondaryVal: number;
        category: string;
        subCategory: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
        tooltipData: ITooltipDataPoints[];
    }

    export interface IBowtieDataPoint {
        source: string;
        destination: string;
        value: number;
        SourceArcWidth: number;
    }

    export interface IHFViewModel {
        hfDataPoints: IHFDataPoint[];
        bowtieDataPoint: IBowtieDataPoint[];
        primaryValMax: number;
        secondaryValMax: number;
        primaryMeasureName: string;
        secondaryMeasureName: string;
        categoryExists: boolean;
        primaryExists: boolean;
        secondaryExists: boolean;
        subCategoryExists: boolean;
        primaryFormatter: string;
        secondaryFormatter: string;
        categoryFormatter: string;
        subCategoryFormatter: string;
        hfTotalDataPoints: IHFDataPoint[];
    }

    export interface ISortSettings {
        sortBy: string;
        orderBy: string;
    }

    export interface IGradientColors {
        minColor: string;
        maxColor: string;
    }

    export interface IConnectorSettings {
        show: boolean;
        color: string;
    }
}
