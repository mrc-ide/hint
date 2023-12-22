import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import { mockBaselineState, mockModelCalibrateState, mockPlottingSelections } from "../../mocks";
import { AgGridVue } from "ag-grid-vue3";
import TableDisplay from "../../../app/components/outputTable/TableDisplay.vue";

const mockAutoSizeAllColumns = vi.fn();
const mockGetAllGridColumns = vi.fn().mockReturnValue([
    {
        getColId: vi.fn().mockReturnValue("col1"),
        getActualWidth: vi.fn().mockReturnValue(100)
    },
    {
        getColId: vi.fn().mockReturnValue("col2"),
        getActualWidth: vi.fn().mockReturnValue(200)
    }
]);
const mockSizeColumnsToFit = vi.fn();

const mockAGGridEvent = {
    columnApi: {
        autoSizeAllColumns: mockAutoSizeAllColumns,
        getAllGridColumns: mockGetAllGridColumns,
    },
    api: {
        sizeColumnsToFit: mockSizeColumnsToFit
    }
};

const defaultColDef = {
    // Set the default filter type
    filter: 'agNumberColumnFilter',
    // Floating filter adds the dedicated row for filtering at the bottom
    floatingFilter: true,
    // suppressMenu hides the filter menu which showed on the column title
    // this just avoids duplication of filtering UI as we have floating turned on
    // there are some cases where other thing show in the menu but not for our example
    suppressMenu: true,
    // Show an icon when the column is not sorted
    unSortIcon: true,
    // Make column sortable
    sortable: true,
    // Stop the columns from being draggable to rearrange order or remove them
    suppressMovable: true,
    // our auto resize will apply to columns not shown on the screen
    // e.g. if they are off to the side, we wont get auto resize
    // because ag grid does this automatically
    suppressColumnVirtualisation: true
};

const data = [
    {
        label: "Place1",
        lower_colOp1: 9,
        mean_colOp1: 10,
        upper_colOp1: 11,
        lower_colOp2: -1,
        mean_colOp2: 0,
        upper_colOp2: 1,
    },
    {
        label: "Place2",
        lower_colOp1: 4,
        mean_colOp1: 5,
        upper_colOp1: 6,
        lower_colOp2: 14,
        mean_colOp2: 15,
        upper_colOp2: 16,
    }
];

describe("Output Table display table tests", () => {
    const createStore = () => new Vuex.Store({
        getters: {
            ["modelOutput/tableFilters"]: vi.fn().mockReturnValue([{
                column_id: "sex",
                id: "sex"
            }])
        },
        modules: {
            modelCalibrate: {
                namespaced: true,
                state: mockModelCalibrateState({
                    metadata: {
                        tableMetadata: {
                            presets: [
                                {
                                    defaults: {
                                        id: "preset1",
                                        column: {
                                            id: "sex"
                                        },
                                    } as any
                                } as any
                            ]
                        },
                        plottingMetadata: {
                            barchart: {indicators: [], filters: []},
                            choropleth: {indicators: [
                                {
                                    indicator: "pop",
                                    name: "Pop",
                                    format: "%",
                                    scale: 10,
                                    accuracy: null
                                },
                                {
                                    indicator: "pop2",
                                    name: "Pop2"
                                }
                            ] as any, filters: []}
                        },
                        warnings: []
                    }
                })
            },
            plottingSelections: {
                namespaced: true,
                state: mockPlottingSelections({
                    table: {
                        preset: "preset1",
                        indicator: "pop",
                        selectedFilterOptions: {
                            rowFilter: [{id: "rowOp2", label: "rowOption2"}],
                            area: [{id: "place1", label: "Place1"}],
                            age: [{id: "ageOp1", label: "ageOption1"}],
                            sex: [{id: "male", label: "Male"}, {id: "female", label: "Female"}]
                        }
                    }
                })
            },
            baseline: {
                namespaced: true,
                state: mockBaselineState({
                    shape: {
                        data: {
                            features: [
                                {
                                    properties: {
                                        area_id: "place1",
                                        area_name: "Place1"
                                    }
                                },
                                {
                                    properties: {
                                        area_id: "place2",
                                        area_name: "Place2"
                                    }
                                },
                            ],
                        }
                    } as any
                })
            }
        }
    });
    const getWrapper = () => {
        const store = createStore();
        return shallowMount(TableDisplay, {
            props: { data, headerName: "Header" },
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();

        expect(wrapper.findComponent(AgGridVue).props("defaultColDef")).toStrictEqual(defaultColDef);
        expect(wrapper.findComponent(AgGridVue).props("rowData")).toStrictEqual(data);
        const columnDefs = wrapper.findComponent(AgGridVue).props("columnDefs");
        expect(columnDefs.length).toBe(3);
        expect(columnDefs[0]).toStrictEqual({
            field: "label",
            filter: "agTextColumnFilter",
            headerName: "Header",
            pinned: "left"
        });
        expect(columnDefs[1].headerName).toBe("Male");
        expect(columnDefs[2].headerName).toBe("Female");
    });

    it("getValue works as expected", async () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const params = {
            data: {
                mean_male: 2
            }
        };
        expect(vm.getValue("male")(params)).toBe(2);
    });

    it("getFormat works as expected", async () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const params = {
            value: 2,
            data: {
                upper_male: 3,
                lower_male: 1
            }
        };
        expect(vm.getFormat("male")(params)).toBe("200% (100% - 300%)");
    });

    it("onGridReady works as expected", () => {
        const wrapper = getWrapper();
        wrapper.findComponent(AgGridVue).vm.$emit("grid-ready", mockAGGridEvent);
        expect((wrapper.vm as any).gridApi).toStrictEqual(mockAGGridEvent);
        expect(mockAutoSizeAllColumns.mock.calls.length).toBe(1);
        expect(mockGetAllGridColumns.mock.calls.length).toBe(1);
        expect(mockSizeColumnsToFit.mock.calls[0][0]).toStrictEqual({
            columnLimits: [
                {key: "col1", minWidth: 100},
                {key: "col2", minWidth: 200},
            ]
        });
    });

    it("ensures column width on update", () => {
        const wrapper = getWrapper();
        // provide random update
        wrapper.trigger("click");
        expect(mockAutoSizeAllColumns.mock.calls.length).toBe(1);
        expect(mockGetAllGridColumns.mock.calls.length).toBe(1);
        expect(mockSizeColumnsToFit.mock.calls[0][0]).toStrictEqual({
            columnLimits: [
                {key: "col1", minWidth: 100},
                {key: "col2", minWidth: 200},
            ]
        });
    });
});