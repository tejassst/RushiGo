declare module 'react/jsx-runtime' {
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export function jsxDEV(type: any, props?: any, key?: any): any;
}

declare module 'react-dom/client' {
  type Root = {
    render(node: any): void;
    unmount(): void;
  };
  export function createRoot(container: Element | DocumentFragment): Root;
}
