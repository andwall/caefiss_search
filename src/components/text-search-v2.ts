import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { SearchEvent, Condition, Operation } from "../model/model";

@customElement('text-search-v2')
export class TextSearch extends LitElement{
 
  /* Properties to be emitted */
  @property({ type: Object }) searchEvent: SearchEvent = {
    parentEntityName: "",
    entityName: "",
    fieldName: "",
    displayName: "",
    context: Operation.Change,
    condition: Condition.Equal
  } as SearchEvent;  
  /* Text value to be passed */
  inputData : string = ""; 

  /*Used for styling purposes */
  @property({ type: Boolean }) private isDropDownOpen?  : boolean;
  @property({ type: String })  private criteriaKey : number;

  /* Used for ui */
  private criterias: { id: string, name: string, icon: string, condition: Condition }[];

  /* Intialize criterias and ui options */
  constructor(){
    super();
 
    this.isDropDownOpen = false;
    this.criterias = [
      { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
      { id: "contains", name: "contains", icon: "&ni;", condition: Condition.Contains },
      { id: "beginsWith", name: "begins with", icon: "A<sub>z</sub>...", condition: Condition.On },
      { id: "endsWith", name: "ends with", icon: "...A<sub>z</sub>", condition: Condition.After  },
      { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null },
      { id: "fieldContains", name: "field contains", icon: "&ni;<sub>f</sub", condition: Condition.Contains }
    ];
    this.criteriaKey = 0;

  }
 
  static styles = css`
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

  input[type=text]{
    width: 100%;
    padding: 6px;
    -webkit-transition: 0.15s;
    transition: 0.15s;
    border-radius: 6px;
    border: solid 1px lightgray;
    outline: none;
    box-shadow: 0 5px 15px rgba(0,0,0,0,0);  
  }

  input[type=text]:focus {
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
  render(){
    return html` 
   
      <h3>${ this.searchEvent.displayName ?  this.searchEvent.displayName : " " }</h3>
      <div class="container">
        <!-- Dropdown --> 
        <div class="dropdown-wrapper">
          
          <!-- Dropdown button -->
          <div @click=${ this._onDropDownClick } class="dropdown-btn">
            <span id="selected-item" class="special-character">${html `${unsafeHTML(this.criterias[this.criteriaKey].icon)}`}</span>
            <span><i class="arrow down"></i></span>
          </div>

          <!-- Dropdown menu -->
          <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
            <!-- Generate all criteria fields -->
            ${this.criterias?.map((criteria, key) => {
              return html `<div key=${key} @click=${ this._onCriteriaClick } class="criteria" id=${criteria.id}><span class="special-character">${unsafeHTML(criteria.icon)}</span>${criteria.name}</div>`
            })}
          </div>

        </div>
       
        <!-- Text Search --> 
        <input @input=${ this._onInput } type="text" class="input"></text>
      </div>
    `
  }

  /* Responsible for setting text value property and emitting event */
  _onInput(event: Event){
    const target = event.target as HTMLInputElement;
    this.inputData = target.value; 
    this._emitTextSearchChanged();
  }
  
  /* Responsible for opening and closing dropdown */
  _onDropDownClick(){
    this.isDropDownOpen = !this.isDropDownOpen;
  }
  
  /* Responsible for updating dropdown button icon and setting criteria value property */
  _onCriteriaClick(e: Event){
    const clickedEl = e.target as HTMLElement;
    this.criteriaKey = clickedEl.getAttribute('key') as unknown as number; //workaround for getting el key
    this.searchEvent.condition = this.criterias[this.criteriaKey].condition;
    this._onDropDownClick();
    this._emitTextSearchChanged();
  }
  
  /* Responsible for emitting the text search changed event */
  _emitTextSearchChanged(){
    
    this.searchEvent.context = this.inputData ? Operation.Change : Operation.Delete; //check if the value is empty
    this.searchEvent.condition = this.searchEvent.condition ? this.searchEvent.condition : this.criterias[this.criteriaKey].condition;

    let textSearchEvent = new CustomEvent('text-search-event', {
      detail: {
        searchEvent: this.searchEvent,
        inputData: this.inputData
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(textSearchEvent);
  }

}


