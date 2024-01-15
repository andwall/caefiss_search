import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, Operation, SearchEvent } from "./SearchTypes";

@customElement('search-text')
export class TextSearch extends LitElement{
 
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
  
  /*Used for styling purposes */
  @property({attribute: false}) private isDropDownOpen: boolean = false;
  @property({attribute: false}) private criteriaKey: number = 0;
  @query('.dropdown-wrapper') private dropDownContainer?: HTMLElement;
  private criterias: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
    { id: "notEquals", name: "not equals", icon: "&ne;", condition: Condition.NotEqual },
    { id: "contains", name: "contains", icon: "&ni;", condition: Condition.Contains },      
    { id: "beginsWith", name: "begins with", icon: "A<sub>z</sub>...", condition: Condition.BeginsWith },
    { id: "endsWith", name: "ends with", icon: "...A<sub>z</sub>", condition: Condition.EndsWith }, 
    { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }
  ]; 
  
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

  /* Display name styling */
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

  _changeMessage(event: Event){
    const input = event.target as HTMLInputElement;
    this.findText = input.value; 
    this.operation = this.findText ? Operation.Change : Operation.Delete; //check if the value is empty
    this._dispatchMyEvent();
  }
  
  _changeCondition(e: Event){
    const clickedEl = e.target as HTMLElement;
    this.criteriaKey = Number(clickedEl.id); //getting element's id instead of key
    this.condition = this.criterias[this.criteriaKey].condition;
    this._toggleDropDown();

    if(this.findText)
      this._dispatchMyEvent();
  }
  
  _dispatchMyEvent(){
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

    let searchChangeEvent = new CustomEvent('search-text-event', {
      detail: evt,
      bubbles: true,
      composed: true });
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
      <div id="main-content" @click=${ this._handleClickAway }> 
      
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input type="checkbox" id="checkbox" />
            <label for="checkbox"></label>
          </div>
            <h3>${ this.displayName }</h3>
        </div>

        <div class="container">
          <div class="dropdown-wrapper">

            <!-- Dropdown button -->
            <div @click=${ this._toggleDropDown } class="dropdown-btn" id="criteria-btn">
              <span id="selected-item" class="special-character">${ html `${unsafeHTML(this.criterias[this.criteriaKey].icon)}` }</span>
              <span><i class="arrow down"></i></span>
            </div>

            <!-- Dropdown menu -->
            <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
              ${this.criterias?.map((criteria, key) => {
                return html `<div @click=${ this._changeCondition } class="criteria" id=${key}><span class="special-character">${unsafeHTML(criteria.icon)}</span>${criteria.name}</div>`
              })}
            </div>
          </div>
          
          <!-- Text Search --> 
          <input @change=${ this._changeMessage } type="text" class="input"></text>
        </div>
      </div>
    `
  }
}