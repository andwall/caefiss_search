import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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

  @state()
  private context: string = '';

  @state()
  private operation: Operation = Operation.Delete;

  @state()
  private condition: Condition = Condition.Equal;

  @state()
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;

  /* Responsible for option set data and checked options */
  @state()
  private checkedOptions: Map<string, boolean> = new Map<string, boolean>(); 

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
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: false } as EntityInfo;
    this._getData();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  /* Responsible for getting option set to populate checkboxes */
  _getData(){
    // let util = new CAEFISS();
    // let data: OptionSet[] = util.getOptionSet(this.fieldName); // returns OptionSet[] -> [{key: "", value: 0}]
    // let seenKeys: Set<string> = new Set<string>();
    
    // data.forEach(d => {
    //   if(!seenKeys.has(d.key)) this.checkedOptions.set(d.key, false);  
    //   seenKeys.add(d.key);
    // });
    
    for(let i = 0; i < 6; i++){
      let key = `Option ${i}`;
      this.checkedOptions.set(key, false);
    } 
    console.log(this.checkedOptions)
  }

  _changeMessage(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.checked ? this.checkedOptions.set(input.id, true) : this.checkedOptions.set(input.id, false);
    this._dispatchMyEvent();
  }

  _deleteOperation(): boolean{
    for(let key of this.checkedOptions.keys())
      if(this.checkedOptions.get(key) === true) return false;
    return true;
  }
  
  _dispatchMyEvent(): void {
    if(this._deleteOperation()) this.operation = Operation.Delete;
    else this.operation = Operation.Change;

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
          <input @click=${this._setChecked} type="checkbox" id="checkbox" aria-labelledby="display-name checkbox-label"/>
          <label for="checkbox" id="checkbox-label"><span class="visually-hidden">Include in output</span></label>
        </div>
          <h4 id="display-name">${this.displayName}</h4>
      </div>
      
      <!-- Conditions & input container -->
      <div class="input-container">
          ${Array.from(this.checkedOptions.keys()).map(key => {
            return html `
              <div class="search-checkbox-container">
                <input @click=${this._changeMessage} type="checkbox" class="checkbox-input" id="${key}"></input>
                <label for="${key}" class="checkbox-input-label">${key}</label> 
              </div>
            `;
          })}
      </div>
    </div>
    `;
  }
}
