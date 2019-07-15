export class HtmlElementRefContainer {

    private readonly container: {[key: string]: HTMLElement} = {};

    public refCallback(key: string): (ref: HTMLElement | null) => void {
        return ref => {
            if (ref) {
                this.container[key] = ref;
            } else {
                delete this.container[key];
            }
        };
    }

    public hasRef(ref: HTMLElement): boolean {
        for (const key in this.container) {
            if (this.container[key] === ref) {
                return true;
            }
        }
        return false;
    }
}