enum SearchTypes {
    Text = "text",
    Date = "date",
    Lookup = "lookup",
    twoOption = "twooption"
}


enum Operation {
    Delete = 1,
    Change
};
 
enum Condition {
    Equal = "eq",
    NotEqual = "ne",
    Contains = "contains",
    BeginsWith="begins-with",
    EndsWith="ends-with",
    Null = "null",
    On = "on",
    After = "on-or-after",
    Between = "between",
    In = "in",
    NotIn = "not-in"
};
 
type SearchEvent = {
    type: SearchTypes;
    parentEntityName: string;
    to: string;
    entityName: string;
    from: string;
    fieldName: string;
    displayName: string;
    operation: Operation;
    condition: Condition;
    findText: string;
    option1: string;
    option2: string;
    context: string;
};

type EntityInfo = {
    name: string;
    from: string;
    alias: string;
}

export {SearchTypes, Operation, Condition, SearchEvent, EntityInfo};