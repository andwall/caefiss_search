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

  @property()
  lookupType: string = ''; // Responsible for determing if lookup is option set or lookup data; may remove later

  @property()
  alias: string = '';
  
  @property()
  isMultiSelect: boolean = false;
  
  private context: string = '';
  private operation: Operation = Operation.Delete;
  private findText: string = '';
  private condition: Condition = Condition.Equal;
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private selectedIndex: number = 0; 
  private uniqueRef: Ref<HTMLDivElement> = createRef(); //uniquely identifies "this" element
  private isFirstVisit: boolean = true;
  private statusMessage: string = "Please wait, getting data :)";

  /* Holds data for lookup */
  private lookupData: string[] = [];
  private selectedData: string[] = [];
  @state() private filterData: string[] = [];

  /* Used for styling purposes */
  @property({attribute: false}) private isSearchValue: boolean = false;
  @query('.lookup-wrapper') private lookupWrapper?: HTMLElement;
  @query('#lookup-options-container') private lookupOptionsContainer?: HTMLElement;
  @query('.select-btn') private selectBtn?: HTMLElement;

  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
    { id: "notEquals", name: "not equals", icon: "&ne;", condition: Condition.NotEqual },
    { id: "contains", name: "contains", icon: "&ni;", condition: Condition.Contains},
    { id: "notIn", name: "not in", icon: "&notni;", condition: Condition.NotIn},
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null },
    { id: "notNull", name: "not null", icon: "!&empty;", condition: Condition.NotNull }
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
      width: 3.4em;
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
      min-height: 37px;
      width: 100%;
      height: auto;
      // padding: 6px 12px;
      padding: 2px 4px;
      border-radius: 6px; 
      border: solid 1px lightgray;
      background: #fff;
      justify-content: space-between;
      margin-top: 2px;
    }

    .select-btn:focus{
      border: 2px solid #66afe9 !important;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }    
    
    .select-btn[aria-expanded="true"]{
      border: 1px solid #66afe9;
    }
    
    /* Lookup content */
    .lookup-wrapper{
      position: relative;
      width: 100%;
    }
    
    // .lookup-wrapper.active .select-btn{
    //   border: 1px solid #66afe9;
    //   box-shadow: 0 0px 8px rgba(102, 175, 233, .45)
    // }
    
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
      // padding: 6px 12px;
      padding: 2px 6px;
      border-radius: 6px; 
      align-items: center;
      justify-content: space-between;
    }

    .tag-x-button{
      width: min-content;
      height: auto;
      text-align: center;
      cursor: pointer;
      border: none; 
    }
    
    .tag-x-button:hover{
      background-color: transparent;
    }

    .tag-x{
      font-size: 18px;
      font-weight: 700;
    }

    .tag-x-button:hover .tag-x{
      color: red;
      font-weight: 700;
    }
   
    .tag-x-button:focus{
      /* border: 2px solid red; */
      outline: none;
    }
    
    .tag-x-button:focus .tag-x{
      color: red;
      font-weight: 700;
    }

    /* Arrow Styling */
    .arrow-container{
      padding: 0 10px;
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

  /*
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and focus away event globally - closes lookup dropdown
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('mousedown', e => this._globalAway(e));
    window.addEventListener('focusin', e => this._globalAway(e));
  }
  
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('mousedown', this._globalAway);
    window.removeEventListener('focusin', this._globalAway);
  }
  
  /* Responsible for various accessibility features and getting/setting data */ 
  override firstUpdated(): void {
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: false } as EntityInfo;

    /* Responsible for opening drop down when entering "enter" */
    this.selectBtn?.addEventListener('keydown', (e) => {
      if(e.key === "Enter" || e.code === "Space"){
        e.preventDefault();
        e.stopPropagation();
        this._toggleLookup();
      }
      if(e.key === "Escape"){
        e.stopPropagation();
        if(this._isActive()) this._toggleLookup();
      }
    });
   
    /* Responsible for handling keyboard events on lookup dropdown */
    this.lookupOptionsContainer?.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowUp' && this.selectedIndex > 0){
        e.preventDefault();
        this._focusOptionAtIndex(--this.selectedIndex);
      }else if(e.key === 'ArrowDown' && this.selectedIndex < this.filterData.length - 1){
        e.preventDefault();
        this._focusOptionAtIndex(++this.selectedIndex);
      }else if(e.key === 'Escape' && this._isActive()){ 
        e.stopPropagation();
        this._toggleLookup();
      }
    });
  }

   /* Responsible for fetching lookup data */
  _getData(): void {
    let tempSet: Set<string> = new Set<string>();
    let util = new CAEFISS();
    let data = util.getLookup(this.entityName, this.fieldName);
    data.forEach((d) => {
      if(d) tempSet.add(d);
    });
    this.lookupData = [...tempSet];
    this.requestUpdate();
  }

  _dispatchMyEvent(): void {
    this._setFindText();
    this._setOperation();
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

  _setCondition(event: Event): void {
    let selectedIndex = Number((event.target as HTMLSelectElement).selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change || this.condition === Condition.NotIn || this.condition === Condition.NotNull) 
      this._dispatchMyEvent();
  }

  _setFindText(): void {
    this.findText = this.selectedData.toString();
  }

  _setOperation(): void{
    this.operation = this.findText || this.condition === Condition.NotIn || this.condition === Condition.NotNull ? Operation.Change : Operation.Delete; 
  }
  
  /* Responsible for adding selected data to selectedData array; supports multi select */
  _addSelectedData(event: Event, isMultiSelect: boolean): void {
    event.stopPropagation();
    let currValue = (event.target as HTMLElement).innerText; 
    
    if(!this.selectedData.includes(currValue)){
      if(!isMultiSelect) this.selectedData = [];
      this.selectedData.push(currValue);
      this._dispatchMyEvent();
    }
    this.requestUpdate();
    this._toggleLookup();
    this.selectBtn?.focus();
  }  
  
  /* Responsible for adding selected data on "Enter" */
  _addSelectedDataOnKey(event: Event, isMultiSelect: boolean): void {
    if(!((event as KeyboardEvent).key === "Enter")) return;
    this._addSelectedData(event, isMultiSelect);  
  }
  
  _removeTag(event: Event, index: number): void {
    event.stopPropagation(); //stop select btn from receiving event
    this.selectedData.splice(index, 1);
    this._dispatchMyEvent();
    this.requestUpdate();
    this.selectBtn?.focus();
  }  
 
  /* Responsible for removing a tag when "Enter" is pressed */
  _removeTagOnKey(event: Event, index: number): void {
    if(!((event as KeyboardEvent).key === "Enter")) return;
    this._removeTag(event, index); 
  }

  /* Responsible for local click away on "this" component */
  _localAway(event: Event): void {
    let currEl = event.target as HTMLElement;
    if(!(this.lookupWrapper?.contains(currEl)) && this._isActive())
      this._toggleLookup();
  }
 
  /* Responsible for toggling lookup based on click away (outside component) */
  _globalAway(event: Event): void {
    let currEl = event.target as LookupSearch;
    if(!(currEl.uniqueRef === this.uniqueRef)){
      if(this._isActive()) this._toggleLookup();
    }
  } 

  _toggleLookup(): void {
    this.lookupWrapper?.classList.toggle('active');
    this.selectBtn?.setAttribute('aria-expanded', this._isActive() ? 'true' : 'false');
    if(this.isFirstVisit){
      setTimeout(() => {
        this._getData();
        this.isFirstVisit = false;
      }, 100);
    } 
  }
  
  _filterLookup(event: Event): void {
    let currEl = event.target as HTMLInputElement;
    this.isSearchValue = currEl.value ? true : false;
    this.filterData = this.lookupData.filter(data => {
      return data.toLowerCase().startsWith(currEl.value.toLowerCase());
    }); 
    !this.isSearchValue ? this.filterData = [] : '';
  }

  /* Resposible for focusing the option in the lookup drop down on arrow up/down */
  _focusOptionAtIndex(index: number): void {
    const options = this.shadowRoot?.querySelectorAll('.lookup-option');
    if(options && index >= 0 && index < options.length)
      (options[index] as HTMLElement).focus();
  }

  _isActive(): boolean{
    return this.lookupWrapper?.classList.contains('active') || false;
  }

  /* Generates selected lookup tags */
  _generateTag(tagName: string, key: number): TemplateResult {
    return html `
      <div class="tag-content">
        <p class="tag-name">${tagName}</p>
        <button @keydown=${(e: Event) => this._removeTagOnKey(e, key)} @click=${(e: Event) => this._removeTag(e, key)} class="tag-x-button" id="${key}" aria-label="${tagName} remove">
          <span class="tag-x" aria-hidden="true">&times;</span>
        </button>
      </div>
    `; 
  }

  override render(){
    return html `
      <div id="mainContent" ${ref(this.uniqueRef)} @click=${this._localAway} id="main-container">
        <div class="display-name-container">
          <h4 id="display-name">${this.displayName}</h4>
        </div>
        <!-- Drop down (conditions) -->
        <div class="condition-wrapper">
          <label for="condition-btn" class="visually-hidden" id="condition-label">Condition</label> 
          <select @change=${this._setCondition} id="condition-btn" aria-labelledby="display-name condition-label">
            <!-- Populate conditions -->
            ${this.conditions?.map((condition, key) => {
              return html `
                <option 
                  ${key === 0 ? 'selected': ''} 
                  tabindex="0" 
                  class="condition-option" 
                  value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;
                </option>
              `;
            })}
          </select> 
        </div>
       
        <!-- Drop down (lookup) -->
        <div class="lookup-wrapper">
          <div 
            @click=${this._toggleLookup} 
            tabindex="0" 
            role="combobox" 
            class="select-btn"
            aria-haspopup="listbox" 
            aria-expanded="${this._isActive()}" 
            aria-label="${this.displayName} lookup dropdown"
          >
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
              ${this.lookupData.length <= 0 ? html `<li class="lookup-info-message"> &#x1F6C8;&nbsp;${this.statusMessage}` : ''}
              ${this.lookupData.length > 0 && !this.isSearchValue ? html `<li class="lookup-info-message"> &#x1F6C8; Please enter 1 or more characters</li>`: ''}
              ${this.filterData.map((data, index) => {
                return html`
                  <li id="${index}" 
                    role="option" 
                    aria-selected="${this.selectedData.includes(data)}"  
                    tabindex="${index === this.selectedIndex ? 0 : -1}"
                    class="lookup-option" 
                    @keydown=${(e: Event) => this._addSelectedDataOnKey(e, this.isMultiSelect)}
                    @click=${(e: Event) => this._addSelectedData(e, this.isMultiSelect)}>${data}
                  </li>
                `;
              })}
              ${this.filterData.length === 0 && this.isSearchValue ? html `<li class="lookup-info-message"> &#x1F6C8; Sorry no results</li>` : ''}
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
