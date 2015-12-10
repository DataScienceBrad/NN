//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    textureMaker.ts - utility class for building shape textures
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    export class textureMakerClass extends dataChangerClass
    {
        static textureCache = <any> {};
        static nextTextureId = 1;

        private _gl: any;
        private _makers: any[];       // funcs that draws the shape on the canvas
        private _texture: any;
        private _shapeCount = 0;
        private _potCount = 0;          // nearest powerOfTwo of shapeCount
        private _texPalette: string[];
        private _images: HTMLImageElement[];
        private _imagesLoaded = 0;

        constructor(texPalette: string[])
        {
            super();

            this._texPalette = texPalette;
            this._shapeCount = texPalette.length;
            this._potCount = this.nearestPowerOfTwo(this._shapeCount);
        }

        getTexture()
        {
            return this._texture;
        }

        getPotCount()
        {
            return this._potCount;
        }

        nearestPowerOfTwo(value: number)
        {
            var log = Math.log2(value);
            var ceil = Math.ceil(log);
            var pot = Math.pow(2, ceil);

            return pot;
        }

        public buildAsync(gl, texPalette: string[], isShapeNames: boolean)
        {
            this._gl = gl;
            var texture = null;
            if (texPalette.length == 1)
            {
                //---- cache only supports single entries ----
                var singleName = texPalette[0];
                texture = textureMakerClass.textureCache[singleName];
            }

            if (texture)
            {
                //---- texture found in cache! ----
                this._texture = texture;

                ////---- waste time ----
                //var dummy = 3;
                //for (var i = 0; i < 10000; i++)
                //{
                //    for (var j = 0; j < 10000; j++)
                //    {
                //        dummy += i * 3;
                //    }
                //}

                this.onDataChanged("loaded");
            }
            else
            {
                var texture = gl.createTexture();
                this._texture = texture;

                /// Note: non-power-of-two (NPOT) textures can NOT be used for mipmapping (setting image for each level) .

                //---- try to use powerOfTwo, since quality is MUCH higher ----
                var powerOfTwo = isShapeNames;

                gl.bindTexture(gl.TEXTURE_2D, texture);                     // normal 2D texture
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);               // flip texture about Y axis (like normal)

                if (powerOfTwo)
                {
                    //---- this is the important one, since our images are bigger and we need to shrink them when we map to a shape ----
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);      //_MIPMAP_NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);      
                }
                else
                {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);      
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }

                if (isShapeNames)
                {
                    this.buildShapeMakers(texPalette);

                    //---- now, load all of the minmap's manually ----
                    this.makeTextureLevel(0, 1024, 96);
                    this.makeTextureLevel(1, 512, 48);
                    this.makeTextureLevel(2, 256, 24);
                    this.makeTextureLevel(3, 128, 12);
                    this.makeTextureLevel(4, 64, 6);            // this is the largest size we currently draw
                    this.makeTextureLevel(5, 32, 3);
                    this.makeTextureLevel(6, 16, 2);
                    this.makeTextureLevel(7, 8, 1.5);
                    this.makeTextureLevel(8, 4, 1.25);
                    this.makeTextureLevel(9, 2, 1.125);

                    //---- have to keep calling until actualWidth (size * nearestPot(shapeCount)) gets down to 1 ----
                    var size = 1;
                    var level = 10;

                    while (true)
                    {
                        this.makeTextureLevel(level, size, 1);

                        var actualWidth = size * this._potCount;
                        if (actualWidth <= 1)
                        {
                            break;
                        }

                        size /= 2;
                        level++;
                    }

                    //---- texture COMPLETED ----
                    this.cacheTextureIfPossible();
                    this.onDataChanged("loaded");
                }
                else
                {
                    this.loadImagesFromPalette(texPalette);
                }
            }
        }

        buildShapeMakers(texPalette)
        {
            var makers = [];

            for (var i = 0; i < texPalette.length; i++)
            {
                var name = texPalette[i];
                var maker: any = {};

                maker.isFilled = name.startsWith("filled ");

                if (name.endsWith("circle"))
                {
                    maker.shapeMaker = this.circleMaker;
                }
                else if (name.endsWith("square"))
                {
                    maker.shapeMaker = this.squareMaker;
                }
                else if (name.endsWith("triangle"))
                {
                    maker.shapeMaker = this.triangleMaker;
                }
                else
                {
                    throw "Error: unknown texture shape: " + name;
                }

                makers.push(maker);
            }

            this._makers = makers;
        }

        private circleMaker(ctx: CanvasRenderingContext2D, size: number, strokeSize: number, xOffset: number, isFilled: boolean)
        {
            //---- draw the circle ----
            ctx.clearRect(xOffset, 0, size, size);

            var r = size / 2 - strokeSize / 2;
            ctx.beginPath();
            ctx.arc(xOffset + size / 2, size / 2, r, 0, 2 * Math.PI, false);

            if (!isFilled)
            {
                //---- outline ----
                ctx.lineWidth = strokeSize;
                ctx.strokeStyle = "white";
                ctx.stroke();
            }
            else
            {
                //---- filled ----
                ctx.fillStyle = "white";
                ctx.fill();

                //ctx.font = "50px Tahoma";
                //ctx.fillText("x", 0, 0);
            }
        }

        private triangleMaker(ctx: CanvasRenderingContext2D, size: number, strokeSize: number, xOffset: number, isFilled: boolean)
        {
            //---- draw the triangle ----
            ctx.clearRect(xOffset, 0, size, size);

            if (isFilled)
            {
                var xMin = xOffset;
                var xMax = xOffset + size;
                var yMin = 0;
                var yMax = size;
            }
            else
            {
                var fudge = .45 * strokeSize;
                var halfStroke = (strokeSize / 2) + fudge;

                var xMin = xOffset + halfStroke;
                var xMax = xOffset + size - halfStroke;
                var yMin = halfStroke;
                var yMax = size - halfStroke;
            }

            ctx.beginPath();
            ctx.moveTo(xMin, yMax);
            ctx.lineTo((xMin+xMax) / 2, yMin);
            ctx.lineTo(xMax, yMax);
            //ctx.lineTo(xMin, yMax);
            ctx.closePath();

            if (!isFilled)
            {
                //---- outline ----
                ctx.lineWidth = strokeSize;
                ctx.strokeStyle = "white";
                ctx.stroke();
            }
            else
            {
                //---- filled ----
                ctx.fillStyle = "white";
                ctx.fill();
            }
        }

        private squareMaker(ctx: CanvasRenderingContext2D, size: number, strokeSize: number, xOffset: number, isFilled: boolean)
        {
            if (isFilled)
            {
                //---- SOLID square ----
                var fudge = .45 * strokeSize;

                ctx.fillStyle = "white";
                var sz = size - 2 * fudge;

                ctx.fillRect(xOffset+fudge, 0+fudge, sz, sz);
            }
            else
            {
                var fudge = .45 * strokeSize;
                var halfStroke = (strokeSize / 2) + fudge;

                var xMin = xOffset + halfStroke;
                var xMax = xOffset + size - halfStroke;
                var yMin = halfStroke;
                var yMax = size - halfStroke;

                //---- OUTLINE rect ----
                ctx.clearRect(xOffset, 0, size, size);

                ctx.lineWidth = strokeSize;
                ctx.strokeStyle = "white";
                ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
            }
        }

        /** create an image sheet from loaded image elements. All images will be drawn using the size of the first image. */
        createImageSheet(images: HTMLImageElement[])
        {
            var imageCount = images.length;
            var width = images[0].width;
            var height = images[0].height;

            var totalWidth = imageCount * width;

            //---- create canvas we can draw on ----
            var canvasW = vp.select(document.createElement("canvas"))
                .attr("width", totalWidth)
                .attr("height", height)

            //---- get drawing context ----
            var canvas = <HTMLCanvasElement>canvasW[0];
            var ctx = canvas.getContext("2d");
            ctx.translate(0.5, 0.5);

            //---- draw the shapes onto the canvas ----
            for (var i = 0; i < imageCount; i++)
            {
                var image = images[i];

                //ctx.msImageSmoothingEnabled = true;
                ctx.drawImage(image, 0, 0, width, height, i * width, 0, width, height);
            }

            return canvas;
        }

        /** create an image sheet from the shapes to be drawn. */
        public createShapeImages(size: number, strokeSize: number)
        {
            var shapeCount = this._makers.length;

            //---- use next highest power of 2, to keep images looking good ----
            var potShapeCount = this._potCount;
            var actualSize = Math.max(1, size);

            var totalWidth = Math.max(1, potShapeCount * size);
            var totalHeight = actualSize;

            //---- create canvas we can draw on ----
            var canvasW = vp.select(document.createElement("canvas"))
                .attr("width", totalWidth)
                .attr("height", totalHeight)

            //---- get drawing context ----
            var canvas = <HTMLCanvasElement>canvasW[0];
            var ctx = canvas.getContext("2d");

            //---- draw the shapes ----
            for (var i = 0; i < this._makers.length; i++)
            {
                var maker = this._makers[i];

                maker.shapeMaker(ctx, actualSize, strokeSize, i * actualSize, maker.isFilled);
            }

            return canvas;
        }

        private loadImagesFromPalette(urls: string[])
        {
            this._images = [];
            this._imagesLoaded = 0;

            for (var i = 0; i < urls.length; i++)
            {
                var url = urls[i];
                var img = new Image();

                img.onload = (e) =>
                {
                    this._imagesLoaded++;
                    vp.utils.debug("URL image loaded:" + url);

                    if (this._imagesLoaded == urls.length)
                    {
                        //---- all needed images have now been loaded ----
                        if (urls.length == 1)
                        {
                            //---- simple case; don't need to create a sheet ----
                            this.loadTextureFromSheet(img);
                        }
                        else
                        {
                            var imgSheet = this.createImageSheet(this._images);
                            this.loadTextureFromSheet(imgSheet);
                        }

                    }
                };

                this._images.push(img);
                img.src = url;
            }  
        }

        /** imgSheet can be HTMLImageElement or canvas. */
        loadTextureFromSheet(imgSheet: any)     
        {
            var gl = this._gl;

            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgSheet);

            this.cacheTextureIfPossible();
            this.onDataChanged("loaded");
        }

        cacheTextureIfPossible()
        {
            if (this._texPalette.length == 1)
            {
                var name = this._texPalette[0];
                textureMakerClass.textureCache[name] = this._texture;
            }

            this._texture._id = textureMakerClass.nextTextureId++;

            this._texture.toString = (e) =>
            {
                return "texture#" + this._texture._id;
            };
        }

        private makeTextureLevel(level: number, size: number, strokeSize: number)
        {
            var gl = this._gl;

            var img = this.createShapeImages(size, strokeSize);

            //---- bind this img as the specified level for the texture ----
            //vp.utils.debug("makeTextureLevel: binding img to texture: level=" + level + " width=" + img.width + ", height=" + img.height);

            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            //if (level == 5)
            //{
            //    vp.select("#imgDebug")
            //        .attr("src", img.toDataURL())
            //        .css("display", "block")
            //}
        }
    }
}