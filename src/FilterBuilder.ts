import { Condition, EntityInfo, SearchEvent } from "./SearchTypes";


export class FilterBuilder {

    private entities: EntityInfo[];
    private filters: Map<string, Map<string, SearchEvent>>;

    constructor() {

        this.entities = [
            {
                name: "incident",
                from: "",
                alias: ""
            },

            {
                name: "caefiss_submission",
                from: "caefiss_master_case",
                alias: "submission"
            },

            {
                name: "caefiss_aefi_vaccines",
                from: "caefiss_case",
                alias: "vaccine"
            }
        ];

        this.filters = new Map<string, Map<string, SearchEvent>>();
        this.entities.forEach((e) => {
            this.filters.set(e.name, new Map<string, SearchEvent>());
        });
    }

    public addSearchEvent(event: SearchEvent): void {
        let entity = event.entityName;
        if (!this.filters.has(entity)) {
            return;
        }

        let filtersForEntity = this.filters.get(entity);
        let field = event.fieldName;
        filtersForEntity?.set(field, event);
    }

    public toString(evt: SearchEvent): string {
        return evt.displayName + " " + evt.entityName + " " + evt.parentEntityName + " " + evt.fieldName
            + " " + evt.condition + " " + evt.findText + " " + (evt.operation == 1 ? "Delete" : "Replace") + " " + evt.context;
    }

    public toFetchXml(): string {
        var xml: string = `
        <fetch view="search">
            <entity name="incident">    
                <attribute name="title" />
                <attribute name="statuscode" />
                <attribute name="ticketnumber" />
                <attribute name="createdon" />    
        `;

        this.entities.forEach((e) => {

            var filters = this.filters.get(e.name);
            if (filters && filters.size > 0) {

                if (e.name != "incident") {// check if this is a linked entity
                    xml += `<link-entity name='${e.name}' from='${e.from}' to='incidentid' link-type='inner' alias='${e.alias}'>`;
                }

                // add the filter and all conditions
                xml += "<filter>";
                for (const [fld, evt] of filters.entries()) {
                    xml += "<condition attribute='" + fld + "' operator='" + evt.condition + "' value='" + evt.findText + "' />"
                }
                xml += "</filter>";

                if (e.name != "incident") {// check if this is a linked entity
                    xml += "</link-entity>";
                }
            }
        });

        xml += `
            </entity>
            </fetch>
        `;


        return xml;
    }

    public search() {
        globalThis.Xrm.Utility.showProgressIndicator("Search in progress. Please wait....");
        var record = {
            fetchxml: this.toFetchXml().replaceAll('\n','')
        };


        var req = new XMLHttpRequest();
        var parent = this;
        req.open("PATCH", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/savedqueries(123f428b-1cb2-ee11-a569-000d3a09dca9)", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    console.log("Record updated");

                    // refresh view
                    parent.publishView();
                } else {
                    console.log(this.responseText);
                }
            }
        };
        req.send(JSON.stringify(record));
    }

    public publishView() {
        debugger;
        var parameters = {
            ParameterXml: "<importexportxml><entities><entity>incident</entity></entities></importexportxml>"
        }

        var req = new XMLHttpRequest();
        req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/PublishXml", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200 || this.status === 204) {
                    console.log("Success");
                    globalThis.Xrm.Utility.closeProgressIndicator();
                    
                    let refresh = <HTMLButtonElement>parent.document.querySelectorAll('[aria-label="Refresh"]')[0];// parent.window.document.getElementById('incident\|NoRelationship\|HomePageGrid\|Mscrm\.Modern\.refreshCommand2id-121-button')
                    if (refresh) {
                        refresh.click();
                    }
                    //parent.window.location.reload();
                    //parent.window.location.reload();
/*
                    var pageInput = {
                        pageType: "dashboard",
                        dashboardId: "1b2d08de-dbab-ee11-a569-000d3a09d9ea"
                    };
                    globalThis.Xrm.Navigation.navigateTo(pageInput,null).then(
                        function success(result) {
                                console.log("Ok: "+result);

                                var pageInput = {
                                    pageType: "dashboard",
                                    dashboardId: "1b2d08de-dbab-ee11-a569-000d3a09d9ea"
                                };
                                globalThis.Xrm.Navigation.navigateTo(pageInput,null).then(
                                    function success(result) {
                                            console.log("Ok: "+result);
                                    },
                                    function error() {
                                        console.log("Error:");
                                    }
                                );




                        },
                        function error() {
                            console.log("Error:");
                        }
                    );
*/
                } else {
                    console.log(this.responseText);
                }
            }
        };
        req.send(JSON.stringify(parameters));
    }
}
