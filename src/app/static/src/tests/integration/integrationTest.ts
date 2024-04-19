import axios, {AxiosRequestConfig} from 'axios';
import {Service} from 'axios-middleware';
import {Language} from "../../app/store/translations/locales";

const FormData = require("form-data");
const service = new Service(axios);

declare let appUrl: string; // configured by jest

export const rootState = {
    language: Language.en,
    metadata: {plottingMetadata: null}
};

export const login = async (username = "test.user@example.com", password = "password") => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await axios.post(appUrl + "callback/formClient",
        formData,
        {
            headers: formData.getHeaders(),
            maxRedirects: 0,
            validateStatus: (status) => status == 303
        });

    const cookie = res.headers["set-cookie"]![0].split(";")[0];

    // Register middleware to pass the session cookie with all requests
    await service.register({
        onRequest(config: AxiosRequestConfig) {
            config.headers!["Cookie"] = cookie;
            return config;
        }
    } as any);

    // GET the homepage to save the session
    await axios.get(appUrl);

};
