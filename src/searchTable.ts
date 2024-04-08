import { LitElement, PropertyValueMap, TemplateResult, css, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ComponentType, EntityInfo, SearchEvent, SearchEventTypes, SearchTypes } from "./SearchTypes"
import { DateSearch, TextSearch, LookupSearch, OptionSearch, NumberSearch}  from "./components"
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { templateContent } from "lit/directives/template-content.js";


@customElement('search-table')
export class TableSearch extends LitElement{
  @property() entityName: string = '';
  @property() displayName: string = '';
  @property() components: string = ''; // should be a JSON representation of the component definitions

  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private parsedComponents: ComponentType[] = [];
  // private rowTemplate: TemplateResult = html `<div></div>`;
  private logicGate: string = '';
  private logicGates: string[] = ['OR', 'AND'];
  private includeEntireTable: boolean = false;
  private nextGroupId: number = 0;

  @state() rowTemplates: TemplateResult[] = [];
  private rowData: Map<string, Map<string, object>> = new Map<string, Map<string, object>>();
  
  static override styles = css`
    *{
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      font-family: inherit;
    }

    .visually-hidden { 
      border: 0;
      padding: 0;
      margin: 0;
      position: absolute !important;
      height: 1px; 
      width: 1px;
      overflow: hidden;
      clip: rect(1px 1px 1px 1px); /* IE6, IE7 - a 0 height clip, off to the bottom right of the visible 1px box */
      clip: rect(1px, 1px, 1px, 1px); /*maybe deprecated but we need to support legacy browsers */
      clip-path: inset(50%); /*modern browsers, clip-path works inwards from each corner*/
      white-space: nowrap; /* added line to stop words getting smushed together (as they go onto seperate lines and some screen readers do not understand line feeds as a space */
    }

    .main-container{
      width: 100%;
    }    
    
    .section-name{
      font-weight: normal;
      font-size: 18px;
      color: #2572b4;
    }

    .component-main-container{
      width: 100%;
    }

    .component{
      min-width: 100px;
    }

    .btn{
      display: inline-block;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: 0.3s ease-in-out;
      color: #000;
      border: none;
      background-color: #f0f0f0;

    }

    .btn:hover{
      background-color: #1a1a1a;
      box-shadow: 0 0px 15px rgba(102,175,233,.45);
      text-decoration: none;
      color: #fff;
    }

    .btn:not(:disabled):not(.disabled) {
      cursor: pointer;
    }

    #section-name{
      font-size: 20px;
    }
    
    .section-header, .section-logic-gate, .section-include-checkbox{
      display: flex;
      align-items: center; 
    }
    
    .section-header{
      gap: 20px;
    }

    .section-logic-gate, .section-include-checkbox{
      font-weight: 500;
      gap: 5px;
    }
    
    /* Custom checkbox styling */
   .checkbox-container{
      padding-top: 0.5em;
    }

    .checkbox-container [type="checkbox"]:not(:checked),
    .checkbox-container [type="checkbox"]:checked {
      position: absolute;
      left: -9999px;
    }

    .checkbox-container [type="checkbox"]:not(:checked) + label,
    .checkbox-container [type="checkbox"]:checked + label {
      position: relative;
      padding-left: 1em;
      cursor: pointer;
    }

    /* checkbox aspect */
    .checkbox-container [type="checkbox"]:not(:checked) + label:before{
      content: '';
      position: absolute;
      left: 0; top: 0;
      width: 0.65em; height: 0.65em;
      border: 3px solid #1e1e1e;
      background: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
    }

    .checkbox-container [type="checkbox"]:checked + label:before{
      content: '';
      position: absolute;
      left: 0; top: 0;
      width: 0.65em; height: 0.65em;
      border: 3px solid green;
      background: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
    } 
    
    /* checked mark aspect */
    .checkbox-container [type="checkbox"]:not(:checked) + label::after,
    .checkbox-container [type="checkbox"]:checked + label::after {
      // content: '✔';
      content: "✓";
      position: absolute;
      top: -0.1em;
      left: 0.2em;
      font-weight: 900;
      font-size: 1em;
      line-height: 1;
      color: green;
      transition: all 0.2s ease-in-out 0s;
    }

    /* checked mark aspect changes */
    .checkbox-container [type="checkbox"]:not(:checked) + label:after {
      opacity: 0;
      transform: scale(0);
    }

    .checkbox-container [type="checkbox"]:checked + label:after {
      opacity: 1;
      transform: scale(1);
    }

    /* disabled checkbox */
    .checkbox-container [type="checkbox"]:disabled:not(:checked) + label:before,
    .checkbox-container [type="checkbox"]:disabled:checked + label:before {
      box-shadow: none;
      border-color: #bbb;
      background-color: #ddd;
    }

    .checkbox-container [type="checkbox"]:disabled:checked + label:after {
      color: #999;
    }
    
    .checkbox-container [type="checkbox"]:disabled + label {
      color: #aaa;
    }
    
    /* accessibility */
    .checkbox-container [type="checkbox"]:not(:checked):focus + label:before {
      // border: 3px solid #0535d2;
      border: 3px solid #66afe9;
    }    
    
    .checkbox-container [type="checkbox"]:checked:focus + label:before {
      // border: 3px solid #0535d2;
      border: 3px solid #66afe9;
    }
    
    /* hover style just for information */
    .checkbox-container label:hover:before {
      // border: 3px solid #0535d2!important;
      border: 3px solid #66afe9 !important;
    } 

    /* Table styling */
    table{
      // width: 100%;
      // border-collapse: collapse;
      box-shadow: 0 0px 10px rgba(102,175,233,.10);
      // margin: 5px;
    }

    // .tbl-wrapper{
    //   display: flex;
    //   flex-direction: column;
    //   overflow-x: scroll;
    //   height: 100%;
    // }

    // table, th, td{
    //   border: 1px solid lightgray;
    //   border-radius: 6px;
    // }

    // thead{
    //   background-color: rgb(240, 240, 240); 
    // }

    // th, td{
    //   padding: 5px;
    // }
   
    // .tbl-mirror{
    //   display: flex;
    //   overflow-x: scroll;
    // }
    
    // .tbl-mirror div {
    //   flex-grow: 1;
    //   width: 100%;
    // }
  `;


  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('DOMContentLoaded', () => this._initComponents()) //wait till all the content loads before parsing
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('DOMContentLoaded', () => this._initComponents()) //wait till all the content loads before parsing
  }  
  
  protected firstUpdated(): void {
    //attach event listeners for each type of search event
    for(let eventType of Object.values(SearchEventTypes)){
      this.shadowRoot?.addEventListener(eventType, (e: Event) => {
        this._handleCustomEvent(e as CustomEvent);
      });
    }

    this.logicGate = this.logicGates[0];
  }
  
  _dispatchMyEvent(): void {
    let evt = {
      entityName: this.entityName,
      logicGate: this.logicGate,
      checked: this.checked,
      rows: this.rowData
    }
     
    let searchChangeEvent = new CustomEvent('search-row-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _initComponents(): void{
    this._parseComponents();
  }

  _parseComponents(): void{
    let currComponents: unknown = JSON.parse(this.components);
    if(!Array.isArray(currComponents)){
      console.log('ERROR: passed components is not an array');
      return;
    }

    // If an object is a search type, add it to the parsed array, else don't
    (currComponents as ComponentType[]).forEach((component) => {
      if(this._isSearchType(component)) this.parsedComponents.push(component as ComponentType);
      else console.log(`Did not add component with search type ${component.type} and display name: ${component.displayName}`);
    })
  }

  // _generateTable(components: ComponentType[]): void {
  //   let mainContentContainer = this.shadowRoot?.querySelector('.component-main-container');
  //   let table = document.createElement('table');
  //   let row = document.createElement('tr');
  //   for(let i = 0; i < components.length; ++i){
  //     let th = document.createElement('th');
  //     th.innerHTML = components[i].displayName;
  //     row.append(th);
  //   }
  //   table.append(row);
  //   mainContentContainer?.append(table);
  // }

  _generateRow(components: ComponentType[]): TemplateResult{
    let currGroupId = this.nextGroupId++;
    let groupId = `${this.entityName}-group${currGroupId}` 
    console.log('generating row: ', groupId)

    let row = html `
      <tr class="tbl-row" id=${groupId}>
        <td class="tbl-data"><button aria-label="Row ${groupId} delete button" class='btn' @click=${(e: Event) => this._deleteRow(e, groupId)}>&#x1F5d1;</button></td>
        ${components.map((component, index) => {
          return html `
            <td class="tbl-data">${this._generateComponent(component, groupId)}</td> 
          `
        })}
      </tr>
    `;
    console.log(row)
    return row;
  }

  _generateComponent(component: ComponentType, groupId: string): TemplateResult{
    let comp = html `
      <div class='component'>
       ${unsafeHTML(`<search-${component.type.toString().toLowerCase()} 
        hideDisplayName='true'
        id='${component.id}'
        groupId='${groupId}'
        displayName='${component.displayName}'
        fieldName='${component.fieldName}'
        entityName='${component.entityName}'
        parentEntityName='${component.parentEntityName}'
        parentEntityId='${component.parentEntityId}'
        from='${component.from}'
        to='${component.to}'
        alias='${component.alias}'
        isMultiSelect='${component.isMultiSelect}'
        include='${component.include}'
        includeLock='${component.includeLock}'
      />`)}
      </div>
    `;
    return comp;
  }

  _addRow(): void {
    this.rowTemplates = [...this.rowTemplates, this._generateRow(this.parsedComponents)];
  }

  _deleteRow(e: Event, rowId: string){
    let delEl = this.shadowRoot?.getElementById(rowId);
    delEl?.remove();
    this.rowData.delete(rowId);
    this._dispatchMyEvent();
  }

  _handleCustomEvent(e: CustomEvent<SearchEvent>){
    let groupId = e.detail.groupId.toString();
    let details = e.detail; //detail of the component
    let component = e.detail.displayName;
    // console.log('Group Id: ', groupId)
    // console.log('details: ', details)
    // console.log('Component: ', component)
    if(!this.rowData.get(groupId)){
      this.rowData.set(groupId, new Map<string, object>);
    }
    this.rowData.get(groupId)?.set(component, details)
    // console.log(this.rowData);
    // this.rowData.set(groupId);
    this._dispatchMyEvent();
  }
  
  /* Responsible for checking if a component is a valid component and component type */
  _isSearchType(component: unknown): component is SearchTypes{
    let currComponentType = (component as ComponentType).type.toLowerCase();

    if(!isNaN(Number(currComponentType))){
      console.log(`Search type is a number`);
      return false;
    }
    if(currComponentType === undefined ){
      console.log(`Search type is undefined`)
      return false;
    }

    if(!(Object.values(SearchTypes) as string[]).includes(currComponentType)){
      console.log(`search type dos not contain ${currComponentType}`)
      return false;
    }

    return true;
  }

  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }

  _setLogicGate(e: Event): void{
    let el = e.target as HTMLSelectElement;
    if(el){
      this.logicGate = el.value;
      this._dispatchMyEvent();
    }
  }

  override render(){
    return html `
      <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"> -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

      <div class="main-container">
        <h4 class="section-name">${this.displayName}</h4>
        <div class="section-header">
          <div class="section-include-checkbox">
            <p>Include entire table</p>
            <!-- Custom Checkbox -->
            <div class="checkbox-container">
              <input 
                @click=${this._setChecked} 
                type="checkbox" 
                id="include-checkbox" 
                aria-labelledby="display-name include-checkbox-label"
              />
              <label for="include-checkbox" id="include-checkbox-label"><span class="visually-hidden">Include in output</span></label>
            </div><!-- End of custom checkbox -->
          </div>
          <div class="section-logic-gate">
            <p>Table Row Condition</p>
            <select @change=${(e:Event) => this._setLogicGate(e)}>
            ${this.logicGates.map((gate) => {
              return html `<option>${gate}</option>`;
            })}
            </select>
          </div>
        </div>
      <button @click=${this._addRow} id="addSearchRowBtn" class="btn btn-primary">&CirclePlus;&nbsp;Add</button>
      <button @click=${this._deleteRow} id="removeSearchRowBtn" class="btn btn-primary">&CircleMinus;&nbsp;Delete</button>
      <button @click=${this._dispatchMyEvent} id="" class="btn btn-primary">Dispatch event</button>
        <div class="component-main-container">
          <div class="table-responsive tbl-wrapper">

            <table class="table">
              <thead>
                <tr class="tbl-header-row">
                  <th class="tbl-header"></th>
                  ${this.parsedComponents.map((component => {
                    return html `
                      <th scope="col" class="">${component.displayName}</th> 
                    `
                  }))}
                </tr>
              </thead>
              <tbody>
                ${this.rowTemplates.map(template=> {
                  return html`
                    ${template} 
                  `
                })}
              </tbody>
            </table>
            <!-- <div class="tbl-mirror"><div></div></div> -->
          </div>
        </div>
      </div>
    
    `
  }
}