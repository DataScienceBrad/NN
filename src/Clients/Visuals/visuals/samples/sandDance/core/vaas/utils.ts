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

/// <reference path="_references.ts" />

module sandDance {
    export class CommonUtils {
        private static _instance: CommonUtils;

        public static get instance(): CommonUtils {
            if (!CommonUtils._instance) {
                CommonUtils._instance = new CommonUtils();
            }

            return CommonUtils._instance;
        }

        constructor() {
            if (CommonUtils._instance) {
                return CommonUtils._instance;
            }
        }

        private _sandDanceElement: HTMLElement;

        public get sandDanceElement(): HTMLElement {
            if (!this._sandDanceElement) {
                this._sandDanceElement = $(".sandDance").get(0);
            }

            return this._sandDanceElement;
        }

        public getScale(): { x: number, y: number } {
            var sandDanceElement = this.sandDanceElement,
                sandDanceRect = sandDanceElement.getBoundingClientRect();

            return {
                x: sandDanceRect.width / sandDanceElement.offsetWidth,
                y: sandDanceRect.height / sandDanceElement.offsetHeight
            };
        }
    }
}
