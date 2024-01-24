import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SearchEvent } from "./SearchTypes";



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

    .container{
      display: flex;
      flex-direction: column;
      gap: 25px;
      width: 500px;
    }

    .multiple-search{
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding-top: 25px;
    }

    .search-text-v2{
      width: 400px;
      padding: 40px;
    }
  `
  render(){
    return html`
      <h1>${this.textValue}</h1>

      <!-- Currently passing props to text search for entity name and field name -->
       <div>
  
        <div class="container">
          <search-text displayName="V Number" entityName="incident" fieldName="V Number" parentEntityName="parent" @search-text-event=${this._onTextSearchChanged }></search-text>

          <search-date @search-date-event=${ this._onDateSearchChanged } entityName="Time of Immunization" fieldName="fieldName" displayName="Date of Vaccine Administration"></search-date>
        </div>

      <div class="multiple-search">

        <!-- <search-text displayName="Andrew"></search-text>
        <search-text displayName="Wallace"></search-text> -->

        
          <search-date @search-date-event=${ this._onDateSearchChanged } entityName="Time of Immunization" fieldName="fieldName" displayName="Date of Vaccine Administration"></search-date>
          <search-date @search-date-event=${ this._onDateSearchChanged } entityName="Time of Immunization" fieldName="fieldName" displayName="Date of Vaccine Administration"></search-date>


      </div>

      <div class="search-text-v2">
        
          <search-text-v2 displayName="V Number" entityName="incident" fieldName="V Number" parentEntityName="parent" @search-text-event=${this._onTextSearchChanged }></search-text-v2>
  </div>

        
      </div>
      `
  }

  _onTextSearchChanged(event: Event) {
    /* Getting via custom event */ 
    const searchTextEvent = event as CustomEvent<SearchEvent>;
   this.searchEvent = searchTextEvent.detail; 
    console.log(this.searchEvent)
    this.textValue = this.searchEvent.findText;
  }

  _onDateSearchChanged(event: Event){
    const dateEvent = event as CustomEvent;
    console.log(dateEvent.detail)
  }

}
