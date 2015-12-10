//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    glUtils.ts - webGL utility functions.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module glUtils
{
    export function error(msg: string)
    {
        throw msg;
    }

    export function getContext(canvas: HTMLCanvasElement, options?: any)
    {
        var gl = null;

        try
        {
            gl = canvas.getContext("webgl", options);
            if (!gl)
            {
                gl = canvas.getContext("experimental-webgl", options);
            }
        }
        catch (ex)
        {
            error("error getting WebGL context: " + ex);
        }

        if (!gl)
        {
            error("Unable to initialize WebGL");
        }

        return gl;
    }

    export function findAndCompileShader(gl: any, shaderId: string, isVertexShader: boolean)
    {
        var url = beachParty.getMyPath() + "/" + shaderId + "?foo=" + Date.now();
        //var shaderStr = <string>beachParty.fileAccess.readFile(url, beachParty.fileFormat.text);//TODO: read file from cache instead the net.

        var shaderStr: string = shadersCache.getShaderCodeByName(shaderId);

        var shader = null;

        if (isVertexShader)
        {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else //if (shaderElem.type == "x-shader/x-fragment")
        {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            //shaderStr = "void main(void) { 	if ( 2.0 > 3.0) 		discard;  }";
        }


        gl.shaderSource(shader, shaderStr);
        gl.compileShader(shader);

        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!status)
        {
            var errMsg = gl.getShaderInfoLog(shader);
            error("compiling shader: " + shaderId + ", error=" + errMsg);
        }

        return shader;
    }

    export function buildProgram(gl: any, shaders: any[])
    {
        var program = gl.createProgram();

        for (var i = 0; i < shaders.length; i++)
        {
            var shader = shaders[i];
            gl.attachShader(program, shader);
        }

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            var errMsg = gl.getProgramInfoLog(program);
            error("Error building webGL program: " + errMsg);
        }

        return program;
    }

    export function addAttribute(attributeMap: any, gl, program, nameInShader: string, sizeInFloats: number)
    {
        var attr = new glAttributeClass(gl, program, nameInShader, sizeInFloats);
        attributeMap[nameInShader] = attr;

        return attr;
    }

    export function addUniform(uniformMap: any, gl, program, nameInShader: string, typeStr: string, initialValue?: any)
    {
        var uniform = new glUniformClass(gl, program, nameInShader, typeStr, initialValue);
        uniformMap[nameInShader] = uniform;

        return uniform;
    }

    export function colorNamesOrValuesToFloats(names: string[])
    {
        var floats = new Float32Array(names.length * 3);
        var nextOffset = 0;

        for (var i = 0; i < names.length; i++)
        {
            var name = names[i];
            var rgb: number[];

            if (vp.utils.isString(name))
            {
                rgb = vp.color.getColorFromString(name);
            }
            else
            {
                rgb = <number[]><any>name;
            }

            floats[nextOffset++] = rgb[0]/255;
            floats[nextOffset++] = rgb[1]/255;
            floats[nextOffset++] = rgb[2]/255;
        }

        return floats;
    }

    export function configDevice(gl: any, width: number, height: number, clearColor, useBlending: boolean, useCulling: boolean)
    {
        //---- avoid WebGL errors before window is resized (during initialization) ----
        width = Math.max(0, width);
        height = Math.max(0, height);

        gl.viewport(0, 0, width, height);

        //---- store in custom properties for later use as needed ----
        gl.canvasWidth = width;
        gl.canvasHeight = height;

        //---- CLEAR GL rendering target ----
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]); 

        if (useCulling)
        {
            gl.frontFace(gl.CCW);              // counter-clockwise triangles are FRONT faces

            //---- don't understand why, but gl.FRONT seems to match normal non-culled drawing whereas gl.BACK doesn't ----
            gl.cullFace(gl.FRONT);      // BACK);              // gl.BACK is the default (do not draw back faces)

            gl.enable(gl.CULL_FACE);           // enable culling
        }
        else
        {
            gl.disable(gl.CULL_FACE);
        }

        gl.enable(gl.DEPTH_TEST);

        //---- init blending ----
        if (useBlending)
        {
            //---- TODO: for proper blending, we need to sort shapes (mesh primitives) by scaled z value ----
            //---- can we do the sorting somehow on the GPU (gp-gpu)? ----

            //---- CPU idea to try: map z-bound data to a large set of discreet values (say ints from 0-999) ----
            //---- and as they are mapped, assign them to a bucket for that discreet value ----
            //---- then, load all shapes in bucket order.  this just requires 1 pass over data ----
            //---- the z-scaling and bucket assignment, and then 1 more pass for the shape loading.  ----
            //---- much better than a sort of 5 million items, for example! ----

            gl.disable(gl.DEPTH_TEST);           // must turn off (takes priority over blending)
            gl.enable(gl.BLEND);

            //var isIE11 = vp.utils.isIE11;
            if (! gl.blendFuncSeparat)      // isIE11)
            {
                //---- IE11 bug workaround - use simple blending because IE11 doesn't support the below alternative ----
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
            else
            {
                //---- TODO: this does not exactly match canvas blending, but it is VERY CLOSE ----
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA_SATURATE, gl.DST_ALPHA);

                //gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA_SATURATE, gl.ONE_MINUS_SRC_ALPHA);
            }

            //gl.depthMask(false);
        }
        else
        {
            //---- we can either set to zbuffer testing or blending (but not both) ----
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
        }
    }
} 