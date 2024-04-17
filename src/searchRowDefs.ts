import { ComponentType, SearchTypes } from "./SearchTypes";


  let searchRow = document.getElementById('searchRow');
  console.log(`Defining search row`)
  // let componentsArr: ComponentType[] = [
  //   {
  //     type: SearchTypes.Text,
  //     id: 'searchRow1',
  //     entityName: '',
  //     from: '',
  //     parentEntityName: '',
  //     to: '', 
  //     fieldName: '',
  //     displayName: "HELLO",
  //     alias: '',
  //     isMultiSelect: false,
  //     include: false,
  //     includeLock: false
  //   } as ComponentType,
  //   {
  //     type: SearchTypes.Lookup,
  //     id: 'searchRow2',
  //     entityName: '',
  //     from: '',
  //     parentEntityName: '',
  //     to: '', 
  //     fieldName: '',
  //     displayName: "World",
  //     alias: '',
  //     isMultiSelect: false,
  //     include: false,
  //     includeLock: false
  //   } as ComponentType
  // ];

  let componentsArr: ComponentType[] = [  

    { // Immunizing Agent
      type: SearchTypes.Lookup,
      id: 'vaccince_immunizingAgent',
      groupId: -1,
      displayName: "Immunizing Agent",
      fieldName: 'caefiss_english_value',
      entityName: "caefiss_cd_immunizing_agents_mls",
      parentEntityName: 'caefiss_aefi_vaccines',
      parentEntityId: 'caefiss_id',
      from: 'caefiss_cd_immunizing_agents_mlid',
      to: 'caefiss_vac_cd_immunizing_agents_ml', 
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false 
    },

    { // Trade Name
      type: SearchTypes.Lookup,
      id: 'vaccine_tradeName',
      groupId: -1,
      displayName: "Trade name",
      fieldName: "caefiss_vac_immunizing_agent_trade_name_en",
      entityName: "caefiss_cd_immunizing_agents_mls",
      parentEntityName: "caefiss_aefi_vaccines",
      parentEntityId: "caefiss_id",
      from: "caefiss_cd_immunizing_agents_mlid", 
      to: "caefiss_vac_cd_immunizing_agents_ml",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    },

    { // Manufacturer
      type: SearchTypes.Lookup,
      id: 'vaccine_manufacturer',
      groupId: -1,
      displayName: "Manufacturer",
      fieldName: "caefiss_vac_immunizing_agent_manufactureren",
      entityName: "caefiss_cd_immunizing_agents_mls",
      parentEntityName: "caefiss_aefi_vaccines",
      parentEntityId: "caefiss_id",
      from: "caefiss_cd_immunizing_agents_mlid",
      to: "caefiss_vac_cd_immunizing_agents_ml",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    },
    
    { //Lot Number
      type: SearchTypes.Text,
      id: 'vaccine_lotNumber',
      groupId: -1,
      displayName: "Lot Number", 
      fieldName: "caefiss_lot_number",
      entityName: "caefiss_aefi_vaccines",
      parentEntityName: "incident",
      parentEntityId: '',
      from: "caefiss_case",
      to: "incidentid",
      alias: '',
      isMultiSelect: false,
      include: false,
      includeLock: false
    },

    {// Dose Number
      type: SearchTypes.Option,
      id: 'vaccine_doseNumber',
      groupId: -1,
      displayName: "Dose #",
      entityName: "caefiss_aefi_vaccines",
      from: "caefiss_case",
      parentEntityName: "incident",
      parentEntityId: '',
      to: "incidentid",
      fieldName: "caefiss_vac_dose",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    },

    { //Dosage 
      type: SearchTypes.Number,
      id: 'vaccine_dosage',
      groupId: -1,
      displayName: "Dosage",
      fieldName: "caefiss_vac_dosage",
      entityName: "caefiss_aefi_vaccines",
      parentEntityName: "incident",
      parentEntityId: '',
      from: "caefiss_case",
      to: "incidentid",
      alias: '',
      isMultiSelect: false,
      include: false,
      includeLock: false
    },

    { //Dosage unit
      type: SearchTypes.Option,
      id: 'vaccine_dosageUnit',
      groupId: -1,
      displayName: "Dosage Unit",
      fieldName:"caefiss_vac_dose_unit",
      entityName: "caefiss_aefi_vaccines",
      parentEntityName: "incident",
      parentEntityId: '',
      from: "caefiss_case",
      to: "incidentid",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    },

    {// Route
      type: SearchTypes.Option,
      id: 'vaccine_route',
      groupId: -1,
      displayName: "Route", 
      fieldName: "caefiss_vac_route",
      entityName: "caefiss_aefi_vaccines",
      parentEntityName: "incident",
      parentEntityId: '',
      from: "caefiss_case",
      to: "incidentid",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    },

    { //Site
      type: SearchTypes.Option,
      id: 'vaccine_site',
      groupId: -1,
      displayName: "Site",
      fieldName: "caefiss_vac_site",
      entityName: "caefiss_aefi_vaccines",
      parentEntityName: "incident",
      parentEntityId: '',
      from: "caefiss_case",
      to: "incidentid",
      alias: '',
      isMultiSelect: true,
      include: false,
      includeLock: false
    }
  ];

  let components = JSON.stringify(componentsArr);
  console.log(components)
  searchRow?.setAttribute('components', components);