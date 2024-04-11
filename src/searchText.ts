import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { SearchTypes, Condition, Operation, SearchEvent, EntityInfo } from "./SearchTypes";
/*
 * Class: TextSearch
 * Purpose: 
 *  TextSearch is a lit element that allows user to text search.
*/
@customElement('search-text')
export class TextSearch extends LitElement {
  
  @property()
  groupId: string = '-1';

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
  include: boolean | string = false;

  @property()
  includeLock: boolean | string = false;  
  
  @property()
  hideDisplayName: boolean | string = false;

  @property()
  hideIncludeCheckbox: boolean | string = false;

  private context: string = '';
  private operation: Operation = Operation.Delete;
  private findText: string = '';
  private condition: Condition = Condition.Equal;
  private checked: EntityInfo = { name: '', field: '', alias: '', include: false } as EntityInfo;
  @query('#include-checkbox') private includeCheckbox?: HTMLInputElement;  
  @query('.checkbox-container') private includeCheckboxContainer?: HTMLInputElement;
  @query('#display-name') private displayNameEl?: HTMLElement;

  private conditions: { id: string, name: string, icon: string, condition: Condition }[] = [
    { id: "beginsWith", name: "begins with", icon: "A..", condition: Condition.BeginsWith },
    { id: "endsWith", name: "ends with", icon: "..A", condition: Condition.EndsWith }, 
    { id: "equals", name: "equals", icon: "&equals;", condition: Condition.Equal },
    { id: "notEquals", name: "not equals", icon: "&ne;", condition: Condition.NotEqual },
    { id: "contains", name: "contains", icon: "&ni;", condition: Condition.Contains }, 
    { id: "not in", name: "not in", icon: "&notni;", condition: Condition.NotIn }, 
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
    
    #display-name{
      font-weight: bold;
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

    /* Input styling */
    .input-container{
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

    /* Condition dropdown styling */
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
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.include= String(this.include).toLowerCase() === 'true';
    this.includeLock= String(this.includeLock).toLowerCase() === 'true';
    this.checked = { name: this.entityName, field: this.fieldName, alias: this.alias, include: this.include } as EntityInfo;
    this.condition = this.conditions[0].condition;

    if(this.includeLock){
      this.include = true;
      this.checked.include = true;
    }else{ // no include lock so set the include checkbox state
      if(this.includeCheckbox)
        this.includeCheckbox.checked = this.checked.include;
    }
  }

  protected override firstUpdated(): void {
    if(this.checked.include) this._dispatchMyEvent();    
    
    /* Check for hiding elements */
    if(this.hideDisplayName === 'true' || this.hideDisplayName === true){
      this.displayNameEl?.classList.add('visually-hidden');
    }
    
    if(this.hideIncludeCheckbox === 'true' || this.hideIncludeCheckbox === true){
      this.includeCheckboxContainer?.classList.add('visually-hidden');
    }
  }

  _setFindText(event: Event): void {
    this.findText = (event.target as HTMLInputElement).value; 
    this._dispatchMyEvent();
  }
  
  _setCondition(event: Event): void {
    let selectedIndex = Number((event.target as HTMLSelectElement).selectedIndex);
    this.condition = this.conditions[selectedIndex].condition;
    if(this.operation === Operation.Change || this.condition == Condition.Null || this.condition === Condition.NotNull)
      this._dispatchMyEvent();
  }

  _setOperation(): void{
    this.operation = this.findText || this.condition === Condition.Null || this.condition === Condition.NotNull ? Operation.Change : Operation.Delete;
  }

  _dispatchMyEvent(): void {
    this._setOperation();
    let evt: SearchEvent = {
      groupId: this.groupId,
      type: SearchTypes.Text,
      entityName: this.entityName,
      from: this.from,
      parentEntityName: this.parentEntityName,
      parentEntityId: '',
      to: this.to,
      fieldName: this.fieldName,
      displayName: this.displayName,
      findText: this.findText,
      condition: this.condition,
      operation: this.operation,
      context: this.context,
      option1: "",
      option2: "",
      checked: this.checked
    };
    
    let searchChangeEvent = new CustomEvent('search-text-event', {
      detail: evt,
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(searchChangeEvent);
  }
  
  _setChecked(event: Event): void {
    this.checked.include = (event.target as HTMLInputElement).checked ? true : false; 
    this._dispatchMyEvent();
  }

  override render(){
    return html` 
    <div id="main-container">  
      <div class="display-name-container">

        <!-- Custom Checkbox -->
        ${ !this.includeLock ? html ` <!-- Only show if there's no include lock -->
          <div class="checkbox-container">
            <input @click=${this._setChecked} type="checkbox" id="include-checkbox" aria-labelledby="display-name checkbox-label"/>
            <label for="include-checkbox" id="checkbox-label"><span class="visually-hidden">Include in output</span></label>
          </div>` : ''
        }
        <h4 id="display-name">${this.displayName}</h4>
      </div>
      
      <!-- Conditions & input container -->
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
        <input @change=${this._setFindText} type="text" class="input" id="search-text" aria-labelledby="display-name"></input>
      </div>
    </div>
    `;
  }
}
