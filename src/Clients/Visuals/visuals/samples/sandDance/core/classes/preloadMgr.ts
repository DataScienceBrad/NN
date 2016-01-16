///-----------------------------------------------------------------------------------------------------------------
/// preloadMgr.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - manages the list of preload items (each describes how to load a known file).
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /// Note: dataFrame does NOT change the original data, but it cache numeric vectors on-demand for each column. 
    export class PreloadMgrClass 
    {
        private appMgr: AppMgrClass;
        private _preloads: bps.Preload[];

        constructor(appMgr: AppMgrClass)
        {
            this.appMgr = appMgr;
            this.buildPreloads();
        }

        getPreloads()
        {
            return this._preloads;
        }

        getFilePreload(name: string)
        {
            name = name.toLowerCase();

            var preload: bps.Preload = null;

            for (var i = 0; i < this._preloads.length; i++)
            {
                var pl = this._preloads[i];
                if (pl.name.toLowerCase() === name)
                {
                    preload = pl;
                    break;
                }
            }

            return preload;
        }

        buildPreloads()
        {
            var preloads: bps.Preload[] = [];
            this._preloads = preloads;
            var isNextEdition = (this.appMgr._edition !== "client");

            //---- DEMOVOTE ----
            var demoVote = new bps.Preload("DemoVote", "demovote.txt", "US Census data merged with 2012 Election results", "Longitude", "Latitude", "Scatter");
            demoVote.addedBy = "sdrucker";
            demoVote.dateAdded = new Date("01/01/2014");
            demoVote.recordCount = 24669;
            demoVote.fieldList.push(new bps.PreloadField("Longitude", undefined, undefined, "number", undefined, "#0.00"));
            demoVote.fieldList.push(new bps.PreloadField("Latitude", undefined, undefined, "number", undefined, "#0.00"));
            demoVote.mergeFieldList = true;
            preloads.push(demoVote);

            if (isNextEdition)
            {
                //---- TrainInst ----
                var trainInst = new bps.Preload("TrainInst", "MLVis\\Train.inst.txt", "ML training data");
                trainInst.addedBy = "rfernand (via t-bijia)";
                trainInst.dateAdded = new Date("07/20/2015");
                trainInst.recordCount = 100000;
                preloads.push(trainInst);

                //---- Million Rows ----
                var millionRows = new bps.Preload("MillionRows", "millionRowsTwoCols.csv", "BeachParty test data");
                millionRows.addedBy = "rfernand (via t-bijia)";
                millionRows.dateAdded = new Date("11/02/2015");
                millionRows.recordCount = 1000000;
                preloads.push(millionRows);
            }

            //---- TITANIC ----
            var useNew = true;

            if (useNew)
            {
                var titanic = new bps.Preload("Titanic", "TitanicMaster.txt", "Titanic Passenger Data");
                titanic.colMappings.x.colName = "Age";
                titanic.colMappings.y.colName = "TicketCost";
            }
            else
            {
                var titanic = new bps.Preload("Titanic", "TitanicRevised.txt", "Titanic Passenger Data", "Fare", "Age", "Scatter");

                titanic.addField("CabinClass", "The class of the passenger's ticket", null, null, ["first", "second", "third"]);
                titanic.addField("Survived", "Whether or not the passenger survived", null, null, ["TRUE", "FALSE"]);
                titanic.addField("Name", "The name of the passenger");
                titanic.addField("Gender", "Whether the passenger was a male or a female", null, null, ["male", "female"]);
                titanic.addField("Age", "The age of the passenger at the time of the voyage");
                titanic.addField("TicketNumber", "The ticket number of the passenger");
                titanic.addField("Fare", "How much the passenger paid for his ticket (in US dollars)", null, "number");
                titanic.addField("Embarked", "The city in which the passenger boarded the Titanic");
            }

            titanic.addedBy = "sdrucker";
            titanic.dateAdded = new Date("10/15/2015");
            titanic.recordCount = 2207;
            preloads.push(titanic);

            //---- SALES ----
            var bigSales = new bps.Preload("Sales", "bigSalesData.csv", "Generated Sales Data", "Profit", "Sales", "Scatter");
            bigSales.hasTimeData = true;
            bigSales.recordCount = 8399;
            preloads.push(bigSales);

            //---- BABY NAMES ----
            var babyNames = new bps.Preload("BabyNames", "TopBabyNamesbyState.csv", "Top baby names, by state and year");
            babyNames.hasTimeData = true;
            babyNames.recordCount = 10506;
            preloads.push(babyNames);

            //---- COFFEE SALES ----
            var coffeeSales = new bps.Preload("CoffeeSales", "CoffeeSales.txt", "Coffee sales data");
            coffeeSales.hasTimeData = true;
            coffeeSales.recordCount = 4248;
            preloads.push(coffeeSales);

            if (isNextEdition)
            {
                //---- MGX SMALL ----
                var mgxSmall = new bps.Preload("MgxSmall", "mgxSmall.txt", "Microsoft Sales Data");
                mgxSmall.hasTimeData = true;
                mgxSmall.recordCount = 25634;
                preloads.push(mgxSmall);

                //---- ATHENS CA ----
                var athensCa = new bps.Preload("AthensCa", "Athens\\ca_microsoft_analytic.3.txt", "Political Data for California");
                athensCa.hasTimeData = true;
                athensCa.recordCount = 4000000;
                preloads.push(athensCa);

                ////---- STATES ----
                //var states = new bps.Preload("States", "CensusData/StateSummary.csv", "US Census data on States (2012)");
                //states.addField("Name", "The state's name");
                //states.addField("Population", "The population of the state in 2012", "CENSUS2010POP");
                //states.addField("Change", "The change in population of the state, since the previous year", "NPOPCHG_2012");
                //states.addField("Births", "The number of births in the state for 2012", "BIRTHS2012");
                //states.addField("Deaths", "The number of deaths in the state for 2012", "DEATHS2012");
                //states.colMappings = new bps.ColMappings("Population", "Longitude", null);
                //states.chartName = "Column";
                //states.prefilter = "Name == 'United States' || Name == 'Alaska' || Name == 'Puerto Rico' || Name == 'Hawaii' || " +
                //"Name.endsWith('Region')";
                //states.recordCount = 50;
                //preloads.push(states);

                ////---- FULLSTATES ----
                //var ttFields = ["Name", "CENSUS2010POP", "NPOPCHG_2012", "BIRTHS2012", "DEATHS2012"];
                //var fullStates = new bps.Preload("FullStates", "CensusData/StateSummary.csv", "US Census data on States (2012)", null,
                //    "Population", "Longitude", null, "Column");
                //fullStates.tooltipFieldList = ttFields;
                //fullStates.recordCount = 57;
                //preloads.push(fullStates);

                //---- RAINFALL ----
                var rainFall = new bps.Preload("RainFall", "US-Rainfall.csv", "US Rainfall data");
                rainFall.hasTimeData = true;
                rainFall.addedBy = "dabrown";
                rainFall.dateAdded = new Date("04/02/2014");
                rainFall.recordCount = 240000;                      // FIX THIS
                preloads.push(rainFall);
            }

            //---- MPG ----
            var mpg = new bps.Preload("MPG", "MPG.csv", "Car data, including miles/gallon", "cyl", "displ", "class", "Scatter");
            mpg.hasTimeData = true;
            mpg.recordCount = 234;
            preloads.push(mpg);

            if (isNextEdition)
            {
                //---- McDonalds ----
                var macDs = new bps.Preload("McDonalds", "macD.csv", "Location of all US McDonald's restaurants");
                macDs.recordCount = 43166;
                preloads.push(macDs);

                //---- PITCHES ----
                var pitches = new bps.Preload("Pitches", "baseball-pitches.csv", "Data on baseball pitches", "x", "y", "Scatter");
                pitches.hasTimeData = true;
                pitches.addedBy = "sdrucker";
                pitches.dateAdded = new Date("12/10/2014");
                pitches.recordCount = 134588;
                preloads.push(pitches);

                //---- IBM ----
                var ibm = new bps.Preload("IBM", "stockQuotes/ibm.csv", "IBM Stock Quotes", "Date", "Close", "Scatter");
                ibm.hasTimeData = true;
                ibm.recordCount = 13194;
                preloads.push(ibm);

                //---- MSFT ----
                var msft = new bps.Preload("MSFT", "stockQuotes/msft.csv", "Microsoft Stock Quotes", "Date", "Close", "Scatter");
                msft.hasTimeData = true;
                msft.recordCount = 7115;
                preloads.push(msft);

                //---- APPL ----
                var appl = new bps.Preload("APPL", "stockQuotes/appl.csv", "Apple Stock Quotes", "Date", "Close", "Scatter");
                appl.hasTimeData = true;
                appl.recordCount = 8440;
                preloads.push(appl);

                //---- AMZN ----
                var amzn = new bps.Preload("AMZN", "stockQuotes/amzn.csv", "Amazon Stock Quotes", "Date", "Close", "Scatter");
                amzn.hasTimeData = true;
                amzn.recordCount = 4288;
                preloads.push(amzn);

                //---- FACEBOOK ----
                var facebook = new bps.Preload("FaceBook", "stockQuotes/fb.csv", "Facebook Stock Quotes", "Date", "Close", "Scatter");
                facebook.hasTimeData = true;
                facebook.recordCount = 511;
                preloads.push(facebook);

                //---- GOOGLE ----
                var google = new bps.Preload("Google", "stockQuotes/googl.csv", "Google Stock Quotes", "Date", "Close", "Scatter");
                google.hasTimeData = true;
                google.recordCount = 2463;
                preloads.push(google);

                //---- ADULT CENSUS ----
                var uciAdults = new bps.Preload("Adult Census", "http://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data",
                    "Adult Census Data (from UCI repository)", "Col3", "Col4");

                uciAdults.addField("Age", "The age of the person", "Col1", "number");
                uciAdults.addField("WorkClass", "The type of employment that person has", "Col2");
                uciAdults.addField("Fnlwgt", "The census taker's estimate of household population", "Col3", "number");
                uciAdults.addField("Education", "The highest educational category acheived by the person", "Col4");
                uciAdults.addField("EdNum", "The numeric highest educational level acheived by the person", "Col5", "number");
                uciAdults.addField("Marital", "The marital status of the person", "Col6");
                uciAdults.addField("Occupation", "The occupation of the person", "Col7");
                uciAdults.addField("Relationship", "The primary family role of the person", "Col8");
                uciAdults.addField("Race", "The race of the person", "Col9");
                uciAdults.addField("Sex", "The biological sex of the person", "Col10");
                uciAdults.addField("CapitalGain", "Capital gains recorded", "Col11", "number");
                uciAdults.addField("CapitalLoss", "Capital losses recorded", "Col12", "number");
                uciAdults.addField("HoursPerWeek", "The number of hours worked per week by the person", "Col13", "number");
                uciAdults.addField("NativeCountry", "The country where the person was born", "Col14");
                uciAdults.addField("Income", "The income level for the person", "Col15");

                uciAdults.separator = ",";
                uciAdults.hasHeader = false;
                uciAdults.recordCount = 32562;
                preloads.push(uciAdults);

                //---- SQL server test ----
                var sqlServer = new bps.Preload("Headtrax (SQL 200K)",
                    "Server=localhost;Database=Headtrax;User ID=vibedemo;Password=vibedemo;Trusted_Connection=False;",
                    "Microsoft Headtrax employee/hire data");
                sqlServer.fileType = bps.FileType.sql;
                //sqlServer.tableName = "EmployeeData";
                sqlServer.queryString = "select * from EmployeeData where EmailName is not null";
                sqlServer.maxRecords = 50 * 1000;
                sqlServer.recordCount = 221353;                 // FIX THIS
                preloads.push(sqlServer);

                //---- AZURE account expired - this is no longer available ----
                ////---- AZURE SQL test ----
                //var azureSql = new bps.Preload("Azure SQL Test",
                //    "Server=tcp:ckwd6fictd.database.windows.net,1433;Database=RolandFour;User ID=rfernand@ckwd6fictd;Password=azure4Me;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;",
                //    "SQL test data, hosted in Azure");
                //azureSql.fileType = bps.FileType.sql;
                //azureSql.tableName = "TableOne";
                //azureSql.recordCount = 5280;                 // FIX THIS
                //preloads.push(azureSql);

                //---- KNOWN DATA (our "preloads" table)  ----
                var knownData = new bps.Preload("KnownData", "knownData.json", "The datasets that we know how to open");
                knownData.colMappings = new bps.ColMappings("dateAdded", "hasTimeData", null);
                knownData.hasTimeData = true;
                preloads.push(knownData);

                //---- this must be last ----
                knownData.recordCount = preloads.length;
            }

            //---- set file "fileSource" for all our preloads to "known" ----
            for (var i = 0; i < preloads.length; i++)
            {
                preloads[i].fileSource = "known";
            }
        }
    }
}
 