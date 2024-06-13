const urlParams = new URLSearchParams(window.location.search);
const modelBugReport = !urlParams.get('modelBugReport');
const modelCalibratePlot = !urlParams.get('modelCalibratePlot');
const comparisonOutput = !urlParams.get('comparisonOutput');
const agywDownload = !urlParams.get('agywDownload');

export const switches = {
    modelBugReport,
    modelCalibratePlot,
    comparisonOutput,
    agywDownload
};
