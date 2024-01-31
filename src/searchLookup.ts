import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, EntityInfo, Operation, SearchEvent, SearchTypes } from "./SearchTypes";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CAEFISS } from "./utilities";

/*
 * Class: LookupSearch
 * Purpose: 
 *  LookupSearch is a lit element that allows user to search and select available options. Supports multi select.
*/
@customElement('search-lookup')
export class LookupSearch extends LitElement {

  @property()
  entityName: string = '';
  
  @property()
  from: string = '';
  
  @property()
  parentEntityName: string = '';

  @property()
  to: string = '';

  @property()
  fieldName: string = '';

  @property()
  displayName: string = '';

  /* Responsible for determining if lookup is option set or lookup data */
  @property()
  lookupType: string = '';

  @property()
  alias: string = '';

  @property({attribute: false})
  context: string = '';

  @property({attribute: false})
  operation: Operation = Operation.Delete;

  @property({attribute: false})
  findText: string = '';

  @property({attribute: false})
  condition: Condition = Condition.Equal;
  
  @property({attribute: false})
  isMultiSelect: boolean = false;

  @property({attribute: false})
  checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;

  /* Responsible for uniquely identifying "this" element */
  private uniqueRef: Ref<HTMLDivElement> = createRef();
  
  /* Holds data for lookup */
  private lookupData: string[] = [];
  @property({type: Array, attribute: false}) private selectedData: string[] = [];
  @property({type: Array, attribute: false}) private filterData: string[] = [];

  /*Used for styling purposes */
  @property({attribute: false}) private isLookupValue: boolean = false;
  @query('.lookup-wrapper') private lookupWrapper?: HTMLElement;
  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
    { id: "notEquals", name: "not equals", icon: "&ne;", condition: Condition.NotEqual },
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }
  ]; 

  static override styles = css`

    *{
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      font-family: inherit;
    }

    #main-container{
      width: 100%;
    }

    .hidden{
      display: none;
    }

    /* Condition dropdown styling */
    #condition-btn{
      font-size: 16px;
      width: 3.3em;
      height: auto; 
      padding: 5px;
      background: #2d2d2d;
      border-radius: 5px;
      white-space: nowrap; 
      color: white;
      cursor: pointer;
      border: 2px solid transparent;
    }
    
    #condition-btn:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }
    
    /* Select button */
    .select-btn, .lookup-options .lookup-option{
      display: flex;
      cursor: pointer;
      align-items: center;
    }
    
    .select-btn{
      min-width: 150px;
      width: 100%;
      padding: 6px 10px;
      border-radius: 6px; 
      border: solid 1px lightgray;
      background: #fff;
      justify-content: space-between;
      margin-top: 2px;
    }
    
    /* Lookup content */
    .lookup-wrapper{
      position: relative;
      width: 100%;
    }
    
    .lookup-wrapper.active .select-btn{
      border: 1px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102, 175, 233, .45)
    }
    
    .lookup-wrapper.active .lookup-content{
      display: block;
      border: 1px solid #66afe9;
    }

    .lookup-content{
      position: absolute;
      width: 100%;
      margin-top: 5px;
      display: none;
      padding: 10px 5px 5px 5px;
      border-radius: 6px;
      background-color: #fff;
      z-index: 99;
    }

    /* Search bar */
    .lookup-content .search{
      position: relative;
    }

    .search .search-icon{
      right: 10px;
      top: 15px;
      position: absolute;
    }

    .search input{
      width: 100%;
      font-size: 1em;
      min-height: 25px;
      padding: 10px;
      -webkit-transition: 0.15s;
      transition: 0.15s;
      border-radius: 6px;
      outline: none;
      border: solid 1px lightgray;
      box-shadow: 0 5px 15px rgba(0,0,0,0,0);  
    }   

    .search input:focus{
      border: 1px solid #66afe9;
    }

    /* Lookup Options */
    .lookup-content .lookup-options{
      margin: 5px 0 0 0;
      max-height: 200px;
      overflow-y: auto;
    }

    .lookup-info-message{
      background-color: #d7faff;
      cursor: auto;
    }

    .lookup-options .lookup-option{
      border-radius: 5px;
      padding: 5px;
      font-size: 16px;
    }

    .lookup-options .lookup-option:hover{
      background-color: #3875d7;
      color: white;
    }

    /* Scroll bar */
    .lookup-options::-webkit-scrollbar, .tag-container::-webkit-scrollbar{
      width: 7px; 
      height: 7px;
    }

    .lookup-options::-webkit-scrollbar-track, .tag-container::-webkit-scrollbar-track{
      background-color: #f1f1f1;
      border-radius: 25px;
    }

    .lookup-options::-webkit-scrollbar-thumb, .tag-container::-webkit-scrollbar-thumb{
      background-color: lightgray;
      border-radius: 25px;
    }

    /* Custom tag */
    .tag-container{
      width: 100%;
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      overflow: auto;
    }

    .tag-content{   
      display: flex; 
      gap: 5px;
      background-color: #f1f1f1;
      border: black;
      padding: 6px 12px;
      border-radius: 6px; 
      align-items: center;
      justify-content: space-between;
    }

    .tag-x-container{
      width: 16px;
      text-align: center;
      cursor: pointer
    }

    .tag-x{
      font-size: 18px;
      font-weight: 700;
    }

    .tag-x-container:hover .tag-x{
      color: red;
      font-weight: 700;
    }

    /* Arrow Styling */
    .arrow-container{
      padding-left: 10px;
    }

    .arrow-white{
      border: solid white;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      margin-bottom: 2px; 
    }
    
    .arrow-black{
      border: solid black;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      margin-bottom: 2px; 
    }

    .up{
      transform: rotate(-135deg);
      -webkit-transform: rotate(-135deg);
    }

    .down{
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }
  `;

  /** 
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and closes lookup dropdown
   * Note: only works if direct parent is the main HTML as it is listening on window & needs es6 arrow function
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('mousedown', e => this._globalClickAway(e));
    this._getData("lookupdata");
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: false } as EntityInfo;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('click', this._globalClickAway);
  }

  /* 
  * Purpose: Responsible for fetching necessary data 
  * Note: currently using hardcoded lookup 
  */
  _getData(lookupType: string){
    /* Using hard coded values for now (Jan 24th) */
    let util = new CAEFISS();
    if(lookupType === "lookupdata"){
      let data = util.getLookup('caefiss_cd_immunizing_agents_mls', 'caefiss_english_value');
      data.forEach((d) => this.lookupData.push(d));
    }  
  }

  _dispatchMyEvent(){
    this._changeMessage();
    let evt: SearchEvent = {
      type: SearchTypes.Lookup,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: this.findText,
      condition: this.condition,
      operation: this.operation,
      context: '',
      option1: '',
      option2: '',
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-lookup-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _changeCondition(event: Event){
    const clickedEl = event.target as HTMLSelectElement;
    let selectedIndex = Number(clickedEl.selectedIndex)
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change)
      this._dispatchMyEvent();
  }

  _changeMessage(){
    this.findText = this.selectedData.length > 0 ? this.selectedData[0] : ""; // only adding first el    
    this.operation = this.findText ? Operation.Change : Operation.Delete; //check if the value is empty
  }
  
  /* Responsible for adding selected data to an array that will be passed in the custom event; Support multi selects*/
  _addSelectedData(event: Event, isMultiSelect: boolean){
    let currEl = event.target as HTMLElement;
    let currValue = currEl.innerText; 
    
    if(!this.selectedData.includes(currValue)){
      if(!isMultiSelect){
        this.selectedData = [];
      }
      this.selectedData.push(currValue);
      this._dispatchMyEvent();
    }
    this._toggleLookup();
  }
  
  _removeTag(e: Event){
    let currEl = e.target as HTMLElement;
    let index = Number(currEl.parentElement?.id);
    this.selectedData.splice(index, 1);
    this._toggleLookup();
    this._dispatchMyEvent();
  }

  /* Helper Functions */
  _localClickAway(event: Event){
    let currEl = event.target as HTMLElement;
    if(!(this.lookupWrapper?.contains(currEl)) && this.lookupWrapper?.classList.contains('active')){
      this._toggleLookup();
    } 
  }
  
  _globalClickAway(event: Event){
    let currEl = event.target as LookupSearch;
    if(!(currEl.uniqueRef === this.uniqueRef)){
      if(this.lookupWrapper?.classList.contains('active')){
        this._toggleLookup();
      }
    }
  } 
  
  _toggleLookup(){
    this.lookupWrapper?.classList.toggle('active');
  }
  
  /* Generates selected lookup tags */
  _generateTag(tagName: string, key: number){
    return html `
      <div id=${key} class="tag-content">
        <p class="tag-name">${tagName}</p>
        <div @click=${this._removeTag} class="tag-x-container">
          <p class="tag-x">&times;</p>
        </div>
      </div>
    `;
  }

  _filterLookup(e: Event){
    let currEl = e.target as HTMLInputElement;
    this.isLookupValue = currEl.value ? true : false;
    this.filterData = this.lookupData.filter(data => {
      return data.toLowerCase().startsWith(currEl.value.toLowerCase());
    }); 
    !this.isLookupValue ? this.filterData = [] : '';
  }

  override render(){
    return html `
      <div id="mainContent" ${ref(this.uniqueRef)} @click=${this._localClickAway} id="main-container">
        <div class="display-name-container">
          <h3>${this.displayName}</h3>
        </div>
        <!-- Drop down (conditions) -->
        <div class="condition-wrapper">
          <label for="condition-btn" class="hidden">Condition</label> 
          <select @change=${this._changeCondition} id="condition-btn">
            <!-- Populate conditions -->
            ${this.conditions?.map((condition, key) => {
              return html `<option ${key === 0 ? 'selected': ''} tabindex="0" class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
            })}
          </select> 
        </div>
       
        <!-- Drop down (lookup) -->
        <div class="lookup-wrapper">
          <div @click=${this._toggleLookup} class="select-btn">
            <span class="tag-container">${this.selectedData.map((data, key) => { 
              return this._generateTag(data, key); 
            })}</span>
            <span class="arrow-container"><i id="arrow" class="arrow-black down"></i></span>
          </div>

          <div class="lookup-content">
            <div class="search">
              <i class="search-icon-container">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39M11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7"/></svg>
              </i>
              <input id="lookupSearch" @input=${this._filterLookup} type="text" placeholder="Search"></input>
            </div>
            <ul class="lookup-options">
              ${!this.isLookupValue ? html `<li class="lookup-info-message"> &#x1F6C8; Please enter 1 or more characters</li>`: ''}
              ${this.filterData.map((data, _key) => {
                return html`<li class="lookup-option" @click=${(e: Event) => this._addSelectedData(e, this.isMultiSelect)}>${data}</li>`
              })}
              ${this.filterData.length === 0 && this.isLookupValue ? html `<li class="lookup-info-message"> &#x1F6C8; Sorry no results</li>` : ''}
            </ul>
          </div>
        </div>

      </div>
    `;
  }
}
