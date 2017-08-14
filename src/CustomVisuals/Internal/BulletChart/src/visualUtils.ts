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
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export module visualUtils {
        export function getValue(d: number, format: string, isTooltip: boolean = false, labelConfig ?: ILabelSettings): string {
            let displayFormatter = 0;
            let primaryFormatter: any;
            if (isTooltip) {
                primaryFormatter = valueFormatter.create({
                    format: format,
                    value: displayFormatter,
                    precision: getDecimalPlacesCount(d.toString())
                });
            } else {
                if (labelConfig.labelDisplayUnits === 0) {
                    let alternateFormatter = parseInt(d.toString(), 10).toString().length;
                    if (alternateFormatter > 9) {
                        displayFormatter = 1e9;
                    } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                        displayFormatter = 1e6;
                    } else if (alternateFormatter <= 6 && alternateFormatter > 4) {
                        displayFormatter = 1e3;
                    } else {
                        displayFormatter = 10;
                    }
                } else {
                    displayFormatter = labelConfig.labelDisplayUnits;
                }
                primaryFormatter = valueFormatter.create({
                    format: format,
                    value: displayFormatter,
                    precision: labelConfig.labelDecimalPlaces
                });
            }
            let val = primaryFormatter.format(d);

            return val;
        }

        export function getDecimalPlacesCount(value: string): number {
            let decimalPlaces: number = 0;
            if (value && value.split('.').length > 1) {                                
                decimalPlaces = value.split('.')[1].length;                
            }
            return decimalPlaces;
        }
    }
}
