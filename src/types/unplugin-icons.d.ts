declare module '~icons/si/[slug].jsx' {
  import { ComponentType } from 'react';
  
  interface IconLoaderProps {
    slug: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }
  
  const IconLoader: ComponentType<IconLoaderProps>;
  export default IconLoader;
}

declare module '~icons/*' {
  import { ComponentType } from 'react';
  
  interface IconProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
  }
  
  const Icon: ComponentType<IconProps>;
  export default Icon;
}
