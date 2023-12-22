// Mock the import of plotly so that we can spy on its exported 'newPlot' method - need to do this
// before importing Plotly
import Vuex from "vuex";

vi.mock("plotly.js-basic-dist", () => ({
    newPlot: vi.fn(),
    react: vi.fn()
}));
import * as plotly from "plotly.js-basic-dist";
import Vue, { nextTick } from "vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import Plotly from "../../../app/components/genericChart/Plotly.vue";
import {PlotColours} from "../../../app/components/genericChart/utils";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../app/root";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";
import {Language} from "../../../app/store/translations/locales";

const chartData = (xval = "date11", yval = 1) => {
    const chartData = {
        data: [
            {
                area_id: "area_1",
                area_hierarchy: "hierarchy11",
                area_level: 4,
                area_name: "name11",
                time_period: xval,
                value: yval
            },
            {
                area_id: "area_1",
                area_hierarchy: "hierarchy12",
                area_level: 4,
                area_name: "name12",
                time_period: "date12",
                value: 2
            },
            {
                area_id: "area_2",
                area_hierarchy: "hierarchy21",
                area_level: 4,
                area_name: "name21",
                time_period: "date21",
                value: 3
            },
            {
                area_id: "area_2",
                area_hierarchy: "hierarchy22",
                area_level: 4,
                area_name: "name22",
                time_period: "date22",
                value: 4
            }
        ]
    };
    return chartData
}

const layoutData = {
    topMargin: 0,
    responsive: true,
    subplots: {
        rows: 2
    }
};

const expectedData = (xval = "date11", yval = 1) => {
    const expectedData = [
        {
            hovertemplate: Array(2).fill("%{x}, %{y}<br>hierarchy11<extra></extra>"),
            line: {color: PlotColours.DEFAULT},
            marker: {
                color: Array(2).fill(PlotColours.DEFAULT),
                line: {
                    color: PlotColours.DEFAULT,
                    width: 0.5
                }
            },
            name: "name11",
            showlegend: false,
            type: "scatter",
            x: [xval, "date12"],
            xaxis: "x1",
            y: [yval, 2],
            yaxis: "y1"
        },
        {
            hovertemplate: Array(2).fill("%{x}, %{y}<br>hierarchy11<extra></extra>"),
            line: {color: PlotColours.LARGE_CHANGE},
            marker: {
                color: Array(2).fill(PlotColours.LARGE_CHANGE),
                line: {
                    color: PlotColours.LARGE_CHANGE,
                    width: 0.5
                }
            },
            name: "name11",
            showlegend: false,
            type: "scatter",
            x: [xval, "date12"],
            xaxis: "x1",
            y: [yval, 2],
            yaxis: "y1"
        },
        {
            hovertemplate: Array(2).fill("%{x}, %{y}<br>hierarchy21<extra></extra>"),
            line: {color: PlotColours.DEFAULT},
            marker: {
                color: Array(2).fill(PlotColours.DEFAULT),
                line: {
                    color: PlotColours.DEFAULT,
                    width: 0.5
                }
            },
            name: "name21",
            showlegend: false,
            type: "scatter",
            x: ["date21", "date22"],
            xaxis: "x2",
            y: [3, 4],
            yaxis: "y2"
        },
        {
            hovertemplate: Array(2).fill("%{x}, %{y}<br>hierarchy21<extra></extra>"),
            line: {color: PlotColours.LARGE_CHANGE},
            marker: {
                color: Array(2).fill(PlotColours.LARGE_CHANGE),
                line: {
                    color: PlotColours.LARGE_CHANGE,
                    width: 0.5
                }
            },
            name: "name21",
            showlegend: false,
            type: "scatter",
            x: ["date21", "date22"],
            xaxis: "x2",
            y: [3, 4],
            yaxis: "y2"
        },
    ] as any;
    return expectedData
}

const expectedLayout = (rows: number, xval = "date11") => {
    const expectedLayout = {
        annotations: [
            {
                showarrow: false,
                text: "name11 (area_1)",
                textfont: {},
                x: 0.5,
                xanchor: "middle",
                xref: "x1 domain",
                y: 1.1,
                yanchor: "middle",
                yref: "y1 domain"
            },
            {
                showarrow: false,
                text: "name21 (area_2)",
                textfont: {},
                x: 0.5,
                xanchor: "middle",
                xref: "x2 domain",
                y: 1.1,
                yanchor: "middle",
                yref: "y2 domain"
            },
        ],
        dragmode: false,
        grid: {
            columns: undefined,
            pattern: "independent",
            rows,
        },
        margin: {
            t: 32,
        },
        xaxis1: {
            autorange: true,
            tickfont: { color: "grey" },
            tickvals: [ xval, "date22" ],
            type: "category",
            zeroline: false
        },
        xaxis2: {
            autorange: true,
            tickfont: { color: "grey" },
            tickvals: [ xval, "date22" ],
            type: "category",
            zeroline: false
        },
        yaxis1: {
            range: [
                -0.2,
                2.2
            ],
            domain: [ NaN, NaN ],
            tickfont: { color: "grey" },
            tickformat: undefined,
            type: "linear",
            zeroline: false
        },
        yaxis2: {
            range: [
                -0.4,
                4.4
            ],
            domain: [ NaN, NaN ],
            tickfont: { color: "grey" },
            tickformat: undefined,
            type: "linear",
            zeroline: false
        },
    } as any
    return expectedLayout
};

const expectedConfig = {
    responsive: false,
    scrollZoom: false,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d']
};

describe("Plotly", () => {
    const mockPlotlyReact = vi.spyOn(plotly, "react");
    const mockPlotlyNewPlot = vi.spyOn(plotly, "newPlot");
    const store = new Vuex.Store({state: emptyState()});
    registerTranslations(store);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const expectPlotlyParams = (plotlyParams: any[], rows = 2) => {
        expect(plotlyParams[0].constructor.name).toBe("HTMLDivElement");
        expect(plotlyParams[1]).toStrictEqual(expectedData());
        expect(plotlyParams[2]).toStrictEqual(expectedLayout(rows));
        expect(plotlyParams[3]).toStrictEqual(expectedConfig);
    };

    it("invokes Plotly on render with expected parameters", (done) => {
        const props = { chartData: chartData(), layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });

        // Rendering flag should be set while rendering proceeds
        expect((wrapper.vm as any).rendering).toBe(true);

        setTimeout(() => {
            expect(mockPlotlyReact.mock.calls.length).toBe(1);
            expectPlotlyParams(mockPlotlyReact.mock.calls[0]);
            expect((wrapper.vm as any).rendering).toBe(false);

            done();
        });
    });

    it("invokes Plotly newPlot when layout subplot rows has changed", async () => {
        const props = { chartData: chartData(), layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        expect(mockPlotlyNewPlot.mock.calls.length).toBe(0);
        await wrapper.setProps({
            chartData: {...chartData()},
            layoutData: {
                ...layoutData,
                subplots: {
                    rows: 3
                }
            }
        });
        // call watcher that would be triggered by layoutData change
        (wrapper.vm as any).$options.watch.layoutData.call({
            ...layoutData,
            subplots: {
                rows: 3
            }
        }, layoutData)
        await nextTick();
        expect(mockPlotlyNewPlot.mock.calls.length).toBe(1);
        expectPlotlyParams(mockPlotlyNewPlot.mock.calls[0], 3);
        expect((wrapper.vm as any).rendering).toBe(false);
    });

    it("invokes plotly again on data change", (done) => {
       const props = { chartData: chartData(), layoutData } as any;
       const wrapper = shallowMount(Plotly, { props, store });

       setTimeout(async () => {
            await wrapper.setProps({
                chartData: chartData("date111", 1.5),
                layoutData
            });

            (wrapper.vm as any).$options.watch.chartData.handler.call(wrapper.vm);
            await nextTick();

            setTimeout(() => {
                expect(mockPlotlyReact.mock.calls.length).toBe(3);
                const plotlyParams = mockPlotlyReact.mock.calls[1];
                expect(plotlyParams[0].constructor.name).toBe("HTMLDivElement");
                expect(plotlyParams[1]).toStrictEqual(expectedData("date111", 1.5));
                expect(plotlyParams[2]).toStrictEqual(expectedLayout(2, "date111"));
                expect(plotlyParams[3]).toStrictEqual(expectedConfig);

                done();
            });
       });
    });

    it("invokes plotly again on layout change", (done) => {
        const props = { chartData: chartData(), layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        setTimeout(async () => {
            await wrapper.setProps({
                chartData: chartData(),
                layoutData: {...layoutData, responsive: false}
            });

            (wrapper.vm as any).$options.watch.layoutData.call(wrapper.vm);
            await nextTick();

            setTimeout(() => {
                expect(mockPlotlyReact.mock.calls.length).toBe(2);
                const plotlyParams = mockPlotlyReact.mock.calls[1];
                expect(plotlyParams[0].constructor.name).toBe("HTMLDivElement");
                expect(plotlyParams[1]).toStrictEqual(expectedData());
                expect(plotlyParams[2]).toStrictEqual(expectedLayout(2));
                expect(plotlyParams[3]).toStrictEqual(expectedConfig);
                done();
            });
        });
    });

    it("does not render loading spinner when rendering flag is false", () => {
        const props = { chartData: chartData(), layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        (wrapper.vm as any).rendering = false;
        expect( wrapper.find("div.text-center").exists()).toBe(false);
        expect((wrapper.find("#chart").element as HTMLElement).style.visibility).toBe("visible");
    });

    it("renders loading spinner when rendering flag is true", async () => {
        const props = { chartData: chartData(), layoutData } as any;
        const wrapper = shallowMountWithTranslate(Plotly, store, { props, global: {plugins: [store]} });
        (wrapper.vm as any).rendering = true;
        await nextTick();
        const spinnerDiv = wrapper.find("div.text-center");
        expect(spinnerDiv.findComponent(LoadingSpinner).props("size")).toBe("lg");
        expect((wrapper.find("#chart").element as HTMLElement).style.visibility).toBe("hidden");
        await expectTranslated(spinnerDiv.find("h2"), "Loading chart",
            "Chargement du graphique", "Carregando o gráfico", store);
    });

    // Test data set for three areas, where number of columns is 2, so 2 rows will be required.
    // Each area has two data points. The first two areas' diff between first and second points violates
    // threshold so these will be highlighted, the third area does not.
    const testChartData = {
        "data": [
            {
                "area_id": "MWI_4_1_demo",
                "area_name": "Chitipa",
                "area_hierarchy": "Northern/Chitipa",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2011 Q4",
                "plot": "art_total",
                "value": 2116,
                "page": 1
            },
            {
                "area_id": "MWI_4_1_demo",
                "area_name": "Chitipa",
                "area_hierarchy": "Northern/Chitipa",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2012 Q4",
                "plot": "art_total",
                "value": 2663,
                "page": 1
            },
            {
                "area_id": "MWI_4_2_demo",
                "area_name": "Karonga",
                "area_hierarchy": "Northern/Karonga",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2011 Q4",
                "plot": "art_total",
                "value": 5673,
                "page": 1
            },
            {
                "area_id": "MWI_4_2_demo",
                "area_name": "Karonga",
                "area_hierarchy": "Northern/Karonga",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2012 Q4",
                "plot": "art_total",
                "value": 7674,
                "page": 1
            },
            {
                "area_id": "MWI_4_3_demo",
                "area_name": "Rumphi",
                "area_hierarchy": "Northern/Rumphi",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2011 Q4",
                "plot": "art_total",
                "value": 4555,
                "page": 1
            },
            {
                "area_id": "MWI_4_3_demo",
                "area_name": "Rumphi",
                "area_hierarchy": "Northern/Rumphi",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2012 Q4",
                "plot": "art_total",
                "value": 4795,
                "page": 1
            },
            {
                "area_id": "MWI_4_4_demo",
                "area_name": "Mzuzu City",
                "area_hierarchy": "Northern/Mzuzu City",
                "area_level": 4,
                "quarter": "Q4",
                "time_period": "2012 Q4",
                "plot": "art_total",
                "value": 1024,
                "page": 1
            }
        ],
        "subplots": {
            "columns": 2,
            "distinctColumn": "area_name",
            "heightPerRow": 100,
            "subplotsPerPage": 99,
            "rows": 2
        },
        "yAxisFormat": ".0f"
    };

    const expectedXAxis = {
        "zeroline": false,
        "tickvals": ["2011 Q4", "2012 Q4"],
        "tickfont": {"color": "grey"},
        "autorange": true,
        "type": "category"
    };

    const expectYAxis = (domainStart: number, domainEnd: number, actual: any) => {
        expect(Object.keys(actual)).toStrictEqual(["zeroline", "tickformat", "tickfont", "domain", "range", "type"]);
        expect(actual.zeroline).toBe(false);
        expect(actual.tickformat).toBe(".0f");
        expect(actual.tickfont).toStrictEqual({"color": "grey"});
        expect(actual.range[0]).toBeLessThan(0);
        expect(actual.range[1]).toBeGreaterThan(2663);
        expect(actual.domain[0]).toBeCloseTo(domainStart, 8);
        expect(actual.domain[1]).toBeCloseTo(domainEnd, 8);
    };

    it("evaluates data as expected", async () => {
        const { data: chartData, ...layoutData } = testChartData
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const data = (await (wrapper.vm as any).getData()).data

        expect(data).toStrictEqual([
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 2663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Chitipa<extra></extra>")
            },
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 2663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": Array(2).fill(PlotColours.LARGE_CHANGE),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Chitipa<extra></extra>")
            },
            {
                "name": "Karonga",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [5673, 7674],
                "xaxis": "x2",
                "yaxis": "y2",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Karonga<extra></extra>")
            },
            {
                "name": "Karonga",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [5673, 7674],
                "xaxis": "x2",
                "yaxis": "y2",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": Array(2).fill(PlotColours.LARGE_CHANGE),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Karonga<extra></extra>")
            },
            {
                "name": "Rumphi",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [4555, 4795],
                "xaxis": "x3",
                "yaxis": "y3",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Rumphi<extra></extra>")
            },
            {
                "name": "Rumphi",
                "showlegend": false,
                "x": [],
                "y": [],
                "xaxis": "x3",
                "yaxis": "y3",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": [],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": []
            },
            {
                "name": "Mzuzu City",
                "showlegend": false,
                "x": ["2012 Q4"],
                "y": [1024],
                "xaxis": "x4",
                "yaxis": "y4",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": [PlotColours.DEFAULT],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": ["%{x}, %{y}<br>Northern/Mzuzu City<extra></extra>"]
            },
            {
                "name": "Mzuzu City",
                "showlegend": false,
                "x": [],
                "y": [],
                "xaxis": "x4",
                "yaxis": "y4",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": [],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": []
            }
        ]);
    });

    it("evaluates top level layout properties as expected", async () => {
        const { data: chartData, ...layoutData } = testChartData
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const layout = (await (wrapper.vm as any).getData()).layout;
        expect(Object.keys(layout)).toStrictEqual([
            "margin", "dragmode", "grid", "annotations",
            "yaxis1", "xaxis1", "yaxis2", "xaxis2", "yaxis3", "xaxis3", "yaxis4", "xaxis4"
        ]);
        expect(layout.margin).toStrictEqual({"t": 32});
        expect(layout.dragmode).toBe(false);
        expect(layout.grid).toStrictEqual({"columns": 2, "rows": 2, "pattern": "independent"});
    });

    it("evaluates layout annotations as expected", async () => {
        const { data: chartData, ...layoutData } = testChartData
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const layout = (await (wrapper.vm as any).getData()).layout;
        expect(JSON.stringify(layout.annotations)).toBe(JSON.stringify([
            {
                "text": "Chitipa (MWI_4_1_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x1 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y1 domain"
            },
            {
                "text": "Karonga (MWI_4_2_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x2 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y2 domain"
            },
            {
                "text": "Rumphi (MWI_4_3_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x3 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y3 domain"
            },
            {
                "text": "Mzuzu City (MWI_4_4_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x4 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y4 domain"
            }
        ]));
    });

    it("evaluates layout axes as expected", async () => {
        const { data: chartData, ...layoutData } = testChartData
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const layout = (await (wrapper.vm as any).getData()).layout;

        expect(layout.xaxis1).toStrictEqual(expectedXAxis);
        expect(layout.xaxis2).toStrictEqual(expectedXAxis);
        expect(layout.xaxis3).toStrictEqual(expectedXAxis);
        expect(layout.xaxis4).toStrictEqual(expectedXAxis);

        expectYAxis(1, 0.7, layout.yaxis1);
        expectYAxis(1, 0.7, layout.yaxis2);
        expectYAxis(0.5, 0.2, layout.yaxis3);
    });

    it("evaluates separate subplots for different areas with identical names", async () => {
        const testData_DuplicateNames =  {
            "data": [
                {
                    "area_id": "MWI_4_1_demo",
                    "area_name": "Chitipa",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2011 Q4",
                    "value": 2116
                },
                {
                    "area_id": "MWI_4_1_demo",
                    "area_name": "Chitipa",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2012 Q4",
                    "value": 2663
                },
                {
                    "area_id": "MWI_4_2_demo",
                    "area_name": "Karonga",
                    "area_hierarchy": "Northern/Karonga",
                    "time_period": "2011 Q4",
                    "value": 5673
                },
                {
                    "area_id": "MWI_4_2_demo",
                    "area_name": "Karonga",
                    "area_hierarchy": "Northern/Karonga",
                    "time_period": "2012 Q4",
                    "value": 7674
                },
                {
                    "area_id": "MWI_4_3_demo",
                    "area_name": "Chitipa",
                    "area_hierarchy": "Southern/Chitipa",
                    "time_period": "2011 Q4",
                    "value": 4555
                },
                {
                    "area_id": "MWI_4_3_demo",
                    "area_name": "Chitipa",
                    "area_hierarchy": "Southern/Chitipa",
                    "time_period": "2012 Q4",
                    "value": 4795
                }
            ],
            "subplots": {
                "columns": 2,
                "distinctColumn": "area_name",
                "heightPerRow": 100,
                "subplotsPerPage": 99,
                "rows": 2
            },
            "yAxisFormat": ".0f"
        };

        const { data: chartData, ...layoutData } = testData_DuplicateNames
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const result = await (wrapper.vm as any).getData();

        expect(result.data).toStrictEqual([
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 2663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Chitipa<extra></extra>")
            },
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 2663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": Array(2).fill(PlotColours.LARGE_CHANGE),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Chitipa<extra></extra>")
            },
            {
                "name": "Karonga",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [5673, 7674],
                "xaxis": "x2",
                "yaxis": "y2",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Karonga<extra></extra>")
            },
            {
                "name": "Karonga",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [5673, 7674],
                "xaxis": "x2",
                "yaxis": "y2",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": Array(2).fill(PlotColours.LARGE_CHANGE),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Northern/Karonga<extra></extra>")
            },
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [4555, 4795],
                "xaxis": "x3",
                "yaxis": "y3",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<br>Southern/Chitipa<extra></extra>")
            },
            {
                "name": "Chitipa",
                "showlegend": false,
                "x": [],
                "y": [],
                "xaxis": "x3",
                "yaxis": "y3",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": [],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": []
            }
        ]);

        const layout = result.layout;
        expect(layout.annotations).toStrictEqual([
            {
                "text": "Chitipa (MWI_4_1_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x1 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y1 domain"
            },
            {
                "text": "Karonga (MWI_4_2_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x2 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y2 domain"
            },
            {
                "text": "Chitipa (MWI_4_3_demo)",
                "textfont": {},
                "showarrow": false,
                "x": 0.5,
                "xanchor": "middle",
                "xref": "x3 domain",
                "y": 1.1,
                "yanchor": "middle",
                "yref": "y3 domain"
            }
        ]);

        expect(layout.xaxis1).toStrictEqual(expectedXAxis);
        expect(layout.xaxis2).toStrictEqual(expectedXAxis);
        expect(layout.xaxis3).toStrictEqual(expectedXAxis);

        expectYAxis(1, 0.7, layout.yaxis1);
        expectYAxis(1, 0.7, layout.yaxis2);
        expectYAxis(0.5, 0.2, layout.yaxis3);
    });

    it("evaluates single-line tooltips for area with null hierarchy", async () => {
        const testData_NullHierarchy = {
            "data": [
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": "Malawi",
                    "area_hierarchy": null,
                    "time_period": "2011 Q4",
                    "value": 2116
                },
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": null,
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2012 Q4",
                    "value": 4663
                }
            ],
            "subplots": {
                "columns": 2,
                "distinctColumn": "area_name",
                "heightPerRow": 100,
                "subplotsPerPage": 99,
                "rows": 2
            },
            "yAxisFormat": ".0f"
        };

        const { data: chartData, ...layoutData } = testData_NullHierarchy
        const props = { chartData: {data: chartData}, layoutData } as any;
        const wrapper = shallowMount(Plotly, { props, store });
        const result = await (wrapper.vm as any).getData();

        expect(result.data).toStrictEqual([
            {
                "name": "Malawi",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 4663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": Array(2).fill(PlotColours.DEFAULT),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<extra></extra>")
            },
            {
                "name": "Malawi",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4"],
                "y": [2116, 4663],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": Array(2).fill(PlotColours.LARGE_CHANGE),
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": Array(2).fill("%{x}, %{y}<extra></extra>")
            }
        ]);
    });

    it("adds tooltip and styling when values are missing", async () => {
        const testData = {
            "data": [
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": "Malawi",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2011 Q4",
                    "value": 2116,
                    "missing_ids": []
                },
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": "Malawi",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2012 Q4",
                    "value": 2116,
                    "missing_ids": ["MWI_1_1_demo"]
                },
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": "Malawi",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2013 Q4",
                    "value": 4663,
                    "missing_ids": ["MWI_1_2_demo", "MWI_1_3_demo"]
                },
                {
                    "area_id": "MWI_1_1_demo",
                    "area_name": "Malawi",
                    "area_hierarchy": "Northern/Chitipa",
                    "time_period": "2014 Q4",
                    "value": 5567,
                    "missing_ids": ["MWI_1_2_demo", "MWI_1_3_demo", "MWI_1_4_demo", "MWI_1_5_demo", "MWI_1_6_demo"]
                }
            ],
            "subplots": {
                "columns": 2,
                "distinctColumn": "area_name",
                "heightPerRow": 100,
                "subplotsPerPage": 99,
                "rows": 2
            },
            "yAxisFormat": ".0f"
        };

        const { data: chartData, ...layoutData } = testData
        const props = { chartData: {data: chartData}, layoutData } as any;
        store.state.language = Language.en;
        const wrapper = shallowMountWithTranslate(Plotly, store, {global: {plugins: [store]}, props});
        const result = await (wrapper.vm as any).getData();

        expect(result.data).toStrictEqual([
            {
                "name": "Malawi",
                "showlegend": false,
                "x": ["2011 Q4", "2012 Q4", "2013 Q4", "2014 Q4"],
                "y": [2116, 2116, 4663, 5567],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.DEFAULT},
                "marker": {
                    "color": [PlotColours.DEFAULT, PlotColours.MISSING, PlotColours.MISSING, PlotColours.MISSING],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.DEFAULT
                    }
                },
                "hovertemplate": [
                    "%{x}, %{y}<br>Northern/Chitipa<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<br>This value is missing from the uploaded data<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<br>Aggregate value missing data for 2 regions<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<br>Aggregate value missing data for 5 regions<extra></extra>"
                ]
            },
            {
                "name": "Malawi",
                "showlegend": false,
                "x": [undefined, "2012 Q4", "2013 Q4", undefined],
                "y": [undefined, 2116, 4663, undefined],
                "xaxis": "x1",
                "yaxis": "y1",
                "type": "scatter",
                "line": {"color": PlotColours.LARGE_CHANGE},
                "marker": {
                    "color": [PlotColours.LARGE_CHANGE, PlotColours.LARGE_CHANGE_MISSING, PlotColours.LARGE_CHANGE_MISSING, PlotColours.LARGE_CHANGE],
                    "line": {
                        "width": 0.5,
                        "color": PlotColours.LARGE_CHANGE
                    }
                },
                "hovertemplate": [
                    "%{x}, %{y}<br>Northern/Chitipa<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<br>This value is missing from the uploaded data<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<br>Aggregate value missing data for 2 regions<extra></extra>",
                    "%{x}, %{y}<br>Northern/Chitipa<extra></extra>"
                ],
            }
        ]);
    });
});
