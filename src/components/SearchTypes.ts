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
    Between = "between"
};
 
type SearchEvent = {
    parentEntityName: string;
    to: string;
    entityName: string;
    from: string;
    fieldName: string;
    displayName: string;
    operation: Operation;
    condition: Condition;
    findText: string;
    context: string;
};

type EntityInfo = {
    name: string;
    from: string;
    alias: string;
}

export { Operation, Condition };
export type { SearchEvent, EntityInfo };
