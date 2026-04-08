type TreeNode<T> = {
    value: T;
    children?: TreeNode<T>[];
    label?: string;
    path?: string;
};
export type FlattenedNode<T> = {
    value: T;
    parent?: T;
    depth: number;
    label?: string;
    path?: string;
    children?: TreeNode<T>[];
};
export declare function flattenTree<T>(tree: TreeNode<T>[], parent?: TreeNode<T> | null, depth?: number, path?: string): FlattenedNode<T>[];
export {};
