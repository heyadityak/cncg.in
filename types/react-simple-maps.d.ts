declare module "react-simple-maps" {
  import type { ComponentType, MouseEventHandler, ReactNode } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      center?: [number, number];
      scale?: number;
      rotate?: [number, number, number];
    };
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    center?: [number, number];
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: Geography[] }) => ReactNode;
  }

  export interface Geography {
    rsmKey: string;
    properties: Record<string, string>;
    [key: string]: unknown;
  }

  export interface GeographyProps {
    key?: string;
    geography: Geography;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: MouseEventHandler<SVGPathElement>;
    onMouseEnter?: MouseEventHandler<SVGPathElement>;
    onMouseMove?: MouseEventHandler<SVGPathElement>;
    onMouseLeave?: MouseEventHandler<SVGPathElement>;
    className?: string;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
  }

  export interface SphereProps {
    id?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Sphere: ComponentType<SphereProps>;
  export const Graticule: ComponentType<{
    stroke?: string;
    strokeWidth?: number;
  }>;
  export const Line: ComponentType<{
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
  }>;
}
