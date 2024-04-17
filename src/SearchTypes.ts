enum SearchTypes {
    Text = "text",
    Date = "date",
    Lookup = "lookup",
    Checkbox = "checkbox",
    Option = "option",
    Number = "number"
};

enum SearchEventTypes {
    Text = "search-text-event",
    Date = "search-date-event",
    Lookup = "search-lookup-event",
    Checkbox = "search-checkbox-event",
    Option = "search-option-event",
    Number = "search-number-event",
    Row = "search-row-event",
};

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
    groupId: string | number,
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

/* Defines a components properties */
type ComponentType = {
    id: string,
    type: SearchTypes,
    /* Universal component props */
    groupId: string | number,
    displayName: string,
    fieldName: string,
    entityName: string,
    parentEntityName: string,
    parentEntityId: string,
    from: string,
    to: string,
    alias: string,
    isMultiSelect: string | boolean,
    include: string | boolean,
    includeLock: string | boolean,
    hideDisplayName: string | boolean,
    hideIncludeCheckbox: string | boolean, 
    wrapped: string | boolean 
};

export {SearchTypes, Operation, Condition, SearchEvent, EntityInfo, OptionSet, ComponentType, SearchEventTypes};