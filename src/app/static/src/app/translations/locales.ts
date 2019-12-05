export interface Translations {
    loadingData: string,
    country: string,
    shape: string,
    population: string,
    back: string,
    continue: string,
    uploadBaseline: string,
    uploadSurvey: string,
    modelOptions: string,
    runModel: string,
    reviewOutput: string,
    downloadResults: string,
    file: string,
    save: string,
    load: string,
    reportBug: string,
    logout: string,
    remove: string,
    validating: string,
    chooseFile: string,
    browse: string,
    filters: string,
    select: string,
    notUsed: string,
    area: string,
    sex: string,
    age: string,
    survey: string,
    indicator: string,
    detail: string,
    loadingOptions: string,
    validate: string,
    optionsValid: string,
    initiialisingRun: string,
    runComplete: string,
    period: string,
    xAxis: string,
    disaggBy: string,
    exportOutputs: string,
    export: string,
    downloadSummary: string,
    download: string,
    couldNotParse: string,
    sessionExpired: string,
    missingError: string,
    username: string,
    password: string,
    forgottenPassword: string,
    clickHere: string,
    logIn: string,
    forgottenPasswordHelp: string,
    email: string,
    requestReset: string,
    emailValidation: string,
    passwordValidation: string,
    usernameValidation: string
}

const en: Translations = {
    loadingData: "Loading your data",
    country: "Country",
    shape: "Shape file",
    population: "Population",
    back: "back",
    continue: "continue",
    uploadBaseline: "Upload baseline data",
    uploadSurvey: "Upload survey and programme data",
    modelOptions: "Model options",
    runModel: "Run model",
    reviewOutput: "Review output",
    downloadResults: "Download results",
    file: "File",
    save: "Save",
    load: "Load",
    reportBug: "Report a bug",
    logout: "Logout",
    remove: "remove",
    validating: "Validating",
    chooseFile: "Choose a file",
    browse: "Browse",
    filters: "Filters",
    select: "Select",
    notUsed: "Not used",
    area: "Area",
    sex: "Sex",
    age: "Age",
    survey: "Survey",
    indicator: "Indicator",
    detail: "Detail",
    loadingOptions: "Loading options",
    validate: "Validate",
    optionsValid: "Options are valid",
    initiialisingRun: "Initialising model run",
    runComplete: "Model run complete",
    period: "Period",
    xAxis: "X Axis",
    disaggBy: "Disaggregate by",
    exportOutputs: "Export model outputs for Spectrum",
    export: "Export",
    downloadSummary: "Download summary",
    download: "Download",
    couldNotParse: "Could not parse API response. Please contact support.",
    sessionExpired: "Your session has expired. Please refresh the page and log in again. You can save your work before refreshing.",
    missingError: "API response failed but did not contain any error information. Please contact support.",
    username: "Username",
    password: "Password",
    forgottenPassword: "Forgotten your password?",
    clickHere: "Click here",
    logIn: "Log In",
    forgottenPasswordHelp: "If you've forgotten your password, enter your email address to request a link which you can use to create a new password.",
    email: "Email address",
    requestReset: "Request password reset email",
    emailValidation: "Please enter a valid email address.",
    passwordValidation: "Please enter your password.",
    usernameValidation: "Please enter your username"
};


export const locales = {
    en,
    fr: {
        country: 'Pay',
    }
};
