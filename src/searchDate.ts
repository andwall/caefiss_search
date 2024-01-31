import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
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

  @property({attribute: false})
  context: string = '';

  @property({attribute: false})
  operation: Operation = Operation.Delete;

  @property({attribute: false})
  findText: string = '';

  @property({attribute: false})
  condition: Condition = Condition.Equal;

  @property({attribute: false})
  private date1?: Date;
  
  @property({attribute: false})
  private date2?: Date;  
  
  @property({attribute: false})
  checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;

  /* For styling */ 
  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "on", name: "on", icon: "&#9737;", condition: Condition.On },
    { id: "between", name: "between", icon: "&harr;", condition: Condition.Between },
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }
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

    .display-name-container{
      display: flex;
      gap: 5px;
      align-items: center;
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
      align-items: center;
      gap: 5px;
      width: 100%;
    }
    
    input[type=date]{
      width: 100%;
      height: 100%; 
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
  `; 

  /** 
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) set all checked information given to this component 
  */
  override connectedCallback(): void {
    super.connectedCallback();
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: false } as EntityInfo;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }
  
  _changeDate(event: Event){
    const target = event.target as HTMLInputElement;
    let date = target.value as unknown as Date; 
    target.id === "date1" ? this.date1 = date : this.date2 = date;
    this.operation = this.date1 || this.date2 ? Operation.Change : Operation.Delete; //check if the value is empty
    this._dispatchMyEvent();
  }

  _changeCondition(event: Event){
    const clickedEl = event.target as HTMLSelectElement;
    let selectedIndex = Number(clickedEl.selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change)
      this._dispatchMyEvent();
  }

  _generateFindText(){
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

  _dispatchMyEvent(){
    let findText = this._generateFindText();

    let evt: SearchEvent = {
      type: SearchTypes.Date,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
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
  
  _setChecked(event: Event){
    let currEl = event.target as HTMLInputElement;
    let isChecked = currEl.checked; 
    this.checked.include = isChecked ? true : false;
    this._dispatchMyEvent();
  }

  override render(){
    return html`
      <div id="main-container">
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input @click=${this._setChecked} type="checkbox" id="checkbox" />
            <label for="checkbox"></label>
          </div>
            <h3>${ this.displayName }</h3>
        </div>
      
        <!-- Conditions & Input Container -->
        <div class="input-container">
          <div class="condition-wrapper">
            <label for="condition-btn" class="hidden">Condition</label> 
            <select @change=${this._changeCondition} id="condition-btn">
              <!-- Populate conditions -->
              ${this.conditions?.map((condition, key) => {
                return html `<option ${key === 0 ? 'selected': ''} tabindex="0" class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
              })}
            </select> 
          </div>

          <!-- Date Search --> 
          <div class="date-search-wrapper">
              <input @change=${ this._changeDate } type="date" class="input" id="date1"></input>
              <span class="dash">-</span>
              <input @change=${ this._changeDate } type="date" class="input" id="date2"></input>
          </div>
        </div>
      </div>
    `;
  }
}
