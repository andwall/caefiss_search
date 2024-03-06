import { Condition, EntityInfo, SearchEvent, Operation } from "./SearchTypes";
import { CAEFISS } from "./utilities";


export class FilterBuilder {

    private entities: EntityInfo[];
    private filters: Map<string, Map<string, SearchEvent>>;
    private attrs: Map<string, string[]>;

    constructor() {

        this.entities = [
            {
                name: "incident",
                field: "",
                alias: "",
                include: false
            },

            {
                name: "caefiss_submission",
                field: "caefiss_master_case",
                alias: "submission",
                include: false
            },

            {
                name: "caefiss_aefi_vaccines",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },
            
            {
                name: "caefiss_cd_concomitant_medication_mls",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_cd_meddra_mls",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            
            {
                name: "caefiss_cd_immunizing_agents_mls",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_immunization_history",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_hospitalization",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_meddras",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_acca",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_reporter_follow_up_activity",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_aefi_issue_resolution_activity",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            },

            {
                name: "caefiss_medicalassessmentofreportedaefis",
                field: "caefiss_case",
                alias: "vaccine",
                include: false
            }

            //
            
        ];

        this.filters = new Map<string, Map<string, SearchEvent>>();
        this.attrs = new Map<string, string[]>();
        this.entities.forEach((e) => {
            this.filters.set(e.name, new Map<string, SearchEvent>());
        });
    }

    public addSearchEvent(event: SearchEvent): void {
        let entity = event.entityName;
        if (!this.filters.has(entity)) {
            return;
        }

        // attribute added or removed
        if (event.checked) {
            // add attribute
            var name = event.checked.name;
            var fld = event.checked.field;
            var alias = event.checked.alias;
            var checked = event.checked.include;
            
            if (!this.attrs.has(name)) {
                this.attrs.set(name, []); // new empty array of attributes
            }

            var ind = alias ? alias + "." + fld : fld;
            if (checked) {
                if (this.attrs.get(name)?.indexOf(ind) === -1) {
                    this.attrs.get(name)?.push(ind);
                }
            } else {
                var x : string[] = this.attrs.get(name) || [];
                var y : string[] = x.filter(s => s != ind)
                this.attrs.set(name, y );
            }
            
        }

        // filter added, updated or removed
        if (event.operation === Operation.Change) {
            let filtersForEntity = this.filters.get(entity);
            let field = event.fieldName;
            filtersForEntity?.set(field, event);
        } else if (event.operation === Operation.Delete) {
            let filtersForEntity = this.filters.get(entity);
            let field = event.fieldName;
            filtersForEntity?.delete(field);
        }

    }

    public toString(evt: SearchEvent): string {
        return evt.displayName + " " + evt.entityName + " " + evt.parentEntityName + " " + evt.fieldName
            + " " + evt.condition + " " + evt.findText + " " + (evt.operation == 1 ? "Delete" : "Replace") + " " + evt.context;
    }

    public toFetchXml(): string {
        var xml: string = `
        <fetch view="search">
            <entity name="incident">  
               
        `; 
        if (this.attrs.has("incident")) {
            var x = this.attrs.get("incident") || [];
            x.filter(a => a.indexOf('.') === -1).forEach(function(a) {
                xml += `<attribute name="${a}" />`;
            });
        }

        this.entities.forEach((e) => {

            var filters = this.filters.get(e.name);
            if (filters && filters.size > 0) {

                if (e.name != "incident") {// check if this is a linked entity
                    xml += `<link-entity name='${e.name}' from='${e.field}' to='incidentid' link-type='inner' alias='${e.alias}'>`;
                }

                var x = this.attrs.get(e.name) || [];
                x.filter(a => a.startsWith(e.alias+".")).forEach(function(a) {
                    if (a !== "title")
                        xml += `<attribute name="${a}" />`;
                });

                // add the filter and all conditions
                xml += "<filter>";
                for (const [fld, evt] of filters.entries()) {
                    if (evt.condition === Condition.Contains) {
                        xml += `<condition attribute='${fld}' operator='${evt.condition}' value='%${evt.findText}%' />`;
                    } else {
                        xml += `<condition attribute='${fld}' operator='${evt.condition}' value='${evt.findText}' />`;
                    }
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

        
        var allAttrs :string[] = [];
        
        for (const [_e, _a] of this.attrs.entries()) {
            if (_a) {
                _a.forEach(function(a) {allAttrs.push(a); });
            }
        }

        var util : CAEFISS = new CAEFISS();

        util.search("incident",  this.toFetchXml().replaceAll('\n',''), allAttrs);

        //let refresh = <HTMLButtonElement>parent.document.querySelectorAll('[aria-label="Refresh"]')[0];
        //if (refresh) {
        //    refresh.click();
        //}
        //globalThis.Xrm.Navigation.openUrl(`https://caefiss-sandbox1.crm3.dynamics.com/main.aspx?appid=43248d47-2702-ed11-82e6-000d3af4d17d&pagetype=dashboard&id=${globalThis.dashboardId}&type=user`, null);

        //var layoutXml : string = util.createLayoutXml("incidentid", allAttrs);
        //util.createUserView(layoutXml, this.toFetchXml().replaceAll('\n',''), "TEMP-CAEFISS Search", "TEMP-CAEFISS Search");
        //var dashboardId : string = util.createDashboard("TEMP-CAEFISS Search", viewId);
        //this.publishView(dashboardId);
    }

}
