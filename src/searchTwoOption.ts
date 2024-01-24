import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { SearchTypes, Condition, Operation, SearchEvent } from "./SearchTypes";

@customElement('search-twooption')
export class TwoOptionSearch extends LitElement {

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

  @property({ attribute: false })
  context: string = '';

  @property({ attribute: false })
  operation: Operation = Operation.Change;

  @property({ attribute: "YES" })
  option1: string = "YES";

  @property({ attribute: "NO" })
  option2: string = "NO";

  @property({ attribute: false })
  option1text: string = "YES";

  @property({ attribute: false })
  option2text: string = "NO";

  @property({ attribute: false })
  condition: Condition = Condition.Equal;

  /*Used for styling purposes */
  @property({ attribute: false }) private isDropDownOpen: boolean = false;
  @property({ attribute: false }) private criteriaKey: number = 0;
  @query('.dropdown-wrapper') private dropDownContainer?: HTMLElement;
  private criterias: { id: string, name: string, icon: string, condition: Condition }[];

  constructor() {
    super();
    this.criterias = [
      { id: "in", name: "in", icon: "&ni;", condition: Condition.In },
      { id: "notIn", name: "not in", icon: "&ne;", condition: Condition.NotEqual },
      { id: "isNull", name: "is null", icon: "&empty;", condition: Condition.Null }
    ];
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

  /* Display name styling */
  .display-name-container{
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .checkbox-container{
    padding-top: 0.5em;
  }

  div.checkbox-container {
    
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

  _click1(event: Event) {
    const input = event.target as HTMLInputElement;
    this.option1 = input.value;
    this.operation = Operation.Change;
    this._dispatchMyEvent();
  }

  _click2(event: Event) {
    const input = event.target as HTMLInputElement;
    this.option2 = input.value;
    this.operation = Operation.Change;
    this._dispatchMyEvent();
  }

  _changeCondition(e: Event) {
    const clickedEl = e.target as HTMLElement;
    this.criteriaKey = clickedEl.getAttribute('key') as unknown as number; //workaround for getting el key
    this.condition = this.criterias[this.criteriaKey].condition;
    this._toggleDropDown();
    this._dispatchMyEvent();
  }

  _dispatchMyEvent() {
    let evt: SearchEvent = {
      type: SearchTypes.Text,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      option1: this.option1,
      option2: this.option2,
      findText: "",
      condition: this.condition,
      operation: this.operation,
      context: ''
    };

    let searchChangeEvent = new CustomEvent('search-text-event', {
      detail: evt,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(searchChangeEvent);
  }

  _toggleDropDown() {
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  _handleClickAway(event: Event) {
    let currEl = event.target as HTMLElement;
    if (!(this.dropDownContainer?.contains(currEl)) && this.isDropDownOpen) {
      this._toggleDropDown();
    }
  }

  override render() {
    return html` 
      <div id="main-content" @click=${this._handleClickAway}> 
      
        <div class="display-name-container">
          <!-- Custom Checkbox -->
          <div class="checkbox-container">
            <input type="checkbox" id="checkbox" />
            <label for="checkbox"></label>
          </div>
            <h3>${this.displayName}</h3>
        </div>

        <div class="container">
          <div class="dropdown-wrapper">

            <!-- Dropdown button -->
            <div @click=${this._toggleDropDown} class="dropdown-btn" id="criteria-btn">
              <span id="selected-item" class="special-character">${html`${unsafeHTML(this.criterias[this.criteriaKey].icon)}`}</span>
              <span><i class="arrow down"></i></span>
            </div>

            <!-- Dropdown menu -->
            <div class="dropdown-menu ${this.isDropDownOpen ? 'open' : ''}">
              ${this.criterias?.map((criteria, key) => {
      return html`<div key=${key} @click=${this._changeCondition} class="criteria" id=${criteria.id}><span class="special-character">${unsafeHTML(criteria.icon)}</span>${criteria.name}</div>`
    })}
            </div>
          </div>

          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="inlineCheckbox1" @click=${this._click1} value="${this.option1}">
            <label class="form-check-label" for="inlineCheckbox1">${this.option1text}</label>
          </div>

          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="inlineCheckbox2" @click=${this._click1} value="${this.option2}">
            <label class="form-check-label" for="inlineCheckbox2">${this.option2text}</label>
          </div>

        </div>
      </div>
    `
  }
}