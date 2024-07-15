import {emptyState} from "../../app/root";
import Vuex from "vuex";
import Accessibility from "../../app/components/Accessibility.vue"

import registerTranslations from "../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate} from "../testHelpers";
import {actions} from "../../app/store/root/actions";
import {mutations} from "../../app/store/root/mutations";
import {Language} from "../../app/store/translations/locales";
import {nextTick} from "vue";

describe(`accessibility`, () =>{
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
        return mountWithTranslate(Accessibility, store,
            {
                global: {
                    plugins: [store]
                }
            })
    }

    it(`renders accessibility tags as expected`, async () => {
        const rendered = getWrapper()
        const store = rendered.vm.$store;
        const h1 = rendered.find("#accessibility-content")
            .find("h1");

        await expectTranslated(h1, "Accessibility on Naomi", "Accessibilité sur Naomi",
            "Acessibilidade do Naomi", store);

        const h2 = rendered.find("#accessibility-content").findAll("h2")

        await expectTranslated(h2[0],"How accessible the website is", "Accessibilité du site Web",
            "Acessibilidade do sítio web", store);
        await expectTranslated(h2[1], "What we do about known issues", "Traitement des problèmes connus",
            "O que fazemos relativamente aos problemas conhecidos", store);
        await expectTranslated(h2[2], "Technical information about this website’s accessibility",
            "Informations techniques sur l'accessibilité de ce site Web",
            "Informações técnicas sobre a acessibilidade deste sítio web", store);
        await expectTranslated(h2[3], "Reporting accessibility issues", "Signalement des problèmes d’accessibilité",
            "Comunicação de problemas de acessibilidade", store);
        await expectTranslated(h2[4], "Enforcement procedure", "Procédure d'exécution",
            "Procedimento de aplicação", store);
        await expectTranslated(h2[5], "How we test this website", "Comment nous testons ce site Web",
            "De que forma testamos este sítio web", store);
        await expectTranslated(h2[6], "Last updated", "Dernière mise à jour",
            "Última atualização", store);

        const paragraphs = rendered.find("#accessibility-content").findAll("p")
        expect(paragraphs.length).toBe(12)
        await expectTranslated(paragraphs[11],
            "This statement was prepared on 24 February 2021. It was last updated on 26 February 2021.",
            "Cette déclaration a été préparée le 24 février 2021. Elle a été mise à jour pour la dernière fois le 26 février 2021.",
            "Esta comunicação foi elaborada em 24 de fevereiro de 2021. Foi atualizada pela última vez em 26 de fevereiro de 2021.",
            store);
    })

    it(`renders accessibility purpose list tags as expected in French`, async () => {
        const rendered = getWrapper()
        rendered.vm.$store.state.language = Language.fr
        await nextTick();

        const li = rendered.find("#accessibility-content").find("#purpose").findAll("ul li")
        expect(li.length).toBe(3)
        expect(li[0].text()).toBe("Redimensionner votre fenêtre avec le contenu reformaté de manière appropriée")
        expect(li[1].text()).toBe("Ajuster la taille de votre texte sans pour autant que le site ne devienne moins utilisable")
        expect(li[2].text()).toBe("Lire facilement le texte grâce à un contraste suffisant entre les éléments de premier plan et les éléments d’arrière-plan")
    })

    it(`renders accessibility example list tags as expected in French`, async () => {
        const rendered = getWrapper()
        rendered.vm.$store.state.language = Language.fr
        await nextTick();

        const li = rendered.find("#accessibility-content").find("#example").findAll("ul li")
        expect(li.length).toBe(6)
        expect(li[0].text()).toBe("Il se peut qu’il ne soit pas entièrement navigable par le clavier")
        expect(li[1].text()).toBe("Certains graphiques et tableaux peuvent ne pas être interprétés correctement par les lecteurs d’écran")
        expect(li[2].text()).toBe("Certains éléments de formulaire peuvent ne pas comporter de noms ou d’étiquettes de description")
        expect(li[3].text()).toBe("Certaines phrases peuvent ne pas avoir été traduites correctement")
        expect(li[4].text()).toBe("Le contraste de couleurs peut ne pas s’avérer suffisant pour certains éléments de formulaire")
        expect(li[5].text()).toBe("Certaines pages peuvent ne pas offrir la possibilité d’ignorer la navigation et d’accéder directement au contenu")
    })

    it(`renders accessibility purpose list tags as expected in English`, () => {
        const rendered = getWrapper()

        const li = rendered.find("#accessibility-content").find("#purpose").findAll("ul li")
        expect(li.length).toBe(3)
        expect(li[0].text()).toBe("Resize your window with content being reformatted appropriately")
        expect(li[1].text()).toBe("Adjust your text size without the site becoming less usable")
        expect(li[2].text()).toBe("Read text easily due to sufficient contrast between foreground and background elements")
    })

    it(`renders accessibility example list tags as expected in English`, () => {
        const rendered = getWrapper()
        const li = rendered.find("#accessibility-content").find("#example").findAll("ul li")
        expect(li.length).toBe(6)
        expect(li[0].text()).toBe("It may not be entirely navigable by keyboard")
        expect(li[1].text()).toBe("Some charts and tables may not be correctly interpreted by screen readers")
        expect(li[2].text()).toBe("Some form elements may lack descriptive names or labels")
        expect(li[3].text()).toBe("Some sentences may not have been correctly translated")
        expect(li[4].text()).toBe("Some form elements may lack sufficient color contrasts")
        expect(li[5].text()).toBe("Some pages may not have the option to skip navigation and jump to the content")
    })

    it(`renders accessibility purpose list tags as expected in Portuguese`, async () => {
        const rendered = getWrapper()
        rendered.vm.$store.state.language = Language.pt;
        await nextTick();
        const li = rendered.find("#accessibility-content").find("#purpose").findAll("ul li")
        expect(li.length).toBe(3)
        expect(li[0].text()).toBe("Reajustar o tamanho da sua janela e o conteúdo será reformatado em conformidade")
        expect(li[1].text()).toBe("Ajustar o tamanho de letra sem que a página se torne menos funcional")
        expect(li[2].text()).toBe("Ler texto facilmente devido ao contraste suficiente entre o primeiro plano e os elementos de fundo")
    })

    it(`renders accessibility example list tags as expected in Portuguese`, async () => {
        const rendered = getWrapper()
        rendered.vm.$store.state.language = Language.pt;
        await nextTick();
        const li = rendered.find("#accessibility-content").find("#example").findAll("ul li")
        expect(li.length).toBe(6)
        expect(li[0].text()).toBe("Poderá não ser possível navegar a totalidade do sítio web com o teclado")
        expect(li[1].text()).toBe("Alguns quadros e tabelas poderão não ser corretamente interpretados pelos leitores de ecrã")
        expect(li[2].text()).toBe("Alguns elementos de formulário poderão não ter designações descritivas ou etiquetas")
        expect(li[3].text()).toBe("Algumas frases poderão não ter sido corretamente traduzidas")
        expect(li[4].text()).toBe("Alguns elementos de formulário poderão não possuir o contraste de cor suficiente")
        expect(li[5].text()).toBe("Algumas páginas poderão não ter a opção de ignorar um passo e saltar para outro conteúdo")
    })
})
