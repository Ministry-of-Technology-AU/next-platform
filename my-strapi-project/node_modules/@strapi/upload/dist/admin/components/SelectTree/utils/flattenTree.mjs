function flattenTree(tree, parent = null, depth = 0, path = '') {
    return tree.flatMap((item)=>{
        const newPath = item.value ? `${path}/${item.value}` : path;
        return item.children ? [
            {
                ...item,
                parent: parent?.value,
                depth,
                path: newPath
            },
            ...flattenTree(item.children, item, depth + 1, newPath)
        ] : {
            ...item,
            depth,
            parent: parent?.value,
            path: newPath
        };
    });
}

export { flattenTree };
//# sourceMappingURL=flattenTree.mjs.map
