import {
    filterData,
    genericChartColumnsToFilters,
    numeralJsToD3format
} from "../../../app/components/genericChart/utils";
import {format} from "d3-format";

describe("filterData", () => {
    const data = [
        {"age": 1, "year": 2020, "country": "GB", value: 1},
        {"age": 2, "year": 2020, "country": "GB", value: 2},
        {"age": 1, "year": 2021, "country": "GB", value: 3},
        {"age": 2, "year": 2021, "country": "GB", value: 4},
        {"age": 1, "year": 2020, "country": "FR", value: 5},
        {"age": 2, "year": 2020, "country": "FR", value: 6},
        {"age": 1, "year": 2021, "country": "FR", value: 7},
        {"age": 2, "year": 2021, "country": "FR", value: 8},
        {"age": 2, "year": 2020, "country": "DE", value: 9}
    ];

    it("returns data unchanged for empty filters array", () => {
        const result = filterData(data, [], {});
        expect(result).toStrictEqual(data);
    });

    it("filters data using filters with single, multiple and missing filter options", () => {
        const filters = [
            {id: "age", label: "Age", column_id: "age", allowMultiple: false},
            {id: "year", label: "Year", column_id: "year", allowMultiple: false},
            {id: "country", label: "Country", column_id: "country", allowMultiple: true}
        ] as any;
        const selectedFilterOptions = {
            year: [{id: "2020", label: "2020"}],
            country: [{id: "GB", label: "United Kingdom"}, {id: "FR", label: "France"}]
        };
        const result = filterData(data, filters, selectedFilterOptions);
        expect(result).toStrictEqual([
            {"age": 1, "year": 2020, "country": "GB", value: 1},
            {"age": 2, "year": 2020, "country": "GB", value: 2},
            {"age": 1, "year": 2020, "country": "FR", value: 5},
            {"age": 2, "year": 2020, "country": "FR", value: 6}
        ]);
    });

    it("can filter data which includes nulls", () => {
        const filters = [
            {id: "age", label: "Age", column_id: "age", allowMultiple: false},
            {id: "year", label: "Year", column_id: "year", allowMultiple: false}
        ] as any;
        const dataWithNulls = [
            {"age": null, "year": 2020, "country": "GB", value: 1},
            {"age": 2, "year": 2020, "country": "GB", value: 2},
            {"age": 1, "year": null, "country": "GB", value: 3}
        ];
        const selectedFilterOptions = {
            year: [{id: "2020", label: "2020"}],
            age: [{id: "2", label: "2"}]
        };
        const result = filterData(dataWithNulls, filters, selectedFilterOptions);
        expect(result).toStrictEqual([
            {"age": 2, "year": 2020, "country": "GB", value: 2}
        ]);
    });
});

describe("genericChartColumnsToFilters", () => {
    const columns = [
        {
            id: "year",
            column_id: "year_col",
            label: "Year",
            values: [{id: "2012", label: "Twenty-twelve"}]
        },
        {
            id: "age",
            column_id: "age_col",
            label: "Age group",
            values: [{id: "0:5", label: "0-5"}, {id: "6:10", label: "6-10"}]
        }
    ];

    it("returns expected values when no filterConfig provided", () => {
        const result = genericChartColumnsToFilters(columns, undefined);
        expect(result).toStrictEqual([
            {
                id: "year",
                column_id: "year_col",
                label: "Year",
                options: [{id: "2012", label: "Twenty-twelve"}],
                allowMultiple: false
            },
            {
                id: "age",
                column_id: "age_col",
                label: "Age group",
                options: [{id: "0:5", label: "0-5"}, {id: "6:10", label: "6-10"}],
                allowMultiple: false
            }
        ]);
    });

    it("returns expected values when filterConfig is provided", () => {
        const filterConfig = [
            { id: "year", source: "data", allowMultiple: false},
            { id: "age", source: "data", allowMultiple: true}
        ];
        const result = genericChartColumnsToFilters(columns, filterConfig);
        expect(result).toStrictEqual([
            {
                id: "year",
                column_id: "year_col",
                label: "Year",
                options: [{id: "2012", label: "Twenty-twelve"}],
                allowMultiple: false
            },
            {
                id: "age",
                column_id: "age_col",
                label: "Age group",
                options: [{id: "0:5", label: "0-5"}, {id: "6:10", label: "6-10"}],
                allowMultiple: true
            }
        ]);
    });

    describe("numeralJSToD3Format", () => {
        it("converts numeric formats as expected", () => {
            const testValue = 123.789;

            let result = numeralJsToD3format("0");
            expect(result).toBe(".0f");
            expect(format(result)(testValue)).toBe("124");

            result = numeralJsToD3format("0.0");
            expect(result).toBe(".1f");
            expect(format(result)(testValue)).toBe("123.8");

            result = numeralJsToD3format("0.00");
            expect(result).toBe(".2f");
            expect(format(result)(testValue)).toBe("123.79");
        });

        it("converts percentage formats as expected", () => {
            const testValue = 0.98765;

            let result = numeralJsToD3format("0%");
            expect(result).toBe(".0%");
            expect(format(result)(testValue)).toBe("99%");

            result = numeralJsToD3format("0.0%");
            expect(result).toBe(".1%");
            expect(format(result)(testValue)).toBe("98.8%");

            result = numeralJsToD3format("0.00%");
            expect(result).toBe(".2%");
            expect(format(result)(testValue)).toBe("98.77%");
        });

        it("converts thousand separator formats as expected", () => {
            const testValue = 100000;

            let result = numeralJsToD3format("0,0");
            expect(result).toBe(",");
            expect(format(result)(testValue)).toBe("100,000");
        });

        it("returns empty string for unsupported formats", () => {
            expect(numeralJsToD3format("0.")).toBe("");
            expect(numeralJsToD3format("00")).toBe("");
            expect(numeralJsToD3format(".%")).toBe("");
            expect(numeralJsToD3format("0a")).toBe("");
        });
    });
});
