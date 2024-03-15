import { Condition, EntityInfo, SearchEvent, Operation, SearchTypes } from "./SearchTypes";
import { CAEFISS } from "./utilities";


export class FilterBuilder {

    private entities: EntityInfo[];
    private filters: Map<string, Map<string, SearchEvent>>;
    private attrs: Map<string, string[]>;

    constructor() {

        //
        // Used to link to the incident



        /*
caefiss_aefi_cncmit_medications
caefiss_aefi_mdc_conditions
caefiss_aefi_mdc_known_allergies
caefiss_aefi_acute_illness
caefiss_aefi_mdc_test_type
caefiss_aefi_immunization_history
caefiss_aefi_vaccines
caefiss_aefi_drugs
caefiss_aefi_investigations_meddra
caefiss_aefi_meddras
caefiss_medicalassessmentofreportedaefis
caefiss_aefi_primary_host_meddra




        */

        this.entities = [
            {
                name: "incident",
                field: "",
                alias: "",
                include: false
            },

            {
                name: "caefiss_aefi_vaccines",
                field: "caefiss_case",
                alias: "aefi_vaccine",
                include: false
            },            

            {
                name: "caefiss_aefi_cncmit_medications",
                field: "caefiss_case",
                alias: "aefi_cncmit_medications",
                include: false
            },

            {
                name: "caefiss_aefi_immunization_history",
                field: "caefiss_aeih_parent_case",
                alias: "aefi_immunization_history",
                include: false
            },

            {
                name: "caefiss_aefi_mdc_conditions",
                field: "caefiss_case",
                alias: "aefi_mdc_conditions",
                include: false
            },

            {
                name: "caefiss_aefi_mdc_known_allergies",
                field: "caefiss_mhka_parent_case",
                alias: "aefi_mdc_known_allergies",
                include: false

            },

            {
                name: "caefiss_aefi_mdc_test_type",
                field: "caefiss_mhtt_parent_case",
                alias: "aefi_mdc_test_type",
                include: false
            },

            {
                name: "caefiss_aefi_acute_illness",
                field: "caefiss_mh_aii_parent_case",
                alias: "aefi_acute_illness",
                include: false
            },

            {
                name: "caefiss_aefi_drugs",
                field: "caefiss_tr_drug_parent_case",
                alias: "aefi_drugs",
                include: false
            },

            {
                name: "caefiss_aefi_investigations_meddra",
                field: "caefiss_in_parent_case",
                alias: "aefi_investigations_meddra",
                include: false

            },

            {
                name: "caefiss_aefi_meddras",
                field: "caefiss_case_to_aefi_meddra",
                alias: "aefi_meddras",
                include: false
            },

            {
                name: "caefiss_medicalassessmentofreportedaefis",
                field: "caefiss_case",
                alias: "medicalassessmentofreportedaefis",
                include: false
            },

            {
                name: "caefiss_aefi_primary_host_meddra",
                field: "caefiss_mcr_aefi_primary_host_meddra_parent_case",
                alias: "aefi_primary_host_meddra",
                include: false
            },

            {
                name: "caefiss_aefi_acca",
                field: "caefiss_for_case",
                alias: "acca",
                include: false
            },



            {
                name: "caefiss_cd_immunizing_agents_mls",
                field: "caefiss_cd_immunizing_agents_mlid",
                alias: "cd_immunizing",
                include: false
            },









            {
                name: "caefiss_submission",
                field: "caefiss_master_case",
                alias: "submission",
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
                name: "caefiss_aefi_hospitalization",
                field: "caefiss_hloco_hospitalization_parent_case",
                alias: "aefi_hospitalization",
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
            }

       

            //
            
        ];

        this.filters = new Map<string, Map<string, SearchEvent>>();
        this.attrs = new Map<string, string[]>();

        // incident always includes the v-Number(title) field
        this.attrs.set("incident", ["title"]);
        this.entities.forEach((e) => {
            this.filters.set(e.name, new Map<string, SearchEvent>());
        });
    }

    public addSearchEvent(event: SearchEvent): void {
        let entity = event.entityName;
        let parent = event.parentEntityName;

        if (!this.filters.has(entity) && !this.filters.has(parent)) {
            return;
        }

        // attribute added or removed
        if (event.checked) {
            // add attribute
            var name = event.checked.name;
            var fld = event.checked.field;
            var checked = event.checked.include;
            
            if (!this.attrs.has(name)) {
                this.attrs.set(name, []); // new empty array of attributes
            }

            
            //var entityInfo = this.entities.find((e) => e.name === name)
            //var alias : string = entityInfo ? `${entityInfo.alias}.${fld}` : fld;

            if (checked) {
                if (this.attrs.get(name)?.indexOf(fld) === -1) {
                    this.attrs.get(name)?.push(fld);
                }
            } else {
                var x : string[] = this.attrs.get(name) || [];
                var y : string[] = x.filter(s => s != fld)
                this.attrs.set(name, y );
            }
            
        }

        // filter added, updated or removed
        if (event.operation === Operation.Change) {
            if (event.type === SearchTypes.Lookup) {
                let filtersForEntity = this.filters.get(parent);
                let field = event.fieldName;
                filtersForEntity?.set(field, event);
            } else {
                let filtersForEntity = this.filters.get(entity);
                let field = event.fieldName;
                filtersForEntity?.set(field, event);
            }
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

/*

Lookup example - parent not incident

// <search-lookup displayName="Immunizing Agent"

    entityName="caefiss_cd_immunizing_agents_mls" from="caefiss_cd_immunizing_agents_mlsid" 

    parentEntityName="caefiss_aefi_vaccines" parentEntityId="caefiss_id" 
    
    fieldName="caefiss_english_value" isMultiSelect="true"></search-lookup>


<fetch distinct="true">
  <entity name="incident">
  <attribute name="title" />
  <link-entity name="caefiss_aefi_vaccines" from="caefiss_case" to="incidentid">
    <link-entity name="caefiss_cd_immunizing_agents_ml" from="caefiss_cd_immunizing_agents_mlid" to="caefiss_vac_cd_immunizing_agents_ml" alias="lk1">
      <attribute name="caefiss_english_value" />
      <filter>
        <condition attribute="caefiss_english_value" operator="eq" value="Anthrax" />
      </filter>
    </link-entity>
  </link-entity>
</entity>
</fetch>



                  <search-lookup 
                         displayName="Concomitant medication(s)" 

                         entityName="caefiss_cd_concomitant_medication_mls" from="caefiss_cd_concomitant_medication_mlsid" 

                         parentEntityName="caefiss_aefi_cncmit_medications" to="caefiss_mh_concomitant_medication_name_ml" 

                         fieldName="caefiss_english_value" 
                    isMultiSelect="true"></search-lookup>


<fetch distinct="true">
  <entity name="incident">


    <link-entity name="caefiss_aefi_cncmit_medications" from="caefiss_case" to="incidentid">
      <link-entity name="caefiss_cd_concomitant_medication_ml" from="caefiss_cd_concomitant_medication_mlid" to="caefiss_mh_concomitant_medication_name_ml" alias="aefi_cncmit_medications">
        <attribute name="caefiss_english_value" />
      </link-entity>
    </link-entity>



  </entity>
</fetch>




<fetch>
  <entity name="incident">
    <attribute name="title" />
    <filter>
      <condition attribute="caefiss_ci_agency_report_received_date" operator="between">
        <value>2023-01-01</value>
        <value>2024-03-01</value>
      </condition>
    </filter>
  </entity>
</fetch>


*/

    public toFetchXml(addId : Boolean): string {
        var xml: string = `
        <fetch>
            <entity name="incident">  
               
        `; 

        // incident attributes
        if (this.attrs.has("incident")) {
            var attrs = this.attrs.get("incident") || ["title"];

            // for reporting
            if (addId) {
                xml += `<attribute name="incidentid" />`;
            }

            attrs.forEach(function(attr) {
                xml += `<attribute name="${attr}" />`;
            });
        }

        // incident filters
        if (this.filters.has("incident")) {
            var filters = this.filters.get("incident");
            if (filters && filters.size > 0) {
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
            }
            
        }


        // skips incident in position 0]
        for (var i : number=1; i<this.entities.length; i++) {
            var entity = this.entities[i];
            var filters = this.filters.get(entity.name);
            if (filters && filters.size > 0) {

                // outer link entity is always the case
                if (entity.name === "caefiss_aefi_vaccines") {
                    xml += `<link-entity name="${entity.name}" from="${entity.field}" to="incidentid" alias="${entity.alias}">`;

                    // add the vaccine group of attributes
                    if (!this.attrs.has(entity.name)) {
                        this.attrs.set(entity.name, []); // new empty array of attributes
                    }
                    var self = this;
                    // vaccine attributes
                    ["caefiss_lot_number","caefiss_vac_dose","caefiss_vac_dosage", "caefiss_vac_dose_unit", "caefiss_vac_route", "caefiss_vac_site"].forEach(function(a) {
                        if (self.attrs.get(entity.name)?.indexOf(a) === -1) {
                            self.attrs.get(entity.name)?.push(a);
                        }
                    });

                    var linkedEntity = this.entities.find((e) => e.name === "caefiss_cd_immunizing_agents_mls");
                    if (linkedEntity) {
                        if (!this.attrs.has(linkedEntity.name)) {
                            this.attrs.set(linkedEntity.name, []); // new empty array of attributes
                        }
                        // caefiss_cd_immunizing_agents_mls attributes
                        ["caefiss_english_value","caefiss_vac_immunizing_agent_trade_name_en","caefiss_vac_immunizing_agent_manufactureren"].forEach(function(a) {
                            if (linkedEntity) {
                                if (self.attrs.get(linkedEntity.name)?.indexOf(a) === -1) {
                                    self.attrs.get(linkedEntity.name)?.push(a);
                                }
                            }
                        });
                    }
                    

                } else {
                    
                    xml += `<link-entity name="${entity.name}" from="${entity.field}" to="incidentid" alias="${entity.alias}">`;
                }

                this.attrs.get(entity.name)?.forEach(function(attr) {                    
                    xml += `<attribute name="${attr}" />`;
                });


                for (const [field, event] of filters.entries()) {
                    
                    // filters on the linked entity where the parent is the incident
                    if (event.parentEntityName === "incident") {

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

                            case Condition.In:
                                var selections = JSON.parse(event.findText);
                                xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                                selections.forEach(function(pair) {
                                    xml += `<value>${pair.value}</value>`;
                                }); 
                                xml += `</condition></filter>`;                                    
                                break;

                            case Condition.NotIn:
                                var selections = JSON.parse(event.findText);
                                xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                                selections.forEach(function(pair) {
                                    xml += `<value>${pair.value}</value>`;
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

                    }
                    
                }

            
                
                var first : boolean = true;
                var addEndLink : boolean = false;
                for (const [field, event] of filters.entries()) {
                    
                    
                    if (first && event.parentEntityName !== "incident") {
                        var linkedEntity = this.entities.find((e) => e.name === event.entityName);
                        if (!linkedEntity) {
                            continue;
                        }

                       
                        var nm = linkedEntity.name.endsWith("s") ? linkedEntity.name.slice(0,-1) : linkedEntity.name;
                        xml += `<link-entity name="${nm}" from="${event.from}" to="${event.to}" alias="${linkedEntity.alias}">`;

                        this.attrs.get(linkedEntity.name)?.forEach(function(attr) {                    
                            xml += `<attribute name="${attr}" />`;
                        });

                        first = false;
                        addEndLink = true;
                    }

                    if (event.parentEntityName !== "incident") {
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

                            case Condition.In:
                                var selections = JSON.parse(event.findText);
                                xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                                selections.forEach(function(pair) {
                                    xml += `<value>${pair.value}</value>`;
                                }); 
                                xml += `</condition></filter>`;                                    
                                break;

                            case Condition.NotIn:
                                var selections = JSON.parse(event.findText);
                                xml += `<filter type='or'><condition attribute="${field}" operator="${event.condition}">`;
                                selections.forEach(function(pair) {
                                    xml += `<value>${pair.value}</value>`;
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
                    }

                    
                }

                if (addEndLink) {
                    xml += `</link-entity>`;
                }


                xml += `</link-entity>`;
            } else {
                if (this.attrs.has(entity.name)) {
                    var leAttrs = this.attrs.get(entity.name);  
                    if (leAttrs && leAttrs.length > 0) {
                        xml += `<link-entity name="${entity.name}" from="${entity.field}" to="incidentid" alias="${entity.alias}">`;
                            leAttrs?.forEach(function(attr) {
                                xml += `<attribute name="${attr}" />`;
                            });
                        xml += '</link-entity>';
                    }
                }
            }
        }

        xml += `
            </entity>
            </fetch>
        `;


        return xml;
    }

    private getAttributes(addId : Boolean) : string[] {
        var allAttrs :string[] = addId ? ["incidentid"] : [];
        
        for (const [_e, _a] of this.attrs.entries()) {
            // get the alias
            var entityInfo = this.entities.find((e) => e.name === _e);


            if (_a) {
                _a.forEach(function(a) {
                    if (entityInfo?.name === "incident") {
                        allAttrs.push(`${a}`);
                    } else {
                        allAttrs.push(`${entityInfo?.alias}.${a}`);
                    }
                });
            }
        
        }

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
