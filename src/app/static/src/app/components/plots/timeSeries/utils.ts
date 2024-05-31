import i18next from "i18next";
import { InputTimeSeriesData, InputTimeSeriesRow } from "../../../generated";
import { Dict } from "../../../types";

export function numeralJsToD3format(numeralJsFormat: string) {
    // Convert hintr metadata format (which are numeralJs style) to d3 format to be used by Plotly
    // We currently support only numeric, large number, and percentage formats, and will return 
    // empty string for any other formats received, for default formatting in Plotly.

    // The first part of this regex (before the |) captures formats with decimal precision and optional percentage
    // The second part captures format with thousands separator for large integers
    const regex = /^0(\.0+)?(%)?$|^0(,0)$/; //This will always return four matches

    const match = numeralJsFormat.match(regex);
    if (match === null) {
        return "";
    }

    if (match[3] !== undefined) {
        return ",";
    }

    const decPl = match[1] == undefined ? 0 : match[1].length - 1;
    const percent = match[2] !== undefined;
    const suffix = percent ? "%" : "f";
    return `.${decPl}${suffix}`;
}

export const drawConfig = {
    responsive: false,
    scrollZoom: false,
    modeBarButtonsToRemove: [
        'zoom2d',
        'pan2d',
        'select2d',
        'lasso2d',
        'autoScale2d',
        'resetScale2d',
        'zoomIn2d',
        'zoomOut2d'
    ]
};

export const translate = (word: string, currentLanguage: string, args: any = null) => {
    return i18next.t(word, {...args, lng: currentLanguage})
}

export const getTooltipTemplate = (plotData: (InputTimeSeriesRow | null)[], areaHierarchy: string,
                                   currentLanguage: string) => {
    const hierarchyText = areaHierarchy ? "<br>" + areaHierarchy : "";
    const tooltip = "%{x}, %{y}" + hierarchyText;
    return plotData.map((entry: InputTimeSeriesRow | null) => {
        let missingIdsText = "";
        if (entry?.missing_ids?.length) {
            // If the area ID matches the missing_id then this is a synthetic value we have appended
            // rather than an aggregate with some missing data. Show this with a slightly different
            // message
            if (entry.missing_ids.length == 1 && entry.missing_ids[0] == entry.area_id) {
                missingIdsText = "<br>" + translate("timeSeriesMissingValue", currentLanguage);
            } else {
                missingIdsText = "<br>" + translate("timeSeriesMissingAggregate", currentLanguage,
                    {count: entry.missing_ids.length});
            }
        }
        // Empty <extra></extra> tag removes the part of the hover where trace name is displayed in
        // contrasting colour. See https://plotly.com/python/hover-text-and-formatting/
        return tooltip + missingIdsText + "<extra></extra>";
    })
}

export const PlotColours = Object.freeze({
    HIGHLIGHT: {
        MISSING: "rgb(255,214,214)",
        BASE: "rgb(255, 51, 51)"
    },
    NORMAL: {
        MISSING: "rgb(220,220,220)",
        BASE: "rgb(51, 51, 51)"
    }
});

export const getScatterPoints = (plotData: (InputTimeSeriesRow | null)[], areaData: InputTimeSeriesRow, index: number,
                                 isHighlight: boolean, currentLanguage: string, isFirstPointHighlight = false) => {
    const { area_hierarchy, area_name } = areaData;
    const colours = isHighlight ? PlotColours.HIGHLIGHT : PlotColours.NORMAL;
    const markerFillColors = plotData.map((x, i) => {
        if (isFirstPointHighlight && i === 0) {
            return x?.missing_ids?.length ? PlotColours.HIGHLIGHT.MISSING : PlotColours.HIGHLIGHT.BASE;
        }
        return x?.missing_ids?.length ? colours.MISSING : colours.BASE;
    });
    const markerOutlineColors = plotData.map((_x, i) => {
        return isFirstPointHighlight && i === 0 ? PlotColours.HIGHLIGHT.BASE : colours.BASE;
    });
    const points: any = {
        name: area_name, showlegend: false,
        x: plotData.map(x => x?.time_period),
        y: plotData.map(x => x?.value),
        xaxis: `x${index+1}`, yaxis: `y${index+1}`,
        type: "scatter",
        marker: {
            color: markerFillColors,
            line: { width: 0.5, color: markerOutlineColors },
        },
        line: { color: colours.BASE },
        hovertemplate: getTooltipTemplate(plotData, area_hierarchy, currentLanguage)
    }
    return points
};

type PointInfo = {
    isHighlight: boolean,
    point: InputTimeSeriesRow
};

type LineSegmentsInfo = {
    isHighlight: boolean,
    points: InputTimeSeriesRow[]
};

export const getScatterPointsFromAreaIds = (areaIds: string[], dataByArea: Dict<InputTimeSeriesData>, currentLanguage: string) => {
    return areaIds.reduce((r, id, index) => {
        const areaData = dataByArea[id];
        const pointsInfo: PointInfo[] = [];
        for (let i = 0; i < areaData.length; i++) {
            if (i === areaData.length - 1) {
                pointsInfo.push({isHighlight: pointsInfo.at(-1)!.isHighlight, point: areaData[i]});
                continue;
            }
            const currPointValue = areaData[i].value;
            const nextPointValue = areaData[i + 1].value;
            const isNextLineSegmentHighlighted = !!((currPointValue != null && nextPointValue != null && nextPointValue > 0)
            && (nextPointValue > 1.25 * currPointValue || nextPointValue < 0.75 * currPointValue));
            pointsInfo.push({isHighlight: isNextLineSegmentHighlighted, point: areaData[i]});
        }
        let isPreviousLineHighlight = pointsInfo[0].isHighlight;
        const lineSegmentsInfo: LineSegmentsInfo[] = [{
            isHighlight: isPreviousLineHighlight, points: []
        }];
        for (let i = 0; i < pointsInfo.length; i++) {
            const { isHighlight, point } = pointsInfo[i];
            lineSegmentsInfo.at(-1)!.points.push(point);
            if (isHighlight !== isPreviousLineHighlight) {
                lineSegmentsInfo.push({ isHighlight, points: [point] });
            }
            isPreviousLineHighlight = isHighlight;
        }
        const colouredLines = lineSegmentsInfo.map(({isHighlight, points}, lineNum) => {
            if (isHighlight) return getScatterPoints(points, areaData[0], index, true, currentLanguage);
            // Need to make sure that the first point in a non highlighted segment is red following a highlighted
            // segment. In the case lineNum = 0, prevHighlight will be false anyway so our special case won't
            // be triggered
            const prevHighlight = lineSegmentsInfo[Math.max(lineNum - 1, 0)].isHighlight;
            return getScatterPoints(points, areaData[0], index, false, currentLanguage, prevHighlight);
        });
        return [...r, ...colouredLines];
    }, [] as any[]);
};

export type Layout = Record<string, any>

export const getLayoutFromData = (areaIds: string[], dataByArea: Dict<InputTimeSeriesData>,
                                  layout: Layout, chartData: InputTimeSeriesData) => {
    const baseLayout: Record<string, any> = {
        margin: {t: 32}, dragmode: false,
        grid: {
            columns: layout.subplots.columns,
            rows: layout.subplots.rows,
            pattern: 'independent',
            xgap: 0.25, ygap: 0.4
        },
        annotations: areaIds.map((id, index) => {
            return {
                x: 0.5, y: 1.1,
                xanchor: "middle", yanchor: "middle",
                xref: `x${index+1} domain`, yref: `y${index+1} domain`,
                text: `${dataByArea[id][0].area_name} (${id})`,
                showarrow: false, textfont: {}
            }
        })
    };

    const subPlotHeight = 1 / (layout.subplots?.rows || 1) * 0.6;
    const timePeriods = chartData.map(dataPoint => dataPoint.time_period).sort() || [];
    const firstXAxisVal = timePeriods[0];
    const lastXAxisVal = timePeriods[timePeriods.length - 1];

    for (let i = 0; i < areaIds.length; i++) {
        const row = Math.floor(i / layout.subplots.columns);
        const maxOfData = Math.max(...dataByArea[areaIds[i]].map(d => d.value || 0));
        const yStart = 1 - (row / layout.subplots.rows);
        baseLayout[`yaxis${i + 1}`] = {
            zeroline: false,
            tickformat: layout.yAxisFormat,
            tickfont: { color: "grey" },
            domain: [yStart, yStart - subPlotHeight],
            range: [-maxOfData * 0.1, maxOfData * 1.1],
            type: "linear"
        };
        baseLayout[`xaxis${i + 1}`] = {
            zeroline: false,
            tickvals: [firstXAxisVal, lastXAxisVal],
            tickfont: { color: "grey" },
            autorange: true,
            type: "category"
        };
    }
    return baseLayout;
}
