export interface ResolvedSvgNode {
  tag: string;
  attrs: Record<string, string>;
}

export type ResolvedIconData =
  | {
      kind: 'lucide';
      nodes: ResolvedSvgNode[];
    }
  | {
      kind: 'brand';
      path: string | null;
    };
