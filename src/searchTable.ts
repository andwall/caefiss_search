import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ComponentType, EntityInfo, Operation, SearchEvent, SearchEventTypes, SearchTypes } from "./SearchTypes"
import { unsafeHTML } from "lit/directives/unsafe-html.js";


@customElement('search-table')
export class TableSearch extends LitElement{
  @property() entityName: string = '';
  @property() displayName: string = '';
  @property() components: string = ''; // should be a JSON representation of the array of component definitions
  private operation: Operation = Operation.Change;

  private checked: EntityInfo = { 
    name: '',
    linkname: '',
    from: '', 
    to: '',
    alias: '', 
    parent: null,
    children: [],
    include: false,
    filters: new Map<string, SearchEvent>(),
    attrs: [] 
  };
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
      color: #2572b4;
      font-size: 1.25rem;
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
      // padding-top: 0.5em;
    }

    .checkbox-label-text{
      padding-left: .25rem;
      font-weight: 500;
    }

    [type="checkbox"]:not(:checked),
    [type="checkbox"]:checked {
      position: absolute;
      left: -9999px;
    }

    [type="checkbox"]:not(:checked) + label,
    [type="checkbox"]:checked + label {
      position: relative;
      padding-left: 1em;
      cursor: pointer;
    }

    /* checkbox aspect */
    [type="checkbox"]:not(:checked) + label:before{
      content: '';
      position: absolute;
      left: 0; top: 0.25rem;
      width: 0.65em; height: 0.65em;
      border: 3px solid #1e1e1e;
      background: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
    }

    [type="checkbox"]:checked + label:before{
      content: '';
      position: absolute;
      left: 0; top: 0.25rem;
      width: 0.65em; height: 0.65em;
      border: 3px solid green;
      background: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
    } 
    
    /* checked mark aspect */
    [type="checkbox"]:not(:checked) + label::after,
    [type="checkbox"]:checked + label::after {
      // content: '✔';
      content: "✓";
      position: absolute;
      top: 0.2rem;
      left: 0.2em;
      font-weight: 900;
      font-size: 1em;
      line-height: 1;
      color: green;
      transition: all 0.2s ease-in-out 0s;
    }
    
    /* checked mark aspect changes */
    [type="checkbox"]:not(:checked) + label:after {
      opacity: 0;
      transform: scale(0);
    }

    [type="checkbox"]:checked + label:after {
      opacity: 1;
      transform: scale(1);
    }

    /* disabled checkbox */
    [type="checkbox"]:disabled:not(:checked) + label:before,
    [type="checkbox"]:disabled:checked + label:before {
      box-shadow: none;
      border-color: #bbb;
      background-color: #ddd;
    }

    [type="checkbox"]:disabled:checked + label:after {
      color: #999;
    }

    [type="checkbox"]:disabled + label {
      color: #aaa;
    }

    /* accessibility */
    [type="checkbox"]:not(:checked):focus + label:before {
      // border: 3px solid #0535d2;
      border: 3px solid #66afe9;
    }    
    
    [type="checkbox"]:checked:focus + label:before {
      // border: 3px solid #0535d2;
      border: 3px solid #66afe9;
    }

    /* Table styling */

    .tbl-wrapper {
      // overflow-x: auto; /* Enable horizontal scrolling */
      position: relative; /* Ensure relative positioning for absolute positioning of dropdown */
      height: auto;
    }

    /* Table styling - Native */ 
    .caefiss-tbl-options{
      display: flex;
      gap: 0.616rem;
      padding: .25rem 0;
    }
  
    .caefiss-tbl-operations-container{
      padding-bottom: .25rem;
    }
    
    .caefiss-tbl-wrapper {
      // overflow-x: auto; /* Enable horizontal scrolling */
      position: relative; /* Ensure relative positioning for absolute positioning of dropdown */
      height: auto;
      padding-bottom: 1.5rem;
    }

    .caefiss-tbl, .caefiss-th, .caefiss-td{
      border: solid 1px lightgray;
    }

    .caefiss-th, .caefiss-td{
      padding: 0.313rem;
    }

    .caefiss-tbl{
      box-shadow: 0 0px 10px rgba(102,175,233,.175);  
      border-collapse: collapse;
      width: 100%;
    }

    .caefiss-th{
      background-color: #f0f0f0;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('load', this._initComponents)
  }  
  
  protected override firstUpdated(): void {
    /* Attach event listeners for each type of search event */
    window.addEventListener('load', () => this._initComponents()) //wait till all the content loads before parsing
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
      operaton: this.operation,
      rows: this.rowData
    }
     
    let searchChangeEvent = new CustomEvent('search-table-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _initComponents(): void{
    this._parseComponents();
  }

  /* Responsible for parsing all the passed components - checks if each component is a valid search type */
  _parseComponents(): void{
    let currComponents: unknown = JSON.parse(this.components);
    if(!Array.isArray(currComponents)){
      console.log('ERROR: passed components is not an array');
      return;
    }

    // If an object is a search type, add it to the parsed array, else don't
    (currComponents as ComponentType[]).forEach((component) => {
      if(this._isSearchType(component)) this.parsedComponents.push(component as ComponentType);
      else console.log(`Could not add component with search type ${component.type} and display name: ${component.displayName} to ${this.displayName} table`);
    })
  }

  _generateRow(components: ComponentType[]): TemplateResult{
    let currGroupId = this.nextGroupId++;
    let groupId = `${this.entityName}-group${currGroupId}` 

    let row = html `
      <tr class="caefiss-tr" id=${groupId}>
        <td class="delete-row-td caefiss-td">
          <button 
            aria-label="Row ${groupId} delete button" 
            class='btn delete-row-btn' 
            @click=${() => this._deleteRow(groupId)}
          >&times;</button>
        </td>
        ${components.map((component) => {
          return html `
            <td class="caefiss-td">${this._generateComponent(component, groupId)}</td> 
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
        hideDisplayName='${component.hideDisplayName}'
        hideIncludeCheckbox='${component.hideDisplayName}'
        wrapped='${component.wrapped}'
      />`)}
      </div>
    `;
    return comp;
  }

  _addRow(): void {
    this.rowTemplates = [...this.rowTemplates, this._generateRow(this.parsedComponents)]; // spread operator to trigger rerender
  }

  _deleteRow(rowId: string){
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
      <div class="main-container">

        <!-- Section name -->
        <div class="section-name-container">
          <h4 class="section-name">${this.displayName}</h4>
        </div>  

        <!-- Table options -->
        <div class="caefiss-tbl-options">
          <div class="checkbox-container">
            <input @click=${this._setChecked} type="checkbox" id="include-checkbox" aria-labelledby="display-name checkbox-label"/>
            <label for="include-checkbox" id="checkbox-label"><span class="checkbox-label-text">Include entire table <span class="visually-hidden">checkbox</span></label>
          </div>
          <div class="bar">|</div> 
          <div class="section-header">
            <div class="section-logic-gate">
              <label id="logic-gate-label">Table Row Condition</label>
              <select aria-labelledby="logic-gate-label" @change=${(e:Event) => this._setLogicGate(e)}>
              ${this.logicGates.map((gate) => {
                return html `<option>${gate}</option>`;
              })}
              </select>
            </div>
          </div>
        </div>
           
        <!-- Table operations -->
        <div class="caefiss-tbl-operations-container">
          <div class="caefiss-btn-container">
            <button aria-label="${this.displayName} table - add row button" @click=${this._addRow} id="addSearchRowBtn" class="btn btn-primary"><!--&CirclePlus;&nbsp;-->Add&nbsp;&plus;</button>
            <!-- <button @click=${this._deleteRow} id="removeSearchRowBtn" class="btn btn-primary">&CircleMinus;&nbsp;Delete</button> -->
            <!-- <button @click=${this._dispatchMyEvent} id="" class="btn btn-primary">Dispatch event</button> -->
          </div>
        </div>

        <!-- Main table -->
        <div class="caefiss-tbl-wrapper">
          <table class="caefiss-tbl">
            <thead class="caefiss-thead">
              <tr class="caefiss-tr">
                <th class="caefiss-th"></th>
                ${this.parsedComponents.map((component => {
                  return html `
                    <th scope="col" class="caefiss-th">${component.displayName}</th> 
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