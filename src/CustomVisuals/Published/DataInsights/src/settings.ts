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
    'use strict';
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {
        public analytics: AnalyticSettings = new AnalyticSettings();
        public presentation: PresentationSettings = new PresentationSettings();
        public orient: OrientSettings = new OrientSettings();
        public value: ValueSettings = new ValueSettings();
        public fontSettings: FontSettings = new FontSettings();
    }
    export class AnalyticSettings {
        public maxLine: boolean = false;
        public maxLineStyle: string = 'solid';
        public maxLineFill: string = '#000';
        public maxLineOpacity: number = 100;
        public maxLineDataLabel: boolean = false;
        public minLine: boolean = false;
        public minLineStyle: string = 'solid';
        public minLineFill: string = '#000';
        public minLineOpacity: number = 100;
        public minLineDataLabel: boolean = false;
        public avgLine: boolean = false;
        public avgLineStyle: string = 'solid';
        public avgLineFill: string = '#000';
        public avgLineOpacity: number = 100;
        public avgLineDataLabel: boolean = false;
        public constantLine: boolean = false;
        public constantLineValue: string = '0';
        public constantLineStyle: string = 'solid';
        public constantLineFill: string = '#fff';
        public constantLineOpacity: number = 100;
        public constantLineDataLabel: boolean = false;
    }

    export class OrientSettings {
        public prop: string = 'None';
        public xaxis: number = 0;
        public yaxis: number = 0;
        public bin: number = 0;
        public icolor: number = 2;
        public jcolor: number = 6;
        public noOfBins: number = 5;
        public icolortext: number = 0;
        public jcolortext: number = 12;
        public columns: string = '0';
    }

    // tslint:disable-next-line:max-classes-per-file
    export class PresentationSettings {
        public show: boolean = false;
    }

    // tslint:disable-next-line:max-classes-per-file
    export class ValueSettings {
        public displayValue: string = 'outside';
    }

    // tslint:disable-next-line:max-classes-per-file
    export class FontSettings {
        public fontSize: number = 12;
        public fontFamily: string = 'Times New Roman';
    }
}
