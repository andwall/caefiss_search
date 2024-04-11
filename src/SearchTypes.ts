enum SearchTypes {
    Text = "text",
    Date = "date",
    Lookup = "lookup",
    Checkbox = "checkbox",
    Option = "option",
    Number = "number"
}

enum Operation {
    Delete = 1,
    Change
};
 
enum Condition {
    Equal = "eq",
    NotEqual = "ne",
    Contains = "like",
    BeginsWith="begins-with",
    EndsWith="ends-with",
    Null = "null",
    NotNull = "not-null",
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
    linkname: string;
    from: string;
    alias: string;
    include: boolean;
    parent: EntityInfo | null;
    to: string;
    children: EntityInfo[];
    filters: Map<string, SearchEvent>;
    attrs: string[];

}

type OptionSet = {
    key: string;
    value: number;
}

export {SearchTypes, Operation, Condition, SearchEvent, EntityInfo, OptionSet};