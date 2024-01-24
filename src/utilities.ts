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


    public getOptionSet(name : string) : object[] {
        var data : object[] = [];

        var req = new XMLHttpRequest();
        req.open("GET", globalThis.Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.2/stringmaps?$select=attributevalue,value&$filter=attributename eq '${name}'`, false);
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
                        var key : string = result["value"];
                        var value : number = result["attributevalue"];
                        data.push(   { key: key, value: value }    );
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





}