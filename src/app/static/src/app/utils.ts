import * as CryptoJS from 'crypto-js';
import {
    ActionMethod,
    CustomVue,
    mapActions,
    mapGetters,
    mapMutations,
    mapState,
    MutationMethod
} from "vuex";
import {ADRSchemas, DatasetResource, Dict, UploadFile, Version} from "./types";
import {Error, FilterOption, NestedFilterOption, Response} from "./generated";
import moment from 'moment';
import {DynamicFormMeta} from "@reside-ic/vue-dynamic-form";

export type ComputedWithType<T> = () => T;

export const mapStateProp = <S, T>(namespace: string | null, func: (s: S) => T): ComputedWithType<T> => {
    return namespace && (mapState<S>(namespace, {prop: (state: S) => func(state)}) as Dict<ComputedWithType<T>>)["prop"]
        || (mapState<S>({prop: (state: S) => func(state)}) as Dict<ComputedWithType<T>>)["prop"]
};

export const mapStatePropByName = <T>(namespace: string | null, name: string): ComputedWithType<T> => {
    return (namespace && mapState(namespace, [name])[name]) || mapState([name])[name]
};

export const mapStateProps = <S, K extends string>(namespace: string,
                                                   map: Dict<(this: CustomVue, state: S) => any>) => {
    type R = { [key in K]: any }
    return mapState<S>(namespace, map) as R
};

export const mapGetterByName = <T>(namespace: string | null, name: string): ComputedWithType<T> => {
    return (namespace && mapGetters(namespace, [name])[name]) || mapGetters([name])[name]
}

export const mapGettersByNames = <K extends string>(namespace: string, names: string[]) => {
    type R = { [key in K]: any }
    return mapGetters(namespace, names) as R
};

export const mapActionByName = <T>(namespace: string | null, name: string): ActionMethod => {
    return (!!namespace && mapActions(namespace, [name])[name]) || mapActions([name])[name]
};

export const mapActionsByNames = <K extends string>(namespace: string | null, names: string[]) => {
    type R = { [key in K]: any }
    return (!!namespace && mapActions(namespace, names) || mapActions(names)) as R
};

export const mapMutationsByNames = <K extends string>(namespace: string, names: string[]) => {
    type R = { [key in K]: any }
    return mapMutations(namespace, names) as R
};

export const mapMutationByName = <T>(namespace: string | null, name: string): MutationMethod => {
    return (!!namespace && mapMutations(namespace, [name])[name]) || mapMutations([name])[name]
};

export const addCheckSum = (data: string): string => {
    const hash = CryptoJS.MD5(data);
    return JSON.stringify([hash.toString(CryptoJS.enc.Base64), data]);
};

export const verifyCheckSum = (content: string): false | any => {
    const result = JSON.parse(content);
    const hash = result[0];
    const data = result[1];
    const valid = CryptoJS.MD5(data).toString(CryptoJS.enc.Base64) === hash;

    return valid && JSON.parse(data);
};

function isHINTError(object: any): object is Error {
    return typeof object.error == "string"
        && object.details == undefined || typeof object.details == "string"
}

export function isHINTResponse(object: any): object is Response {
    return object && (typeof object.status == "string")
        && (Array.isArray(object.errors))
        && typeof object.data == "object"
        && object.errors.every((e: any) => isHINTError(e))
}

export const freezer = {

    deepFreeze: (data: any): any => {
        if (Array.isArray(data)) {
            return Object.freeze(data.map(d => freezer.deepFreeze(d)))
        }
        if (data != null && typeof data === "object") {
            for (const prop in data) {
                if (Object.prototype.hasOwnProperty.call(data, prop)) {
                    data[prop] = freezer.deepFreeze(data[prop])
                }
            }
            return Object.freeze(data);
        }
        return data;
    }
};

export function prefixNamespace(namespace: string, name: any) {
    return `${namespace}/${name}`
}

export function stripNamespace(name: string) {
    const nameArray = name.split("/");
    if (nameArray.length == 1) {
        return ["root", name];
    } else {
        return nameArray;
    }
}

const flattenToIdArray = (filterOption: NestedFilterOption): string[] => {
    let result: string[] = [];
    result.push(filterOption.id);
    if (filterOption.children) {
        filterOption.children.forEach(o =>
            result = [
                ...result,
                ...flattenToIdArray(o as NestedFilterOption)
            ]);

    }
    return result;
};

export const flattenToIdSet = (ids: string[], lookup: Dict<NestedFilterOption>): Set<string> => {
    let result: string[] = [];
    ids.forEach(r =>
        result = [
            ...result,
            ...flattenToIdArray(lookup[r])
        ]);
    return new Set(result);
};

export const flattenOptions = (filterOptions: NestedFilterOption[]): { [k: string]: NestedFilterOption } => {
    let result = {};
    filterOptions.forEach(r =>
        result = {
            ...result,
            ...flattenOption(r)
        });
    return result;
};

const flattenOption = (filterOption: NestedFilterOption): NestedFilterOption => {
    let result = {} as any;
    result[filterOption.id] = filterOption;
    if (filterOption.children) {
        filterOption.children.forEach(o =>
            result = {
                ...result,
                ...flattenOption(o as NestedFilterOption)
            });

    }
    return result;
};

export const flattenOptionsIdsByHierarchy = (filterOptions: NestedFilterOption[]): string[] => {
    const result: string[] = [];
    const recursive = (filterOptions: NestedFilterOption[]) => {
        // 1. Push ids for the top level of options
        filterOptions.forEach((option: NestedFilterOption) => result.push(option.id));
        let nextLayer: NestedFilterOption[] = [];
        // 2. Get all options at next layer and recurse
        filterOptions.forEach((option: NestedFilterOption) => {
            if (option.children) {
                nextLayer = nextLayer.concat(option.children as NestedFilterOption[]);
            }
        });
        if (nextLayer.length > 0) {
            recursive(nextLayer);
        }
    };
    recursive(filterOptions);
    return result;
};

export const rootOptionChildren = (filterOptions: FilterOption[]) => {
    const rootOption = filterOptions[0];
    return (rootOption && (rootOption as any).children) || [];
};

export const formatDateTime = (isoUTCString: string) => {
    return moment.utc(isoUTCString).local().format('DD/MM/YYYY HH:mm:ss');
};

export const findResource = (datasetWithResources: any, resourceType: string, resourceName?: string | null): DatasetResource | null => {
    let resources = datasetWithResources.resources;

    if (resourceName) {
        resources = resources.filter((r: any) => r.name === resourceName);
    }
    const metadata = resources.find((r: any) => r.resource_type === resourceType);
    return metadata ? {
        id: metadata.id,
        name: metadata.name,
        url: metadata.url,
        lastModified: metadata.last_modified,
        metadataModified: metadata.metadata_modified,
        outOfDate: false} : null
};

export const datasetFromMetadata = (fullMetaData: any, schemas: ADRSchemas, release?: string) => {
    return fullMetaData && {
        id: fullMetaData.id,
        release,
        title: fullMetaData.title,
        url: `${schemas.baseUrl}${fullMetaData.type}/${fullMetaData.name}`,
        resources: {
            pjnz: findResource(fullMetaData, schemas.pjnz),
            shape: findResource(fullMetaData, schemas.shape),
            pop: findResource(fullMetaData, schemas.population),
            survey: findResource(fullMetaData, schemas.survey),
            program: findResource(fullMetaData, schemas.programme),
            anc: findResource(fullMetaData, schemas.anc)
        },
        organization: {
            id: fullMetaData.organization.id
        }
    }
};

export const constructUploadFile = (datasetWithResources: any, index: number, resourceType: string,
                                 resourceFilename: string, displayName: string): UploadFile | null => {
    const resource = findResource(datasetWithResources, resourceType, null);
    // We expect to find resource name on the resource - return null if not found - file should
    // not be uploadable.
    if (resource) {
        const resourceName = resource.name;
        return getUploadFileFromResource(resource, resourceName, index, resourceType, resourceFilename, displayName);
    } else {
        return null;
    }
};

export const constructUploadFileWithResourceName = (datasetWithResources: any, index: number, resourceType: string,
    resourceFilename: string, displayName: string, resourceName: string): UploadFile => {
    const resource = findResource(datasetWithResources, resourceType);
    const name = resource?.name || resourceName;
    return getUploadFileFromResource(resource, name, index, resourceType, resourceFilename, displayName);
};

function getUploadFileFromResource(resource: DatasetResource | null, resourceName: string, index: number,
                                resourceType: string, resourceFilename: string, displayName: string): UploadFile
{
    const resourceId = resource ? resource.id : null;
    const lastModified = resource ? ([resource.lastModified, resource.metadataModified].sort()[1]) : null;
    const resourceUrl = resource ? resource.url : null;

    return {
        index,
        displayName,
        resourceType,
        resourceFilename,
        resourceName,
        resourceId,
        resourceUrl,
        lastModified
    }
}

export const emailRegex = RegExp("^([\\w+-.%]+@[\\w.-]+\\.[A-Za-z]{2,4})(,[\\w+-.%]+@[\\w.-]+\\.[A-Za-z]{2,4})*$")

export const validateEmail = (test: string): boolean => {
    return emailRegex.test(test.replace(/\s*/g, ""))
}

export const versionLabel = (version: Version) => `v${version.versionNumber}`;

export const updateForm = (oldForm: DynamicFormMeta, newForm: DynamicFormMeta): DynamicFormMeta => {
    const selectedOptions = {} as Dict<string | string[] | number | null | undefined>;
    oldForm.controlSections.forEach(oldSection => {
        oldSection.controlGroups.forEach(oldGroup => {
            oldGroup.controls.forEach(oldControl => {
                selectedOptions[oldControl.name] = oldControl.value;
            });
        });
    });

    newForm.controlSections.forEach(newSection => {
        newSection.controlGroups.forEach(newGroup => {
            newGroup.controls.forEach(newControl => {
                if (newControl.name in selectedOptions) {
                    newControl.value = selectedOptions[newControl.name];
                }
            });
        });
    });

    return newForm
};

export function getFilenameFromImportUrl(url: string) {
    return url.split("/").pop()!.split("?")[0];
}

export function getFilenameFromUploadFormData(formdata: FormData) {
    const file = formdata.get("file");
    return (file as File).name;
}

export enum HelpFile {
    french = "https://hivtools.unaids.org/wp-content/uploads/75D-Instructions-pour-Naomi.pdf",
    english = "https://hivtools.unaids.org/wp-content/uploads/75D-Guide-5-Naomi-quick-start.pdf"
}

export const extractErrors = (state: any) => {
    const errors = [] as Error[];
    extractErrorsRecursively(state, errors);
    return errors;
}

const isComplexObject = (state: any) => {
    return typeof state === 'object' && !Array.isArray(state) && state !== null
}

const extractErrorsRecursively = (state: any, errors: Error[]) => {
    if (isComplexObject(state)) {
        const keys = Object.keys(state);
        const errorKeys = keys.filter(key => /error$/i.test(key));
        errors.push(...errorKeys.map(key => state[key]).filter(err => !!err && !!err.error));
        keys.forEach(key => extractErrorsRecursively(state[key], errors));
    }
};
