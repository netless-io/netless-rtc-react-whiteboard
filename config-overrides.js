const tsImportPluginFactory = require("ts-import-plugin");
const {getLoader} = require("react-app-rewired");
const rewireLess = require('react-app-rewire-less');
const rewireYAML = require('react-app-rewire-yaml');
const rewireDefinePlugin = require("react-app-rewire-define-plugin");

module.exports = function override(config, env) {
    config = rewireYAML(config, env);

    const tsLoader = getLoader(
        config.module.rules,
        rule =>
            rule.loader &&
            typeof rule.loader === "string" &&
            rule.loader.includes("ts-loader")
    );

    tsLoader.options = {
        getCustomTransformers: () => ({
            before: [
                tsImportPluginFactory({
                    libraryDirectory: "es",
                    libraryName: "antd",
                    style: true,
                }),
            ],
        })
    };
    config = rewireLess.withLoaderOptions({
        modifyVars: require("./theme").antd,
        javascriptEnabled: true,
    })(config, env);

    config = setupProcessEnv(config, env);

    return config;
};

function setupProcessEnv(config, env) {
    let scope = process.env.SCOPE;
    switch (process.env.SCOPE) {
        case "testing":
        default: {
            scope = "development";
            consoleLambdaOrigin = "https://cloudcapiv4.herewhite.com";
            break;
        }
    }
    config = rewireDefinePlugin(config, env, {
        "process.env.SCOPE": JSON.stringify(scope),
        "process.env.CONSOLE_LAMBDA_ORIGIN": JSON.stringify(consoleLambdaOrigin),
    });
    return config;
}
