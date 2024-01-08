  export enum Operation {
    Delete = 1,
    Change
  }

  export enum Condition{
    Equal = 1,
    NotEqual,
    Contains,
    Null,
    On,
    After,
    Between
  }

  export type SearchEvent = {
    entityName: string;
    fieldName: string;
    displayName: string;
    context: Operation;
    condition: Condition;
  }