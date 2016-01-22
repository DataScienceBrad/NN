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
    export module commonUtils{
        export function getScale(continer: HTMLElement): { x: number, y: number } {
            var sandDanceRect = continer.getBoundingClientRect();

            return {
                x: sandDanceRect.width / continer.offsetWidth,
                y: sandDanceRect.height / continer.offsetHeight
            };
        }

        export function isFullscreenEnabled(): boolean {
            return document.fullscreenEnabled ||
                (<any> document).msFullscreenEnabled ||
                (<any> document).mozFullScreenEnabled ||
                document.webkitFullscreenEnabled;

        }

        export function getFullscreenElement(): Element {
            return document.fullscreenElement ||
                (<any> document).msFullscreenElement ||
                (<any> document).mozFullScreenElement ||
                document.webkitFullscreenElement;
        }

        export function isFullscreenActive(): boolean {
            return !!getFullscreenElement();
        }

        export function toggleFullScreen(element: HTMLElement) {
            if (isFullscreenActive()) {
                exitFullscreen();
            } else {
                requestFullscreen(element);
            }
        }

        export function requestFullscreen(element: HTMLElement): void {
            if (!element) {
                return;
            }

            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if ((<any> element).msRequestFullscreen) {
                (<any> element).msRequestFullscreen();
            } else if ((<any> element).mozRequestFullScreen) {
                (<any> element).mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
        }

        export function exitFullscreen(): void {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((<any> document).msExitFullscreen) {
                (<any> document).msExitFullscreen();
            } else if ((<any> document).mozCancelFullScreen) {
                (<any> document).mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
}
