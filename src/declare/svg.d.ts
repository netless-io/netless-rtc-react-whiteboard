declare module "*.svg" {
    import * as React from "react";
    const content: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
    export default content;
}
