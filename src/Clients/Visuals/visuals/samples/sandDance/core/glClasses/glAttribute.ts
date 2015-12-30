//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    glAttribute.ts - small class to manage a webGL attribute.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module glUtils
{
    export class GlAttributeClass
    {
        _gl: any;
        _program: any;
        _attrLoc: any;
        _glBuffer: any;
        _sizeInFloats: number;
        _array: Float32Array;       //  number[];
        _nameInShader: string;

        constructor(gl: any, program: any, nameInShader: string, sizeInFloats: number)
        {
            this._gl = gl;
            this._program = program;
            this._sizeInFloats = sizeInFloats;
            this._nameInShader = nameInShader;
            this._array = null;

            var attrLoc = gl.getAttribLocation(program, nameInShader);
            this._attrLoc = attrLoc;

            if (attrLoc === -1)
            {
                //----for debugging/development purposes, ignore this error ----
                if (nameInShader !== "size2" && nameInShader !== "theta" && nameInShader !== "theta2")        // experiment
                {
                    //glUtils.error("Cannot locate shader attribute: " + nameInShader);
                }
            }
            else
            {
                var glBuffer = gl.createBuffer();
                this._glBuffer = glBuffer;

                this.rebindBuffer();
            }

        }

        rebindBuffer()
        {
            var gl = this._gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
            gl.enableVertexAttribArray(this._attrLoc);
            gl.vertexAttribPointer(this._attrLoc, this._sizeInFloats, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        setArray(array: any)
        {
            var gl = this._gl;
            this._array = array;

            if (this._attrLoc !== undefined && this._attrLoc !== -1 && array !== undefined)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }

    }
}

 