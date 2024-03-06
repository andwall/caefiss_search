import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, EntityInfo, Operation, OptionSet, SearchEvent, SearchTypes } from "./SearchTypes";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { CAEFISS } from "./utilities";

/*
 * Class: OptionSearch
 * Purpose: 
 *  OptionSearch is a lit element that allows user to search and select available options. Supports multi select.
*/
@customElement('search-option')
export class OptionSearch extends LitElement {

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
  include: boolean = false;
  
  private context: string = '';
  private operation: Operation = Operation.Delete;
  private findText: string = '';
  private condition: Condition = Condition.NotIn;
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private selectedIndex: number = 0; 
  private uniqueRef: Ref<HTMLDivElement> = createRef(); // Responsible for uniquely identifying "this" element
  private optionData: OptionSet[] = [];
  private selectedData: OptionSet[] = [];
  private isFirstVisit: boolean = true;
  private statusMessage: string = "Please wait, getting data :)";

  /* Used for styling purposes */
  @query('.options-wrapper') private optionsWrapper?: HTMLElement;
  @query('#options-list-container') private optionsContainer?: HTMLElement;
  @query('.select-btn') private selectBtn?: HTMLElement;
  @query('#include-checkbox') private includeCheckbox?: HTMLInputElement;

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
      min-width: 135px;
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

  /*
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and focus away event globally - closes options dropdown
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
  protected override firstUpdated(): void {
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: this.include } as EntityInfo;
    this.condition = this.conditions[0].condition;

    /* If property of include checkbox is checked, dispatch event */
    this.includeCheckbox!.checked = this.checked.include;
    if(this.checked.include) this._dispatchMyEvent();

    /* Responsible for opening drop down when entering "enter" */
    this.selectBtn?.addEventListener('keydown', (e) => {
      if(e.key === "Enter" || e.code === "Space"){
        e.preventDefault();
        e.stopPropagation();
        this._toggleOptions();
      }
      if(e.key === "Escape"){
        e.stopPropagation();
        if(this._isActive()) this._toggleOptions();
      }
    });

    /* Responsible for handling keyboard events on Options dropdown */
    this.optionsContainer?.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowUp' && this.selectedIndex > 0){
        e.preventDefault();
        this._focusOptionAtIndex(--this.selectedIndex);
      }else if(e.key === 'ArrowDown' && this.selectedIndex < this.optionData.length - 1){
        e.preventDefault();
        this._focusOptionAtIndex(++this.selectedIndex);
      }else if(e.key === 'Escape' && this._isActive()){ 
        e.stopPropagation();
        this._toggleOptions();
      }
    });
  }

  /* Responsible for fetching Option's data */
  _getData(): void {
    let util = new CAEFISS();
    let data = util.getOptionSet(this.entityName, this.fieldName);
    data.forEach((d) => {
      if(!this.optionData.some(obj => obj.key === d.key)) this.optionData.push(d); //avoid duplicates 
    });
    this.requestUpdate();
  }

  _dispatchMyEvent(): void {
    this._setFindText();
    this._setOperation();
    let evt: SearchEvent = {
      type: SearchTypes.Option,
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
    if(this.operation === Operation.Change || this.condition === Condition.NotIn || this.condition === Condition.NotNull) this._dispatchMyEvent();
  }

  _setFindText(): void {
    this.findText = JSON.stringify(this.selectedData);
  }
  
  _setOperation(): void{
    this.operation = this.selectedData.length > 0 || this.condition === Condition.NotIn || this.condition === Condition.NotNull ? Operation.Change : Operation.Delete; 
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

  /* Responsible for checking if event is happening on "this" current element and toggling options dropdown*/
  _localAway(event: Event): void {
    let currEl = event.target as HTMLElement;
    if(!(this.optionsWrapper?.contains(currEl)) && this._isActive()) this._toggleOptions();
  }

  /* Responsible for toggling Options based on "tabbing" or "clicking" out of component */
  _globalAway(event: Event): void {
    let currEl = event.target as OptionSearch;
    if(!(currEl.uniqueRef === this.uniqueRef))
      if(this._isActive()) this._toggleOptions();
  }
  
  _toggleOptions(): void {
    this.optionsWrapper?.classList.toggle('active');
    this.selectBtn?.setAttribute('aria-expanded', this._isActive() ? 'true' : 'false');
    if(this.isFirstVisit){
      setTimeout(() => {
        this._getData();
        this.isFirstVisit = false;
      }, 100);
    }
  }
  
  /* Resposible for focusing the option in the option drop down on arrow up/down */
  _focusOptionAtIndex(index: number): void {
    const options = this.shadowRoot?.querySelectorAll('.options-list-item');
    if(options && index >= 0 && index < options.length) 
      (options[index] as HTMLElement).focus();
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
      <div ${ref(this.uniqueRef)} @click=${this._localAway} id="main-container">
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input 
              @click=${this._setChecked} 
              type="checkbox" 
              id="include-checkbox" 
              aria-labelledby="display-name include-checkbox-label"
            />
            <label for="include-checkbox" id="include-checkbox-label"><span class="visually-hidden">Include in output</span></label>
          </div>
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
          <div class="options-wrapper">
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
                ${this.optionData.length <= 0 ? html `<li class="options-list-info-message">&#x1F6c8;&nbsp;${this.statusMessage}` : ''}
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
