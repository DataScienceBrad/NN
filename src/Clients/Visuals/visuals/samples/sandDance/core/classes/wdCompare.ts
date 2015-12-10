//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    wdCompare.ts - compares 2 sets of wdParams.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class wdCompare 
    {
        public static valueEntriesMatch(entry1: bps.ValueMapEntry, entry2: bps.ValueMapEntry)
        {
            var match = true;

            if ((!entry1) || (!entry2))
            {
                match = (entry1 == entry2);
            }
            else if (entry1.originalValue != entry2.originalValue)
            {
                match = false;
            }
            else if (entry1.newValue != entry2.newValue)
            {
                match = false;
            }

            return match;
        }

        public static valueMapsMatch(map1: bps.ValueMapEntry[], map2: bps.ValueMapEntry[])
        {
            var match = true;

            if ((!map1) || (!map2))
            {
                match = (map1 == map2);
            }
            else
            {
                if (map1.length != map2.length)
                {
                    match = false;
                }
                else
                {
                    //---- check each entry ----
                    for (var i = 0; i < map1.length; i++)
                    {
                        var f1 = map1[i];
                        var f2 = map2[i];
                        if (!this.valueEntriesMatch(f1, f2))
                        {
                            match = false;
                            break;
                        }
                    }
                }
            }

            return match;
        }

        public static fieldsMatch(f1: bps.PreloadField, f2: bps.PreloadField)
        {
            var match = true;

            if ((!f1) || (!f2))
            {
                match = (f1 == f2);
            }
            else if (f1.name != f2.name)
            {
                match = false;
            }
            else if (f1.calcFieldExp != f2.calcFieldExp)
            {
                match = false;
            }
            else if (f1.description != f2.description)
            {
                match = false;
            }
            else if (f1.fieldType != f2.fieldType)
            {
                match = false;
            }
            else if (!vp.arrayEquals(f1.sortedValues, f2.sortedValues))
            {
                match = false;
            }
            else if (!this.valueMapsMatch(f1.valueMap, f2.valueMap))
            {
                match = false;
            }

            return match;
        }

        public static fieldListsMatch(list1: bps.PreloadField[], list2: bps.PreloadField[])
        {
            var match = true;

            if ((!list1) || (!list2))
            {
                match = (list1 == list2);
            }
            else
            {
                if (list1.length != list2.length)
                {
                    match = false;
                }
                else
                {
                    //---- check each field ----
                    for (var i = 0; i < list1.length; i++)
                    {
                        var f1 = list1[i];
                        var f2 = list2[i];
                        if (!this.fieldsMatch(f1, f2))
                        {
                            match = false;
                            break;
                        }
                    }
                }
            }

            return match;
        }
    }
} 