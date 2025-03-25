declare module 'feather-icons' {
  export interface FeatherIcon {
    name: string;
    contents: string;
    tags: string[];
    attrs: {
      [key: string]: string;
    };
    toSvg(attrs?: { [key: string]: string | number }): string;
  }

  export interface FeatherIcons {
    icons: {
      [key: string]: FeatherIcon;
    };
    
    /**
     * Get the contents of an icon
     */
    icons: { [key: string]: FeatherIcon };
    
    /**
     * Create an SVG string
     */
    toSvg(name: string, attrs?: { [key: string]: string | number }): string;
    
    /**
     * Replace all HTML elements that have a `data-feather` attribute with SVG markup
     * corresponding to the element's `data-feather` attribute value
     */
    replace(attrs?: { [key: string]: string | number }): void;
  }

  const feather: FeatherIcons;
  export default feather;
} 