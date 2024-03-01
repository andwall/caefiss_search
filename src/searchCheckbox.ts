import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { SearchTypes, Condition, Operation, SearchEvent, EntityInfo, OptionSet } from "./SearchTypes";
import { CAEFISS } from "./utilities";
/*
 * Class: CheckboxSearch
 * Purpose: 
 *  CheckboxSearch is a lit element that allows user to select multiple checkboxes.
*/
@customElement('search-checkbox')
export class CheckboxSearch extends LitElement {
  
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
  
  @query('#include-checkbox')
  private includeCheckbox?: HTMLInputElement;

  private context: string = '';
  private operation: Operation = Operation.Delete;
  private condition: Condition = Condition.Equal;
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  private optionData: OptionSet[] = [];
  private checkedOptions: Map<number, boolean> = new Map<number, boolean>(); 


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
    
    #display-name{
      font-weight: normal;
      font-size: 20px;
      color: #2572b4;
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

    .checkbox-container{
      padding-top: 0.5em;
    }
  
    /* Custom checkbox styling */
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

    /* Input styling */
    .input-container{
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    /* Search checkboxes */
    .search-checkbox-container{
      display: flex;
      gap: 5px;
      width: 33.3%;
      flex-grow: 1;
      padding: 2.5px 5px;
    }

    .search-checkbox-container label{
      font-weight: bold;
    }
    
  `;

  /** 
   * Function: connectedCallback
   * Purpose: After this compoonent is added to DOM, listen to events on DOM (window) set all checked information given to this component 
  */
 override connectedCallback(): void {
    super.connectedCallback();
    this._getData();
  }
  
  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }
  
  protected override firstUpdated(): void {
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: this.include } as EntityInfo;
    this.includeCheckbox!.checked = this.checked.include;
    if(this.checked.include) this._dispatchMyEvent();
  }

  /* Responsible for getting option set to populate checkboxes */
  _getData(){
    let util = new CAEFISS();
    let data: OptionSet[] = util.getOptionSet(this.fieldName);
    data.forEach(d => {
      if(!this.optionData.some(obj => obj.key === d.key)){ //remove duplicates
        this.optionData.push(d);
        this.checkedOptions.set(d.value, false);
      } 
    });
  }

  _changeMessage(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedKey = Number(target.id);
    target.checked ? this.checkedOptions.set(selectedKey, true) : this.checkedOptions.set(selectedKey, false);
    this._dispatchMyEvent();
  }

  _setOperation(): void{
    let deleteOperaiton: boolean = true;
    for(let key of this.checkedOptions.keys()){
      if(this.checkedOptions.get(key) === true){
        deleteOperaiton = false;
        break;
      } 
    }
    this.operation = deleteOperaiton ? Operation.Delete : Operation.Change;
  }
  
  _dispatchMyEvent(): void {
    this._setOperation();
    let evt: SearchEvent = {
      type: SearchTypes.Checkbox,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: '',
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: JSON.stringify(Object.fromEntries(this.checkedOptions)),
      condition: this.condition,
      operation: this.operation,
      context: this.context,
      option1: '',
      option2: '',
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-checkbox-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }
 
  /* Responsible for setting the "include in output" checkbox" */
  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
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
      
      <!-- Conditions & input container -->
      <div class="input-container">
          ${this.optionData.map((data) => {
            return html `
              <div class="search-checkbox-container">
                <input @click=${this._changeMessage} type="checkbox" class="checkbox-input" id="${data.value}"></input>
                <label for="${data.value}" class="checkbox-input-label">${data.key}</label> 
              </div>
            `;
          })}
      </div>
    </div>
    `;
  }
}
