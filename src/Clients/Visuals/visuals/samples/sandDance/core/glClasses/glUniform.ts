//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    glUniform.ts - small class to manage a webGL uniform.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module glUtils
{
    export class GlUniformClass
    {
        static uniformSetCount = 0;

        _gl: any;
        _program: any;
        _uniformLoc: any;
        _value: any;
        _typeStr: string;
        _nameInShader: string;
        _glSetter: any;         // gl function to set the uniform value

        constructor(gl: any, program: any, nameInShader: string, typeStr: string, initValue: any)
        {
            this._gl = gl;
            this._program = program;
            this._nameInShader = nameInShader;

            var uniformLoc = gl.getUniformLocation(program, nameInShader);
            if (uniformLoc === -1)
            {
                glUtils.error("Cannot locate shader uniform: " + nameInShader);
            }
            this._uniformLoc = uniformLoc;

            this._typeStr = typeStr;
            var setter = null;

            if (typeStr === "li")
            {
                setter = gl.uniform1i;
            }
            else if (typeStr === "1f" || typeStr === "f")
            {
                setter = gl.uniform1f;
            }
            else if (typeStr === "2f")
            {
                setter = gl.uniform2f;
            }
            else if (typeStr === "3f")
            {
                setter = gl.uniform3f;
            }
            else if (typeStr === "4f")
            {
                setter = gl.uniform4f;
            }
            else if (typeStr === "1fv" || typeStr === "fv")
            {
                setter = gl.uniform1fv;
            }
            else if (typeStr === "2fv")
            {
                setter = gl.uniform2fv;
            }
            else if (typeStr === "3fv")
            {
                setter = gl.uniform3fv;
            }
            else if (typeStr === "4fv")
            {
                setter = gl.uniform4fv;
            }
            else if (typeStr === "matrix3fv")
            {
                setter = gl.uniformMatrix3fv;
            }
            else if (typeStr === "matrix4fv")
            {
                setter = gl.uniformMatrix4fv;
            }
            else
            {
                utils.error("Unknown uniform type: " + typeStr);
            }

            this._glSetter = setter;

            if (initValue !== undefined && initValue != null)
            {
                this.setValue(initValue);
            }

        }

        isValueEqual(value: any)
        {
            if (vp.utils.isArray(value) || value instanceof Float32Array)
            {
                var eq = vp.arrayEquals(value, this._value);
            }
            else
            {
                var eq = (value === this._value);
            }

            return eq;
        }

        setValue(value: any)
        {
            var changed = (!this.isValueEqual(value));

            //---- don't call the relative expensive GPU setter unless value has actually changed ----
            if (changed)       // ! this.isValueEqual(value))
            {
                //vp.utils.debug("goUniform.setValue: name=" + this._nameInShader + ", old=" + this._value + ", new=" + value +
                //    ", changed=" + changed);

                this._value = value;
                GlUniformClass.uniformSetCount++;

                if (this._glSetter)
                {
                    var gl = this._gl;
                    var uniformLoc = this._uniformLoc;

                    if (!uniformLoc)
                    {
                        throw "uniformLoc is null for var name=" + this._nameInShader;
                    }

                    //vp.utils.debug("setValue uniformLoc=" + uniformLoc + ", value=" + value);

                    if (this._typeStr === "matrix4fv")
                    {
                        this._gl.uniformMatrix4fv(uniformLoc, gl.FALSE, value);
                    }
                    else if (this._typeStr === "matrix3fv")
                    {
                        this._gl.uniformMatrix3fv(uniformLoc, gl.FALSE, value);
                    }
                    else
                    {
                        //---- note: we must pass "gl" as the "this" ptr AND must pass all of our params  ----
                        var argArray = vp.utils.toArray(arguments);
                        argArray.insert(0, uniformLoc);

                        //this._glSetter.call(gl, uniformLoc, value);
                        this._glSetter.apply(gl, argArray);
                    }

                    if (gl.getError())
                    {
                        var msg = "glUniform.setValue error: name=" + this._nameInShader + ", value=" + value + ", uniformLoc=" + uniformLoc;
                        vp.utils.debug(msg);

                        throw msg;
                    }
                }
            }
        }
    }
}