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
    parentEntityId: string;
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
    checked: EntityInfo;
};

type EntityInfo = {
    name: string;
    field: string;
    alias: string;
    include: boolean;
}

export { SearchTypes, Operation, Condition };
export type { SearchEvent, EntityInfo };
