import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, EntityInfo, Operation, OptionSet, SearchEvent, SearchTypes } from "./SearchTypes";
import { CAEFISS } from "./utilities";

/*
 * Class: OptionSearch
 * Purpose: 
 *  OptionSearch is a lit element that allows user to search and select available options. Supports multi select.
*/
@customElement('search-option')
export class OptionSearch extends LitElement {

  private static nextId = 0;
  private optionsWrapperId = '';

  @property() 
  groupId: string = '-1';

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
  alias: string = '';
  
  @property()
  isMultiSelect: boolean = true;

  @property()
  include: string | boolean = false; 

  @property()
  includeLock: string | boolean = false;
  
  @property()
  hideDisplayName: boolean | string = false;

  @property()
  hideIncludeCheckbox: boolean | string = false;
  
  @property()
  wrapped: boolean | string = false;
  
  private context: string = '';
  private operation: Operation = Operation.Delete;
  private condition: Condition = Condition.NotIn;
  private checked: EntityInfo = { name: '', from: '', alias: '', include: false } as EntityInfo;
  private selectedIndex: number = 0; 
  private optionData: OptionSet[] = [];
  private selectedData: OptionSet[] = [];
  private isFirstVisit: boolean = true;
  @state() private statusMessage: string = "Please wait, getting data :)";

  /* Used for styling purposes */
  @query('.options-wrapper') private optionsWrapper?: HTMLElement;
  @query('#options-list-container') private optionsContainer?: HTMLElement;
  @query('.select-btn') private selectBtn?: HTMLElement;
  @query('#include-checkbox') private includeCheckbox?: HTMLInputElement;
  @query('#status-message') private statusMessageEl?: HTMLLIElement;
  @query('.checkbox-container') private includeCheckboxContainer?: HTMLInputElement;
  @query('#display-name') private displayNameEl?: HTMLElement;
  @query('.input-container') private inputContainer?: HTMLElement;

  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "in", name: "in", icon: "&ni;", condition: Condition.In},
    { id: "notIn", name: "not in", icon: "&notni;", condition: Condition.NotIn },
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

    .main-container{
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
    
    .display-name-container{
      display: flex;
      gap: 5px;
      align-items: center;
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

    /* main input container */
   .input-container{
      display: flex;
      gap: 2px;
      align-items: center;
    }    
    
    .input-container-wrapped{
      flex-direction: column;
      align-items: start;
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
    .select-btn, .options-list .options-list-item{
      display: flex;
      cursor: pointer;
      align-items: center;
    }

    .select-btn{
      min-width: 100px;
      min-height: 37px;
      width: 100%;
      height: auto;
      padding: 2px 4px;
      border-radius: 6px; 
      border: solid 1px lightgray;
      background: #fff;
      justify-content: space-between;
    }

    .select-btn:focus{
      border: 2px solid #66afe9 !important;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }

    .select-btn[aria-expanded="true"]{
      border: 1px solid #66afe9;
    }
    
    /* Options content */
    .options-wrapper{
      position: relative;
      width: 100%;
    }
    
    .options-wrapper.active .options-content{
      display: block;
      border: 1px solid #66afe9;
    }

    .options-content{
      position: absolute;
      width: 100%;
      margin-top: 5px;
      display: none;
      padding: 10px 5px 5px 5px;
      border-radius: 6px;
      background-color: #fff;
      z-index: 99;
    }

    .options-content:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }

    /* Options list Options */
    .options-content .options-list{
      margin: 5px 0 0 0;
      max-height: 200px;
      overflow-y: auto;
      border-radius: 5px;
    }

    .options-list:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }

    .options-list-info-message{
      background-color: #d7faff;
      cursor: auto;
    }    
    
    .error-background-color{
      background-color: #ffd7d7;
    }

    .options-list .options-list-item{
      border-radius: 5px;
      padding: 5px;
      font-size: 16px;
    }

    .options-list .options-list-item:hover{
      background-color: #3875d7;
      color: white;
    }    
    
    .options-list .options-list-item:focus{
      border: 2px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }
    
    /* Scroll bar */
    .options-list::-webkit-scrollbar, .tag-container::-webkit-scrollbar{
      width: 7px; 
      height: 7px;
    }

    .options-list::-webkit-scrollbar-track, .tag-container::-webkit-scrollbar-track{
      background-color: #f1f1f1;
      border-radius: 25px;
    }

    .options-list::-webkit-scrollbar-thumb, .tag-container::-webkit-scrollbar-thumb{
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

  constructor(){
    super();
    this.optionsWrapperId = `optionsWrapper${OptionSearch.nextId++}`;
  }

  /*
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (document) to handle click away event and focus away event globally - closes options dropdown
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('click', (e) => this._handleGlobalClick(e));
    this.include= String(this.include).toLowerCase() === 'true'; //need to parse the truth value before dispatching event
    this.checked = { 
      name: this.entityName, 
      linkname: '', 
      from: this.from, 
      alias: this.alias, 
      include: this.include, 
      parent: null, 
      to: this.to, 
      children: [], 
      filters: new Map<string, SearchEvent>(), 
      attrs: []
    };
    this.condition = this.conditions[0].condition;
    
    this.includeLock = String(this.includeLock).toLowerCase() === 'true';
    if(this.includeLock){
      this.include = true;
      this.checked.include = true;
    }else{ // no include lock so set the include checkbox state
      if(this.includeCheckbox)
        this.includeCheckbox.checked = this.checked.include;
    }
  }
  
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('click', (e) => this._handleGlobalClick(e));
  }
  
  /* Responsible for various accessibility features and getting/setting data */ 
  protected override firstUpdated(): void {
    this.includeCheckbox!.checked = this.checked.include;
    if(this.checked.include) this._dispatchMyEvent();
       
    this.addEventListener('focusout', () => this._closeOptions());
    this.selectBtn?.addEventListener('focusout', (e) => {
      if(!this.optionsWrapper?.contains(e.relatedTarget as Node)) this._closeOptions();
    });

    this.selectBtn?.addEventListener('keydown', (e) => this._handleKeyOnSelectBtn(e));
    this.optionsContainer?.addEventListener('keydown', (e) => this._handleKeyOnOptions(e));    
    
    /* Check for hiding elements */
    if(this.hideDisplayName === 'true' || this.hideDisplayName === true){
      this.displayNameEl?.classList.add('visually-hidden');
    }
    
    if(this.hideIncludeCheckbox === 'true' || this.hideIncludeCheckbox === true){
      this.includeCheckboxContainer?.classList.add('visually-hidden');
    }    
    
    if(this.wrapped === 'true' || this.wrapped === true){
      this.inputContainer?.classList.add('input-container-wrapped');
    }

  }

   _handleGlobalClick(e: Event): void{
    if(!this.optionsWrapper?.contains(e.composedPath()[0] as HTMLElement)) this._closeOptions();
  }

  _handleKeyOnSelectBtn(e: KeyboardEvent): void{
    if(e.key === "Enter" || e.code === "Space"){
      e.preventDefault();
      e.stopPropagation();
      this._toggleOptions();
    }
    if(e.key === "Escape"){
      e.stopPropagation();
      if(this._isActive()) this._toggleOptions();
    }
  }

  _handleKeyOnOptions(e: KeyboardEvent): void{
    if(e.key === 'ArrowUp' && this.selectedIndex > 0){
      e.preventDefault();
      this._focusOptionAtIndex(--this.selectedIndex);
    }else if(e.key === 'ArrowDown' && this.selectedIndex < this.optionData.length - 1){
      e.preventDefault();
      this._focusOptionAtIndex(++this.selectedIndex);
    }else if(e.key === 'Escape' && this._isActive()){ 
      e.stopPropagation();
      this._toggleOptions();
      this.selectBtn?.focus();
    }
  }

  /* Responsible for fetching Option's data */
   _getData(): void {
    try {
      let util = new CAEFISS();
      let data = util.getOptionSet(this.entityName, this.fieldName);
      data.forEach((d) => {
        if(!this.optionData.some(obj => obj.key === d.key)) this.optionData.push(d); //avoid duplicates 
      });
      this.statusMessageEl?.classList.remove('error-background-color');
      this.requestUpdate();
    } catch (err) {
      console.log(err);
      this.statusMessageEl?.classList.add('error-background-color'); 
      this.statusMessage = "Error: could not get data"; 
    }
  }

  _dispatchMyEvent(): void {
    this._setOperation();
    let evt: SearchEvent = {
      groupId: this.groupId,
      type: SearchTypes.Option,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: this.parentEntityId,
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: JSON.stringify(this.selectedData),
      condition: this.condition,
      operation: this.operation,
      context: '',
      option1: '',
      option2: '',
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-option-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _setCondition(event: Event): void {
    let selectedIndex = Number((event.target as HTMLSelectElement).selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change || this.condition === Condition.Null || this.condition === Condition.NotNull) this._dispatchMyEvent();
  }

  _setOperation(): void{
    this.operation = this.selectedData.length > 0 || this.condition === Condition.Null || this.condition === Condition.NotNull ? Operation.Change : Operation.Delete; 
  }
  
  /* Responsible for adding selected data to an array that will be passed in the custom event; Support multi selects*/
  _addSelectedData(event: Event, isMultiSelect: boolean): void {
    event.stopPropagation(); //stop select btn from receiving event
    let currId: number = Number((event.target as HTMLElement).id);
    
    if(!this.selectedData.includes(this.optionData[currId])){
      if(!isMultiSelect) this.selectedData = [];
      this.selectedData.push(this.optionData[currId]);
      this._dispatchMyEvent();
    }    
    this.requestUpdate();
    this._toggleOptions();
    this.selectBtn?.focus();
  }  
  
  /* Responsible for adding selected data on "Enter" */
  _addSelectedDataOnKey(event: Event, isMultiSelect: boolean): void {
    if(!((event as KeyboardEvent).key === "Enter")) return;
    this._addSelectedData(event, isMultiSelect);  
  }
 
  /* Resposible for removing tag */
  _removeTag(event: Event, index: number): void {
    event.stopPropagation(); 
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

  _toggleOptions(): void {
    this.optionsWrapper?.classList.toggle('active');
    this.selectBtn?.setAttribute('aria-expanded', this._isActive() ? 'true' : 'false');
    if(this.isFirstVisit){ // lazy loading
      setTimeout(() => {
        this._getData();
        this.isFirstVisit = false;
      }, 50);
    }
  }

  _closeOptions(): void{
    this.optionsWrapper?.classList.remove('active');
    this.selectBtn?.setAttribute('aria-expanded', this._isActive() ? 'true' : 'false');
  }
  
  /* Resposible for focusing the option in the option drop down on arrow up/down */
  _focusOptionAtIndex(index: number): void {
    const options = this.shadowRoot?.querySelectorAll('.options-list-item');
    if(options && index >= 0 && index < options.length){
      (options[index] as HTMLElement).focus();
      (options[index] as HTMLElement).tabIndex = 0;
      
      /* update previous or next elements tab index */
      if(index - 1 >= 0)
        (options[index - 1] as HTMLElement).tabIndex = -1;
      if(index + 1 < options.length)
        (options[index + 1] as HTMLElement).tabIndex = -1;
    }
  }

  _isActive(): boolean{
   return this.optionsWrapper?.classList.contains('active') || false;
  }

  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }

  /* Generates selected Options tags */
  _generateTag(tagName: string, index: number): TemplateResult {
    return html `
      <div class="tag-content">
        <p class="tag-name">${tagName}</p>
        <button @keydown=${(e: Event) => this._removeTagOnKey(e, index)} @click=${(e: Event) => this._removeTag(e, index)} class="tag-x-button" id="${index}" aria-label="${tagName} remove">
          <span class="tag-x" aria-hidden="true">&times;</span>
        </div>
      </div>
    `; 
  }

  override render(){
    return html `
      <div class="main-container">
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          ${ !this.includeLock ? html ` <!-- Only show if there's no include lock -->
            <div class="checkbox-container">
              <input 
                @click=${this._setChecked} 
                type="checkbox" 
                id="include-checkbox" 
                aria-labelledby="display-name checkbox-label"/>
              <label for="include-checkbox" id="checkbox-label"><span class="visually-hidden">Include in output</span></label>
            </div>` : ''
          }
          <h4 id="display-name">${this.displayName}</h4>
        </div>
        
        <div class="input-container">
          <!-- Drop down (conditions) -->
          <div class="condition-wrapper">
            <label for="condition-btn" class="visually-hidden" id="condition-label">Condition</label> 
            <select @change=${this._setCondition} id="condition-btn" aria-labelledby="display-name condition-label">
              <!-- Populate conditions -->
              ${this.conditions?.map((condition, key) => {
                return html `<option ${key === 0 ? 'selected': ''} class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
              })}
            </select> 
          </div>

          <!-- Drop down (Options) -->
          <div id="${this.optionsWrapperId}" class="options-wrapper">
            <div 
              @click=${this._toggleOptions} 
              tabindex="0" 
              role="combobox" 
              class="select-btn" 
              aria-haspopup="listbox" 
              aria-expanded="${this._isActive()}" 
              aria-label="${this.displayName} options dropdown"
            >
              <span class="tag-container">${this.selectedData.map((data, index) => { 
                return this._generateTag(data.key, index); 
              })}</span>
              <span class="arrow-container"><i id="arrow" class="arrow-black down"></i></span>
            </div>
  
            <div class="options-content">
              <ul role="listbox" tabindex="-1" class="options-list" id="options-list-container">
                ${this.optionData.length <= 0 ? html `<li id="status-message" class="options-list-info-message">&#x1F6c8;&nbsp;${this.statusMessage}` : ''}
                ${this.optionData.map((data, index) => {
                  return html`
                    <li id="${index}" 
                      role="option" 
                      aria-selected="${this.selectedData.includes(data)}" 
                      tabindex="${index === this.selectedIndex ? 0 : -1}"
                      class="options-list-item" 
                      @keydown=${(e: Event) => this._addSelectedDataOnKey(e, this.isMultiSelect)}
                      @click=${(e: Event) => this._addSelectedData(e, this.isMultiSelect)}>${data.key}
                    </li>
                  `;
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
