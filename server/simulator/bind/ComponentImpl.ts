/* eslint-disable no-lonely-if, new-cap, no-continue, no-warning-comments, nonblock-statement-body-position, max-classes-per-file */
import { IComponentSimplified } from "../../model/IComponentSimplified";
import {
    EmployeeTypes, Inventory,
    Item, ItemOrder, ItemPrice, ItemPurchase, ItemSale,
    Machine,
    MachineType,
    DepartmentTypes,
    Time
} from "../model/enterprise";
import { Simulation } from "../engine/engine";

type WrappedTypes =
    Machine
    | MachineType
    | DepartmentTypes
    | EmployeeTypes
    | Item
    | Time
    | Inventory
    | ItemPrice
    | ItemOrder
    | ItemPurchase
    | ItemSale
    ;

// TODO: add undefined
type FieldValuesType = string | number | boolean | null | Object;
const fieldValuesType = ["string", "number", "boolean", "null", "undefined", "object"];
type FieldsType = { [key: string]: FieldValuesType };

function makeFields(obj: Record<string, FieldValuesType>): FieldsType {
    const objectKeys = Object.keys(obj) as Array<string>;
    const newObj: FieldsType = {};
    for (const key of objectKeys) {
        if (key !== "name" && key !== "type_name") {
            if (fieldValuesType.indexOf(typeof obj[key]) !== -1) {
                newObj[key] = obj[key];
            } else {
                newObj["asJSON_" + key] = JSON.stringify(obj[key]);
            }
        }
    }
    return newObj;
}

export class ComponentWrapper<T extends WrappedTypes> implements IComponentSimplified {
    id: string;

    type: string;

    fields: { [key: string]: string | number | boolean | null | Object };

    constructor(
        sim: Simulation,
        wrapped: T
    ) {
        this.id = wrapped.name;
        this.type = wrapped.type_name;

        this.fields = makeFields(wrapped as unknown as Record<string, FieldValuesType>);
    }
}

export class ComponentArrayWrapper<T extends WrappedTypes> implements IComponentSimplified {
    id: string;

    type: string;

    fields: { [key: string]: string | number | boolean | null | Object };

    constructor(
        sim: Simulation,
        id: string,
        array_type_name: string,
        wrapped: T[]
    ) {
        this.id = id;
        this.type = array_type_name;

        this.fields = { 'array': wrapped.map(elem => makeFields(elem as unknown as Record<string, FieldValuesType>)) };
    }
}