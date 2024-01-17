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
  operation: Operation = Operation.Change;

  @property({attribute: false})
  findText: string = '';

  @property({attribute: false})
  condition: Condition = Condition.Equal;

  @property({attribute: false})
  private date1?: Date;
  
  @property({attribute: false})
  private date2?: Date;

  /* For styling */ 
  @property({ type: Boolean }) private isDropDownOpen: boolean = false;
  @property({ type: Number })  private criteriaKey: number = 0;
  @query('.dropdown-wrapper') private dropDownContainer?: HTMLElement;
  private criterias: { id: string, name: string, icon: string, condition: Condition }[];

  constructor(){
    super();
    this.criterias = [
      { id: "on", name: "on", icon: "&#9737;", condition: Condition.On },
      { id: "between", name: "between", icon: "&harr;", condition: Condition.Between },
      { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }
    ]
  }

  static override styles = css`
  *{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: inherit;
  }

  body{
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container{
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
    z-index: 1;
  }

  .dropdown-menu.open{
    display: block;
  }

  .dropdown-menu .criteria{
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 5px;
  }

  .dropdown-menu .criteria:hover{
    background-color: #1967d2;
  }

  .special-character{
    padding-right: 5px;
  }

  .criteria, .special-character{
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
  
  _changeDate(event: Event){
    const target = event.target as HTMLInputElement;
    let date = target.value as unknown as Date; 
    target.id === "date1" ? this.date1 = date : this.date2 = date;
  
    this.operation = this.date1 || this.date2 ?  Operation.Change : Operation.Delete; //check if the value is empty
    this._dispatchMyEvent();
  }

  _changeCondition(event: Event){
    const clickedEl = event.target as HTMLElement;
    this.criteriaKey = Number(clickedEl.id)
    this.condition = this.criterias[this.criteriaKey].condition;
    this._toggleDropDown();
    this._dispatchMyEvent();
  }

  _dispatchMyEvent(){
    let findText = '';
    if(this.date1 && !this.date2){
      findText = this.date1.toString();
    }else if(!this.date1 && this.date2){
      findText = this.date2.toString();
    }else if(this.date1 && this.date2){
      findText = this.date1 + " " + this.date2;
    }
<<<<<<< Updated upstream
=======
    return findText;
  }

  _dispatchMyEvent(){
    let findText = this._generateFindText();
>>>>>>> Stashed changes

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
  
  override render(){
    return html`

      <div id="main-content" @click= ${ this._handleClickAway }>
      <h3>${this.displayName}</h3>
      <div class="container">

        <!-- DropDown -->
        <div class="dropdown-wrapper">
          <div @click=${ this._toggleDropDown } class="dropdown-btn">
            <span id="selected-item" class="special-character">${ html `${unsafeHTML(this.criterias[this.criteriaKey].icon)}` }</span>
            <span><i class="arrow down"></i></span>
          </div>

          <!-- Dropdown menu -->
          <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
            <!-- Generate all criteria fields -->
            ${this.criterias?.map((criteria, key) => {
              return html `<div key=${key} @click=${ this._changeCondition } class="criteria" id=${criteria.id}><span class="special-character">${unsafeHTML(criteria.icon)}</span>${criteria.name}</div>`
            })}
          </div>
        </div>

<<<<<<< Updated upstream
        <!-- Date Search --> 
        <div class="date-search-wrapper">
            <input @input=${ this._changeDate } type="date" class="input" id="date1"></input>
            <span class="dash">-</span>
            <input @input=${ this._changeDate } type="date" class="input" id="date2"></input>
=======
          <!-- DropDown -->
          <div class="dropdown-wrapper">
            <div @click=${ this._toggleDropDown } class="dropdown-btn">
              <span id="selected-item" class="special-character">${ html `${unsafeHTML(this.criterias[this.criteriaKey].icon)}` }</span>
              <span><i class="arrow down"></i></span>
            </div>

            <!-- Dropdown menu -->
            <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
              <!-- Generate all criteria fields -->
              ${this.criterias?.map((criteria, key) => {
                return html `<div @click=${ this._changeCondition } class="criteria" id=${key}><span class="special-character">${unsafeHTML(criteria.icon)}</span>${criteria.name}</div>`
              })}
            </div>
          </div>

          <!-- Date Search --> 
          <div class="date-search-wrapper">
              <input @change=${ this._changeDate } type="date" class="input" id="date1"></input>
              <span class="dash">-</span>
              <input @change=${ this._changeDate } type="date" class="input" id="date2"></input>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
    `;
  }
}