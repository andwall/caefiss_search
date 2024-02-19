import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, EntityInfo, Operation, SearchEvent, SearchTypes } from "./SearchTypes";

/**
 * Class: DateSearch
 * Purpose: 
 *  DateSearch is a lit element that allows users to enter two dates.
 *  Emits a custom event called 'search-date-event' with necessary data as per specified SearchEvent in SearchTypes.ts
 */
@customElement('search-date')
export class DateSearch extends LitElement{
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

  @property()
  alias: string = '';

  @property()
  include: boolean = false;

  @state()
  private context: string = '';

  @state()
  private operation: Operation = Operation.Delete;

  @state()
  private findText: string = '';

  @state()
  private condition: Condition = Condition.Equal;

  @state()
  private date1?: Date;
  
  @state()
  private date2?: Date;  
  
  @state()
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;

  @query('#include-checkbox')
  private includeCheckbox?: HTMLInputElement;

  /* For styling */ 
  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "on", name: "on", icon: "&#9737;", condition: Condition.On },
    { id: "between", name: "between", icon: "&harr;", condition: Condition.Between },
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }, 
    { id: "notNull", name: "not null", icon: "!&empty;", condition: Condition.NotNull }
  ];

  static override styles = css`
    *{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: inherit;
    } 

    #main-container{
      width: 100%;
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

    /* Display name styling */
    .display-name-container{
      display: flex;
      gap: 5px;
      align-items: center;
    }

    #display-name{
      font-weight: bold;
    }

    .date-format{
      font-weight: normal;
      font-style: italic;
    }

    .checkbox-container{
      padding-top: 0.5em;
    }

    /* Custom checkbox styling */
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
      left: 0; top: 0;
      width: 0.65em; height: 0.65em;
      border: 3px solid #1e1e1e;
      background: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
    }

    [type="checkbox"]:checked + label:before{
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
    [type="checkbox"]:not(:checked) + label::after,
    [type="checkbox"]:checked + label::after {
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
    
    /* hover style just for information */
    label:hover:before {
      // border: 3px solid #0535d2!important;
      border: 3px solid #66afe9 !important;
    }
    
    /* Input Styling */
    .input-container{
      display: flex;
      gap: 2px;
    }

    .date-search-wrapper{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      // gap: 5px;
      width: 100%;
    }

    .dash{
      width: 2%;
      text-align: center;
    }
    
    input[type=date]{
      width: 49%;
      height: min-content;
      padding: 6px;
      -webkit-transition: 0.15s;
      transition: 0.15s;
      border-radius: 6px;
      border: solid 1px lightgray;
      outline: none;
      box-shadow: 0 5px 15px rgba(0,0,0,0,0); 
    }

    input[type=date]:focus {
      border: 1px solid #66afe9;
      box-shadow: 0 0px 8px rgba(102,175,233,.45);
      outline: none;
    }
    
    /* Dropdown styling */
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
  `; 

  protected override firstUpdated(): void {
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: this.include } as EntityInfo;
    this.includeCheckbox!.checked = this.checked.include;
    if(this.checked.include) this._dispatchMyEvent();
  }
  
  _changeDate(event: Event): void{
    const target = event.target as HTMLInputElement;
    let date = target.value as unknown as Date; 
    target.id === "date1" ? this.date1 = date : this.date2 = date;
    this.operation = this.date1 || this.date2 ? Operation.Change : Operation.Delete; //check if the value is empty
    this._dispatchMyEvent();
  }

  _changeCondition(event: Event): void{
    const clickedEl = event.target as HTMLSelectElement;
    let selectedIndex = Number(clickedEl.selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change)
      this._dispatchMyEvent();
  }

  _generateFindText(): string{
    let findText = "";
    if(this.date1 && !this.date2){
      findText = this.date1.toString();
    }else if(!this.date1 && this.date2){
      findText = this.date2.toString();
    }else if(this.date1 && this.date2){
      findText = this.date1 + " " + this.date2;
    }
    return findText;
  }

  _dispatchMyEvent(): void{
    let findText = this._generateFindText();

    let evt: SearchEvent = {
      type: SearchTypes.Date,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: '',
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: findText,
      condition: this.condition,
      operation: this.operation,
      context: this.context,
      option1: "",
      option2: "",
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-date-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }
  
  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }

  _processDisplayName(): string{
    if(this.displayName.indexOf('(YYYY') > -1){
      return `${this.displayName.slice(0, this.displayName.indexOf('(YYYY'))} <span class="date-format" aria-hidden="true">${this.displayName.slice(this.displayName.indexOf('(YYYY'))}</span>`;
    }else{
      return this.displayName;
    }
  }

  override render(){
    return html`
      <div id="main-container">
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input @click=${this._setChecked} type="checkbox" id="include-checkbox" aria-labelledby="display-name checkbox-label"/>
            <label for="include-checkbox" id="checkbox-label"><span class="visually-hidden">Include in output</span></label>
          </div>
            <h4 id="display-name">${unsafeHTML(this._processDisplayName())}</h4>
        </div>
      
        <!-- Conditions & Input Container -->
        <div class="input-container">
          <div class="condition-wrapper">
            <label for="condition-btn" class="visually-hidden" id="condition-label">Condition</label> 
            <select @change=${this._changeCondition} id="condition-btn" aria-labelledby="display-name condition-label">
              <!-- Populate conditions -->
              ${this.conditions?.map((condition, key) => {
                return html `<option ${key === 0 ? 'selected': ''} tabindex="0" class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
              })}
            </select> 
          </div>

          <!-- Date Search --> 
          <div class="date-search-wrapper">
              <input @change=${ this._changeDate } type="date" class="input" id="date1" aria-labelledby="display-name"></input>
              <span class="dash">-</span>
              <input @change=${ this._changeDate } type="date" class="input" id="date2" aria-labelledby="display-name"></input>
          </div>
        </div>
      </div>
    `;
  }
}
