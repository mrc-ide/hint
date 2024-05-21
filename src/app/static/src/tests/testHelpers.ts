import {mockAxios, mockBaselineState, mockError, mockFailure, mockRootState} from "./mocks";
import {ActionContext, MutationTree, Store} from "vuex";
import {PayloadWithType, TranslatableState} from "../app/types";
import {DOMWrapper, mount, shallowMount, VueWrapper} from "@vue/test-utils";
import {Language, Translations} from "../app/store/translations/locales";
import registerTranslations from "../app/store/translations/registerTranslations";
import {LanguageMutation} from "../app/store/language/mutations";
import ErrorReport from "../app/components/ErrorReport.vue";
import translate from "../app/directives/translate";
import {nextTick} from "vue";
import {RootState} from "../app/root";
import {Mock} from "vitest";

export function expectEqualsFrozen(args: PayloadWithType<any>, expected: PayloadWithType<any>) {
    expect(Object.isFrozen(args["payload"])).toBe(true);
    expect(args).toStrictEqual(expected);
}

export function testUploadErrorCommitted(url: string,
                                         expectedErrorType: string,
                                         expectedSuccessType: string,
                                         expectedErroredFileType: string,
                                         expectedErroredFilename: string,
                                         formData: any,
                                         action: (store: ActionContext<any, any>, formData: FormData) => void) {

    it(`commits error message when ${url} fails`, async () => {

        mockAxios.onPost(url)
            .reply(500, mockFailure("Something went wrong"));

        const commit = vi.fn();
        const state = mockBaselineState();
        const dispatch = vi.fn();
        const rootState = mockRootState();
        await action({commit, state, dispatch, rootState} as any, formData);

        // first call to clear the data
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: expectedSuccessType,
            payload: null
        });

        // then a call to set the error
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: expectedErrorType,
            payload: mockError("Something went wrong")
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: expectedErroredFileType,
            payload: expectedErroredFilename
        });
    });
}

export function expectAllMutationsDefined(mutationDefinitions: any, mutationTree: MutationTree<any>) {

    const missing: string[] = [];
    Object.keys(mutationDefinitions).forEach(k => {
        const mutationName = mutationDefinitions[k];
        if (!mutationTree[mutationName]) {
            missing.push(mutationName);
        }
    });

    if (missing.length > 0) {
        throw Error(`The following mutations were declared but not defined: ${missing.join(",")}`)
    }
}

export async function expectTranslatedWithStoreType<T extends TranslatableState>(element: DOMWrapper<any>,
                                                                           englishText: string,
                                                                           frenchText: string,
                                                                           portugueseText: string,
                                                                           store: Store<T>,
                                                                           attribute?: string) {
    const value = () => attribute ? element.attributes(attribute) : element.text();
    store.state.language = Language.en;
    registerTranslations(store);
    await nextTick();
    expect(value()).toBe(englishText);

    store.state.language = Language.fr;
    registerTranslations(store);
    await nextTick();
    expect(value()).toBe(frenchText);

    store.state.language = Language.pt;
    registerTranslations(store);
    await nextTick();
    expect(value()).toBe(portugueseText);
}

export const expectTranslated = async (element: DOMWrapper<any>,
                                 englishText: string,
                                 frenchText: string,
                                 portugueseText: string,
                                 store: Store<RootState>,
                                 attribute?: string) =>
    expectTranslatedWithStoreType<RootState>(element, englishText, frenchText, portugueseText, store, attribute);

export const expectHasTranslationKey = (element: DOMWrapper<any>,
                                        mockTranslate: Mock,
                                        translationKey: keyof Translations,
                                        attribute?: string) => {
    const relevantCall = mockTranslate.mock.calls.filter((call) => call[0] === element.element);
    expect(relevantCall.length).toBeGreaterThanOrEqual(1);
    if (attribute) {
        const relevantAttributeCall = relevantCall.filter((call) => call[1].arg === attribute);
        expect(relevantAttributeCall[0][1].value).toBe(translationKey);
    } else {
        expect(relevantCall[0][1].value).toBe(translationKey);
    }
    // const vNode = (element.vm ? element.vm.$vnode : (element as any).vnode) as VNode; // support component and element wrappers
    // const elTranslationKey = vNode.data?.directives?.find(dir => dir.name === "translate" && dir.arg === attribute)?.value;
    // expect(elTranslationKey).toBe(translationKey);
};

export const expectChangeLanguageMutations = (commit: Mock) => {
    expect(commit.mock.calls[0][0]).toStrictEqual({
        type: LanguageMutation.SetUpdatingLanguage,
        payload: true
    });
    expect(commit.mock.calls[1][0]).toStrictEqual({
        type: LanguageMutation.ChangeLanguage,
        payload: "fr"
    });

    expect(commit.mock.calls[2][0]).toStrictEqual({
        type: LanguageMutation.SetUpdatingLanguage,
        payload: false
    });
};

export const expectErrorReportOpen = async (wrapper: VueWrapper<any>, row = 0) => {
    const link = wrapper.findAll(".dropdown-item")[row];
    await link.trigger("click");
    expect(wrapper.findComponent(ErrorReport).props("open")).toBe(true);
}

export function expectArraysEqual(result: any[], expected: any[]) {
    expect(result).toEqual(expect.arrayContaining(expected));
    expect(expected).toEqual(expect.arrayContaining(result));
}

/*
This are functions that let us easily put in the translate directive into mount and shallowMount test
functions. There are ts-ignores as shallowMount/mount require a DefineComponent type as their first
argument however if we replace the C generic type below to "C extends DefineComponent" then we get
typescript errors when we use shallowMountWithTranslate with our normal vue components.

Since this is just for testing, ts-ignore was used for this special case.
*/
// @ts-ignore
export function shallowMountWithTranslate<T extends TranslatableState, C>(component: C, store: Store<T>, options?: any): VueWrapper<InstanceType<C>> {
    // @ts-ignore
    return shallowMount(component, {
        ...options,
        global: {
            ...options?.global,
            directives: {
                ...options?.global?.directives,
                translate: translate(store)
            }
        }
    });
}

// @ts-ignore
export function mountWithTranslate<T extends TranslatableState, C>(component: C, store: Store<T>, options?: any): VueWrapper<InstanceType<C>> {
    // @ts-ignore
    return mount(component, {
        ...options,
        global: {
            ...options?.global,
            directives: {
                ...options?.global?.directives,
                translate: translate(store)
            }
        }
    });
}
