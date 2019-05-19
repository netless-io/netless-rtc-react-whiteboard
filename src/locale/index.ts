import {Language, addLocaleData} from "@netless/i18n-react-router";

addLocaleData([
    ...require("react-intl/locale-data/zh"),
    ...require("react-intl/locale-data/en"),
]);

export type Lan = "en" | "zh-CN";

export const language = new Language<Lan>({
    defaultLan: "zh-CN",
    localeDescriptions: {
        "en": require("./en.yml"),
        "zh-CN": require("./zh-CN.yml"),
    },
});
