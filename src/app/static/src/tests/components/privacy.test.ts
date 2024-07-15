import {emptyState} from "../../app/root";
import Vuex from "vuex";
import Privacy from "../../app/components/Privacy.vue"

import registerTranslations from "../../app/store/translations/registerTranslations";
import {expectTranslated, shallowMountWithTranslate} from "../testHelpers";
import {actions} from "../../app/store/root/actions";
import {mutations} from "../../app/store/root/mutations";
import {Language} from "../../app/store/translations/locales";
import {nextTick} from "vue";

describe(`privacy`, () =>{
    const createStore = () => {
        const store = new Vuex.Store({
            state: emptyState(),
            actions: actions,
            mutations: mutations
        });
        registerTranslations(store);
        return store;
    };

    const getWrapper = () => {
        const store = createStore();
        return shallowMountWithTranslate(Privacy, store,
            {
                global: {
                    plugins: [store]
                }
            })
    }

    it(`renders privacy tags as expected`, async () => {
        const rendered = getWrapper()
        const store = rendered.vm.$store;
        const h1 = rendered.find("#privacy-content")
            .find("h1");

        await expectTranslated(h1, "Privacy notice for naomi.unaids.org",
            "Avis de confidentialité pour naomi.unaids.org",
            "Aviso de privacidade para naomi.unaids.org", store);

        const h2 = rendered.find("#privacy-content").findAll("h2")

        await expectTranslated(h2[0],"What do we collect?", "Ce que nous collectons?",
            "O que é que recolhemos?", store);
        await expectTranslated(h2[1], "Information we collect from third parties", "Informations que nous recueillons auprès de tiers",
            "Informação que recolhemos de terceiros", store);
        await expectTranslated(h2[2], "How we use your personal data", "Comment nous utilisons vos données personnelles",
            "Como utilizamos os seus dados pessoais", store);
        await expectTranslated(h2[3], "Where we store your data", "Où nous stockons vos données",
            "Onde guardamos os seus dados", store);
        await expectTranslated(h2[4], "How we keep your data secure", "Comment nous assurons la sécurité de vos données",
            "Como mantemos os seus dados seguros", store);
        await expectTranslated(h2[5], "How long will you use my personal data for?", "Combien de temps utiliserez-vous mes données personnelles?",
            "Por quanto tempo irá utilizar os meus dados pessoais durante?", store);
        await expectTranslated(h2[6], "Disclosing your information", "Divulgation de vos informations",
            "Divulgação da sua informação", store);
        await expectTranslated(h2[7], "Your rights", "Vos droits",
            "Os seus direitos", store);
        await expectTranslated(h2[8], "Links to other websites", "Liens vers d'autres sites web",
            "Ligações a outros sítios Web", store);
    })

    it(`renders privacy preamble list tags as expected`, () => {
        const rendered = getWrapper()

        const li = rendered.find("#privacy-content").find("#preamble").findAll("ul li")
        expect(li.length).toBe(3)
        expect(li[0].text()).toBe("inform you as to how we look after your personal data when you visit our websites;")
        expect(li[1].text()).toBe("tell you about your privacy rights;")
        expect(li[2].text()).toBe("tell you how the law protects you;")
    })

    it(`renders privacy preamble list tags as expected in French`, async () => {
        const rendered = getWrapper()
        rendered.vm.$store.state.language = Language.fr;
        await nextTick();
        const li = rendered.find("#privacy-content").find("#preamble").findAll("ul li")
        expect(li.length).toBe(3)
        expect(li[0].text()).toBe("vous informer sur la manière dont nous traitons vos données personnelles lorsque vous visitez nos sites web;")
        expect(li[1].text()).toBe("vous informer de vos droits en matière de confidentialité;")
        expect(li[2].text()).toBe("vous dire comment la loi vous protège;")
    })
})
