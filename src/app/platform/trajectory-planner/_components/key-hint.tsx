/** A shortcut key shown inside a tooltip or menu item, so people learn the shortcut while using the control. */
export function KeyHint({ children }: { children: string }) {
    return (
        <kbd className="ml-auto min-w-5 rounded border border-current px-1 text-center font-mono text-[10px] leading-4 opacity-70">
            {children}
        </kbd>
    )
}
