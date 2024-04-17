import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ComponentType, EntityInfo, SearchEvent, SearchEventTypes, SearchTypes } from "./SearchTypes"
import { DateSearch, TextSearch, LookupSearch, OptionSearch, NumberSearch}  from "./components"
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement('search-row')
export class RowSearch extends LitElement {

  @property()
  components: string = '';
  
  @property()
  sectionName: string = ''; //parent entity of each component
  
  @query('#addSearchRowBtn')
  searchRowBtn?: HTMLButtonElement;
  
  @query('.component-main-container')
  componentMainContainer?: HTMLDivElement;
  
  private parsedComponents: ComponentType[] = [];
  private rowTemplate?: HTMLDivElement;
  private logicGate: string = '';
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private componentDetails: Map<string, SearchEvent> = new Map<string, SearchEvent>();
  private nextRowId = 0;
  
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

    #main-container{
      width: 100%;
    }    
    
    #section-name{
      font-weight: normal;
      font-size: 18px;
      color: #2572b4;
    }

    .component-main-container{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .component-row{
      display: flex;
      justify-content: start;
      align-items: end;
      gap: 10px;
      flex-wrap: wrap;
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

  `;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('DOMContentLoaded', e => this._initComponents(e)); // ensures that any scripts for component JSON definitions have been passed 
  }

  override disconnectedCallback(): void {
    window.removeEventListener('DOMContentLoaded', () => {});
  }

  protected firstUpdated(): void {
    //attach event listeners for each type of search event
    for(let eventType of Object.values(SearchEventTypes)){
      this.shadowRoot?.addEventListener(eventType, (e: Event) => {
        console.log((<CustomEvent>e).detail);
        this.componentDetails.set((e.target as HTMLElement).id, (<CustomEvent>e).detail);
      });
    }
  }

  _initComponents(e: Event): void {
    this._parseComponents();
    this.rowTemplate = this._generateRow(this.parsedComponents);
  }

  _dispatchMyEvent(): void {
    let evt = {
      logicGate: this.logicGate,
      checked: this.checked
    }
     
    let searchChangeEvent = new CustomEvent('search-row-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  /* Responsible for checking and parsing valid components */
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

  _addRow(): void{
    console.log(`In add row`, this.rowTemplate);
    this.componentMainContainer?.append(this._generateRow(this.parsedComponents));
  }
 
  _deleteRow(e: Event, currRowId: string): void{
    let delEl = this.shadowRoot?.getElementById(currRowId);
    console.log(delEl)
    delEl?.remove();
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

  _generateComponent(component: ComponentType){
    let comp = document.createElement('div');
    comp.classList.add('component');
    let searchEl = document.createElement(`search-${component.type.toString().toLowerCase()}`);

    searchEl.id = component.id;
    searchEl.setAttribute('groupId', component.groupId.toString());
    searchEl.setAttribute('displayName', component.displayName);
    searchEl.setAttribute('fieldName', component.fieldName);
    searchEl.setAttribute('entityName', component.entityName);
    searchEl.setAttribute('parentEntityName', component.parentEntityName);
    searchEl.setAttribute('parentEntityId', component.parentEntityId);
    searchEl.setAttribute('from', component.from);
    searchEl.setAttribute('to', component.to);
    searchEl.setAttribute('alias', component.alias);
    searchEl.setAttribute('isMultiSelect', String(component.isMultiSelect));
    searchEl.setAttribute('include', String(component.include));
    searchEl.setAttribute('includeLock', String(component.includeLock));
    comp.appendChild(searchEl);

    return comp;
  }

  _generateRow(components: ComponentType[]){
    let currRowId = this.nextRowId++;
    let row = document.createElement('div');
    row.id = `${this.sectionName.replace(/ /g,'')}-row${currRowId}`;
    row.classList.add('component-row');

    let delBtn = document.createElement('button');
    delBtn.addEventListener('click', e => this._deleteRow(e, row.id));
    delBtn.classList.add('btn');
    delBtn.ariaLabel = 'Delete Row';
    delBtn.innerHTML = '&#x1F5d1;';

    row.appendChild(delBtn);
    
    for(let i = 0; i < components.length; i++){
      console.log(`In the generate row loop ${components[i]}`)
      row.append(this._generateComponent(components[i]));
    }
    let hr = document.createElement('hr');
    row.append(hr); 
    console.log(row)
    return row;
  }
  
  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }

  _setLogicGate(e: Event): void{
    let el = e.target as HTMLSelectElement;
    if(el)
      this.logicGate = el.value;
  }
 
  override render(){
    return html `
      <div id="main-container">
        <h4 id="section-name">${this.sectionName}</h4>
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
            <select @change=${this._setLogicGate}>
              <option>OR</option>
              <option>AND</option>
            </select>
          </div>
        </div>
      <button @click=${this._addRow} id="addSearchRowBtn" class="btn btn-primary">&CirclePlus;&nbsp;Add</button>
      <button @click=${this._deleteRow} id="removeSearchRowBtn" class="btn btn-primary">&CircleMinus;&nbsp;Delete</button>
      <button @click=${this._dispatchMyEvent} id="" class="btn btn-primary">Dispatch event</button>
        <div class="component-main-container">
         
        </div>
      </div>
    
    `
  }
}
