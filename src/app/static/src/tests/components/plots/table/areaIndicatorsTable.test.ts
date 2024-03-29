import AreaIndicatorsTable from "../../../../app/components/plots/table/AreaIndicatorsTable.vue";
import Table from "../../../../app/components/plots/table/Table.vue";
import {testData} from "../testHelpers";
import {mount, shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import {Language} from "../../../../app/store/translations/locales";
import registerTranslations from "../../../../app/store/translations/registerTranslations";
import { mountWithTranslate, shallowMountWithTranslate } from "../../../testHelpers";

const props = {
    ...testData,
    selections: {
        indicatorId: "prevalence",
        detail: 4,
        selectedFilterOptions: {
            age: [{id: "0:15", label: "0-15"}],
            sex: [{id: "female", label: "Female"}],
            area: []
        },
    },
    indicators: [{
        indicator: "prevalence",
        "value_column": "prevalence",
        "indicator_column": "",
        "indicator_value": "",
        "name": "HIV prevalence",
        "min": 0,
        "max": 0.5,
        "colour": "interpolateMagma",
        "invert_scale": true,
        "format": "0.00%",
        "scale": 1
    }],
    tableData: [
        ...testData.chartdata
    ],
    countryAreaFilterOption: {
        id: "MWI", label: "Malawi", children: [
            {"id": "MWI_3_1", "label": "3.1", "children": [{"id": "MWI_4_1", "label": "4.1", "children": []}]},
            {"id": "MWI_3_2", "label": "3.2", "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]}
        ]
    }
};

const createStore = (language: Language = Language.en) => {
    const store = new Vuex.Store({
        state: {language, updatingLanguage: false}
    });
    registerTranslations(store);
    return store as any;
};

const getWrapper = (customPropsData: any = {}, language: Language = Language.en) => {
    const store = createStore(language);
    return shallowMountWithTranslate(AreaIndicatorsTable, store, {
        props: {...props, ...customPropsData},
        global: {
            plugins: [store]
        }
    });
};

describe("areaIndicatorsTable", () => {
    it('renders Table with correct fields', () => {
        const wrapper = getWrapper();
        const table = wrapper.findComponent(Table);

        const expectedFields = [
            {key: "areaLabel", label: "Area", sortable: true, sortByFormatted: true},
            {key: "age", label: "Age", sortable: true, sortByFormatted: true},
            {key: "sex", label: "Sex", sortable: true, sortByFormatted: true},
            {key: "prevalence", label: "HIV prevalence", sortable: true, sortByFormatted: true}
        ];
        expect(table.props("fields")).toStrictEqual(expectedFields);
    });

    it('renders Table with correct fields in French', () => {
        const wrapper = getWrapper({}, Language.fr);
        const table = wrapper.findComponent(Table);

        const expectedFields = [
            {key: "areaLabel", label: "Zone", sortable: true, sortByFormatted: true},
            {key: "age", label: "Âge", sortable: true, sortByFormatted: true},
            {key: "sex", label: "Sexe", sortable: true, sortByFormatted: true},
            {key: "prevalence", label: "HIV prevalence", sortable: true, sortByFormatted: true}
        ];
        expect(table.props("fields")).toStrictEqual(expectedFields);
    });


    it('renders Table with correct fields when translateFilterLabels is false', () => {
        const wrapper = getWrapper({
            translateFilterLabels: false,
            filters: [
                testData.filters[0],
                {
                    id: "age",
                    label: "Age (already translated)",
                    column_id: "age",
                    options: [{id: "0:15", label: "0-15"}, {id: "15:30", label: "15-30"}]
                },
                {
                    id: "sex",
                    label: "Sex (already translated)",
                    column_id: "sex",
                    options: [{id: "female", label: "Female"}, {id: "male", label: "Male"}]
                }
            ]
        });
        const table = wrapper.findComponent(Table);

        const expectedFields = [
            {key: "areaLabel", label: "Area", sortable: true, sortByFormatted: true},
            {key: "age", label: "Age (already translated)", sortable: true, sortByFormatted: true},
            {key: "sex", label: "Sex (already translated)", sortable: true, sortByFormatted: true},
            {key: "prevalence", label: "HIV prevalence", sortable: true, sortByFormatted: true}
        ];
        expect(table.props("fields")).toStrictEqual(expectedFields);
    });

    it('renders Table with correct data', () => {
        const wrapper = getWrapper();
        const table = wrapper.findComponent(Table);

        const expectedFilteredData = [
            {
                areaLabel: "4.1",
                areaHierarchy: "3.1",
                prevalence: "10.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "",
                prevalence_upper: ""
            },
            {
                areaLabel: "4.2",
                areaHierarchy: "3.2",
                prevalence: "20.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "",
                prevalence_upper: ""
            }
        ];
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    it('renders Table with correct data when male selected', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    sex: [{id: "male", label: "Male"}]
                }
            }
        });
        const table = wrapper.findComponent(Table);

        const expectedFilteredData = [
            {
                areaLabel: "4.2",
                areaHierarchy: "3.2",
                prevalence: "10.00%",
                age: "0-15",
                sex: "Male",
                prevalence_lower: "",
                prevalence_upper: ""
            },
            {
                areaLabel: "4.1",
                areaHierarchy: "3.1",
                prevalence: "90.00%",
                age: "0-15",
                sex: "Male",
                prevalence_lower: "",
                prevalence_upper: ""
            }
        ];
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    it('renders Table with correct data when detail set to 3', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                detail: 3,
            }
        });
        const table = wrapper.findComponent(Table);

        const expectedFilteredData = [
            {
                areaLabel: "3.1",
                areaHierarchy: "",
                prevalence: "1.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "1.00%",
                prevalence_upper: "10.00%"
            },
            {
                areaLabel: "3.2",
                areaHierarchy: "",
                prevalence: "0.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "",
                prevalence_upper: ""
            }
        ];
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    it('renders Table correctly when no data are available for selected filters', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    age: [{id: "15:30", label: "15-30"}],
                    sex: [{id: "male", label: "Male"}],
                    area: []
                }
            }
        });
        const table = wrapper.findComponent(Table);
        expect(table.props("filteredData")).toStrictEqual([]);
    });

    it('renders Table data correctly when plhiv indicator is selected', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                indicatorId: "plhiv"
            },
            indicators: [{
                ...props.indicators,
                indicator: "plhiv", value_column: "plhiv", name: "PLHIV", format: "0,0", scale: 10
            }]
        });
        const expectedFilteredData = [
            {
                areaLabel: "4.1",
                areaHierarchy: "3.1",
                plhiv: "100",
                age: "0-15",
                sex: "Female",
                plhiv_lower: "",
                plhiv_upper: ""
            },
            {
                areaLabel: "4.2",
                areaHierarchy: "3.2",
                plhiv: "200",
                age: "0-15",
                sex: "Female",
                plhiv_lower: "",
                plhiv_upper: ""
            }
        ];
        const table = wrapper.findComponent(Table);
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    it('renders Table data correctly when 3.2 is selected only', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{
                        "id": "MWI_3_2",
                        "label": "3.2",
                        "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                    }]
                }
            },
            filters: [
                {
                    ...props.filters[0],
                    options: [
                        {
                            "id": "MWI_3_1",
                            "label": "3.1",
                            "children": [{"id": "MWI_4_1", "label": "4.1", "children": []}]
                        },
                        {
                            "id": "MWI_3_2",
                            "label": "3.2",
                            "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                        }
                    ]
                },
                {...props.filters[1]},
                {...props.filters[2]}
            ]
        });
        const table = wrapper.findComponent(Table);

        const expectedFilteredData = [
            {
                areaLabel: "4.2",
                areaHierarchy: "3.2",
                prevalence: "20.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "",
                prevalence_upper: ""
            }
        ];
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    it('renders Table data correctly when 3.2 is selected only and detail is set to 3', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                detail: 3,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{
                        "id": "MWI_3_2",
                        "label": "3.2",
                        "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                    }]
                }
            },
            filters: [
                {
                    ...props.filters[0],
                    options: [
                        {
                            "id": "MWI_3_1",
                            "label": "3.1",
                            "children": [{"id": "MWI_4_1", "label": "4.1", "children": []}]
                        },
                        {
                            "id": "MWI_3_2",
                            "label": "3.2",
                            "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                        }
                    ]
                },
                {...props.filters[1]},
                {...props.filters[2]}
            ]
        });
        const table = wrapper.findComponent(Table);

        const expectedFilteredData = [
            {
                areaLabel: "3.2",
                areaHierarchy: "",
                prevalence: "0.00%",
                age: "0-15",
                sex: "Female",
                prevalence_lower: "",
                prevalence_upper: ""
            }
        ];
        expect(table.props("filteredData")).toStrictEqual(expectedFilteredData);
    });

    const countryLevelAreaFilter = {
        ...props.filters[0],
        options: [
            {
                id: "MWI", label: "Malawi", children: [
                    {
                        "id": "MWI_3_1",
                        "label": "3.1",
                        "children": [{"id": "MWI_4_1", "label": "4.1", "children": []}]
                    },
                    {
                        "id": "MWI_3_2",
                        "label": "3.2",
                        "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                    }
                ]
            },
        ]
    };
    const tableDataWithCountryValue = [
        ...props.tableData,
        {
            area_id: "MWI", plhiv: 25, prevalence: 0.5, age: "0:15", sex: "female"
        }
    ];

    const expectedCountryLevelData = [
        {
            areaLabel: "Malawi",
            areaHierarchy: undefined,
            prevalence: "50.00%",
            age: "0-15",
            sex: "Female",
            prevalence_lower: "",
            prevalence_upper: ""
        }
    ];

    it('renders Table data correctly when detail set to 0', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                detail: 0
            },
            tableData: tableDataWithCountryValue,
            filters: [
                countryLevelAreaFilter,
                {...props.filters[1]},
                {...props.filters[2]}
            ]
        });
        const table = wrapper.findComponent(Table);

        expect(table.props("filteredData")).toStrictEqual(expectedCountryLevelData);
    });

    it('renders Table with country level data when detail set to null', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                detail: null,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [
                        {
                            id: "MWI", label: "Malawi", children: [
                                {
                                    "id": "MWI_3_1",
                                    "label": "3.1",
                                    "children": [{"id": "MWI_4_1", "label": "4.1", "children": []}]
                                },
                                {
                                    "id": "MWI_3_2",
                                    "label": "3.2",
                                    "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                                }
                            ]
                        }
                    ]
                }
            },
            tableData: tableDataWithCountryValue,
            filters: [
                countryLevelAreaFilter,
                {...props.filters[1]},
                {...props.filters[2]}
            ]
        });
        const table = wrapper.findComponent(Table);

        expect(table.props("filteredData")).toStrictEqual(expectedCountryLevelData);
    });

    it('renders Table with country level data when detail set to 0 but 3.2 is selected', () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                detail: 0,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{
                        "id": "MWI_3_2",
                        "label": "3.2",
                        "children": [{"id": "MWI_4_2", "label": "4.2", "children": []}]
                    }]
                }
            },
            tableData: tableDataWithCountryValue,
            filters: [
                countryLevelAreaFilter,
                {...props.filters[1]},
                {...props.filters[2]}
            ]
        });
        const table = wrapper.findComponent(Table);

        expect(table.props("filteredData")).toStrictEqual(expectedCountryLevelData);
    });

    it('area hierarchy is rendered in child Table component', () => {
        const store = createStore();
        const wrapper = mountWithTranslate(AreaIndicatorsTable, store, {
            global: {
                plugins: [store]
            }, props
        });

        expect(wrapper.findAll('td')[0].findAll("div")[0].text()).toBe('4.1');
        expect(wrapper.findAll('td')[0].find(".small").text()).toBe('3.1');
    });

    it('uncertainty is rendered in child Table component', () => {
        const customPropsData = {
            selections: {
                ...props.selections,
                detail: 3,
            }
        };

        const store = createStore();
        const wrapper = mountWithTranslate(AreaIndicatorsTable, store, {
            global: {
                plugins: [store]
            }, props: {...props, ...customPropsData}
        });

        expect(wrapper.findAll('td')[3].find(".value").text()).toBe('1.00%');
        expect(wrapper.findAll('td')[3].find(".small").text()).toBe('(1.00% – 10.00%)');
    })

    it('render format output props correctly', () => {
        const wrapper = getWrapper({
            roundFormatOutput: false
        });
        expect(wrapper.props("roundFormatOutput")).toBe(false)
    });

    it('render format output props correctly when prop is not specified', () => {
        const wrapper = getWrapper();
        expect(wrapper.props("roundFormatOutput")).toBe(true)
    });
});
