//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    vector.ts - helper functions for working with vectors (of dataFrame).
//      - the vector can be a Float32Array or a number[].
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module vector
{
    /** return the number of entries that are true (or == 1). */
    export function countOn(vector: any)
    {
        var count = 0;

        for (var i = 0; i < vector.length; i++)
        {
            if (vector[i])
            {
                count++;
            }
        }

        return count;
    }

    /** return the number of entries that are false (or == 0). */
    export function countOff(vector: any)
    {
        var count = 0;

        for (var i = 0; i < vector.length; i++)
        {
            if (! vector[i])
            {
                count++;
            }
        }

        return count;
    }

    /** set each entry to 0. */
    export function clear(vector: any)
    {
        for (var i = 0; i < vector.length; i++)
        {
            vector[i] = 0;
        }
    }
}
 