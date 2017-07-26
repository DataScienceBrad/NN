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
    export interface DotPlotDataPoints {
        dataPoints: DotPlotViewModel[];
        xTitleText: string;
        yTitleText: string;
    }

    export interface TooltipDataPoints {
        name: string;
        value: string;
    }

    export interface LegendDataPoint {
        category: string;
        value: number;
        color: string;
        identity: powerbi.visuals.ISelectionId;
        selected: boolean;
    }

    export interface DotPlotViewModel {
        category: string;
        categoryGroup: string;
        value: number;
        selectionId: ISelectionId;
        categoryColor: string;
        categorySize: number;
        tooltipData: TooltipDataPoints[];
        xCategoryParent: string;
        updatedXCategoryParent: string;
        highlights: any;
    }

    export interface AxisSettings {
        show: boolean;
        start: number;
        end: number;
        fontColor: string;
        fontSize: number;
        decimalPlaces: number;
        displayUnits: number;
        minWidth: number;
        showTitle: boolean;
        titleText: string;
        titleColor: string;
        titleSize: number;
    }

    export interface ParentAxisSettings {
        split: boolean;
        fontColor: string;
        fontSize: number;
    }

    export interface BackgroundSettings {
        bgPrimaryColor: string;
        bgSecondaryColor: string;
        bgTransparency: number;
        show: boolean;
    }

    export interface GridLinesSettings {
        showAxisGridLines: boolean;
        thickness: number;
        color: string;
        showCategoryGridLines: boolean;
        categoryThickness: number;
        categoryColor: string;
    }

    export interface TickSettings {
        showAxisTicks: boolean;
        thickness: number;
        color: string;
        showCategoryTicks: boolean;
        categoryTickThickness: number;
        categoryTickColor: string;
    }

    export interface GradientSelectorSettings {
        minColor: string;
        maxColor: string;
    }

    export interface RangeSettings {
        min: number;
        max: number;
        borderColor: string;
        transparency: number;
    }

    export interface LegendConfig {
        show: boolean;
        legendName: string;
        showTitle: boolean;
        labelColor: string;
        fontSize: number;
        sizeLegendColor: string;
        displayUnits: number;
        decimalPlaces: number;
    }

    export interface FlipSettings {
        orient: string;
        flipText: boolean;
        flipParentText: boolean;
    }
}
