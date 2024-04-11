import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ComponentType, EntityInfo, SearchEvent, SearchEventTypes, SearchTypes } from "./SearchTypes"
// import { DateSearch, TextSearch, LookupSearch, OptionSearch, NumberSearch}  from "./components"
import { unsafeHTML } from "lit/directives/unsafe-html.js";


@customElement('search-table')
export class TableSearch extends LitElement{
  @property() entityName: string = '';
  @property() displayName: string = '';
  @property() components: string = ''; // should be a JSON representation of the component definitions

  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private parsedComponents: ComponentType[] = [];
  private logicGate: string = '';
  private logicGates: string[] = ['OR', 'AND'];
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
      // font-size: 18px;
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

    .delete-row-td{
      vertical-align: middle;
    }

    .delete-row-btn:hover{
      color: red;
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

    /* Table styling - Using bootstrap */
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

    .tbl-wrapper {
      overflow-x: auto; /* Enable horizontal scrolling */
      position: relative; /* Ensure relative positioning for absolute positioning of dropdown */
      height: auto;
    }
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
    /* Attach event listeners for each type of search event */
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


  _generateRow(components: ComponentType[]): TemplateResult{
    let currGroupId = this.nextGroupId++;
    let groupId = `${this.entityName}-group${currGroupId}` 

    let row = html `
      <tr class="tbl-row" id=${groupId}>
        <td class="tbl-data delete-row-td">
          <button 
            aria-label="Row ${groupId} delete button" 
            class='btn delete-row-btn' 
            @click=${(e: Event) => this._deleteRow(e, groupId)}
          >&times;</button>
        </td>
        ${components.map((component, index) => {
          return html `
            <td class="tbl-data">${this._generateComponent(component, groupId)}</td> 
          `
        })}
      </tr>
    `;
    return row;
  }

  _generateComponent(component: ComponentType, groupId: string): TemplateResult{
    let comp = html `
      <div class='component'>
       ${unsafeHTML(`<search-${component.type.toString().toLowerCase()} 
        hideDisplayName='true'
        hideIncludeCheckbox='true'
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
    const groupId = e.detail.groupId.toString();
    const details = e.detail; //detail of the component
    const component = e.detail.displayName;

    if(!this.rowData.get(groupId)){
      this.rowData.set(groupId, new Map<string, object>);
    }
    this.rowData.get(groupId)?.set(component, details)
    this._dispatchMyEvent();
  }
  
  /* Responsible for checking if a component is a valid component and component type */
  _isSearchType(component: unknown): component is SearchTypes{
    const currComponentType = (component as ComponentType).type.toLowerCase();

    if(!isNaN(Number(currComponentType))) return false;
    if(currComponentType === undefined ) return false;
    if(!(Object.values(SearchTypes) as string[]).includes(currComponentType)) return false;

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
      <!-- Using Bootstrap table -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
      <div class="main-container">

        <!-- Section name -->
        <div class="row">
          <div class="col-sm-12">
            <h4 class="section-name">${this.displayName}</h4>
          </div>
        </div>  

        <!-- Table options -->
        <div class="d-flex gap-3 pt-1 pb-1">
          <div class="form-check form-switch form-check-reverse">
            <input @click=${this._setChecked} class="form-check-input" type="checkbox" id="includeEntireTableCheck">
            <label class="form-check-label fw-bold" for="includeEntireTableCheck">Include entire table</label>
          </div>
          
          <div class="section-header">
            <div class="d-flex align-items-center section-logic-gate">
              <p class="m-0 fw-bold">Table Row Condition</p>
              <select @change=${(e:Event) => this._setLogicGate(e)}>
              ${this.logicGates.map((gate) => {
                return html `<option>${gate}</option>`;
              })}
              </select>
            </div>
          </div>
        </div>
           
        <!-- Table operations -->
        <div class="row pb-2">
          <div class="col-sm-12">
            <button @click=${this._addRow} id="addSearchRowBtn" class="btn btn-primary"><!--&CirclePlus;&nbsp;-->Add&nbsp;&plus;</button>
            <!-- <button @click=${this._deleteRow} id="removeSearchRowBtn" class="btn btn-primary">&CircleMinus;&nbsp;Delete</button> -->
            <!-- <button @click=${this._dispatchMyEvent} id="" class="btn btn-primary">Dispatch event</button> -->
          </div>
        </div>

        <!-- Main table -->
        <div class="tbl-wrapper">
          <table class="table table-bordered mb-5">
            <thead class="table-light">
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
        </div>
      </div>
    `;
  }
}