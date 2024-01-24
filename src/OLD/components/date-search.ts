import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement('date-search')
export class DateSearch extends LitElement{

  //Entity name
  //Field name
  //Date entered
  //Criteria entered
  //Context data
  @property({ type: String }) entityName? : string;
  @property({ type: String }) fieldName?  : string;
  @property({ type: Date   }) date1?      : Date | string;
  @property({ type: Date   }) date2?      : Date | string;
  @property({ type: String }) criteria?   : string;
  @property({ type: String }) context?    : string;

  /* For styling */ 
  @property({ type: Boolean }) private isDropDownOpen?  : boolean;
  @property({ type: String })  private selectedItemKey? : number;

  /* Used for ui */
  private criterias: { id: string, name: string, icon: string }[];

  constructor(){
    super();
    this.criterias = [
      { id: "between", name: "between", icon: "&harr;" },
      { id: "isNull",  name: "is null", icon: "&empty;"}
    ]
    this.selectedItemKey = 0;
    this.criteria = this.criterias[0].id;
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

  .date-search-wrapper{
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
  }

  input[type=date]{
    width: 100%;
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
      <h3>${this.fieldName}</h3>
      <div class="container">
        <!-- DropDown -->
        <div class="dropdown-wrapper">
          <div @click=${ this._onDropDownClick } class="dropdown-btn">
            <span id="selected-item" class="special-character">${this.selectedItemKey ? html `${unsafeHTML(this.criterias[this.selectedItemKey].icon)}` : html `&harr;` }</span>
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
        <!-- Date Search --> 
        <div class="date-search-wrapper">
            <input @input=${ this._onInput } type="date" class="input" id="date1"></input>
            <span class="dash">-</span>
            <input @input=${ this._onInput } type="date" class="input" id="date2"></input>

        </div>
      </div>
    `
  }


  _onDropDownClick(){
    this.isDropDownOpen = !this.isDropDownOpen;
  }  
  
  /* Responsible for updating dropdown button icon and setting criteria value property */
  _onCriteriaClick(e: Event){
    const clickedEl = e.target as HTMLElement;
    this.selectedItemKey = clickedEl.getAttribute('key') as unknown as number; //workaround for getting el key
    this.criteria = clickedEl.id;
    this._onDropDownClick();
    this._emitDateSearchChanged();
  }

  _emitDateSearchChanged(){
    let textSearchEvent = new CustomEvent('date-search-event', {
      detail: {
        entityName: this.entityName,
        fieldName: this.fieldName,
        displayName: this.date1 + " " + this.date2,
        context: this.context,
        condition: this.criteria
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(textSearchEvent);
  }

  _onInput(event: Event){
    const target = event.target as HTMLInputElement;
    let date = target.value; 
    this.context = date ? "change" : "delete"; //check if the value is empty

    target.id === "date1" ? this.date1 = date : this.date2 = date;
    this._emitDateSearchChanged();
  }
}