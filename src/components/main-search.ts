import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TextSearch } from "./text-search";


@customElement('main-search')
export class MainSearch extends LitElement{

  @property({ type: String }) entityName?    : string;
  @property({ type: String }) fieldName?     : string;
  @property({ type: String }) textValue?     : string;
  @property({ type: String }) criteriaValue? : string;
  @property({ type: String }) contextData?   : string;

  static styles = css `
    .text-search-container{
      width: 400px;
    }
  `
  render(){
    return html`
      <h1>${this.textValue}</h1>

      <!-- Currently padding props to text search for entity name and field name -->
      <div class="text-search-container">
        <text-search entityName="V Number" fieldName="v_number" @text-search-changed=${ this._onTextSearchChanged }></text-search>

      </div>
      `
  }

  /* 
    * Responsible for getting all values emitted from text search
    * TODO replace with a context manager
  */
  _onTextSearchChanged(event: Event) {
    const target = event.target as TextSearch;
    this.entityName = target.entityName;
    this.fieldName = target.fieldName;
    this.textValue = target.textValue;
    this.criteriaValue = target.criteriaValue;
    this.contextData = target.contextData;
    console.log(this.entityName, this.fieldName, this.textValue, this.criteriaValue)
  }
}
