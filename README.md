# netless-agora-react-whiteboard

## 一、前言

1. `netless-react-whiteboard` 是 netless 提供的 web 实践项目，目的是为了让用户更加具象化的了解 netless 白板的功能和场景。
2. 我们采用 react 前端框架，mobx 管理状态，Typescript 作为编程语言的技术选型编写这个项目，目的是让项目更加容易维护和迭代。
3. 我们将项目很多可复用的组件都抽象成了 react 的控件托管在 [netless-io](https://github.com/netless-io) 这个仓库，用户可以参考相关代码或者直接使用组件。我们也非常欢迎指正错误提交 PR.
4. 如有疑问可以发邮件到： rick@herewhite.com

## 二、开发准备

### 1. 概述

1. 云服务 token 获取，要启动这个项目完整的功能需要接入三个类型的云服务。

    - 互动白板
    - 云存储
    - 音视频

    该 demo 使用的是 netless 自研的互动白板，阿里云的云存储，声网的音视频通讯服务作为基础选型。

2. 填写 `appTokenConfig.ts` 文件  

    ``` typescript
    export const netlessToken = "xxx";
    
    export const ossConfigObj = {
        accessKeyId: "xxx",
        accessKeySecret: "xxx",
        region: "oss-cn-xxx",
        bucket: "xxx",
        folder: "xxx",
        prefix: "https://xxx.oss-cn-xxx.aliyuncs.com/",
    };
    
    export const rtcAppId = "xxx";
    ```

### 2. 白板 Token

1. 用途：用于白板的权限管理。
2. 获取方式：
    - 地址：https://console.herewhite.com/zh-CN/
    ![1558157918260](https://ohuuyffq2.qnssl.com/1558157918260.jpg)

3. 填写参数
  
    ```
     export const netlessToken = "xxx";
    ```
4. 如果要体验 `ppt、pptx、word、pdf 转图片` 或者 `pptx 转网页`  服务请去管理控制台先开启对应的服务。

### 3. 云存储 Token

1. 用途：存储互动白板的图片 ppt 等静态资源。
2. 获取方式：
    - 地址：https://oss.console.aliyun.com/overview
    ![1558158253900](https://ohuuyffq2.qnssl.com/1558158253900.jpg)

3. 填写参数
  
    ```
      export const ossConfigObj = {
        accessKeyId: "xxx",
        accessKeySecret: "xxx",
        region: "oss-cn-xxx",
        bucket: "xxx",
        folder: "xxx",
        prefix: "https://xxx.oss-cn-xxx.aliyuncs.com/",
    };
    ```


### 4. 音视频 Token

1. 用途：音视频实时通信。
2. 获取方式：
   - 地址：https://dashboard.agora.io/
    ![1558250731260](https://ohuuyffq2.qnssl.com/1558250731260.png)
3. 填写参数
  
    ```
    export const rtcAppId = "xxx";
    ```
    
### 5. 注意事项

**以上 token 都是用户的核心资产，本项目只是为了方便演示才直接放在项目当中，客户正式商用的时候请妥善保管。**
    
## 三、安装启动

### 1. 基础工具

1. node >= 8
2. 使用 `npm` 或者 `yarn` 管理依赖库。以下都用 `yarn` 命令说明。

### 2. 获取

```shell
git clone git@github.com:netless-io/netless-react-whiteboard.git
```

### 3. 安装

```shell
# 访问目标文件
cd netless-react-whiteboard

# 安装依赖
yarn
```

### 4. 填写配置文件

> 如果前面已经填写，这里不用重复

```typescript
export const netlessToken = "";

export const ossConfigObj = {
    accessKeyId: "",
    accessKeySecret: "",
    region: "",
    bucket: "",
    folder: "",
    prefix: "",
};

export const agoraAppId = "";
```

### 5. 启动

```shell
# 启动项目
yarn start
```

### 6. 构建

```shell
# 构建项目
yarn build
```

### 7. 效果

1. 首页
    ![1558160175316](https://ohuuyffq2.qnssl.com/1558160175316.jpg)

2. 白板
    ![1558160181194](https://ohuuyffq2.qnssl.com/1558160181194.jpg)

## 四、深度使用

1. 文档站

    地址：https://developer.herewhite.com/#/
    
    ![develop-netless-io](https://ohuuyffq2.qnssl.com/develop-netless-io.png)


2. 管理控制台

    地址：https://console.herewhite.com/zh-CN/
    
    ![console-netless-io](https://ohuuyffq2.qnssl.com/console-netless-io.png)

3. 官网

    地址：https://www.herewhite.com/
    
    ![home-netless-io](https://ohuuyffq2.qnssl.com/home-netless-io.png)

4. 开源控件托管

    地址：https://github.com/netless-io
    
    ![netless-io-github](https://ohuuyffq2.qnssl.com/netless-io-github.png)

