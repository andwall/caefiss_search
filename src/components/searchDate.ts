import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, Operation, SearchEvent } from "./SearchTypes";

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

  private COMPONENT_NAME = "SEARCH-DATE";

  /* For styling */ 
  @property({ type: Boolean }) private isDropDownOpen: boolean = false;
  @property({ type: Number })  private conditionKey: number = 0;
  @query('.dropdown-wrapper') private dropDownContainer?: HTMLElement;
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

  .container{
    display: flex;
    gap: 2px;
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
  [type="checkbox"]:not(:checked) + label:after,
  [type="checkbox"]:checked + label:after {
    content: '✔';
    // content: '✓';
    position: absolute;
    top: 0.1em; left: 0.215em;
    font-size: 0.9em;
    line-height: 0.8;
    color: green;
    transition: all .2s ease-in-out;
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
    border: 3px solid #0535d2;
  }

  /* hover style just for information */
  label:hover:before {
    border: 3px solid #0535d2!important;
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
  .dropdown-wrapper{
    position: relative;
    font-size: 12px;
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

  /* Arrow Styling */
  .arrow{
    border: solid white;
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
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) to handle click away event and close condition drop down
   * Note: only works if direct parent is the main HTML as it is listening on window & needs es6 arrow function
  */
  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('click', e => this._globalClickAway(e));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
     window.removeEventListener('click', this._globalClickAway);
  }
  
  _changeDate(event: Event){
    const target = event.target as HTMLInputElement;
    let date = target.value as unknown as Date; 
    target.id === "date1" ? this.date1 = date : this.date2 = date;
    this.operation = this.date1 || this.date2 ? Operation.Change : Operation.Delete; //check if the value is empty
    this._dispatchMyEvent();
  }

  _changeCondition(event: Event){
    const clickedEl = event.target as HTMLElement;
    this.conditionKey = Number(clickedEl.id)
    this.condition = this.conditions[this.conditionKey].condition;
    this._toggleDropDown();

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
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: findText,
      condition: this.condition,
      operation: this.operation,
      context: this.context
    };
    
    let searchChangeEvent = new CustomEvent('search-date-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _toggleDropDown(){
    this.isDropDownOpen = !this.isDropDownOpen;
  }   
  
  _handleClickAway(event: Event){
    let currEl = event.target as HTMLElement;
    if(!(this.dropDownContainer?.contains(currEl)) && this.isDropDownOpen){
      this._toggleDropDown();
    } 
  } 
  
  /* Used to handle click away event on this element (searchText) */
  _localClickAway(event: Event){
    let currEl = event.target as HTMLElement;
    if(!(this.dropDownContainer?.contains(currEl)) && this.isDropDownOpen){
      this._toggleDropDown();
    }  
  }

  /* Used to handle click away on window - used in connected callback*/
  _globalClickAway(event: Event){
    let currEl = event.target as HTMLElement;
    if(!(currEl.nodeName === this.COMPONENT_NAME) && this.isDropDownOpen){
      this._toggleDropDown();
    }
  }
    
  override render(){
    return html`
      <div id="main-content" @click= ${ this._localClickAway }>
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input type="checkbox" id="checkbox" />
            <label for="checkbox"></label>
          </div>
            <h3>${ this.displayName }</h3>
        </div>
      
        <div class="container">

          <!-- DropDown -->
          <div class="dropdown-wrapper">
            <div @click=${ this._toggleDropDown } class="dropdown-btn">
              <span id="selected-item" class="special-character">${ html `${unsafeHTML(this.conditions[this.conditionKey].icon)}` }</span>
              <span><i class="arrow down"></i></span>
            </div>

            <!-- Dropdown menu -->
            <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
              <!-- Generate all condition fields -->
              ${this.conditions?.map((condition, key) => {
                return html `<div @click=${ this._changeCondition } class="condition" id=${key}><span class="special-character">${unsafeHTML(condition.icon)}</span>${condition.name}</div>`
              })}
            </div>
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
