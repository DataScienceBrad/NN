//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataChanger.ts - base class for classes that change data (supports lightweight MVC).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export var dcRegisterCount = 0;
    export var dcChangedCount = 0;
    export var dcCallbackCount = 0;
    export var dcUnregisterCount = 0;

    /// Lightweight MVC rules:
    ///
    ///    1. each chunk of data shared between classes (e.g. the app, controls, and dialogs) should be associated with exactly one
    ///          owner class.
    ///
    ///    2. [MODEL] any class that owns shared data should:
    ///         - extend the base class "dataChangerClass" 
    ///         - expose the data with a property getter/setter function
    ///         - when the data is changed (thru the setter or directly), the "onDataChanged()" method should be called
    ///
    ///    3. [VIEW-write] any class that changes shared data should:
    ///         - extend the base class "dataChangerClass" 
    ///         - expose the data with a property getter/setter function
    ///         - when the data is changed (thru the setter or directly), the "onDataChanged()" method should be called
    ///
    ///    5. [CONTROLLER] the code creating a VIEW class should call "connectModelView()" to connect shared data changes
    ///         between the view and the associated owner class.
    ///
    /// This way, the model classes don't have to track the connected view classes and the view classes don't have to known who
    /// the owner/model classes are.  It makes model classes easier to maintain, and enables view classes to be reusable.  The 
    /// messy event-connection code is handled by the "connectModelView()" calls.

    export class DataChangerClass implements IDataChanger
    {
        _callbacks: any = {};                           // used to register listeners for changes to our data
        _pendingDataChange: any = {};                   // used to set "changer" for an upcoming "onDataChanged()" call

        constructor() {
            
        }

        registerForChange(name: string, callback: any)
        {
            dcRegisterCount++;

            var callbacks = this._callbacks[name];
            if (!callbacks)
            {
                callbacks = [];
                this._callbacks[name] = callbacks;
            }

            var entry = new CallbackEntry(null, callback);

            //---- don't add if already there ----
            if (callbacks.indexOf(entry) === -1)
            {
                callbacks.push(entry);
            }
        }

        registerForRemovableChange(name: string, context: any, callback: any)
        {
            dcRegisterCount++;

            var callbacks = this._callbacks[name];
            if (!callbacks)
            {
                callbacks = [];
                this._callbacks[name] = callbacks;
            }

            var entry = new CallbackEntry(context, callback);

            //---- don't add if already there ----
            if (callbacks.indexOf(entry) === -1)
            {
                callbacks.push(entry);
            }
        }

        unregisterForChanges(context: any, name?: string)
        {
            dcUnregisterCount++;

            if (name)
            {
                //---- unhook caller from named event ----
                var callbacks = <CallbackEntry[]> this._callbacks[name];

                for (var i = callbacks.length - 1; i >= 0; i--)
                {
                    var entry = callbacks[i];
                    if (entry.context === context)
                    {
                        callbacks.removeAt(i);
                    }
                }
            }
            else
            {
                //---- unhook caller from all events ----
                var keys = vp.utils.keys(this._callbacks);

                for(var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    this.unregisterForChanges(context, key);
                }
            }
        }

        onDataChanged(name: string, changedBy?: any, ...params: string[])
        {
            dcChangedCount++;

            if (!changedBy)
            {
                changedBy = this._pendingDataChange[name];
                if (changedBy)
                {
                    //---- clear it ----
                    delete this._pendingDataChange[name];
                }
            }

            changedBy = changedBy || this;

            if (name === null || name === undefined)
            {
                //---- trigger all names ----
                var keys = vp.utils.keys(this._callbacks);

                for (var i = 0; i < keys.length; i++)
                {
                    var name = keys[i];

                    this.triggerCallbacks(name, changedBy, params);
                }
            }
            else
            {
                this.triggerCallbacks(name, changedBy, params);
            }
        }

        triggerCallbacks(name: string, changedBy: string, params: string[])
        {
            var callbacks = <CallbackEntry[]>this._callbacks[name];
            if (callbacks)
            {
                for (var i = 0; i < callbacks.length; i++)
                {
                    var entry = <CallbackEntry>callbacks[i];
                    var callback = entry.callback;

                    if (!entry.context || entry.context !== changedBy)
                    {
                        //callback(name, changedBy);
                        var newParams = [name, changedBy];
                        if (params)
                        {
                            newParams = newParams.concat(params);
                        }

                        dcCallbackCount++;

                        callback.apply(undefined, newParams);
                    }
                }
            }
        }

        setDataWithChanger(name: string, value: any, changer: any)
        {
            this._pendingDataChange[name] = changer;

            this[name](value);
        }
    }

    export function connectModelView(model: DataChangerClass, modelDataName: string, view: DataChangerClass, viewDataName: string)
    {
        //--- send changes from model to view ----
        model.registerForRemovableChange(modelDataName, view, (name, changer) =>
        {
            var value = model[modelDataName]();

            view.setDataWithChanger(viewDataName, value, model);
        });

        //--- send changes from view to model ----
        view.registerForRemovableChange(viewDataName, model, (name, changer) =>
        {
            var value = view[viewDataName]();

            model.setDataWithChanger(modelDataName, value, view);
        });
    }

    export class CallbackEntry
    {
        context: any;
        callback: any;

        constructor(context, callback)
        {
            this.context = context;
            this.callback = callback;
        }
    }

    export interface IDataChanger
    {
        registerForChange(name: string, callback: any);
        registerForRemovableChange(name: string, context: any, callback: any);
        unregisterForChanges(context: any, name?: string);
        onDataChanged(name: string, changedBy?: any, ...params: string[]);
        setDataWithChanger(name: string, value: any, changer: any);
    }
}