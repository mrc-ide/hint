export interface Translations {
    age: string,
    ANC: string,
    area: string,
    ART: string,
    apiCouldNotParseError: string,
    apiMissingError: string,
    bar: string,
    back: string,
    browse: string,
    bubble: string,
    cancelEdit: string,
    cancelRun: string,
    chooseFile: string,
    clickHere: string,
    continue: string,
    couldNotParse: string,
    country: string,
    detail: string,
    disaggBy: string,
    discardSteps: string,
    discardWarning: string,
    download: string,
    downloadResults: string,
    downloadSummary: string,
    email: string,
    emailValidation: string,
    enterPassword: string,
    export: string,
    exportOutputs: string,
    file: string,
    filters: string,
    forgottenPassword: string,
    forgottenPasswordHelp: string,
    haveYouSaved: string,
    indicator: string,
    initialisingRun: string,
    invalidPassword: string,
    load: string,
    loadError: string,
    loadFailedErrorDetail: string,
    loadingData: string,
    loadingOptions: string,
    logIn: string,
    logout: string,
    map: string,
    missingError: string,
    modelOptions: string,
    newPassword: string,
    notUsed: string,
    ok: string,
    optionsValid: string,
    password: string,
    passwordValidation: string,
    passwordWasReset: string,
    period: string,
    population: string,
    remove: string,
    reportBug: string,
    requestReset: string,
    resetLinkRequested: string,
    resetTokenInvalid: string,
    reviewOutput: string,
    runComplete: string,
    runModel: string,
    save: string,
    savePrompt: string,
    select: string,
    sessionExpired: string,
    sex: string,
    shape: string,
    survey: string,
    updatePassword: string,
    uploadBaseline: string,
    uploadSurvey: string,
    username: string,
    usernameValidation: string,
    validate: string,
    validating: string,
    xAxis: string
}

const en: Translations = {
    age: "Age",
    ANC: "ANC",
    area: "Area",
    ART: "ART",
    apiCouldNotParseError: "Could not parse API response. Please contact support.",
    apiMissingError: "API response failed but did not contain any error information. Please contact support.",
    bar: "Bar",
    back: "back",
    browse: "Browse",
    bubble: "Bubble Plot",
    cancelEdit: "Cancel editing so I can save my work",
    cancelRun: "Cancel run",
    chooseFile: "Choose a file",
    clickHere: "Click here",
    continue: "continue",
    couldNotParse: "Could not parse API response. Please contact support.",
    country: "Country",
    detail: "Detail",
    disaggBy: "Disaggregate by",
    discardSteps: "Discard these steps and keep editing",
    discardWarning: "Changing this will result in the following steps being discarded:",
    download: "Download",
    downloadResults: "Download results",
    downloadSummary: "Download summary",
    email: "Email address",
    emailValidation: "Please enter a valid email address.",
    enterPassword: "Enter a new password",
    export: "Export",
    exportOutputs: "Export model outputs for Spectrum",
    file: "File",
    filters: "Filters",
    forgottenPassword: "Forgotten your password?",
    forgottenPasswordHelp: "If you've forgotten your password, enter your email address to request a link which you can use to create a new password.",
    haveYouSaved: "Have you saved your work?",
    indicator: "Indicator",
    initialisingRun: "Initialising model run",
    invalidPassword: "Please enter a new password with at least 6 characters.",
    load: "Load",
    loadError: "Load Error",
    loadFailedErrorDetail: "There was a problem loading your data. Some data may have been invalid. Please contact support if this issue persists.",
    loadingData: "Loading your data",
    loadingOptions: "Loading options",
    logIn: "Log In",
    logout: "Logout",
    map: "Map",
    missingError: "API response failed but did not contain any error information. Please contact support.",
    modelOptions: "Model options",
    newPassword: "New password",
    notUsed: "Not used",
    ok: "OK",
    optionsValid: "Options are valid",
    password: "Password",
    passwordValidation: "Please enter your password.",
    passwordWasReset: "Thank you, your password has been updated. Click <a href=\"/\">here</a> to login.",
    period: "Period",
    population: "Population",
    remove: "remove",
    reportBug: "Report a bug",
    requestReset: "Request password reset email",
    resetLinkRequested: "Thank you. If we have an account registered for this email address, you wil receive a password reset link.",
    resetTokenInvalid: "This password reset link is not valid. It may have expired or already been used.\n" +
        "Please request another link <a href=\"/password/forgot-password\">here</a>.",
    reviewOutput: "Review output",
    runComplete: "Model run complete",
    runModel: "Run model",
    save: "Save",
    savePrompt: "You may want to save your work before continuing.",
    select: "Select",
    sessionExpired: "Your session has expired. Please refresh the page and log in again. You can save your work before refreshing.",
    sex: "Sex",
    shape: "Shape file",
    survey: "Survey",
    updatePassword: "Update password",
    uploadBaseline: "Upload baseline data",
    uploadSurvey: "Upload survey and programme data",
    username: "Username",
    usernameValidation: "Please enter your username",
    validate: "Validate",
    validating: "Validating...",
    xAxis: "X Axis"
};

const fr: Partial<Translations> = {
    country: "Pays",
    email: "Adresse e-mail",
    logout: "Déconnexion",
    reportBug: "Envoyer un rapport de bug",
    validate: "Valider"
};

export const locales = {
    en,
    fr
};

export enum Language {en = "en", fr = "fr"}
