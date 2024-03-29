import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, Operation, SearchEvent } from "./SearchTypes";
import { Ref, createRef, ref } from "lit/directives/ref.js";

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

  /* Responsible for uniquely identifying "this" element */
  @property({attribute: false})
  uniqueRef: Ref<HTMLDivElement> = createRef();
  
  /* Holds data for lookup */
  private lookupData: string[]  = [];
  @property({type: Array, attribute: false}) private selectedData: string[] = [];
  @property({type: Array, attribute: false}) private filterData: string[] = [];

  /*Used for styling purposes */
  @property({attribute: false}) private isDropDownOpen: boolean = false;
  @property({attribute: false}) private conditionKey: number = 0;
  @property({attribute: false}) private isLookupValue: boolean = false;
  @query('.dropdown-wrapper') private dropDownContainer?: HTMLElement; 
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
      font: inherit;
    }

    .main-container{
      width: 100%;
    }

    /* Dropdown styling */
    .dropdown-wrapper{
      position: relative;
      font-size: 12px;
      width: min-content;
    }

    .dropdown-btn{
      padding: 8px 8px;
      background: #2d2d2d;
      border-radius: 5px;
      width: min-content;
      white-space: nowrap; 
      color: white;
      cursor: pointer;
    }

    .dropdown-menu{
      width: max-content;
      background-color: #2d2d2d;
      border-radius: 5px;
      margin-top: 2px;
      box-shadow: 0 5px 10px rgba(0,0,0,0.15);
      display: none;
      position: absolute;
      z-index: 10;
    }

    .dropdown-menu.open{
      display: block;
    }

    .dropdown-menu .condition{
      padding: 6px 10px;
      cursor: pointer;
      border-radius: 5px;
    }

    .dropdown-menu .condition:hover{
      background-color: #1967d2;
    }

    .special-character{
      padding-right: 5px;
    }

    .condition, .special-character{
      color: white;
      font-size: 14px;
    }

    /* Main content */
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
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and close necessary drop downs
   * Note: only works if direct parent is the main HTML as it is listening on window & needs es6 arrow function
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('mousedown', e => this._globalClickAway(e));
    this._getData();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('click', this._globalClickAway);
  }

  /* 
  * Purpose: Responsible for fetching necessary data 
  * Note: currently using dummy data - TODO: get this function from Hany 
  */
  _getData(){
    this.lookupData = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6", "Option 7", "Option 8", "Option 9", "Option 10"];
  }

  _dispatchMyEvent(){
    this._changeMessage();
    let evt: SearchEvent = {
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: this.findText,
      condition: this.condition,
      operation: this.operation,
      context: ''
    };
    
    let searchChangeEvent = new CustomEvent('search-lookup-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _changeCondition(event: Event){
    const clickedEl = event.target as HTMLElement;
    this.conditionKey = Number(clickedEl.id)
    this.condition = this.conditions[this.conditionKey].condition;
    this._toggleDropDown();
    
    if(this.operation === Operation.Change)
      this._dispatchMyEvent();
  }

  _changeMessage(){
    this.findText = (this.selectedData.length > 0 ? this.selectedData[0] : "");    
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
    if(!(this.dropDownContainer?.contains(currEl)) && this.isDropDownOpen){
      this._toggleDropDown();
    } 
    if(!(this.lookupWrapper?.contains(currEl)) && this.lookupWrapper?.classList.contains('active')){
      this._toggleLookup();
    } 
  }
  
  _globalClickAway(event: Event){
    let currEl = event.target as LookupSearch;
    if(!(currEl.uniqueRef === this.uniqueRef)){
      if(this.isDropDownOpen){
        this._toggleDropDown();
      }
      if(this.lookupWrapper?.classList.contains('active')){
        this._toggleLookup();
      }
    }
  } 

  _toggleDropDown(){
    this.isDropDownOpen = !this.isDropDownOpen;
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
    this.isLookupValue = (currEl.value ? true : false);
    this.filterData = this.lookupData.filter(data => {
      return data.toLowerCase().startsWith(currEl.value.toLowerCase());
    }); 
    !this.isLookupValue ? this.filterData = [] : '';
  }

  override render(){
    return html `
      <div id="mainContent" ${ref(this.uniqueRef)} @click=${this._localClickAway} class="main-container">

        <!-- Drop down (conditions) -->
        <div class="dropdown-wrapper">
          <div @click=${this._toggleDropDown} class="dropdown-btn" id="condition-btn">
            <span id="selected-item" class="special-character">${unsafeHTML(this.conditions[this.conditionKey].icon)}</span>
            <span><i class="arrow-white down"></i></span>
          </div>

          <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
            ${this.conditions?.map((condition, key) => {
              return html `<div @click=${this._changeCondition} class="condition" id=${key}><span class="special-character">${unsafeHTML(condition.icon)}</span>${condition.name}</div>`
            })}
          </div>
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
              <input id="lookupSearch" @input=${this._filterLookup} type="text" placeholder="Search">
            </div>
            <ul class="lookup-options">
              ${!this.isLookupValue ? html `<li class="lookup-info-message"> &#x1F6C8; Please enter 1 or more characters</li>`: ''}
              ${this.filterData.map((data, key) => {
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
