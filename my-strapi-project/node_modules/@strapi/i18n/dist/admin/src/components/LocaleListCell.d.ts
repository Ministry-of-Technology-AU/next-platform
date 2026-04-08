interface LocaleListCellProps {
    localizations: {
        locale: string;
    }[];
    locale: string;
    documentId: string;
}
declare const LocaleListCell: ({ locale: currentLocale, localizations, documentId, }: LocaleListCellProps) => import("react/jsx-runtime").JSX.Element | null;
export { LocaleListCell };
export type { LocaleListCellProps };
