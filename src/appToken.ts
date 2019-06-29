const config = require("./tokenConfig");

export const netlessToken = {
    sdkToken: config.netlessToken,
};

export const ossConfigObj = {
    accessKeyId: config.ossConfigObj.accessKeyId,
    accessKeySecret: config.ossConfigObj.accessKeySecret,
    region: config.ossConfigObj.region,
    bucket: config.ossConfigObj.bucket,
    folder: config.ossConfigObj.folder,
    prefix: config.ossConfigObj.prefix,
};

export const rtcAppId = {
    agoraAppId: config.agoraAppId,
    restId: "b4e2bc22a89549b2a84969b844258fe3",
    restSecret: "594daac9c32b491795f8cbd27a7d5265",
};
