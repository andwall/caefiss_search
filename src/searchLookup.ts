import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
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
  parentEntityId: string = '';

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
  
  @property()
  isMultiSelect: boolean = false;
  
  @state()
  private context: string = '';

  @state()
  private operation: Operation = Operation.Delete;

  @state()
  private findText: string = '';

  @state()
  private condition: Condition = Condition.Equal;
  
  @state()
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;

  @state()
  private selectedIndex: number = 0; 
  
  /* Responsible for uniquely identifying "this" element */
  private uniqueRef: Ref<HTMLDivElement> = createRef();

  /* Holds data for lookup */
  private lookupData: string[] = [];
  @state() private selectedData: string[] = [];
  @state() private filterData: string[] = [];

  /* Used for styling purposes */
  @property({attribute: false}) private isSearchValue: boolean = false;
  @query('.lookup-wrapper') private lookupWrapper?: HTMLElement;
  @query('#lookup-options-container') private lookupOptionsContainer?: HTMLElement;
  @query('.select-btn') private selectBtn?: HTMLElement;
  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
    { id: "notEquals", name: "not equals", icon: "&ne;", condition: Condition.NotEqual },
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null },
    { id: "notNull", name: "not null", icon: "!&empty;", condition: Condition.NotNull },
    { id: "notIn", name: "not in", icon: "&notni;", condition: Condition.NotIn }
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
    
    #display-name{
      font-weight: bold;
    }

    .hidden{
      display: none;
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
    
    /* Select button - opening and closing drop down*/
    .select-btn-input:focus + .select-btn{
      border: 1px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102, 175, 233, .45);
    }

    .select-btn-input{
      position: absolute;
      z-index: 0;
      color: tranparent;
      background: transparent;
      border:none;
    }

    .select-btn, .lookup-options .lookup-option{
      display: flex;
      cursor: pointer;
      align-items: center;
    }

    .select-btn{
      min-width: 135px;
      width: 100%;
      padding: 6px 10px;
      border-radius: 6px; 
      border: solid 1px lightgray;
      background: #fff;
      justify-content: space-between;
      margin-top: 2px;
    }

    .select-btn:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
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
      border-radius: 5px;
    }

    .lookup-options:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
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
    
    .lookup-options .lookup-option:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
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
      width: min-content;
      height: auto;
      text-align: center;
      cursor: pointer;
    }

    .tag-x{
      font-size: 18px;
      font-weight: 700;
    }

    .tag-x-container:hover .tag-x{
      color: red;
      font-weight: 700;
    }
   
    .tag-x-container:focus{
      /* border: 2px solid red; */
      outline: none;
    }
    
    .tag-x-container:focus .tag-x{
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
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and focus away event - closes lookup dropdown
   * Note: only works if direct parent is the main HTML as it is listening on window & needs es6 arrow function
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('mousedown', e => this._globalClickAway(e));
    window.addEventListener('focusin', e => this._globalFocusAway(e));
  }
  
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('mousedown', this._globalClickAway);
    window.removeEventListener('focusin', this._globalFocusAway);
  }
  
  /* Responsible for various accessibility features and getting/setting data */ 
  override firstUpdated(): void {
    this._getData("lookupdata");
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: false } as EntityInfo;

    /* Responsible for opening drop down when entering "enter" */
    this.selectBtn?.addEventListener('keydown', (e) => {
      if(e.key === "Enter"){
        e.preventDefault();
        this._toggleLookup();
      }
      if(e.key === "Escape"){
        if(this._isActive()){
          this._toggleLookup();
        }
      }
    });

    /* Responsible for toggle lookup when out of focus */
    this.lookupOptionsContainer?.addEventListener('blur', (e) => {
      console.log(e.relatedTarget as HTMLElement)
      console.log(this.lookupOptionsContainer?.contains(e.relatedTarget as HTMLElement))
      if (!this.lookupOptionsContainer?.contains(e.relatedTarget as HTMLElement)) {
        if(this._isActive()){
          this._toggleLookup();
        }
      }
    }); 
   
    /* Responsible for handling keyboard events on lookup dropdown */
    this.lookupOptionsContainer?.addEventListener('keydown', (e: Event) => {
      let event = e as KeyboardEvent;
      if(event.key === 'ArrowUp' && this.selectedIndex > 0){
        e.preventDefault();
        this.selectedIndex = this.selectedIndex - 1;
        this._focusOptionAtIndex(this.selectedIndex);
      } else if(event.key === 'ArrowDown' && this.selectedIndex < this.filterData.length - 1){
        e.preventDefault();
        this.selectedIndex = this.selectedIndex + 1;
        this._focusOptionAtIndex(this.selectedIndex);
      } else if(event.key === 'Enter' || event.key === 'Spacebar'){ 
        e.preventDefault();
        this._addSelectedData(e, this.isMultiSelect);
        this.requestUpdate();
        this._toggleLookup();
      } else if(event.key === 'Escape' && this._isActive()){ 
        this._toggleLookup();
      }
    });
  }

   /* Responsible for fetching lookup data */
  _getData(lookupType: string): void {
    let tempSet: Set<string> = new Set<string>();
    let util = new CAEFISS();
    
    if(lookupType === "lookupdata"){ //need to update when option is available
      let data = util.getLookup(this.entityName, this.fieldName);
      data.forEach((d) => {
        if(d){
          tempSet.add(d);
        }
      });
    }
    this.lookupData = [...tempSet];
  }

  _dispatchMyEvent(): void {
    this._changeMessage();
    let evt: SearchEvent = {
      type: SearchTypes.Lookup,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: this.parentEntityId,
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

  _changeCondition(event: Event): void {
    const clickedEl = event.target as HTMLSelectElement;
    let selectedIndex = Number(clickedEl.selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change || this.condition === Condition.NotIn)
      this._dispatchMyEvent();
  }

  _changeMessage(): void {
    this.findText = this.selectedData.toString();
    this.operation = this.findText || this.condition === Condition.NotIn ? Operation.Change : Operation.Delete; //check if the value is empty
  }
  
  /* Responsible for adding selected data to an array that will be passed in the custom event; Support multi selects*/
  _addSelectedData(event: Event, isMultiSelect: boolean): void {
    let currEl = event.target as HTMLElement;
    let currValue = currEl.innerText; 
    
    if(!this.selectedData.includes(currValue)){
      if(!isMultiSelect){
        this.selectedData = [];
      }
      this.selectedData.push(currValue);
      this._dispatchMyEvent();
    }
    this.requestUpdate();
    this._toggleLookup();
  }
  
  _removeTag(index: number): void {
    // console.log("index passed to removeTag() " + index)
    this.selectedData.splice(index, 1);
    this._toggleLookup();
    this._dispatchMyEvent();
    this.requestUpdate();
  }  
 
  /* Responsible for removing a tag when "Enter" is pressed */
  _removeTagOnKey(e: Event, index: number): void {
    if(!((e as KeyboardEvent).key === "Enter")) return;
    this.selectedData.splice(index, 1);
    this._toggleLookup();
    this._dispatchMyEvent();
    this.requestUpdate();
  }

  /* Helper Functions */
  _localClickAway(event: Event): void {
    let currEl = event.target as HTMLElement;
    if(!(this.lookupWrapper?.contains(currEl)) && this._isActive()){
      this._toggleLookup();
    } 
  }
 
  /* Responsible for toggling lookup based on click away (outside component) */
  _globalClickAway(event: Event): void {
    let currEl = event.target as LookupSearch;
    if(!(currEl.uniqueRef === this.uniqueRef)){
      if(this._isActive()){
        this._toggleLookup();
      }
    }
  } 

  /* Responsible for toggling lookup based on "tabbing" out of component (focus) */
  _globalFocusAway(event: Event): void {
    let currEl = event.target as LookupSearch;
    if(!(currEl.uniqueRef === this.uniqueRef)){
      if(this._isActive()) this._toggleLookup();
    }
  }
  
  _toggleLookup(): void {
    this.lookupWrapper?.classList.toggle('active');
    this.selectBtn?.setAttribute('aria-expanded', this._isActive() ? 'true' : 'false');
  }
  
  /* Generates selected lookup tags */
  _generateTag(tagName: string, key: number): TemplateResult {
    return html `
      <div class="tag-content">
        <p class="tag-name">${tagName}</p>
        <div @keydown=${(e: Event) => this._removeTagOnKey(e, key)}  tabindex="0" role="button" @click=${this._removeTag.bind(this, key)} class="tag-x-container" id="${key}">
          <p aria-label="${tagName} remove" class="tag-x">&times;</p>
        </div>
      </div>
    `; 
  }

  _filterLookup(e: Event): void {
    let currEl = e.target as HTMLInputElement;
    this.isSearchValue = currEl.value ? true : false;
    this.filterData = this.lookupData.filter(data => {
      return data.toLowerCase().startsWith(currEl.value.toLowerCase());
    }); 
    !this.isSearchValue ? this.filterData = [] : '';
    this.requestUpdate();
  }

  /* Resposible for focusing the option in the lookup drop down on arrow up/down */
  _focusOptionAtIndex(index: number): void {
    const options = this.shadowRoot?.querySelectorAll('.lookup-option');
    if(options)
    if (index >= 0 && index < options.length) {
      (options[index] as HTMLElement).focus();
    }
  }

  _isActive(): boolean{
    return this.lookupWrapper?.classList.contains('active') || false;
  }

  override render(){
    return html `
      <div id="mainContent" ${ref(this.uniqueRef)} @click=${this._localClickAway} id="main-container">
        <div class="display-name-container">
          <h4 id="display-name">${this.displayName}</h4>
        </div>
        <!-- Drop down (conditions) -->
        <div class="condition-wrapper">
          <label for="condition-btn" class="visually-hidden" id="condition-label">Condition</label> 
          <select @change=${this._changeCondition} id="condition-btn" aria-labelledby="display-name condition-label">
            <!-- Populate conditions -->
            ${this.conditions?.map((condition, key) => {
              return html `<option ${key === 0 ? 'selected': ''} tabindex="0" class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
            })}
          </select> 
        </div>
       
        <!-- Drop down (lookup) -->
        <div class="lookup-wrapper">
          <!-- Used for accessibility (tab through) -->
          <!-- <input id="search-lookup-dropdown" type="button" class="select-btn-input"/> -->
          <div @click=${this._toggleLookup} tabindex="0" role="combobox" class="select-btn" aria-haspopup="listbox" aria-expanded="${this._isActive()}" aria-label="${this.displayName} lookup dropdown">
            <span class="tag-container">${this.selectedData.map((data, key) => { 
              return this._generateTag(data, key); 
            })}</span>
            <span class="arrow-container"><i id="arrow" class="arrow-black down"></i></span>
          </div>

          <div class="lookup-content">
            <div class="search">
              <i class="search-icon-container">
                <svg aria-hidden="true" class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39M11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7"/></svg>
              </i>
              <input id="lookupSearch" @input=${this._filterLookup} type="text" placeholder="Search" aria-labelledby="display-name"></input>
            </div>
            <ul role="listbox" tabindex="-1" class="lookup-options" id="lookup-options-container">
              ${!this.isSearchValue ? html `<li class="lookup-info-message"> &#x1F6C8; Please enter 1 or more characters</li>`: ''}
              ${this.filterData.map((data, index) => {
                return html`
                  <li id="${index}" 
                    role="option" 
                    aria-selected="${index === this.selectedIndex}" 
                    tabindex="${index === this.selectedIndex ? 0 : -1}"
                    class="lookup-option" 
                    @click=${(e: Event) => this._addSelectedData(e, this.isMultiSelect)}>${data}
                  </li>`;
              })}
              ${this.filterData.length === 0 && this.isSearchValue ? html `<li class="lookup-info-message"> &#x1F6C8; Sorry no results</li>` : ''}
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
