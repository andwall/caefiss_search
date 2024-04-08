enum SearchTypes {
    Text = "text",
    Date = "date",
    Lookup = "lookup",
    twoOption = "twooption",
    Checkbox = "checkbox",
    Option = "option",
    Number = "number",
    Row = "row"
}

enum SearchEventTypes {
    Text = "search-text-event",
    Date = "search-date-event",
    Lookup = "search-lookup-event",
    Checkbox = "search-checkbox-event",
    Option = "search-option-event",
    Number = "search-number-event",
    Row = "search-row-event",
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
    groupId: string;
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

type OptionSet = {
    key: string;
    value: number;
}

type ComponentType = {
    type: SearchTypes,
    id: string,
    groupId: string | number,
    /* Universal component props */
    displayName: string,
    fieldName: string,
    entityName: string,
    parentEntityName: string,
    parentEntityId: string,
    from: string,
    to: string,
    alias: string,
    isMultiSelect: boolean,
    include: boolean,
    includeLock: boolean
}

export { SearchTypes, SearchEventTypes, Operation, Condition };
export type { SearchEvent, EntityInfo, OptionSet, ComponentType };
