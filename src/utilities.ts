import { OptionSet } from './SearchTypes';

export class CAEFISS {
    public getLookup(entity: string, field: string) : string[] {
        var data : string[] = [];


        var req = new XMLHttpRequest();
        req.open("GET", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/${entity}?$select=${field}`, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");


        req.onreadystatechange = function () : void {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    console.log(results);
                    for (var i = 0; i < results.value.length; i++) {
                        var result = results.value[i];
                        data.push(result[`${field}`]);
                    }
                } else {
                    // error
                    console.log(this.responseText);
                }
            }
        };
        req.send();
        return data;
    }

    private _webAPI(webapiquery : string, async : boolean) {
 
      var _url = globalThis.Xrm.Page.context.getClientUrl() + "/api/data/v9.1/";
       
      var retrieveReq = new XMLHttpRequest();
      retrieveReq.open("GET", _url + webapiquery.replace(/[{}]/g, ''), async);
      retrieveReq.setRequestHeader("Accept", "application/json");
      retrieveReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      retrieveReq.setRequestHeader("Prefer", "odata.include-annotations='OData.Community.Display.V1.FormattedValue'");
       
      retrieveReq.send();
       
      if (retrieveReq.readyState == 4) {
          if (retrieveReq.status == 200) {
              return JSON.parse(retrieveReq.responseText);
          }

          else {
              return null;
          }
      }
      }


    public getOptionSet(entity : string, name : string) : OptionSet[] {
        var data : OptionSet[] = [];
//debugger;
        var _optionMetadata = this._webAPI(`EntityDefinitions?$filter=LogicalName eq '${entity}'&$expand=Attributes($select=LogicalName;$filter=LogicalName eq '${name}')`, false);
        var _entityMetadataId = _optionMetadata.value["0"].MetadataId;
        var _attributeMetadataId = _optionMetadata.value["0"].Attributes["0"].MetadataId;
        var _type  : string = _optionMetadata.value["0"].Attributes["0"]["@odata.type"];

        

        var _optionAttributeMetadata;
        if (_type.indexOf("Boolean") > 0) {        
          _optionAttributeMetadata = this._webAPI(`EntityDefinitions(${_entityMetadataId})/Attributes(${_attributeMetadataId})/${_type.substring(1)}/OptionSet`, false);

          var trueOption = _optionAttributeMetadata.TrueOption.Label.LocalizedLabels[0].Label;
          var value = _optionAttributeMetadata.TrueOption.Value;
          data.push(   { key: trueOption, value: value }  as OptionSet  );

          var falseOption = _optionAttributeMetadata.FalseOption.Label.LocalizedLabels[0].Label;
          var value = _optionAttributeMetadata.FalseOption.Value;
          data.push(   { key: falseOption, value: value }  as OptionSet  );

        } else if (_type.indexOf("Picklist") > 0) {        
            _optionAttributeMetadata = this._webAPI(`EntityDefinitions(${_entityMetadataId})/Attributes(${_attributeMetadataId})/${_type.substring(1)}?$select=LogicalName&$expand=OptionSet`, false);

            var options = _optionAttributeMetadata.OptionSet.Options;
            for (var i = 0; i < options.length; i++) {  
              var value = options[i].Value;
              var key = options[i].Label.LocalizedLabels[0].Label
              data.push(   { key: key, value: value }  as OptionSet  );
            }
  

        } else {

          _optionAttributeMetadata = this._webAPI(`EntityDefinitions(${_entityMetadataId})/Attributes(${_attributeMetadataId})/${_type.substring(1)}/OptionSet?$select=Options`, false);

          for (var i = 0; i < _optionAttributeMetadata.Options.length; i++) {                      
            var key = _optionAttributeMetadata.Options[i].Label.UserLocalizedLabel.Label;
            var value = _optionAttributeMetadata.Options[i].Value;
            data.push(   { key: key, value: value }  as OptionSet  );
          }
        }

       

        return data;
       
    }


    // used from the dashboard
    public searchRB() : void{
      debugger;
      var userSettings = globalThis.Xrm.Utility.getGlobalContext().userSettings;
      var username = userSettings.userName;

      var layoutXml = this.createLayoutXml("incident", ["incidentid", "title"]);

      var fetchXml = [
        "<fetch>",
        "  <entity name='incident'>",
        "    <attribute name='incidentid'/>",
        "    <attribute name='title'/>",
        "  </entity>",
        "</fetch>"
        ].join("");
      this.createOrUpdateUserView(username, fetchXml, layoutXml, true);

    }

    // called from FilterBuilder
    public search(entityId : string, fetchXml : string, fields : string[]) : void {
      // get username 
      var userSettings = globalThis.Xrm.Utility.getGlobalContext().userSettings;
      var username = userSettings.userName;

      var layoutXml = this.createLayoutXml(entityId, fields);

      // check if view exists
      this.createOrUpdateUserView(username, fetchXml, layoutXml, false);
    }

    // create a view layout
    public createLayoutXml(entityId : string, fields : string[]) : string {
      var layoutXml : string = `
          <grid name='resultset' object='112' jump='name' select='1' preview='1' icon='1'>
              <row name='result' id='${entityId}'>`;
      fields.forEach(function(attr) : void {
          layoutXml += `<cell name='${attr}' width='100' /> `;
      });
      layoutXml += `</row></grid>`;
      return layoutXml;
  }


    private createOrUpdateUserView(username : string, fetchXml : string, layoutXml : string, openDashboard : boolean) : void {
      var outer = this;
      var req = new XMLHttpRequest();
      req.open("GET", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userqueries?$filter=name eq '${username}-search'`, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Prefer", "odata.include-annotations=*");
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          req.onreadystatechange = null;
          if (this.status === 200) {
            var results = JSON.parse(this.response);
            console.log(results);

            if (results.value.length === 0) {
              // create the user view - does not exist
              outer.createUserView(`${username}-search`, `${username}-search`, fetchXml, layoutXml, openDashboard);
            } else {
              var id = results.value[0]["userqueryid"];
              // update the user view 
              //outer.updateUserView(`${username}-search`, `${username}-search`, id, fetchXml, layoutXml);
              // update the user view 
              outer.deleteUserView(`${username}-search`, `${username}-search`, id, fetchXml, layoutXml, openDashboard);
            }
          } else {
            console.log(this.responseText);
          }
        }
      };
      req.send();

      
    }

    public deleteUserView(name : string, description : string,  viewid : string, fetchXml : string, layoutXml : string, openDashboard : boolean) {
      var outer = this;
      var req = new XMLHttpRequest();
      req.open("DELETE", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userqueries(${viewid})`, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("Accept", "application/json");
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          req.onreadystatechange = null;
          if (this.status === 204 || this.status === 1223) {
            console.log("User view deleted");
            outer.createUserView(name, description, fetchXml, layoutXml, openDashboard);
          } else {
            console.log(this.responseText);
          }
        }
      };
      req.send();
    }



    // private updateUserView(name : string, description : string,  viewid : string, fetchXml : string, layoutXml : string) : void {
    //   var record = {
    //     fetchxml: fetchXml,
    //     layoutxml: layoutXml,
    //     returnedtypecode: "incident"
    //   };
      
    //   var outer = this;
    //   var req = new XMLHttpRequest();
    //   req.open("PATCH", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userqueries(${viewid})`, true);
    //   req.setRequestHeader("OData-MaxVersion", "4.0");
    //   req.setRequestHeader("OData-Version", "4.0");
    //   req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    //   req.setRequestHeader("Accept", "application/json");
    //   req.setRequestHeader("Prefer", "odata.include-annotations=*");
    //   req.onreadystatechange = function () {
    //     if (this.readyState === 4) {
    //       req.onreadystatechange = null;
    //       if (this.status === 204) {
    //         console.log("User view updated");
    //         // create or update the dashboard
    //         outer.createOrUpdateUserDashboard(name, description);


    //       } else {
    //         console.log(this.responseText);
    //       }
    //     }
    //   };
    //   req.send(JSON.stringify(record));


    // }


    
    // creates a view
    public createUserView(name: string, description : string, fetchXml : string, layoutXml : string, openDashboard : boolean) : void {
        var record = {
            fetchxml: fetchXml,
            layoutxml: layoutXml,
            querytype: 0,
            name: name,
            description: description,
            returnedtypecode: "incident"
        }

        var outer = this;
        var req = new XMLHttpRequest();
        req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/userqueries", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");
        req.onreadystatechange = function () : void {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    var uri = req?.getResponseHeader("OData-EntityId") || "";
                    var regExp = /\(([^)]+)\)/;
                    var matches = regExp?.exec(uri) || [];
                    var viewid = matches.length > 1 ? matches[1] : "";
                    console.log(`User view created GUID: ${viewid}`);
                    // create or update the dashboard
                    outer.createOrUpdateUserDashboard(name, description, viewid, openDashboard);
                } else {
                    console.log(this.responseText);
                }
            }
        };
        req.send(JSON.stringify(record));
       
    }

    private createOrUpdateUserDashboard(name : string, description : string, viewid : string, openDashboard : boolean) : void {
      var outer = this;
      var req = new XMLHttpRequest();
      req.open("GET", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userforms?$select=userformid&$filter=name eq '${name}'`, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Prefer", "odata.include-annotations=*");
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          req.onreadystatechange = null;
          if (this.status === 200) {
            var results = JSON.parse(this.response);

            if (results.value.length === 0) {
              // create the user dashboard - does not exist
              outer.createUserDashboard(name, description, viewid, openDashboard);
            } else {
              var id = results.value[0]["userformid"];
              // delete the user dashboard 
              //outer.deleteUserDashboard(id, name, description, viewid);
              // update the user dashboard 
              outer.updateUserDashboard(id, viewid, openDashboard);
            }
          } else {
            console.log(this.responseText);
          }
        }
      };
      req.send();
      
    }    

    // Not used 02-07
    public deleteUserDashboard(id : string, name : string, description : string, viewid : string, openDashboard : boolean) {
      var outer = this;
      var req = new XMLHttpRequest();
      req.open("DELETE", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userforms(${id})`, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("Accept", "application/json");
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          req.onreadystatechange = null;
          if (this.status === 204 || this.status === 1223) {
            console.log("User dashboard deleted");
            outer.createUserDashboard(name, description, viewid, openDashboard);
          } else {
            console.log(this.responseText);
          }
        }
      };
      req.send();
    }


    // creates a dashboard
    public createUserDashboard(name: string, description : string, viewid : string, openDashboard : boolean) : void {
        var form : string = `
        <form>
        <tabs>
          <tab showlabel="false" verticallayout="true" id="{f28e5c30-b17a-4a25-bcb4-385d26724d68}">
            <labels>
              <label description="Tab" languagecode="1033" />
            </labels>
            <columns>
              <column width="100%">
                <sections>
                  <section showlabel="false" showbar="false" columns="1111" id="{0e82892d-51a3-440d-a400-aedabe4dd1b7}">
                    <labels>
                      <label description="Section" languagecode="1033" />
                    </labels>
                    <rows>
                      <row>
                        <cell colspan="2" rowspan="33" showlabel="false" id="{ad8eee16-0612-4efc-9cca-16a651eab23e}">
                          <labels>
                            <label description="Component22aad8d" languagecode="1033" />
                          </labels>
                          <control id="WebResource_Component22aad8d" classid="{9FDF5F91-88B1-47f4-AD53-C11EFC01A01D}">
                            <parameters>
                              <Url>caefiss_search.html</Url>
                              <PassParameters>false</PassParameters>
                              <ShowOnMobileClient>false</ShowOnMobileClient>
                              <Security>false</Security>
                              <Scrolling>auto</Scrolling>
                              <Border>true</Border>
                              <WebResourceId>{4889CF47-4BAB-EE11-A569-000D3A09DCA9}</WebResourceId>
                            </parameters>
                          </control>
                        </cell>
                        <cell id="{40d59577-3594-b2c1-4e26-7915aec40093}" showlabel="false"></cell>
                        <cell id="{e718ac26-85aa-e286-98a8-3e9d7539a9be}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{2411a522-dd3a-e0a5-72c1-ec10ac060134}" showlabel="false"></cell>
                        <cell id="{b453290a-8626-6979-459b-cd008400c126}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{367c1da7-86e2-8987-b498-8e8a857e57c7}" showlabel="false"></cell>
                        <cell id="{0d5ea0b0-808c-8d09-6209-5b9de6e54000}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{e97739dd-e285-a27d-32e1-7967a435b96d}" showlabel="false"></cell>
                        <cell id="{5411d986-0eba-95de-449e-1518a28c79c7}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{2096dddd-3c46-96e5-8881-e2dd683260d9}" showlabel="false"></cell>
                        <cell id="{324941a4-3472-b96b-7808-5601907de915}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{c3eb4d63-0788-2e54-5993-ae8c84ce5758}" showlabel="false"></cell>
                        <cell id="{3be28622-a7a7-659a-be8b-92d350aa70a8}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{578321c6-1d91-429b-e3dc-916eb5c61910}" showlabel="false"></cell>
                        <cell id="{804b5ce5-a3b7-26e3-00d3-0914474a12eb}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{70d78699-2219-3c7a-14ca-b6c3ed347353}" showlabel="false"></cell>
                        <cell id="{be084b60-d1ea-9bd8-ceb7-ecd5c43b9062}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{96e11eda-3a44-6dbd-3c92-70cbad6b1691}" showlabel="false"></cell>
                        <cell id="{7e53bd54-6682-9863-e2d4-c101b788a786}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{3187980d-79a7-84a0-ba23-36885018068b}" showlabel="false"></cell>
                        <cell id="{31233742-d229-4484-ce5b-ba1253b02ea3}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{d1bdd0e0-985d-ed7a-81a1-2deadd1ed65b}" showlabel="false"></cell>
                        <cell id="{d97db7a7-28dd-9b65-6d92-a480bc4cc680}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{043a2e56-b7ed-1cc8-0106-9bcc9c57ce24}" showlabel="false"></cell>
                        <cell id="{3834b8a4-76aa-a2d8-86c2-6de098ce7a1c}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{63416754-99be-307c-554e-8d63e0488b2c}" showlabel="false"></cell>
                        <cell id="{4d967d6b-b490-ee46-a57b-5d747eb7cd56}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{2cd2e426-3bcb-08d3-2bd7-0c099bac01a2}" showlabel="false"></cell>
                        <cell id="{91380b64-430d-8312-81ed-e56866002281}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{e238a91e-e1ee-78ca-a6a6-b82b0be463d8}" showlabel="false"></cell>
                        <cell id="{e2574355-c4ad-40a9-7cb0-ca2c21e7e2a8}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{b7de5a82-31e0-478d-7645-6acaa5297124}" showlabel="false"></cell>
                        <cell id="{5a7a504a-3c39-801b-a763-6b3540cc98bd}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{5b2aa4b2-7496-0c55-915b-46222d33d05e}" showlabel="false"></cell>
                        <cell id="{ada8da9d-c0a3-1d05-a02e-e034763ce6ee}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{e0473976-a8e9-532e-0d75-81751c7c94db}" showlabel="false"></cell>
                        <cell id="{c32897ee-7916-9081-5c3e-5d8a6ae5cb6a}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{4a382007-8930-91d5-9264-464b3b57b7c9}" showlabel="false"></cell>
                        <cell id="{2eaeaece-4c0b-4529-817c-3c849a2777e3}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{3a00d6a1-2cbe-036c-e21a-4e2e82827343}" showlabel="false"></cell>
                        <cell id="{b2915983-2908-9a31-0a16-83e943b310b9}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{290c0900-30d0-a15c-1d12-2e774c515c02}" showlabel="false"></cell>
                        <cell id="{dbb4baa7-0174-4c02-406b-a0664769a0ea}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{b459d6b1-21ea-8697-e42e-e88e2b9475cc}" showlabel="false"></cell>
                        <cell id="{54070d49-4c4b-49e1-ad01-c4e2071e6b96}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{7a0220aa-d52d-3d7b-ea2c-5b87cebe59b0}" showlabel="false"></cell>
                        <cell id="{821cc0c0-1d2c-6034-8639-c91500b6a413}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{c3122a6b-7681-446c-4d83-6011795aae9e}" showlabel="false"></cell>
                        <cell id="{475aa829-319c-1566-038c-252a8237e457}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{45c04c98-584d-706d-4724-1415885eeb9e}" showlabel="false"></cell>
                        <cell id="{47a5c07a-90c9-9aea-e7ce-8dae12046e46}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{31152402-6148-31d9-adcb-d37609cc1682}" showlabel="false"></cell>
                        <cell id="{7a6e5358-9153-d9a6-ac5b-c9d98b1d47b2}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{b055d41d-4770-7062-d6c3-547883695e9c}" showlabel="false"></cell>
                        <cell id="{b7e4db28-bb9b-8900-5767-9d4aaeed653e}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{55a9a21a-d717-5563-68dc-e8e13811184c}" showlabel="false"></cell>
                        <cell id="{6e896c40-4741-642e-114a-25930744a5ee}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{b883921d-693e-d193-da7d-d6a45ebc911c}" showlabel="false"></cell>
                        <cell id="{a7b8c457-c23d-746a-5273-46ac3d552edb}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{2bcc4797-8e5e-6c38-99cc-ae6dbe263d20}" showlabel="false"></cell>
                        <cell id="{71da9443-3b30-41a2-13d3-683794bdbc30}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{ba8b2403-3d26-2d92-8a46-095d1883a644}" showlabel="false"></cell>
                        <cell id="{4ca65c40-472b-de0c-7046-a37b46c9e7bd}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{13780675-e482-c55b-a30d-572c01504116}" showlabel="false"></cell>
                        <cell id="{4c26309a-b3e2-3e0a-1a52-d29601ee71dc}" showlabel="false"></cell>
                      </row>
                      <row>
                        <cell id="{36810392-1deb-38cc-980d-7406e364eb8b}" showlabel="false"></cell>
                        <cell id="{734dac42-859e-7157-9656-25b32bd2243e}" showlabel="false"></cell>
                      </row>
                    </rows>
                  </section>
                </sections>
              </column>
            </columns>
          </tab>
        </tabs>
      </form>`;

        var outer = this;
        var record = {
            formxml: form,
            description: description,
            name: name,
            type: 0
        }
        // systemform only isdefault: true,

        var newId : string = "";
        var req = new XMLHttpRequest();
        req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/userforms", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");
        req.onreadystatechange = function () : void {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    var uri = req?.getResponseHeader("OData-EntityId") || "";
                    var regExp = /\(([^)]+)\)/;
                    var matches = regExp?.exec(uri) || [];
                    var dashboardId = matches.length > 1 ? matches[1] : "";
                    console.log(`User dashboard created ${dashboardId}`);

                    //outer.addAppComponents(newId, viewid);
                    //outer.publish(dashboardId);
                    outer.setDefaultDashboard(dashboardId, viewid, openDashboard);

                } else {
                    console.log(this.responseText);
                }
            }
        };
        req.send(JSON.stringify(record));
    }

        // updates a user dashboard
    public updateUserDashboard(id : string, viewid : string, openDashboard : boolean) : void {
          var form : string = `
          <form>
          <tabs>
            <tab showlabel="false" verticallayout="true" id="{f28e5c30-b17a-4a25-bcb4-385d26724d68}">
              <labels>
                <label description="Tab" languagecode="1033" />
              </labels>
              <columns>
                <column width="100%">
                  <sections>
                    <section showlabel="false" showbar="false" columns="1111" id="{0e82892d-51a3-440d-a400-aedabe4dd1b7}">
                      <labels>
                        <label description="Section" languagecode="1033" />
                      </labels>
                      <rows>
                        <row>
                          <cell colspan="2" rowspan="33" showlabel="false" id="{ad8eee16-0612-4efc-9cca-16a651eab23e}">
                            <labels>
                              <label description="Component22aad8d" languagecode="1033" />
                            </labels>
                            <control id="WebResource_Component22aad8d" classid="{9FDF5F91-88B1-47f4-AD53-C11EFC01A01D}">
                              <parameters>
                                <Url>caefiss_search.html</Url>
                                <PassParameters>false</PassParameters>
                                <ShowOnMobileClient>false</ShowOnMobileClient>
                                <Security>false</Security>
                                <Scrolling>auto</Scrolling>
                                <Border>true</Border>
                                <WebResourceId>{4889CF47-4BAB-EE11-A569-000D3A09DCA9}</WebResourceId>
                              </parameters>
                            </control>
                          </cell>
                          <cell id="{40d59577-3594-b2c1-4e26-7915aec40093}" showlabel="false"></cell>
                          <cell id="{e718ac26-85aa-e286-98a8-3e9d7539a9be}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{2411a522-dd3a-e0a5-72c1-ec10ac060134}" showlabel="false"></cell>
                          <cell id="{b453290a-8626-6979-459b-cd008400c126}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{367c1da7-86e2-8987-b498-8e8a857e57c7}" showlabel="false"></cell>
                          <cell id="{0d5ea0b0-808c-8d09-6209-5b9de6e54000}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{e97739dd-e285-a27d-32e1-7967a435b96d}" showlabel="false"></cell>
                          <cell id="{5411d986-0eba-95de-449e-1518a28c79c7}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{2096dddd-3c46-96e5-8881-e2dd683260d9}" showlabel="false"></cell>
                          <cell id="{324941a4-3472-b96b-7808-5601907de915}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{c3eb4d63-0788-2e54-5993-ae8c84ce5758}" showlabel="false"></cell>
                          <cell id="{3be28622-a7a7-659a-be8b-92d350aa70a8}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{578321c6-1d91-429b-e3dc-916eb5c61910}" showlabel="false"></cell>
                          <cell id="{804b5ce5-a3b7-26e3-00d3-0914474a12eb}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{70d78699-2219-3c7a-14ca-b6c3ed347353}" showlabel="false"></cell>
                          <cell id="{be084b60-d1ea-9bd8-ceb7-ecd5c43b9062}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{96e11eda-3a44-6dbd-3c92-70cbad6b1691}" showlabel="false"></cell>
                          <cell id="{7e53bd54-6682-9863-e2d4-c101b788a786}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{3187980d-79a7-84a0-ba23-36885018068b}" showlabel="false"></cell>
                          <cell id="{31233742-d229-4484-ce5b-ba1253b02ea3}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{d1bdd0e0-985d-ed7a-81a1-2deadd1ed65b}" showlabel="false"></cell>
                          <cell id="{d97db7a7-28dd-9b65-6d92-a480bc4cc680}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{043a2e56-b7ed-1cc8-0106-9bcc9c57ce24}" showlabel="false"></cell>
                          <cell id="{3834b8a4-76aa-a2d8-86c2-6de098ce7a1c}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{63416754-99be-307c-554e-8d63e0488b2c}" showlabel="false"></cell>
                          <cell id="{4d967d6b-b490-ee46-a57b-5d747eb7cd56}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{2cd2e426-3bcb-08d3-2bd7-0c099bac01a2}" showlabel="false"></cell>
                          <cell id="{91380b64-430d-8312-81ed-e56866002281}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{e238a91e-e1ee-78ca-a6a6-b82b0be463d8}" showlabel="false"></cell>
                          <cell id="{e2574355-c4ad-40a9-7cb0-ca2c21e7e2a8}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{b7de5a82-31e0-478d-7645-6acaa5297124}" showlabel="false"></cell>
                          <cell id="{5a7a504a-3c39-801b-a763-6b3540cc98bd}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{5b2aa4b2-7496-0c55-915b-46222d33d05e}" showlabel="false"></cell>
                          <cell id="{ada8da9d-c0a3-1d05-a02e-e034763ce6ee}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{e0473976-a8e9-532e-0d75-81751c7c94db}" showlabel="false"></cell>
                          <cell id="{c32897ee-7916-9081-5c3e-5d8a6ae5cb6a}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{4a382007-8930-91d5-9264-464b3b57b7c9}" showlabel="false"></cell>
                          <cell id="{2eaeaece-4c0b-4529-817c-3c849a2777e3}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{3a00d6a1-2cbe-036c-e21a-4e2e82827343}" showlabel="false"></cell>
                          <cell id="{b2915983-2908-9a31-0a16-83e943b310b9}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{290c0900-30d0-a15c-1d12-2e774c515c02}" showlabel="false"></cell>
                          <cell id="{dbb4baa7-0174-4c02-406b-a0664769a0ea}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{b459d6b1-21ea-8697-e42e-e88e2b9475cc}" showlabel="false"></cell>
                          <cell id="{54070d49-4c4b-49e1-ad01-c4e2071e6b96}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{7a0220aa-d52d-3d7b-ea2c-5b87cebe59b0}" showlabel="false"></cell>
                          <cell id="{821cc0c0-1d2c-6034-8639-c91500b6a413}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{c3122a6b-7681-446c-4d83-6011795aae9e}" showlabel="false"></cell>
                          <cell id="{475aa829-319c-1566-038c-252a8237e457}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{45c04c98-584d-706d-4724-1415885eeb9e}" showlabel="false"></cell>
                          <cell id="{47a5c07a-90c9-9aea-e7ce-8dae12046e46}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{31152402-6148-31d9-adcb-d37609cc1682}" showlabel="false"></cell>
                          <cell id="{7a6e5358-9153-d9a6-ac5b-c9d98b1d47b2}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{b055d41d-4770-7062-d6c3-547883695e9c}" showlabel="false"></cell>
                          <cell id="{b7e4db28-bb9b-8900-5767-9d4aaeed653e}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{55a9a21a-d717-5563-68dc-e8e13811184c}" showlabel="false"></cell>
                          <cell id="{6e896c40-4741-642e-114a-25930744a5ee}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{b883921d-693e-d193-da7d-d6a45ebc911c}" showlabel="false"></cell>
                          <cell id="{a7b8c457-c23d-746a-5273-46ac3d552edb}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{2bcc4797-8e5e-6c38-99cc-ae6dbe263d20}" showlabel="false"></cell>
                          <cell id="{71da9443-3b30-41a2-13d3-683794bdbc30}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{ba8b2403-3d26-2d92-8a46-095d1883a644}" showlabel="false"></cell>
                          <cell id="{4ca65c40-472b-de0c-7046-a37b46c9e7bd}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{13780675-e482-c55b-a30d-572c01504116}" showlabel="false"></cell>
                          <cell id="{4c26309a-b3e2-3e0a-1a52-d29601ee71dc}" showlabel="false"></cell>
                        </row>
                        <row>
                          <cell id="{36810392-1deb-38cc-980d-7406e364eb8b}" showlabel="false"></cell>
                          <cell id="{734dac42-859e-7157-9656-25b32bd2243e}" showlabel="false"></cell>
                        </row>
                      </rows>
                    </section>
                  </sections>
                </column>
              </columns>
            </tab>
          </tabs>
        </form>`;
  
          var outer = this;
          var record = {
            formxml: form
          }
          
          var req = new XMLHttpRequest();
          req.open("PATCH", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/userforms(${id})`, true);
          req.setRequestHeader("OData-MaxVersion", "4.0");
          req.setRequestHeader("OData-Version", "4.0");
          req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          req.setRequestHeader("Accept", "application/json");
          req.setRequestHeader("Prefer", "odata.include-annotations=*");
          req.onreadystatechange = function () {
            if (this.readyState === 4) {
              req.onreadystatechange = null;
              if (this.status === 204) {
                var uri = req?.getResponseHeader("OData-EntityId") || "";
                var regExp = /\(([^)]+)\)/;
                var matches = regExp?.exec(uri) || [];
                var dashboardId = matches.length > 1 ? matches[1] : "";
                console.log(`User dashboard updated ${dashboardId}`);

                //outer.addAppComponents(newId, viewid);
                //outer.publish(dashboardId);
                outer.setDefaultDashboard(dashboardId, viewid, openDashboard);
          } else {
                console.log(this.responseText);
              }
            }
          };
          req.send(JSON.stringify(record));  
      }
  


    public addAppComponents(dashboardId : string, viewId : string) : void {
        var parameters = {
            AppId: "43248d47-2702-ed11-82e6-000d3af4d17d",
            Components: [{ "@odata.type": "Microsoft.Dynamics.CRM.savedquery", savedqueryid : `${viewId}` }]  
        };
        // { "@odata.type": "Microsoft.Dynamics.CRM.systemform", userformid : `${dashboardId}` }]
        // system form Components: [{ "@odata.type": "Microsoft.Dynamics.CRM.savedquery", savedqueryid : `${viewId}` }, { "@odata.type": "Microsoft.Dynamics.CRM.systemform", formid : `${dashboardId}` }]

        var outer = this;
        var req = new XMLHttpRequest();
        req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/AddAppComponents", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Accept", "application/json");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200 || this.status === 204) {
                    console.log("App components added: Success");

                    //outer.publishView(dashboardId);


                    globalThis.Xrm.Utility.closeProgressIndicator();

                    globalThis.Xrm.Navigation.openUrl(`https://caefiss-sandbox1.crm3.dynamics.com/main.aspx?appid=43248d47-2702-ed11-82e6-000d3af4d17d&pagetype=dashboard&id=${dashboardId}&type=system&_canOverride=true`, null);

                } else {
                    console.log(this.responseText);
                }
            }
        };
        req.send(JSON.stringify(parameters));
    }

    // public publish(dashboardId : string) {
    //     var parameters = {
    //         ParameterXml: `<importexportxml><entities><entity>incident</entity></entities></importexportxml>`
    //     }

    //     var outer = this;
    //     var req = new XMLHttpRequest();
    //     req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/PublishXml", true);
    //     req.setRequestHeader("OData-MaxVersion", "4.0");
    //     req.setRequestHeader("OData-Version", "4.0");
    //     req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    //     req.setRequestHeader("Accept", "application/json");
    //     req.onreadystatechange = function () {
    //         if (this.readyState === 4) {
    //             req.onreadystatechange = null;
    //             if (this.status === 200 || this.status === 204) {
    //                 console.log("Success: view published"); 



    //                 parameters = {
    //                     ParameterXml: `<importexportxml><dashboards><dashboard>${dashboardId}</dashboard></dashboards></importexportxml>`
    //                 }
            
    //                 req = new XMLHttpRequest();
    //                 req.open("POST", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/PublishXml", true);
    //                 req.setRequestHeader("OData-MaxVersion", "4.0");
    //                 req.setRequestHeader("OData-Version", "4.0");
    //                 req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    //                 req.setRequestHeader("Accept", "application/json");
    //                 req.onreadystatechange = function () {
    //                     if (this.readyState === 4) {
    //                         req.onreadystatechange = null;
    //                         if (this.status === 200 || this.status === 204) {
    //                             console.log("Success: dashboard published");

    //                             outer.setDefaultDashboard(dashboardId);
            
    //                         } else {
    //                             console.log("Error: " + this.responseText);
    //                         }
    //                     }
    //                 };
    //                 req.send(JSON.stringify(parameters));


    //             } else {
    //                 console.log("Error: " + this.responseText);
    //             }
    //         }
    //     };
    //     req.send(JSON.stringify(parameters));
    // }


public setDefaultDashboard(dashboardId : string, viewid : string, openDashboard : boolean) : void {
  var userSettings = globalThis.Xrm.Utility.getGlobalContext().userSettings;
  var userId = userSettings.userId;
  userId = userId.replace("{","").replace("}","");
  
  var record = {
    defaultdashboardid: dashboardId
  };




  globalThis.Xrm.Utility.getGlobalContext().getCurrentAppProperties().then(
    function success(app) {

      var req = new XMLHttpRequest();
      req.open("PATCH", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/usersettingscollection(${userId})`, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Prefer", "odata.include-annotations=*");
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          req.onreadystatechange = null;
          if (this.status === 204) {
            console.log("User dashboard default updated");
    
    
            
            globalThis.Xrm.Utility.closeProgressIndicator();
    
            //var hash = Math.floor(Math.random() * 100000000);
    
            if (openDashboard) {                                                                                         
              console.log("Navigate to:  "+`${globalThis.Xrm.Utility.getGlobalContext().getClientUrl()}/main.aspx?appid=${app.appId}&pagetype=dashboard&id=${dashboardId}` + " view="+viewid);
              globalThis.Xrm.Navigation.openUrl(`${globalThis.Xrm.Utility.getGlobalContext().getClientUrl()}/main.aspx?appid=${app.appId}&pagetype=dashboard&id=${dashboardId}`);
            } else {
              console.log("Navigate to:  "+`${globalThis.Xrm.Utility.getGlobalContext().getClientUrl()}/main.aspx?appid=${app.appId}&cmdbar=true&forceUCI=1&navbar=on&pagetype=entitylist&etn=incident&viewid=${viewid}&viewType=4230`);//&x=${hash}`);
              globalThis.Xrm.Navigation.openUrl(`${globalThis.Xrm.Utility.getGlobalContext().getClientUrl()}/main.aspx?appid=${app.appId}&cmdbar=true&forceUCI=1&navbar=on&pagetype=entitylist&etn=incident&viewid=${viewid}&viewType=4230`);//&x=${hash}`);
            }
        
            // //globalThis.Xrm.Page.data.refresh().then(function(){}, function(){});
            // let refresh = <HTMLButtonElement>parent.document.querySelectorAll('[aria-label="Refresh"]')[0];
            // if (refresh) {
            //     refresh.click();
            // }
            //window.location.reload();
            //window.location.reload();
            //globalThis.Xrm.Navigation.openUrl(`https://caefiss-sandbox1.crm3.dynamics.com/main.aspx?appid=43248d47-2702-ed11-82e6-000d3af4d17d&pagetype=dashboard&id=${dashboardId}&type=user`, null);
            //globalThis.Xrm.Navigation.openUrl(`https://caefiss-sandbox1.crm3.dynamics.com/main.aspx?appid=43248d47-2702-ed11-82e6-000d3af4d17d&pagetype=dashboard&id=${dashboardId}&type=user`, null);
          } else {
            console.log(this.responseText);
          }
        }
      };
      req.send(JSON.stringify(record));





    },
    function errorCallback() {
        console.log("Error");
    });




  
}

}
