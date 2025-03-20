declare module 'html-to-image' {
  export interface HtmlToImageOptions {
    /**
     * Quality of the image, between 0-1
     */
    quality?: number;
    /**
     * Background color, if none is specified in the DOM
     */
    backgroundColor?: string;
    /**
     * Width in pixels to be applied to node before rendering
     */
    width?: number;
    /**
     * Height in pixels to be applied to node before rendering
     */
    height?: number;
    /**
     * Pixel ratio to use for rendering
     */
    pixelRatio?: number;
    /**
     * A string value for the CORS mode to use
     */
    fetchRequestInit?: RequestInit;
    /**
     * A css selector that will be used to filter nodes from the HTML
     */
    filter?: (node: HTMLElement) => boolean;
    /**
     * A flag indicating whether to include CSS rules
     */
    skipAutoScale?: boolean;
    /**
     * CSS font URLs to preload
     */
    fontEmbedCSS?: string;
    /**
     * Set to true to append the current document fonts to the output
     */
    embedFonts?: boolean;
  }

  export function toSvg(node: HTMLElement, options?: HtmlToImageOptions): Promise<string>;
  export function toPng(node: HTMLElement, options?: HtmlToImageOptions): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: HtmlToImageOptions): Promise<string>;
  export function toBlob(node: HTMLElement, options?: HtmlToImageOptions): Promise<Blob>;
  export function toCanvas(node: HTMLElement, options?: HtmlToImageOptions): Promise<HTMLCanvasElement>;
  export function toPixelData(node: HTMLElement, options?: HtmlToImageOptions): Promise<Uint8ClampedArray>;
} 