import {
    Control,
    DynamicFormMeta,
    MultiSelectControl,
    NumberControl,
    SelectControl
} from "@reside-ic/vue-next-dynamic-form";
import {checkOptionsValid} from "../../app/store/modelOptions/optionsUtils";

const fakeNumber = (value: any) => {
    return {
        label: "Number label",
        name: "id_1",
        type: "number",
        value: value,
        required: false
    } as NumberControl
};

const fakeSelect = (value: any) => {
    return {
        name: "id_2",
        type: "select",
        value: value,
        required: true,
        options: [{id: "opt1", label: "option 1"}, {id: "opt2", label: "option2"}]
    } as SelectControl
};

const fakeMultiSelect = (value: any) => {
    return {
        name: "id_3",
        type: "multiselect",
        value: value,
        required: true,
        options: [{id: "opt1", label: "option 1"}, {id: "opt2", label: "option2"}]
    } as MultiSelectControl
};

const fakeNestedSelect = (value: any) => {
    return {
        name: "id_4",
        required: true,
        type: "select",
        value: value,
        options: [{id: "opt1", label: "option 1", children: [{id: "opt2", label: "child option"}]}]
    } as SelectControl
}

const getForm = (controls: Control[]) => {
    return {
        controlSections: [{
            label: "Test 1",
            controlGroups: [{
                label: "Group 1",
                controls: controls
            }]
        }]
    } as DynamicFormMeta
};

test('can check if select and multiselect controls are valid', () => {
    const validNumber = fakeNumber(2)
    const validSelect = fakeSelect("opt1")
    const validMultiSelect = fakeMultiSelect(["opt1", "opt2"])
    const validFormMeta = getForm([validNumber, validSelect, validMultiSelect])
    expect(checkOptionsValid(validFormMeta)).toStrictEqual(true);

    const invalidSelect = fakeSelect("opt3")
    const invalidMultiSelect = fakeMultiSelect(["opt3", "opt2"])
    const invalidFormMeta = getForm([validNumber, invalidSelect, invalidMultiSelect])

    expect(checkOptionsValid(invalidFormMeta)).toStrictEqual(false);

    const validNestedSelect = fakeNestedSelect("opt2")
    const nestedFormMeta = getForm([validNumber, validSelect, validNestedSelect])

    expect(checkOptionsValid(nestedFormMeta)).toStrictEqual(true);

    const invalidNestedSelect = fakeNestedSelect("opt3")
    const invalidNestedFormMeta = getForm(
        [validNumber, validSelect, invalidNestedSelect])

    expect(checkOptionsValid(invalidNestedFormMeta)).toStrictEqual(false);
})

test('can check if number control is valid', () => {
    const invalidNumber = {
        label: "Number label",
        name: "id_1",
        type: "number",
        value: 100,
        min: 0,
        max: 5,
        required: false
    } as NumberControl
    const validNumber = fakeNumber(100)
    const invalidNumberFormMeta = getForm([validNumber, invalidNumber])

    expect(checkOptionsValid(invalidNumberFormMeta)).toStrictEqual(false);
})

test('marks as invalid if required controls are missing', () => {
    const missingRequired = {
        name: "id_5",
        type: "select",
        required: true,
        options: [{id: "opt1", label: "option 1"}, {id: "opt2", label: "option2"}]
    } as SelectControl

    const nullRequired = {
        name: "id_5",
        type: "select",
        required: true,
        value: null,
        options: [{id: "opt1", label: "option 1"}, {id: "opt2", label: "option2"}]
    } as SelectControl

    const missingRequiredValue = getForm([missingRequired])
    expect(checkOptionsValid(missingRequiredValue)).toStrictEqual(false);

    const nullRequiredValue = getForm([nullRequired])
    expect(checkOptionsValid(nullRequiredValue)).toStrictEqual(false);
})
