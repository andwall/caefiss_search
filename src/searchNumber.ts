import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Condition, EntityInfo, Operation, SearchEvent, SearchTypes } from "./SearchTypes";

/**
 * Class: NumberSearch
 * Purpose: 
 *  NumberSearch is a lit element that allows users to enter two numberic value.
 *  Emits a custom event called 'search-number-event' with necessary data as per specified SearchEvent in SearchTypes.ts
 *  Note: if the condition is '=', then the second numeric field is disabled and only first numeric field is used. 
 */
@customElement('search-number')
export class NumberSearch extends LitElement{

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

  private context: string = '';
  private operation: Operation = Operation.Delete;
  private condition: Condition = Condition.Equal;
  private number1: number | null = null;
  private number2: number | null = null;
  private min: number = 0;
  private max: number = 99;
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private errorBorderClass = 'error-border';

  /* For styling */ 
  @query('#include-checkbox') private includeCheckbox?: HTMLInputElement;
  @query('#number1') private n1Input?: HTMLInputElement;
  @query('#number2') private n2Input?: HTMLInputElement;
  @state() private errorMessage: string = "";

  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
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

    .number-search-wrapper{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      // gap: 5px;
      width: 100%;
    }

    .dash{
      width: 1%;
      text-align: center;
    }
    
    input[type=number]{
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

    input[type=number]:focus {
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

    /* Error handling */
    #error-message{
      width: 100%;
      height: auto;
      font-size: 14px;
      color: black;
      background-color: #ffd7d7;
      padding-left: 5px;
    }

    .error-border{
      border: red 1px solid !important;
      box-shadow: 0 0px 8px rgba(233, 102, 102,.45) !important;
    }
  `; 

  protected override firstUpdated(): void {
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: this.include } as EntityInfo;
    this.includeCheckbox!.checked = this.checked.include;
    if(this.checked.include) this._dispatchMyEvent();
    this.n2Input ? this.n2Input.disabled = true : '';
  }

  _dispatchMyEvent(): void{
    this._setOperation();

    let evt: SearchEvent = {
      type: SearchTypes.Number,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: '',
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: JSON.stringify({number1: this.number1, number2: this.number2}),
      condition: this.condition,
      operation: this.operation,
      context: this.context,
      option1: "",
      option2: "",
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-number-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }

  /* Responsible for handling the change event on number inputs */
  _handleChange(event: Event): void{
    const target = event.target as HTMLInputElement;
    if(target.value === ""){
      target.id === 'number1' ? this.number1 = null : this.number2 = null;
    }else{
      target.id === 'number1' ? this.number1 = Number(target.value) : this.number2 = Number(target.value);
    }
    this._dispatchMyEvent()
  }

  /* Responsible for handling the input event on number inputs */
  _handleInput(): void{
    this._setErrors();
  }
  
  /* Responsible for checking the current state of the inputs and setting errors */
  _setErrors(): void{
    if(this.n1Input){ //handle n1 input errors
      this._isValidNum(Number(this.n1Input.value)) ? this._removeErrorBorder(this.n1Input) : this._addErrorBorder(this.n1Input);
    }
    
    if(this.n2Input?.disabled === true) this._removeErrorBorder(this.n2Input); //handle n2 input errors
    else if(this.n2Input){
      this._isValidNum(Number(this.n2Input.value)) ? this._removeErrorBorder(this.n2Input) : this._addErrorBorder(this.n2Input);
    }
    
    this._hasErrorBorder(this.n1Input) || this._hasErrorBorder(this.n2Input) ? this._setErrorMessage('NOTE: invalid input - will not be included in search') : this._setErrorMessage('');
  }
  
  /* Responsible for setting the condition and disabling inputs per necessary */
  _setCondition(event: Event): void{
    let selectedIndex = Number((event.target as HTMLSelectElement).selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    
    if(this.condition === Condition.Between){
      this.n1Input ? this.n1Input.disabled = false : '';
      this.n2Input ? this.n2Input.disabled = false : '';
      this._setErrors();
    }
    else if(this.condition === Condition.Equal){ 
      this.n1Input ? this.n1Input.disabled = false : '';
      this.n2Input ? this.n2Input.disabled = true : '';
      this._setErrors();
    }else{
      this.n1Input ? this.n1Input.disabled = true : '';
      this.n2Input ? this.n2Input.disabled = true : '';
      this._clearErrors(); //clear the errors b/c not using either input
    }
    
    this._dispatchMyEvent();
  }
  
  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }
  
  _setOperation(): void{
    this.operation = 
    (this._isValidNum(this.number1) && this._isValidNum(this.number2) && this.condition === Condition.Between) ||
    (this.number1 === null && this._isValidNum(this.number2) && this.condition === Condition.Between) ||
    (this._isValidNum(this.number1) && this.number2 === null && this.condition === Condition.Between) ||
    (this._isValidNum(this.number1) && this.condition === Condition.Equal) ||
    (this.condition === Condition.Null || this.condition === Condition.NotNull) ?
    Operation.Change : Operation.Delete;
  }

  _isValidNum(num: number | null): boolean{
    if(num === null) return false; 
    return (num >= this.min && num <= this.max);
  }

  _setErrorMessage(message: string){
    this.errorMessage = message;
  }

  _addErrorBorder(el: HTMLInputElement | undefined): void{
    if(el) el.classList.add(this.errorBorderClass);
  }
  
  _removeErrorBorder(el: HTMLInputElement | undefined): void{
    if(el) el.classList.remove(this.errorBorderClass);
  }

  _hasErrorBorder(el: HTMLInputElement | undefined): boolean{
    return el ? el?.classList.contains(this.errorBorderClass) : false;
  }

  _clearErrors(): void{
    this._setErrorMessage('');
    this._removeErrorBorder(this.n1Input);
    this._removeErrorBorder(this.n2Input);
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
            <h4 id="display-name">${this.displayName}</h4>
        </div>
      
        <!-- Conditions & Input Container -->
        <div class="input-container">
          <div class="condition-wrapper">
            <label for="condition-btn" class="visually-hidden" id="condition-label">Condition</label> 
            <select @change=${this._setCondition} id="condition-btn" aria-labelledby="display-name condition-label">
              <!-- Populate conditions -->
              ${this.conditions?.map((condition, key) => {
                return html `<option ${key === 0 ? 'selected': ''} tabindex="0" class="condition-option" value=${condition.id}>${unsafeHTML(condition.icon)}&nbsp;&nbsp;&nbsp;${condition.name}&nbsp;</option>`
              })}
            </select> 
          </div>

          <!-- Number Search --> 
          <div class="number-search-wrapper">
            <input @input=${ this._handleInput} @change=${this._handleChange} type="number" min="${this.min}" max="${this.max}" class="input" id="number1" aria-labelledby="display-name"></input>
            <span class="dash">-</span>
            <input @input=${ this._handleInput} @change=${this._handleChange} type="number" min="${this.min}" max="${this.max}" class="input" id="number2" aria-labelledby="display-name"></input>
          </div>
        </div>
        <p id="error-message">${this.errorMessage}</p>
      </div>
    `;
  }
}
