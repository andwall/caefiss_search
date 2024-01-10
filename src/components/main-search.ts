import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TextSearch } from "./text-search";
import { DateSearch } from "./date-search";
import { SearchEvent } from "../model/model";


@customElement('main-search')
export class MainSearch extends LitElement{

  @property({ type: Object }) searchEvent?   : SearchEvent;

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

      <!-- Currently passing props to text search for entity name and field name -->
      <div class="text-search-container">
        <text-search entityName="V number" fieldName="V number" @text-search-event=${ this._onTextSearchChanged }></text-search>

        <date-search @date-search-event=${ this._onDateSearchChanged } entityName="Time of Immunization" fieldName="Date of vaccine administration"></date-search>
        
      </div>
      `
  }

  /* 
    * Responsible for getting all values emitted from text search
    * TODO replace with a context manager
  */
  _onTextSearchChanged(event: Event) {
    /* Getting via custom event */ 
    const searchTextEvent = event as CustomEvent<SearchEvent>;
    this.searchEvent = searchTextEvent.detail;
    
    //debugging purposes
    this.textValue = searchTextEvent.detail.displayName;
    console.log(this.searchEvent)
    
    /* Getting via properties */
    const target = event.target as TextSearch;
    // this.entityName = target.entityName;
    // this.fieldName = target.fieldName;
    // this.textValue = target.textValue;
    // this.criteriaValue = target.criteriaValue;
    // this.contextData = target.contextData;

    //Show results
    // console.log(this.entityName, this.fieldName, this.textValue, this.criteriaValue);
  }

  _onDateSearchChanged(event: Event){
    const dateEvent = event as CustomEvent;
    console.log(dateEvent.detail)
  }
}
