# hint 3.6.0

* Add new input file "VMMC" for uploading DMPPT2 outputs to add VMMC indicators into datapack download

# hint 3.5.1

* Fix bug where indicator loading would not end because call stack exceeded error in chrome
* Fix bug where projects page would be very slow by removing tooltips

# hint 3.5.0

* Add new table tab to Model Outputs page

# hint 3.4.3

* Add loading components to plots when they fetch indicator slice of data

# hint 3.3.0

* Keep user's language preference outside project state

# hint 2.39.0

* Break calibrate result response into data and metadata

# hint 2.38.1

* Improve Load Failed dialog guidance

# hint 2.38.0

* Include invalid steps in new project version note on rollback

# hint 2.37.2

* Fix Retry load for guest user

# hint 2.37.1

* Fix Input Time Series plots with single values

# hint 2.37.0

* Auth0 single sign on authorization integration 

# hint 2.36.0

* Projects link on invalid state dialog

# hint 2.35.0

* Allow retry on project load fail

# hint 2.34.0

* Change download approach for remaining download files

# hint 2.33.2

* Retain model options when selected dataset is updated data is updated

# hint 2.33.1

* Bug: fix export model outputs download, it fails to prepare file download when logged in as guest user.

# hint 2.33.0

* Add Comparison download ID to generateErrorReport action

# hint 2.32.4

* Capitalise ADR API key buttons
* Align ADR key text with the button text

# hint 2.32.3

* Use UTF-8 encoded properties file to fix issue with malformed special characters in error string

# hint 2.32.2

* fix project load

# hint 2.32.1

* As a user I can see ADR source URL in output zip for input data so I know the source of the files

# hint 2.32.0

* As a user I can download input time series data

# hint 2.31.3

* Styling of ADR key links

# hint 2.31.2

* Make refresh button realtime

# hint 2.31.1

* Setup Playwright and add Browser test for data exploration login

# hint 2.31.0

* turn off rounding in review inputs

# hint 2.30.2

* Fix oauth login method querying existing users

# hint 2.30.1

* Fix spectrum file validation issue.

# hint 2.30.0

* Improve comparison plot usability

# hint 2.29.2

* Fix data exploration mode required files

# hint 2.29.1

* Put load and save json behind feature switch

# hint 2.29.0

* Upload Comparison report to ADR

# hint 2.28.1

* Modify landing page text

# hint 2.28.0

* Link AdrProfileUrl from schema

# hint 2.27.0

* As a user I cannot start multiple model fits in the same session

# hint 2.26.5

* Enable comparison download report

# hint 2.26.4

* yaxis scale is not automatically generating the correct range at low values for some indicators

# hint 2.26.3

* Add link to news site from version number drop down and update styling of version drop down

# hint 2.26.2

* Bug: Comparison barchart error bars display incorrectly

# hint 2.26.1

* Bug: prevent spamming when creating a new project during model

# hint 2.26.0

* Remove fixed disaggregate value from xAxis options in vue-charts

# hint 2.25.0

* Login to data exploration throws an error on redirect

# hint 2.24.0

* Barchart uncertainty ranges (error bars) are greyed out on first rendering

# hint 2.23.0

* Implement no data message in comparison chart

# hint 2.22.0

* Bug: Fix download status errors

# hint 2.21.0

* Speed up display of project rehydrate dialog

# hint 2.20.0

* Add a new login page for displaying Auth0 login button in hint

# hint.2.19.0

* Verify auth0 state for protection against threat of cross-site request forgery 

# hint.18.0

* Update naomi ADR integration to pull 2023 datasets

# hint 2.17.0

* As a user when I login with Auth0 I can see my projects 

# hint 2.16.0

* Include system info in logs

# hint 2.15.0

* Log elapsed time for ADR responses

# hint 2.14.0

* Add Auth0 login method

# hint 2.13.0

* Update hint to work with options schema changes

# hint 2.12.0

* Update backend logging for new log structure

# hint 2.11.2

* Prevent comparison plot data being saved in local storage

# hint 2.11.1

* fix broken request password mailer

# hint 2.11.0

* Table for comparison barchart

# hint 2.10.0

* Display comparison plot error message

# hint 2.9.1

* Bug: HINT login is broken on dev and staging

# hint 2.9.0

* Comparison barchart in review output step

# hint 2.8.0

* Populate model Run Id and calibrate options from project summary

# hint 2.7.3

* Fix guest login issue

# hint 2.7.2

* Change userCLI target to master

# hint 2.7.1

* Fix docker run entrypoint issue and update pac4j

# hint 2.7.0

* Endpoint for comparison barchart dataset

# hint 2.6.0

* Upgrade java, gradle and dependecies  

# hint 2.5.0

* Populate project input file data

# hint 2.4.1

* Rename frontend translation text for enterProjectName and uploadFromZip keys

# hint 2.4.0

* Implement upload output zip UI

# hint 2.3.1

* Remove 'Parsing ADR Response' log messages

# hint 2.3.0

* Upload output zip action which calls hintr endpoint via backend

# hint 2.2.1

* Bug: Fix bug backwards compatibility calibrate options

# hint 2.2.0

* Include project notes in output zip

# hint 2.1.1

* Bug: hint tries to pull resources it does not have access to

# hint 2.1.0

* Use commas as thousands separators for plain numbers in the input time series table

# hint 2.0.0

* HINT to send project state to hintr with generate output zip request

# hint 1.99.4

* Prevent spamming download and meta endpoints after download generate completes

# hint 1.99.3

* Bug fixes- Display and upload output files to ADR if they are available for Upload

# hint 1.99.2

* Input data warnings are not persisted/displayed

# hint 1.99.1

* Bug fix - app timeout when using large dataset before completing a request.

# hint 1.99.0

* Download comparison report

# hint 1.98.0

* Trigger generation of comparison report from front end

# hint 1.97.2

* Bug fixes -Clear current warning before import or upload failure

# hint 1.97.1

* Project history page not persisting language

# hint 1.97.0

* Input Time Series area hierarchy tooltips

# hint 1.96.0

* Display warnings from input validation 

# hint 1.95.1

* Don't remove survey, ANC and ART data if user uploads a new baseline file

# hint 1.95.0

* Show uncertainty ranges in the barchart tool tip

# hint 1.94.0

* Display warnings on review-inputs

# hint 1.93.0

* Improved user experience when downloading results

# hint 1.92.2

* Fix order of nested x-axis disaggregate options in barchart

# hint 1.92.1

* Handle resource with missing download gracefully

# hint 1.92.0

* Show asterisks for required files in both modes

# hint 1.91.0

* add register link to login page

# hint 1.90.4

* Replace 'ART' with 'TARV' in French strings

# hint 1.90.3

* Make hintr warnings dismissable

# hint 1.90.2

* Fix warnings being truncated without 'Show more' visible

# hint 1.90.1

* Bug fix for 'Failed to fetch result' error when reload ModelRun after failed run

# hint 1.90.0

* Link to help documents hosted by UNAIDS

# hint 1.89.2

* Fix throttling of version state uploads

# hint 1.89.1

* Increase async timeouts on server

# hint 1.89.0

* Persist Data Exploration step

# hint 1.88.5

* Remove Calibrate Plot Result from localStorage

# hint 1.88.4

* Remove Projects state from localStorage

# hint 1.88.3

* Use area_id to define unique areas in Input Time Series

# hint 1.88.2

* Output barchart x-axis should remain in correct order after updates

# hint 1.88.1

* Bug: ADR access level incorrectly displayed as 'Read only' on reload

# hint 1.88.0

* Return calibrate_id in error report if it is available

# hint 1.87.1

* Allow Continue as guest in Data Exploration

# hint 1.87.0

* Formatting Input Time Series table values

# hint 1.86.0

* Persist Data Exploration state

# hint 1.85.0

* Input file validation in Data Exploration

# hint 1.84.0

* Data exploration mode error reporting

# hint 1.83.0

* Support y-axis formats in Input Time Series

# hint 1.82.2

* Fix bug which prevented selection change in barchart

# hint 1.82.1

* Fix Input Time Series bug where some lines were shown incorrectly in red

# hint 1.82.0

* Move change Language action to DE stater

# hint 1.81.0

* Add online-support-menu component to DE 

# hint 1.80.0

* Add data exploration header

# hint 1.79.0

* Updating help documentation

# hint 1.78.0

* Paging in Input Time Series

# hint 1.77.0

* validate send error report email field

# hint 1.76.0

* Indicate Data Exploration mode in login screen

# hint 1.75.1

* Update review output plots to use metadata from modelCalibrate

# hint 1.75.0

* Show description for Generic Chart

# hint 1.74.1

* Remove calibration plot when user changes calibration options

# hint 1.74.0

* Add navigation buttons to bottom of every page

# hint 1.73.2

* When importing from ADR remove all datasets currently uploaded

# hint 1.73.1

* fix issues with displaying Input Time Series for DRC data

# hint 1.73.0

* prompt login when using data exploration mode

# hint 1.72.3

* Make time series tooltip usable

# hint 1.72.1

* Troubleshooting request very slow to close the dialog and send multiple errors

# hint 1.72.0

* Add DataExploration app component

# hint 1.71.1

* bug fix for input indicators being included when not relevant for dataset

# hint 1.71.0

* support redirecting to a requested url after a successful login

# hint 1.70.3

* Move error reporting related mutations out of root mutations

# hint 1.70.2

* bug fix for undefined indicator in choropleth while new data is loading

# hint 1.70.1

* correct Portuguese translation for "Steps to reproduce"

# hint 1.70.0

* adds basic data exploration app with loading spinner 

# hint 1.69.0

* Add feedback to error reporting

# hint 1.68.4

* Fix Input Time Series for null values

# hint 1.68.3

* Rename baseline and surveyAndProgram components

# hint 1.68.2

* moves internal logic from plotting selections module to model calibrate module - no visible change

# hint 1.68.1

* Rename "Report issues" to "Troubleshooting request"

# hint 1.68.0

* Add /explore endpoint

# hint 1.67.0

* Component to display warnings from hintr

# hint 1.66.0

* Made Calibration plot visible

# hint 1.65.0

* Output Time Series plots

# hint 1.64.3

* Fix language bug on reload

# hint 1.64.2

* add default placeholder to some error report data

# hint 1.64.1

* Update error report object in backend include version info 

# hint 1.64.0

* Improve error reporting process

# hint 1.63.0

* Display warning alert at bottom of Model Options step

# hint 1.62.1

* ADR upload fails if download attempted while in progress

# hint 1.62.0

* Upload release to ADR epic

# hint 1.61.0

* Include WarningAlert in Stepper

# hint 1.60.0

* Do not poll for ADR dataset updates when using a releaser

# hint 1.59.0

* Do not auto-progress to calibrate step if there are model fit warnings

# hint 1.58.0

* Endpoint for posting error report to Teams

# hint 1.57.1

* accessibility fixes

# hint 1.57.0

* New ADR resources should grant permissions to UNAIDS org

# hint 1.56.3

* fix accessibility issue with buttons on projects page

# hint 1.56.2

* Save warnings from option validation, model fit and model calibration to app state

# hint 1.59.1

* Render filter labels verbatim in output tables, do not attempt to translate

# hint 1.59.0

* Include Back/Continue links at bottom of model options page

# hint 1.58.0

* Refresh output metadata and options when language changes

# hint 1.57.0

* Add tooltips for indicators in Time series chart

# hint 1.56.0

* Remove genericChart dataset when corresponding input file changes

# hint 1.55.0

* Add input Time series chart

* Refresh output metadata and options when language changes

# hint 1.54.0

* Switch Naomi to pull and push to ADR 2022 packager

# hint 1.53.0

* Persist current language in browser storage

# hint 1.52.0

* Show selected release name and preselected in modal

# hint 1.51.0

* Re-fetch all metadata when language changes

# hint 1.50.0

* Move all file upload controls to Step 1

# hint 1.49.1

* Fix erroneous ADR upload file count

# hint 1.49.0

* User can create a new project when enter key event is pressed

# hint 1.48.0

* Use async endpoints for Just-In-time generation of download files from HINT frontend

# hint 1.47.0

* Add Portuguese translations

# hint 1.46.0

* Combine input data tabs

# hint 1.45.0

* Import releases from ADR: fetch and display release data from ADR

# hint 1.44.1

* Import releases from ADR: fetch data from correct ADR release

# hint 1.44.0

* Modify Rename dialog modal and add notes text area

# hint 1.43.1

* Bug fix: Importing from adr after fitting model should prompt new version behaviour

# hint 1.43.0

* Add note icon(s) and dialogs to project history for project/version

# hint 1.42.0

* Make login email case insensitive again

# hint 1.41.0

* Add bar chart to model calibrate page

# hint 1.40.0

* Create an endpoint for model calibrate bar chart

# hint 1.39.0

* Add note text area for copy dialog in project history

# hint 1.38.0

* Support uploading edited input files, behind feature switch for now

# hint 1.37.0

* Add note field to confirmation dialog when saving new version

# hint 1.36.1

* Correctly scope ADR mutations/actions in upload logic

# hint 1.36.0

* Update Project and Version Repository and controllers to implement notes column

# hint 1.35.0

* Roll-back making login email case insensitive (mrc-2210)

# hint 1.34.0

* Clear ADR upload success message where necessary

# hint 1.33.1

* Revert to master branch of hintr

# hint 1.33.0

* Include metadata when pushing file to ADR

# hint 1.32.0

* Avoid re-uploading unchanged files to ADR

# hint 1.31.1

* Rebuild ADR uploadFiles with new resourceIds after upload new files

# hint 1.31.0

* Add accessibility statement

# hint 1.30.0

* Prevent ADR upload of output files from overwriting those from other projects

# hint 1.29.2

* Remove incorrectly committed debug code

# hint 1.29.1

* Improve performance of ADR uploads

# hint 1.29.0

* Progress feedback on uploading files to ADR

# hint 1.28.0

* Check and display user permissions on dataset when dataset is first selected

# hint 1.27.0

* Invoke ADR uploads with actions

# hint 1.26.0

* Set resource_type when pushing to ADR

# hint 1.25.0

* add upload button and dialog box for result outputs to ADR

# hint 1.24.0

* Make login email case insensitive

# hint 1.23.0

* Improved handling of ADR timeouts

# hint 1.22.0

* Check if user has ADR upload permission

# hint 1.21.0

* Backend support for ADR uploads

# hint 1.20.0

* Add output adr schemas

# hint 1.19.0

* validate Survey & Program file on change Baseline file

# hint 1.18.0

* add uncertainty ranges to choropleth tooltips

# hint 1.16.1

* Bug fix: Emails should be case insensitive when sharing a project

# hint 1.16.0

* show project name as default input value when a user clicks rename and copy project link

# hint 1.15.3

* Bug fix: Calibration error not returned to user

# hint 1.15.2

* Update help document to new provided by UNAIDS on 02/02/2021

# hint 1.15.1

* fix download of wrong results set

# hint 1.15.0

* add custom event to open confirmation modal

# hint 1.14.0

* Show indication that a project was shared by someone else underneath project name column

# hint 1.13.2

* Update translations using reviewed strings from UNAIDS

# hint 1.13.1

* Translate 'Select...' in form drop downs and 'required' warning

# hint 1.13.0

* Add indication that a project was shared by someone else

# hint 1.12.3

* prevent users from sharing projects with self or sharing with the same email twice


# hint 1.12.2

* Fix casing in French translation of "Spectrum file"

# hint 1.12.1

* fix reload project post-calibrate

# hint 1.12.0

* adds a map reset button

# hint 1.11.0

* Do model calibration asynchronously.

# hint 1.10.3

* More useful "No data" message on map

# hint 1.10.2

* fix issues with plot legend wrapping

# hint 1.10.1

* Trigger confirm save dialog if subsequent steps have any changes

# hint 1.10.0

* fix ok button accessibility bug in share project

# hint 1.9.0

* make projects endpoint redirect session to login for non-logged in user

# hint 1.8.2

* Update help document

# hint 1.8.1

* bug fix for not been able to recover model run when hintr is torn down

# hint 1.8.1

* fix bug cancel button on share project dialog is broken

* fix cancel button not getting triggered at first when text input has data

# hint 1.8.0

* redirect stale session to login page with session error message


# hint 1.7.2

* Avoid opening links with javascript

# hint 1.7.1

* Update help document resource

# hint 1.7.0

* Update link text & resources

# hint 1.6.3

* Fix bug from `/model/options` which results in hanging spinner


# hint 1.6.2

* Auto advance to next step when run model completes

# hint 1.6.1

* Makes ADR import button red

# hint 1.6.0

* Show spinner when fetching ADR datasets

# hint 1.5.1

* Swap button colours on Save new version confirmation dialog

# hint 1.5.0

* Make 'Download results' step red when advance to that step.

# hint 1.4.0

* Include metadata default scale for bubble size

# hint 1.3.0

* Don't show ADR key to user after it has been entered.

# hint 1.2.1

* Fetch all relevant datasets from ADR without paging

# hint 1.2.0

* Support custom value ranges for bubble plot scales.

# hint 1.1.3

* Display text on map when no data in selections.

# hint 1.1.2

* Fixed bug where bubble plot failed to display bubble for single-value range.

* Fix bug to allow removal of files with errors

# hint 1.1.1
* Fixed bug where bubble plot failed to display bubble for single-value range.

# hint 1.1.0

* Bubble plot size can be scaled by filtered dataset


# hint 1.0.0

* ADR integration
* Table views of input and output data
* Project and version management
* Separation of calibration from model fitting
* Summary reports

# hint 0.0.0

* Initial version of HINT for 2019 workshops.
