//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    cubeMesh.ts - defines cube vertices, normals, and triangles.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export var cubeMesh:any = {};

    /** Defines the geometry for a CUBE object (vertices, normals, and texture coordinates).  Note
        that triangles are defined with FRONT side trinagle points in CCW (counter-clockwise) order. */
    export function buildCubeMesh()
    {
        cubeMesh = {};

        cubeMesh.vertices = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];

        //---- normalize the mesh ----
        cubeMesh.vertices = cubeMesh.vertices.map(function (d, i) { return d / 2; });

        cubeMesh.vertexNormals = [
        // Front face
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

        // Back face
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

        // Top face
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

        // Bottom face
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

        // Right face
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // Left face
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ];

        cubeMesh.uv = [
        // Front
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Back
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Top
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Bottom
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Right
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Left
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];

        /** This allows us to draw with perspective camera but still only see the front of a cube (to emulate a 2D view). */ 
        cubeMesh.uvFrontOnly = [
        // Front
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        // Back
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
        // Top
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
        // Bottom
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
        // Right
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
        // Left
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0,
            0.0, 0.0
        ];

        //---- these are the indicies (reference the vertexes/uv by index) ----
        cubeMesh.triangles =
        [
        //---- FOR 24 VERTICES ----
            0, 1, 2, 0, 2, 3,    // front (CCW)
            4, 5, 6, 4, 6, 7,    // back (CW)
            8, 9, 10, 8, 10, 11,   // top (CCW)
            12, 13, 14, 12, 14, 15,   // bottom (CCW)
            16, 17, 18, 16, 18, 19,   // right (CCW)
            20, 21, 22, 20, 22, 23    // left (CCW)
        ];

        //---- flip UV vertically (to correct for upside-down bitmap ----
        for (var i = 1; i < cubeMesh.uv.length; i += 2)
        {
            var v = cubeMesh.uv[i];
            cubeMesh.uv[i] = (v === 0) ? 1 : 0;
        }

        //---- convert to float32Arrays for setting as shader uniform values ----
        cubeMesh.vertices = new Float32Array(cubeMesh.vertices);
        cubeMesh.vertexNormals = new Float32Array(cubeMesh.vertexNormals);
        cubeMesh.uv = new Float32Array(cubeMesh.uv);
        cubeMesh.triangles = new Float32Array(cubeMesh.triangles);

    }
}