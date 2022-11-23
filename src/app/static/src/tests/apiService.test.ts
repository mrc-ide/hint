import {api} from "../app/apiService";
import {mockAxios, mockError, mockFailure, mockRootState, mockSuccess} from "./mocks";
import {freezer} from '../app/utils';
import {Language} from "../app/store/translations/locales";

const rootState = mockRootState();

describe("ApiService", () => {

    beforeEach(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as jest.Mock).mockClear();
        (console.warn as jest.Mock).mockClear();
        jest.clearAllMocks();
    });

    const detail = "HTTP error 500, there was a problem processing your request. Please contact support."

    it("console logs error", async () => {
        mockAxios.onGet(`/baseline/`)
            .reply(500, mockFailure("some error message"));

        try {
            await api({commit: jest.fn(), rootState} as any)
                .get("/baseline/")
        } catch (e) {

        }
        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe("No error handler registered for request /baseline/.");
        expect((console.log as jest.Mock).mock.calls[0][0].errors[0].detail)
            .toBe("some error message");
    });

    it("commits the the first error message to errors module by default", async () => {

        mockAxios.onGet(`/unusual/`)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({commit, rootState} as any)
            .get("/unusual/");

        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe("No error handler registered for request /unusual/.");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/ErrorAdded`,
            payload: mockError("some error message")
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    });

    it("if no first error message, commits a default error message to errors module by default", async () => {

        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onGet(`/unusual/`)
            .reply(500, failure);

        const commit = jest.fn();

        await api({commit, rootState} as any)
            .get("/unusual/");

        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe("No error handler registered for request /unusual/.");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/ErrorAdded`,
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: "API response failed but did not contain any error information. Please contact support.",
            }
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    });

    it("commits the first error with the specified type if well formatted", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, mockFailure("some error message"));

        let committedType: any = false;
        let committedPayload: any = false;

        const commit = ({type, payload}: any) => {
            committedType = type;
            committedPayload = payload;
        };

        await api({commit, rootState} as any)
            .withError("TEST_TYPE")
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(committedPayload).toStrictEqual(mockError("some error message"));
    });

    it("commits the error type if the error detail is missing", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, mockFailure(null as any));

        let committedType: any = false;
        let committedPayload: any = false;

        const commit = ({type, payload}: any) => {
            committedType = type;
            committedPayload = payload;
        };

        await api({commit, rootState} as any)
            .withError("TEST_TYPE")
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(committedPayload).toStrictEqual({error: "OTHER_ERROR", detail: null});
    });

    it("can redirect to login when 401 response is received", async () => {
        const realLocation = window.location
        delete window.location;
        window.location = {...window.location, assign: jest.fn()};

        mockAxios.onGet("/baseline/")
            .reply(401, null);
        expect(window.location.assign).not.toHaveBeenCalled()

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .get("/baseline/");

        expect(window.location.assign).toHaveBeenCalledWith("/login?error=SessionExpired" +
            "&message=Your%20session%20has%20expired.%20Please%20log%20in%20again.")

        window.location = realLocation
    });

    it("commits the success response with the specified type", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess(true));

        let committedType: any = false;
        let committedPayload: any = false;
        let committedOptions: any = null;
        const commit = ({type, payload}: any, options?: any) => {
            committedType = type;
            committedPayload = payload;
            committedOptions = options;
        };

        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(committedPayload).toBe(true);
        expect(committedOptions).toBeUndefined();
    });

    it("commits the success response with the specified type with root options", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess(true));

        let committedType: any = false;
        let committedPayload: any = false;
        let committedOptions: any = null;
        const commit = ({type, payload}: any, options?: any) => {
            committedType = type;
            committedPayload = payload;
            committedOptions = options;
        };

        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE", true)
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(committedPayload).toBe(true);
        expect(committedOptions).toStrictEqual({root: true});
    });

    it("commits the error response with the specified type with root options", async () => {
        mockAxios.onGet(`/baseline/`)
            .reply(500, mockFailure("TEST"));

        let committedType: any = false;
        let committedPayload: any = false;
        let committedOptions: any = null;
        const commit = ({type, payload}: any, options?: any) => {
            committedType = type;
            committedPayload = payload;
            committedOptions = options;
        };

        const response = await api({commit, rootState} as any)
            .withError("TEST_TYPE", true)
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(committedPayload.detail).toBe("TEST");
        expect(committedOptions).toStrictEqual({root: true});
    });

    it("returns the response object", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess("TEST"));

        const commit = jest.fn();
        const response = await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get("/baseline/");

        expect(response).toStrictEqual({data: "TEST", errors: [], status: "success"});
    });

    it("deep freezes the response object if requested", async () => {

        const fakeData = {name: "d1"};
        const mockResponse = mockSuccess(fakeData);
        mockAxios.onGet(`/baseline/`)
            .reply(200, mockResponse);

        const spy = jest.spyOn(freezer, "deepFreeze");

        let committedType: any = false;
        let committedPayload: any = false;
        const commit = ({type, payload}: any) => {
            committedType = type;
            committedPayload = payload;
        };

        await api({commit, rootState} as any)
            .freezeResponse()
            .withSuccess("TEST_TYPE")
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(Object.isFrozen(committedPayload)).toBe(true);
        expect(spy).toHaveBeenCalledWith(mockResponse);
    });

    it("does not deep freeze the response object if not requested", async () => {

        const fakeData = {name: "d1"};
        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess(fakeData));

        const spy = jest.spyOn(freezer, "deepFreeze");

        let committedType: any = false;
        let committedPayload: any = false;
        const commit = ({type, payload}: any) => {
            committedType = type;
            committedPayload = payload;
        };

        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get("/baseline/");

        expect(committedType).toBe("TEST_TYPE");
        expect(Object.isFrozen(committedPayload)).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it("throws error if API response is null", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500);

        await expectCouldNotParseAPIResponseError(detail);
    });

    it("can commit error in french if API response is malformed", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, {data: {}, errors: []});

        const detail = "Erreur HTTP 500, il y a eu un problème lors du traitement de votre demande. Veuillez contacter l'assistance."

        await expectCouldNotParseAPIResponseError(detail, Language.fr);
    });

    it("can commit error in Portuguese if API response is malformed", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, {data: {}, errors: []});

        const detail = "Erro HTTP 500, ocorreu um problema ao processar sua solicitação. Entre em contato com o suporte."

        await expectCouldNotParseAPIResponseError(detail, Language.pt);
    });

    it("throws error if API response status is missing", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, {data: {}, errors: []});

        await expectCouldNotParseAPIResponseError(detail);
    });

    it("throws error if API response errors are missing", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, {data: {}, status: "failure"});

        await expectCouldNotParseAPIResponseError(detail);
    });

    it("does nothing on error if ignoreErrors is true", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(500, mockFailure("some error message"));

        await api({commit: jest.fn(), rootState} as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .get("/baseline/");

        expect((console.warn as jest.Mock).mock.calls.length).toBe(0);
    });

    it("warns if error and success handlers are not set", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess(true));

        await api({commit: jest.fn(), rootState} as any)
            .get("/baseline/");

        const warnings = (console.warn as jest.Mock).mock.calls;

        expect(warnings[0][0]).toBe("No error handler registered for request /baseline/.");
        expect(warnings[1][0]).toBe("No success handler registered for request /baseline/.");
    });

    it("passes language header on get", async () => {

        mockAxios.onGet(`/baseline/`)
            .reply(200, mockSuccess(true));

        await api({commit: jest.fn(), rootState} as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .get("/baseline/");

        expect(mockAxios.history.get[0].headers).toStrictEqual({
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en"
        })
    });

    it("passes language header on post", async () => {

        mockAxios.onPost(`/baseline/`)
            .reply(200, mockSuccess(true));

        await api({commit: jest.fn(), rootState} as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .postAndReturn("/baseline/");

        expect(mockAxios.history.post[0].headers).toStrictEqual({
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en",
            "Content-Type": "application/x-www-form-urlencoded"
        })
    });

    async function expectCouldNotParseAPIResponseError(detail: string, lang: Language = Language.en) {
        const commit = jest.fn();
        await api({commit, rootState: {language: lang}} as any)
            .get("/baseline/");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/ErrorAdded`,
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: detail
            }
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    }

});
