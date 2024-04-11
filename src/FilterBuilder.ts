import { Condition, EntityInfo, SearchEvent, Operation, SearchTypes } from "./SearchTypes";
import { CAEFISS } from "./utilities";


export class FilterBuilder {

    private incident: EntityInfo;

    constructor() {

        this.incident = 
            {
                name: "incident",
                linkname: "incident",
                from: "",
                alias: "",
                include: false,
                parent: null,
                to: "",
                filters: new Map<string, SearchEvent>(),
                attrs: ["title"],
                children: []
            };

        var vaccine : EntityInfo=  {
            name: "caefiss_aefi_vaccines",
            linkname: "caefiss_aefi_vaccines",
            from: "caefiss_case",
            alias: "VAC",
            include: false,
            parent: this.incident,
            to: "incidentid",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        };

        vaccine.children = [{
            name: "caefiss_cd_immunizing_agents_mls",
            linkname: "caefiss_cd_immunizing_agents_ml",
            from: "caefiss_cd_immunizing_agents_mlid",
            alias: "AGENT",
            include: false,
            parent: vaccine,
            to: "caefiss_vac_cd_immunizing_agents_ml",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        }];

        var medications : EntityInfo =  {
            name: "caefiss_aefi_cncmit_medications",
            linkname: "caefiss_aefi_cncmit_medications",
            from: "caefiss_case",
            alias: "MEDS",
            include: false,
            parent: this.incident,
            to: "incidentid",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        };

        medications.children = [{
            name: "caefiss_cd_concomitant_medication_mls",
            linkname: "caefiss_cd_concomitant_medication_ml",
            from: "caefiss_cd_concomitant_medication_mlid",
            alias: "MED",
            include: false,
            parent: medications,
            to: "caefiss_mh_concomitant_medication_name_ml",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        }];

        var conditions : EntityInfo =  {
            name: "caefiss_aefi_mdc_conditions",
            linkname: "caefiss_aefi_mdc_conditions",
            from: "caefiss_case",
            alias: "CONDS",
            include: false,
            parent: this.incident,
            to: "incidentid",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        };

        conditions.children = [{
            name: "caefiss_cd_meddra_mls",
            linkname: "caefiss_cd_meddra_ml",
            from: "caefiss_cd_meddra_mlid",
            alias: "MEDRA",
            include: false,
            parent: conditions,
            to: "caefiss_mdcmeddra_llt_ml",
            filters: new Map<string, SearchEvent>(),
            attrs: [],
            children: []
        }];

        this.incident.children = [ vaccine, medications, conditions,
                    {
                        name: "caefiss_aefi_immunization_history",
                        linkname: "caefiss_aefi_immunization_history",
                        from: "caefiss_aeih_parent_case",
                        alias: "HIST",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },

                    {
                        name: "caefiss_aefi_mdc_known_allergies",
                        linkname: "caefiss_aefi_mdc_known_allergies",
                        from: "caefiss_mhka_parent_case",
                        alias: "ALLGY",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
        
                    },
        
                    {
                        name: "caefiss_aefi_mdc_test_type",
                        linkname: "caefiss_aefi_mdc_test_type",
                        from: "caefiss_mhtt_parent_case",
                        alias: "TST",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_acute_illness",
                        linkname: "caefiss_aefi_acute_illness",
                        from: "caefiss_mh_aii_parent_case",
                        alias: "ILL",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_drugs",
                        linkname: "caefiss_aefi_drugs",
                        from: "caefiss_tr_drug_parent_case",
                        alias: "DRUGS",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_investigations_meddra",
                        linkname: "caefiss_aefi_investigations_meddra",
                        from: "caefiss_in_parent_case",
                        alias: "INV",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
        
                    },
        
                    {
                        name: "caefiss_aefi_meddras",
                        linkname: "caefiss_aefi_meddras",
                        from: "caefiss_case_to_aefi_meddra",
                        alias: "MEDRAS",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_medicalassessmentofreportedaefis",
                        linkname: "caefiss_medicalassessmentofreportedaefis",
                        from: "caefiss_case",
                        alias: "RPT",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_primary_host_meddra",
                        linkname: "caefiss_aefi_primary_host_meddra",
                        from: "caefiss_mcr_aefi_primary_host_meddra_parent_case",
                        alias: "PRIM",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_acca",
                        linkname: "caefiss_aefi_acca",
                        from: "caefiss_for_case",
                        alias: "ACCA",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_hospitalization",
                        linkname: "caefiss_aefi_hospitalization",
                        from: "caefiss_hloco_hospitalization_parent_case",
                        alias: "HOSP",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_reporter_follow_up_activity",
                        linkname: "caefiss_aefi_reporter_follow_up_activity",
                        from: "regardingobjectid",
                        alias: "FOLLOW",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },
        
                    {
                        name: "caefiss_aefi_issue_resolution_activity",
                        linkname: "caefiss_aefi_issue_resolution_activity",
                        from: "regardingobjectid",
                        alias: "RESOL",
                        include: false,
                        parent: this.incident,
                        to: "incidentid",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    },

                    {
                        name: "accounts",
                        linkname: "account",
                        from: "accountid",
                        alias: "JURS",
                        include: false,
                        parent: this.incident,
                        to: "caefiss_ri_reporting_jurisdiction",
                        filters: new Map<string, SearchEvent>(),
                        attrs: [],
                        children: []
                    }

                ];
    }

    private find(entity : EntityInfo, name: string) : EntityInfo|null {
        if (entity.name === name) {
            return entity;
        }
        
        for (var i = 0; i < entity.children.length; i++) {
            if (entity.children[i].name === name) {
                return entity.children[i];
            }
            for (var j = 0;  j < entity.children[i].children.length; j++) {
                if (entity.children[i].children[j].name === name) {
                    return entity.children[i].children[j];
                }
            }
        }

        return null;
    }

    public addSearchEvent(event: SearchEvent): void {        
        let entity : EntityInfo|null = this.find(this.incident, event.entityName);
        if (!entity) {
            return;
        }

        let field = event.fieldName;

        // attribute added or removed
        if (event.checked) {
            var checked = event.checked.include;
            
            if (checked) {
                if (entity.attrs.indexOf(field) === -1) {
                    entity.attrs.push(field);
                }
            } else {
                entity.attrs = entity.attrs.filter(s => s != field);
            }            
        }

        // filter added, updated or removed
        if (event.operation === Operation.Change) {            
            entity.filters.set(field, event);
        } else if (event.operation === Operation.Delete) {
            entity.filters.delete(field);
        }

    }

    public toString(evt: SearchEvent): string {
        return evt.displayName + " " + evt.entityName + " " + evt.parentEntityName + " " + evt.fieldName
            + " " + evt.condition + " " + evt.findText + " " + (evt.operation == 1 ? "Delete" : "Replace") + " " + evt.context;
    }


    private addVaccineAttributeGroup() : void {
        var vaccine : EntityInfo|null  = this.find(this.incident, "caefiss_aefi_vaccines");
        if (!vaccine) {
            return;
        }
        var agents : EntityInfo|null  = this.find(this.incident, "caefiss_cd_immunizing_agents_mls");
        if (!agents) {
            return;
        }

        if ((vaccine.filters.size > 0) || agents.filters.size > 0) {
            vaccine.attrs = ["caefiss_lot_number","caefiss_vac_dose","caefiss_vac_dosage", "caefiss_vac_dose_unit", "caefiss_vac_route", "caefiss_vac_site"];
            agents.attrs = ["caefiss_english_value","caefiss_vac_immunizing_agent_trade_name_en","caefiss_vac_immunizing_agent_manufactureren"]; 
        }                    
    }

    private applyFilters(filters: Map<string, SearchEvent>) : string {
        var xml : string = '';
        for (const [field, event] of filters.entries()) {
            switch (event.type) {
                case SearchTypes.Text:
                    switch (event.condition) {
                        case Condition.BeginsWith:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.EndsWith:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.NotEqual:
                            break;

                        case Condition.Equal:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.Contains:
                            event.findText.split(',').forEach(function(txt) {
                                xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='%${txt}%' /></filter>`;
                            })
                            
                            break;

                        case Condition.NotIn:
                            break;

                        case Condition.Null:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        case Condition.NotNull:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        default:
                            // noop
                    }
                    break;
            
                    case SearchTypes.Date:
                        switch (event.condition) {
                            case Condition.Equal:
                                if (event.findText) {
                                    // possible there is a date from a previous between
                                    var dates = event.findText.split(' ');
                                    if (dates && dates.length > 0) {
                                        xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${dates[0]}' /></filter>`;
                                    }
                                }
                                break;

                            case Condition.Between:
                                if (event.findText) {
                                    var dates = event.findText.split(' ');
                                    if (dates && dates.length === 2) {
                                        xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}"><value>${dates[0]}</value><value>${dates[1]}</value></condition></filter>`;
                                    }
                                }
                                break;


                            case Condition.Null:
                                xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                                break;

                            case Condition.NotNull:
                                xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                                break;

                            default:
                                // noop
                        }
                        break;
                
                        case SearchTypes.Number:
                            switch (event.condition) {
                                case Condition.Equal:
                                    if (event.findText) {
                                        var vals : object = JSON.parse(event.findText);
                                        if (vals) {
                                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${vals["number1"]}' /></filter>`;
                                        }
                                    }
                                    break;

                                case Condition.Between:
                                    if (event.findText) {
                                        var vals : object = JSON.parse(event.findText);
                                        if (vals) {
                                            xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}"><value>${vals["number1"]}</value><value>${vals["number2"]}</value></condition></filter>`;
                                        }
                                    }
                                    break;


                                case Condition.Null:
                                    xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                                    break;

                                case Condition.NotNull:
                                    xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                                    break;

                                default:
                                    // noop
                            }
                            break;
                    
                case SearchTypes.Lookup:
                    switch (event.condition) {
                        case Condition.BeginsWith:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.EndsWith:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.NotEqual:
                            break;

                        case Condition.Equal:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='${event.findText}' /></filter>`;
                            break;

                        case Condition.Contains:
                            event.findText.split(',').forEach(function(txt) {
                                xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' value='%${txt}%' /></filter>`;
                            })
                            
                            break;

                        case Condition.NotIn:
                            break;

                        case Condition.Null:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        case Condition.NotNull:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        default:
                            // noop
                    }
                    break;
                
                case SearchTypes.Option:
                    var selections = JSON.parse(event.findText);
                    switch (event.condition) {
                        case Condition.In:
                            xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                            selections.forEach(function(pair) {
                                xml += `<value>${pair.value}</value>`;
                            }); 
                            xml += `</condition></filter>`;                                    
                            break;

                        case Condition.NotIn:
                            xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                            selections.forEach(function(pair) {
                                xml += `<value>${pair.value}</value>`

                            }); 
                            xml += `</condition></filter>`;
                            break;


                        case Condition.Null:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        case Condition.NotNull:
                            xml += `<filter type='or'><condition attribute='${field}' operator='${event.condition}' /></filter>`;
                            break;

                        default:
                            // noop
                    }
                    break;
                    
                case SearchTypes.Checkbox:
                    var selections = JSON.parse(event.findText);
                    // Equal is the event but in is the operator
                    xml += `<filter type='or'><condition attribute="${field}" operator="in">`;
                    xml += selections["0"] ? `<value>0</value>` : '';
                    xml += selections["1"] ? `<value>1</value>` : '';
                    xml += `</condition></filter>`;  
                    break;
                    
                    
                default:
                    //noop
                
            }
        }
        return xml;
    }

    private applyAttrs(attrs : string[]) : string {
        var xml : string = '';
        attrs.forEach(function(attr) {
            xml += `<attribute name="${attr}" />`;
        });
        return xml;
    }

    private hasAttrsOrFilters(entity : EntityInfo) : boolean {
        if (entity.attrs.length > 0 || entity.filters.size > 0) {
            return true;
        }
        var res = entity.children.filter(c => c.filters.size > 0 || c.attrs.length > 0);
        return res.length > 0 ? true : false;
    }

    public toFetchXml(addId : Boolean): string {
        var xml: string = `
        <fetch version="1.0" output-format="xml-platform" mapping="logical">
            <entity name="incident">                 
        `; 

        xml += addId ? `<attribute name="incidentid" />` : ''; // reporting required field        

        xml += this.applyAttrs(this.incident.attrs);        // incident attributes
        xml += this.applyFilters(this.incident.filters);    // incident filters   
            
        this.addVaccineAttributeGroup(); // adds all attributes in the vaccine tab if any filter is applied within the group
       
        this.incident.children.forEach((entity) => {
            if (this.hasAttrsOrFilters(entity)) {
                xml += `<link-entity name="${entity.linkname}" from="${entity.from}" to="${entity.to}" alias="${entity.alias}" link-type="inner" >`;
                
                xml += this.applyAttrs(entity.attrs);
                xml += this.applyFilters(entity.filters);

                entity.children.forEach((child) => {
                    xml += `<link-entity name="${child.linkname}" from="${child.from}" to="${child.to}" alias="${child.alias}" link-type="inner" >`;
                
                    xml += this.applyAttrs(child.attrs);
                    xml += this.applyFilters(child.filters);

                    xml += '</link-entity>';
                });

                xml += '</link-entity>';
            }
        });


        xml += `
            </entity>
            </fetch>
        `;


        return xml;
    }

    private getAttributes(addId : Boolean) : string[] {
        var allAttrs :string[] = addId ? ["incidentid"] : []; // reporting requires the ID
        
        this.incident.attrs.forEach(a => allAttrs.push(a));
        this.incident.children.forEach(c => c.attrs.forEach(a => allAttrs.push(`${c.alias}.${a}`)));
        this.incident.children.forEach(c => c.children.forEach(gc => gc.attrs.forEach(a => allAttrs.push(`${gc.alias}.${a}`))));

        return allAttrs;
    }

    public search() {
        globalThis.Xrm.Utility.showProgressIndicator("Search in progress. Please wait....");

        var fetchXml = this.toFetchXml(false).replaceAll('\n','');

        var util : CAEFISS = new CAEFISS();

        util.search("incidentid",  fetchXml, this.getAttributes(false));
    }

    public report() {

        var attrs = this.getAttributes(true);
        var fetchXml =  "?fetchXml=" + this.toFetchXml(true).replaceAll('\n','');
        var customerURL = globalThis.Xrm.Utility.getGlobalContext().getCurrentAppUrl() + "&pagetype=entityrecord&etn=incident&id=";
        globalThis.Xrm.WebApi.retrieveMultipleRecords("incident", fetchXml).then(
            function success(result) {
                var jsonData : Array<Map<string, string>> = new Array<Map<string, string>>();
                for (var i = 0; i < result.entities.length; i++) {
                    var entity = result.entities[i];

                    var jsonObj : Map<string, string>  = new Map<string, string>();
                    
                    var caseObject = {
                        Name: entity['title'],
                        URL: customerURL + entity['incidentid']
                    }
                    jsonObj["Case Title"] = caseObject;

                    attrs.filter((a) => a !== "title" && a !== "incidentid").forEach(function(a){
                        let result = Object.keys(entity).filter(v => v.startsWith(`${a}@`)); //formatted values
                        if (result.length > 0) {
                            jsonObj[a.replace(/\b\w/g, function (l) { return l.toUpperCase(); })] = entity[result[0]];
                        } else {
                            jsonObj[a.replace(/\b\w/g, function (l) { return l.toUpperCase(); })] = entity[a];
                        }
                    });
                    jsonData.push(jsonObj);
                }

                // Convert JSON keys to Camel Case
                var headerText = Object.keys(jsonData[0]).map(function (key) {
                    return key;
                });

                // Make headers bold
                var headerStyle = headerText.map(function () {
                    return { font: { bold: true } };
                });

                // Create a new worksheet
                var ws = globalThis.XLSX.utils.json_to_sheet(jsonData, { header: headerText });

                // Apply style to header
                ws["!cols"] = headerStyle.map(function () {
                    return { wch: 20 }; // Set column width
                });

                // Add hyperlink to the 'B' column (index 1) and index + 1 set font color to blue
                jsonData.forEach(function (item, index) {
                    //var cellAddress = globalThis.XLSX.utils.encode_cell({ r: index + 1, c: 0 }); // Assuming 'url' field from JSON
                    var hyperlink = '=HYPERLINK("' + item['Case Title'].URL + '", "' + item['Case Title'].Name + '")';

                    ws[globalThis.XLSX.utils.encode_cell({
                        c: 0,
                        r: index + 1
                    })] = {
                        t: "s",
                        f: hyperlink,
                        s: { 
                            font: { 
                                name: "Calibri",                            
                                sz: 11,
                                bold: true,
                                color: { 
                                    rgb: "0000FF"
                                }, 
                                underline: true
                            }
                        }
                    };

                    
                });

                // Create a new workbook
                var wb = globalThis.XLSX.utils.book_new();
                globalThis.XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

                // Save workbook as XLSX file
                globalThis.XLSX.writeFile(wb, 'Incident.xlsx', {"type": "binary", "bookType": "xlsx"});
            },
            function (error) {
                console.log(error.message);
                // handle error conditions
            }
        );

        
    }

}
