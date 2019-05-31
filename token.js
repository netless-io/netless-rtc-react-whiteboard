const fs = require("fs");
let config = require("./src/tokenConfig");
const netlessToken = process.env.netlessToken;
const accessKeyId = process.env.accessKeyId;
const accessKeySecret = process.env.accessKeySecret;
const region = process.env.region;
const bucket = process.env.bucket;
const folder = process.env.folder;
const prefix = process.env.prefix;
const agoraAppId = process.env.agoraAppId;

config.netlessToken = netlessToken;
config.agoraAppId = agoraAppId;
config.ossConfigObj = {};
config.ossConfigObj.accessKeyId = accessKeyId;
config.ossConfigObj.accessKeySecret = accessKeySecret;
config.ossConfigObj.bucket = bucket;
config.ossConfigObj.region = region;
config.ossConfigObj.folder = folder;
config.ossConfigObj.prefix = prefix;

fs.writeFileSync("./src/tokenConfig.json", JSON.stringify(config, null, 2));
