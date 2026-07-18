# Graph Report - .  (2026-07-04)

## Corpus Check
- Large corpus: 413 files · ~1,017,863 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1835 nodes · 4930 edges · 97 communities (89 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Page Apl|Page Apl]]
- [[_COMMUNITY_Components Section|Components Section]]
- [[_COMMUNITY_Cgpa Planner|Cgpa Planner]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Course Reviews|Course Reviews]]
- [[_COMMUNITY_Components Assetdialog|Components Assetdialog]]
- [[_COMMUNITY_Route Strapi|Route Strapi]]
- [[_COMMUNITY_Combobox Index|Combobox Index]]
- [[_COMMUNITY_Sidebar Index|Sidebar Index]]
- [[_COMMUNITY_Accordion Sheet|Accordion Sheet]]
- [[_COMMUNITY_Route Pool|Route Pool]]
- [[_COMMUNITY_Calendar Components|Calendar Components]]
- [[_COMMUNITY_Morphing Dialog|Morphing Dialog]]
- [[_COMMUNITY_Page Results|Page Results]]
- [[_COMMUNITY_Dialog Components|Dialog Components]]
- [[_COMMUNITY_Route Src|Route Src]]
- [[_COMMUNITY_Layout Components|Layout Components]]
- [[_COMMUNITY_Route Lib|Route Lib]]
- [[_COMMUNITY_Dropdown Menu|Dropdown Menu]]
- [[_COMMUNITY_Planner Trajectory|Planner Trajectory]]
- [[_COMMUNITY_Components Form|Components Form]]
- [[_COMMUNITY_Trajectories Templates|Trajectories Templates]]
- [[_COMMUNITY_Index Toggle|Index Toggle]]
- [[_COMMUNITY_Semester Planner|Semester Planner]]
- [[_COMMUNITY_Route Preferences|Route Preferences]]
- [[_COMMUNITY_Page Components|Page Components]]
- [[_COMMUNITY_Lib Apl|Lib Apl]]
- [[_COMMUNITY_Components Tooltip|Components Tooltip]]
- [[_COMMUNITY_Data Page|Data Page]]
- [[_COMMUNITY_Knockout Lib|Knockout Lib]]
- [[_COMMUNITY_Calendar Route|Calendar Route]]
- [[_COMMUNITY_Components Editor|Components Editor]]
- [[_COMMUNITY_Announcement Index|Announcement Index]]
- [[_COMMUNITY_Drive Apis|Drive Apis]]
- [[_COMMUNITY_Apl Knockout|Apl Knockout]]
- [[_COMMUNITY_Theme Providers|Theme Providers]]
- [[_COMMUNITY_Components Aliases|Components Aliases]]
- [[_COMMUNITY_Tsconfig Compileroptions|Tsconfig Compileroptions]]
- [[_COMMUNITY_Banner Index|Banner Index]]
- [[_COMMUNITY_Cash Survey|Cash Survey]]
- [[_COMMUNITY_Organisations Catalog|Organisations Catalog]]
- [[_COMMUNITY_When2meet Types|When2meet Types]]
- [[_COMMUNITY_Tabs Index|Tabs Index]]
- [[_COMMUNITY_Motion Highlight|Motion Highlight]]
- [[_COMMUNITY_Components Tour|Components Tour]]
- [[_COMMUNITY_Usepreventscroll Hooks|Usepreventscroll Hooks]]
- [[_COMMUNITY_Route Apl|Route Apl]]
- [[_COMMUNITY_Text Page|Text Page]]
- [[_COMMUNITY_Wordle Context|Wordle Context]]
- [[_COMMUNITY_Matches Route|Matches Route]]
- [[_COMMUNITY_Ashokan Around|Ashokan Around]]
- [[_COMMUNITY_Borrow Assets|Borrow Assets]]
- [[_COMMUNITY_Package Devdependencies|Package Devdependencies]]
- [[_COMMUNITY_Sse Apl|Sse Apl]]
- [[_COMMUNITY_Route Apis|Route Apis]]
- [[_COMMUNITY_Cgpa Planner|Cgpa Planner]]
- [[_COMMUNITY_Drawer Speedtest|Drawer Speedtest]]
- [[_COMMUNITY_Semester Planner|Semester Planner]]
- [[_COMMUNITY_Calendar Apis|Calendar Apis]]
- [[_COMMUNITY_Page Ashoka|Page Ashoka]]
- [[_COMMUNITY_Components Friendspanel|Components Friendspanel]]
- [[_COMMUNITY_Package Scripts|Package Scripts]]
- [[_COMMUNITY_Components Gameboard|Components Gameboard]]
- [[_COMMUNITY_Components Keyboard|Components Keyboard]]
- [[_COMMUNITY_Dashboard Columns|Dashboard Columns]]
- [[_COMMUNITY_Outbox Columns|Outbox Columns]]
- [[_COMMUNITY_Asset Components|Asset Components]]
- [[_COMMUNITY_Date Lib|Date Lib]]
- [[_COMMUNITY_Scripts Create|Scripts Create]]
- [[_COMMUNITY_Components Category|Components Category]]
- [[_COMMUNITY_Dept Rep|Dept Rep]]
- [[_COMMUNITY_Grid Flickering|Grid Flickering]]
- [[_COMMUNITY_Dictionary Utils|Dictionary Utils]]
- [[_COMMUNITY_Components Form|Components Form]]
- [[_COMMUNITY_Leaderboard Route|Leaderboard Route]]
- [[_COMMUNITY_Profile Types|Profile Types]]
- [[_COMMUNITY_Wordle Route|Wordle Route]]
- [[_COMMUNITY_Route Sse|Route Sse]]
- [[_COMMUNITY_Unauthorized Page|Unauthorized Page]]
- [[_COMMUNITY_Eslint Config|Eslint Config]]
- [[_COMMUNITY_Pool Subscription|Pool Subscription]]
- [[_COMMUNITY_Button Group|Button Group]]
- [[_COMMUNITY_Semester Planner|Semester Planner]]
- [[_COMMUNITY_Types Auth|Types Auth]]
- [[_COMMUNITY_Confettieffect Components|Confettieffect Components]]
- [[_COMMUNITY_Gamecard Components|Gamecard Components]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_Config Postcss|Config Postcss]]
- [[_COMMUNITY_Semester Planner|Semester Planner]]
- [[_COMMUNITY_Nextauth Route|Nextauth Route]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 220 edges
2. `strapiGet()` - 135 edges
3. `Button()` - 106 edges
4. `getUserIdByEmail()` - 77 edges
5. `Card()` - 62 edges
6. `CardContent()` - 56 edges
7. `CardHeader()` - 52 edges
8. `strapiPut()` - 52 edges
9. `CardTitle()` - 48 edges
10. `Input()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `strapiGet()`  [INFERRED]
  src/app/api/platform/courses/[id]/route.ts → src/lib/apis/strapi.ts
- `GET()` --calls--> `strapiGet()`  [INFERRED]
  src/app/api/platform/sports/aba/matches/route.ts → src/lib/apis/strapi.ts
- `GET()` --calls--> `strapiGet()`  [INFERRED]
  src/app/api/platform/sports/aba/teams/[id]/route.ts → src/lib/apis/strapi.ts
- `GET()` --calls--> `strapiGet()`  [INFERRED]
  src/app/api/platform/sports/apl/matches/[id]/route.ts → src/lib/apis/strapi.ts
- `DELETE()` --calls--> `strapiDelete()`  [INFERRED]
  src/app/api/platform/sports/apl/matches/[id]/route.ts → src/lib/apis/strapi.ts

## Import Cycles
- None detected.

## Communities (97 total, 8 thin omitted)

### Community 0 - "Page Apl"
Cohesion: 0.05
Nodes (58): LIVE_MATCH_FALLBACK, MOCK_GROUPS, MOCK_PAST_MATCHES, MOCK_TOP_SCORERS, MOCK_UPCOMING_MATCHES, MVPS, WINNERS, EMPTY_STARTER_IDS (+50 more)

### Community 1 - "Components Section"
Cohesion: 0.08
Nodes (34): ArchivePuzzle, MultiSelectCheckbox(), SingleSelect(), TextInput(), Section1A(), Section1AData, Section1AProps, Section1BData (+26 more)

### Community 2 - "Cgpa Planner"
Cohesion: 0.07
Nodes (46): CGPAPlanner(), computeCourse(), computeRow(), defaultScoreForLetter(), getLetterFromPercentage(), gradeOptions, gradePointsMap, letterRanges (+38 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.03
Nodes (62): dependencies, an-array-of-english-words, axios, canvas-confetti, class-variance-authority, clsx, cmdk, critters (+54 more)

### Community 4 - "Course Reviews"
Cohesion: 0.06
Nodes (39): colorMap, Course, CourseDialog(), CourseDialogProps, Rating, ratingMetrics, Review, ReviewsTable() (+31 more)

### Community 5 - "Components Assetdialog"
Cohesion: 0.09
Nodes (25): FormData, Asset, AssetDialog(), AssetRequestDialogProps, formatDate(), FormData, CGPAFormProps, FormContainer() (+17 more)

### Community 6 - "Route Strapi"
Cohesion: 0.07
Nodes (29): axiosConfig, buildQueryString(), strapi, StrapiCallProps, StrapiFields, StrapiFilters, strapiGet(), StrapiPagination (+21 more)

### Community 7 - "Combobox Index"
Cohesion: 0.07
Nodes (35): Combobox(), ComboboxContent(), ComboboxContentProps, ComboboxContext, ComboboxContextType, ComboboxCreateNewProps, ComboboxData, ComboboxEmpty() (+27 more)

### Community 8 - "Sidebar Index"
Cohesion: 0.09
Nodes (39): ComboboxCreateNew(), InteractiveGridPattern(), InteractiveGridPatternProps, cn(), iconMap, SidebarCategory, SidebarItem, AlertTitle() (+31 more)

### Community 9 - "Accordion Sheet"
Cohesion: 0.09
Nodes (27): Accordion11(), Accordion11Content(), Accordion11ContentProps, Accordion11Item(), Accordion11ItemProps, Accordion11Props, Accordion11Trigger(), Accordion11TriggerProps (+19 more)

### Community 10 - "Route Pool"
Cohesion: 0.11
Nodes (27): strapiDelete(), ArchivePuzzle, GET(), DELETE(), GET(), POST(), PUT(), sanitizeInput() (+19 more)

### Community 11 - "Calendar Components"
Cohesion: 0.11
Nodes (25): AnimatedSearch(), AnimatedSearchProps, CalendarViewsProps, ListView(), MonthView(), TodayView(), WeekView(), EventDialog() (+17 more)

### Community 12 - "Morphing Dialog"
Cohesion: 0.09
Nodes (29): MemberTag(), MemberTagProps, truncateEmail(), buttonVariants, CopyButton(), CopyButtonProps, useClickOutside(), MorphingDialog() (+21 more)

### Community 13 - "Page Results"
Cohesion: 0.10
Nodes (17): ActionResponse, CGPAApiResponse, ActivePoolRequestProps, PoolData, ActivePoolSubscriptionProps, SubscriptionData, UserData, PoolData (+9 more)

### Community 14 - "Dialog Components"
Cohesion: 0.14
Nodes (15): InviteFriendDialogProps, RichTextProps, ExistingTrajectory, ShareTrajectoryDialog(), formatTime(), WinDialog(), animationTransition, animationVariants (+7 more)

### Community 15 - "Route Src"
Cohesion: 0.10
Nodes (23): strapiPost(), POST(), convertTo24HourFormat(), GET(), POST(), PUT(), sanitizeInput(), VALID_LOCATIONS (+15 more)

### Community 16 - "Layout Components"
Cohesion: 0.13
Nodes (7): Developer, DeveloperCredits(), DeveloperProps, DismissNewToolAlert(), OrientationDialog(), PageTitle(), Loader()

### Community 17 - "Route Lib"
Cohesion: 0.12
Nodes (21): GET(), POST(), GET(), POST(), AuthenticatedUser, getAuthenticatedUser(), hasAccess(), requireAuth() (+13 more)

### Community 18 - "Dropdown Menu"
Cohesion: 0.09
Nodes (20): ClientOnly(), ClientOnlyProps, DraftTabs(), useIsMac(), AuthSection, Navbar(), SearchCommand, AppSidebar() (+12 more)

### Community 19 - "Planner Trajectory"
Cohesion: 0.14
Nodes (24): CourseCardProps, SemesterColumnProps, ShareTrajectoryDialogProps, gradeOptions, gradePointsMap, IdealTrajectorySemester, CoursePlannerContext, CoursePlannerContextType (+16 more)

### Community 20 - "Components Form"
Cohesion: 0.08
Nodes (18): CheckboxComponentProps, DropdownOption, FileUpload(), FileUploadProps, FormContainerProps, ImageUploadProps, InstructionsField(), InstructionsFieldProps (+10 more)

### Community 21 - "Trajectories Templates"
Cohesion: 0.18
Nodes (15): GET(), bioTemplates, bioTrajectories, chemTemplates, chemTrajectories, csTemplates, csTrajectories, ecoTemplates (+7 more)

### Community 22 - "Index Toggle"
Cohesion: 0.11
Nodes (14): AuroraBackground(), AuroraBackgroundProps, EditorProps, MinimalTiptap(), MinimalTiptapProps, CursorBlinker(), TypingTextProps, RichTextEditor() (+6 more)

### Community 23 - "Semester Planner"
Cohesion: 0.17
Nodes (19): CourseSelection(), CourseSelectionProps, DraftTabsProps, addCourseToGoogleCalendar(), getNextDateForDay(), TimetableGrid(), TimetableGridProps, WEEKDAY_MAP (+11 more)

### Community 24 - "Route Preferences"
Cohesion: 0.13
Nodes (17): DELETE(), POST(), strapiPut(), EventsCalendarPreferences, validatePreferences(), GET(), PUT(), validatePhoneNumber() (+9 more)

### Community 25 - "Page Components"
Cohesion: 0.11
Nodes (8): CGPAOverview(), CGPAOverviewProps, UpdateItem, WhatsNewData, popularTools, normalizePlayerName(), Button(), buttonVariants

### Community 26 - "Lib Apl"
Cohesion: 0.11
Nodes (20): APLAdminPage(), clampSecond(), evaluateTeamSubstitutionCompliance(), EvaluateTeamSubstitutionComplianceParams, formatSecondsAsClock(), getRequiredSecondsForStartingPlayerCount(), PlayerComplianceStatus, PlayerIgnoreReason (+12 more)

### Community 27 - "Components Tooltip"
Cohesion: 0.22
Nodes (14): AvailableCoursesTray(), CourseCard(), CoursePlannerBoard(), SearchBar(), SearchBarProps, SemesterColumn(), SummaryAndTemplateTable(), WordleHeaderProps (+6 more)

### Community 28 - "Data Page"
Cohesion: 0.13
Nodes (14): banners, banners, recentlyVisited, tailwindSafelist, Advertisement, BannerButton, ButtonVariant, DashboardStats() (+6 more)

### Community 29 - "Knockout Lib"
Cohesion: 0.12
Nodes (18): extractRelationId(), FixedKnockoutBracket, getManualWinnerTeamId(), getTeamLogoUrl(), getTeamName(), isKnockoutRound(), KNOCKOUT_ROUND_ALIASES, KNOCKOUT_ROUNDS (+10 more)

### Community 30 - "Calendar Route"
Cohesion: 0.14
Nodes (16): createCalendarEvent(), formatLocalDateTime(), getAllExistingEvents(), getEventsOnHolidays(), getNextDateForDay(), parseTime(), POST(), ScheduledCourse (+8 more)

### Community 31 - "Components Editor"
Cohesion: 0.16
Nodes (15): CourseItem, CourseListEditor(), CourseListEditorProps, CREDIT_OPTIONS, TYPE_OPTIONS, SemesterInTrajectory, TrajectoryEditor(), TrajectoryEditorProps (+7 more)

### Community 32 - "Announcement Index"
Cohesion: 0.13
Nodes (14): Announcement(), AnnouncementProps, AnnouncementTag(), AnnouncementTagProps, AnnouncementTitle(), AnnouncementTitleProps, TourProvider(), NewToolAlert() (+6 more)

### Community 33 - "Drive Apis"
Cohesion: 0.17
Nodes (15): deleteFromDrive(), drive, DriveFile, extractFileIds(), getEmailAttachments(), oauth2Client, UploadedFile, uploadToDrive() (+7 more)

### Community 34 - "Apl Knockout"
Cohesion: 0.13
Nodes (17): BracketItemProps, BracketSide, BracketTeamRow(), KnockoutBracketTree(), KnockoutBracketTreeProps, KnockoutConnectors(), LEFT_QF_ROWS, LEFT_R16_ROWS (+9 more)

### Community 35 - "Theme Providers"
Cohesion: 0.13
Nodes (12): metadata, nunito, nunitoSans, useTheme(), Theme, ThemeContext, ThemeContextType, ThemeProvider() (+4 more)

### Community 36 - "Components Aliases"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+11 more)

### Community 37 - "Tsconfig Compileroptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 38 - "Banner Index"
Cohesion: 0.17
Nodes (16): Banner(), BannerAction(), BannerActionProps, BannerClose(), BannerCloseProps, BannerContext, BannerContextProps, BannerIcon() (+8 more)

### Community 39 - "Cash Survey"
Cohesion: 0.20
Nodes (15): convertSurveyToCSV(), ensureSurveysDir(), GET(), getUserFilePaths(), hashEmail(), POST(), readJsonSubmissions(), SURVEYS_DIR (+7 more)

### Community 40 - "Organisations Catalog"
Cohesion: 0.14
Nodes (14): FiltersSidebarProps, OrganizationCardProps, FilterCategory, OrganizationFiltersProps, Page(), CataloguePage(), CataloguePageProps, defaultColors (+6 more)

### Community 41 - "When2meet Types"
Cohesion: 0.21
Nodes (14): TimeSlotPageProps, fetchTimeTableData(), When2MeetPage(), fetchTimeTableData(), When2MeetPage(), ASHOKA_TIME_SLOTS, CUSTOM_SLOT_DURATIONS, HOUR_SLOTS (+6 more)

### Community 42 - "Tabs Index"
Cohesion: 0.16
Nodes (16): BaseTabsProps, ControlledTabsProps, Tabs(), TabsContent(), TabsContentProps, TabsContents(), TabsContentsProps, TabsContext (+8 more)

### Community 43 - "Motion Highlight"
Cohesion: 0.12
Nodes (17): BaseMotionHighlightProps, Bounds, ControlledChildrenModeMotionHighlightProps, ControlledParentModeMotionHighlightProps, ExtendedChildProps, getNonOverridingDataAttributes(), MotionHighlight(), MotionHighlightContext (+9 more)

### Community 44 - "Components Tour"
Cohesion: 0.20
Nodes (13): GlobalTourPopover(), TourContext, TourContextType, TourOverlay(), TourProviderProps, TourStep(), TourStepConfig, TourTrigger() (+5 more)

### Community 45 - "Usepreventscroll Hooks"
Cohesion: 0.20
Nodes (14): addEvent(), chain(), getScrollParent(), isIOS(), isIPad(), isIPhone(), isMac(), isScrollable() (+6 more)

### Community 46 - "Route Apl"
Cohesion: 0.22
Nodes (16): buildProxyErrorResponse(), DELETE(), extractStrapiValidationMessage(), extractTeamId(), findMatchRoundIndex(), listMatchesForKnockoutPropagation(), normalizeDetailsPayload(), normalizeKnockoutWinnerId() (+8 more)

### Community 47 - "Text Page"
Cohesion: 0.15
Nodes (6): ExpandableText(), ExpandableTextProps, CourseReviewsLayout(), getReviewCount(), WritingText(), WritingTextProps

### Community 48 - "Wordle Context"
Cohesion: 0.19
Nodes (11): ArchiveEntry, GameData, GameState, Guess, KeyboardState, LeaderboardEntry, LetterEvaluation, STORAGE_KEYS (+3 more)

### Community 49 - "Matches Route"
Cohesion: 0.24
Nodes (15): createRecordFromStrapiMatch(), convertISTDateTimeLocalToISOString(), buildProxyErrorResponse(), extractStrapiValidationMessage(), extractTeamId(), getNextMatchNumber(), isMatchNumberConflictError(), isMatchNumberProvided() (+7 more)

### Community 50 - "Ashokan Around"
Cohesion: 0.24
Nodes (11): ActiveAccommodationRequest(), ActiveAccommodationRequestProps, AshokanAroundPage(), existAccommodationRequest(), AccommodationConnectionListing, AccommodationData, GenderPreferenceFilter, HousingPreference (+3 more)

### Community 51 - "Borrow Assets"
Cohesion: 0.24
Nodes (11): BorrowAssetsClient(), getAssets(), Home(), AssetStatus, AssetTab, AssetType, BorrowRequest, CreateBorrowRequestData (+3 more)

### Community 52 - "Package Devdependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, shadcn, tailwindcss, @tailwindcss/postcss, tw-animate-css (+7 more)

### Community 53 - "Sse Apl"
Cohesion: 0.16
Nodes (8): globalForSSE, AplEventPayload, emitAplUpdate(), MODEL_ALIASES, normalizeAplEventPayload(), normalizeEventName(), normalizeModel(), APL_MODEL_ALIASES

### Community 54 - "Route Apis"
Cohesion: 0.25
Nodes (10): MailParams, sendMail(), sendMailSG(), POST(), DELETE(), GET(), POST(), escapeHtml() (+2 more)

### Community 55 - "Cgpa Planner"
Cohesion: 0.24
Nodes (13): ALLOWED_DOMAIN, CORS_HEADERS, DELETE(), extractBearerToken(), GET(), getGoogleUserInfo(), GoogleUserInfo, jsonResponse() (+5 more)

### Community 56 - "Drawer Speedtest"
Cohesion: 0.21
Nodes (10): SpeedTest(), SpeedTestProps, Drawer(), DrawerClose(), DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader() (+2 more)

### Community 57 - "Semester Planner"
Cohesion: 0.20
Nodes (8): Course, fetchCourses(), fetchSemesterPlannerData(), formatCourses(), GET(), getLastSyncInfo(), RawCourseData, TimeSlot

### Community 58 - "Calendar Apis"
Cohesion: 0.23
Nodes (6): calendar, calendarOAuth2Client, getEvents(), GoogleEvent, GET(), GET()

### Community 59 - "Page Ashoka"
Cohesion: 0.24
Nodes (9): AshokaWordlePage(), DailyPuzzle, getTodayDate(), getWordleData(), UserProgress, ArchivePageProps, ArchivePlayPage(), formatDate() (+1 more)

### Community 60 - "Components Friendspanel"
Cohesion: 0.20
Nodes (5): AcceptInviteHandler(), FriendScore, FriendsPanelProps, WordleGameClientProps, WordleProvider()

### Community 61 - "Package Scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, create-page, dev, lint, start (+2 more)

### Community 62 - "Components Gameboard"
Cohesion: 0.27
Nodes (8): LetterState, GameBoard(), getTextColor(), getTileColor(), RowProps, Tile(), TileProps, KeyProps

### Community 63 - "Components Keyboard"
Cohesion: 0.29
Nodes (8): formatTime(), GameTimer(), getKeyColor(), Key(), Keyboard(), KEYBOARD_ROWS, LoseDialog(), useWordle()

### Community 64 - "Dashboard Columns"
Cohesion: 0.29
Nodes (6): dashboardColumns(), DashboardEmail, DashboardPage(), DataTable(), DialogTrigger(), Textarea()

### Community 65 - "Outbox Columns"
Cohesion: 0.31
Nodes (4): columns, OutboxEmail, ComposeOutboxPage(), getData()

### Community 66 - "Asset Components"
Cohesion: 0.25
Nodes (8): BorrowAssetsClientProps, Asset, AssetCard(), AssetCardProps, formatDateIST(), AssetRequestDialogProps, AssetGrid(), AssetGridProps

### Community 67 - "Date Lib"
Cohesion: 0.28
Nodes (8): formatISTDateTimeForInput(), getCurrentDateIST(), isOverdueIST(), IST_DATE_FORMATTER, IST_INPUT_FORMATTER, IST_TIME_FORMATTER, toIST(), toISTString()

### Community 68 - "Scripts Create"
Cohesion: 0.31
Nodes (8): appDir, categories, main(), sidebarEntriesPath, sidebarTsxPath, toComponentName(), toKebab(), toTitle()

### Community 69 - "Components Category"
Cohesion: 0.25
Nodes (7): CategoryColors, CategoryColorsContext, CategoryColorsContextType, CategoryColorsProvider(), useCategoryColors(), FiltersSidebar(), OrganizationCard()

### Community 70 - "Dept Rep"
Cohesion: 0.39
Nodes (5): DEPT_NAMES, getDeptForRep(), REP_TO_DEPT, GET(), PUT()

### Community 71 - "Grid Flickering"
Cohesion: 0.36
Nodes (5): FlickeringGrid(), FlickeringGridProps, defaultStats, BentoGrid(), BentoGridItem()

### Community 72 - "Dictionary Utils"
Cohesion: 0.25
Nodes (3): DICTIONARY, isValidWord(), WORDS_BY_LENGTH

### Community 73 - "Components Form"
Cohesion: 0.29
Nodes (3): InputProps, LabelProps, PFCreditsComponentProps

### Community 74 - "Leaderboard Route"
Cohesion: 0.43
Nodes (6): GET(), getCachedScoreLeaderboard, getCachedStreakLeaderboard, getTodayDate(), ScoreLeaderboardEntry, StreakLeaderboardEntry

### Community 75 - "Profile Types"
Cohesion: 0.29
Nodes (6): PhoneNumber, PhoneValidation, ProfileApiResponse, ProfileUpdateRequest, UserData, UserProfile

### Community 76 - "Wordle Route"
Cohesion: 0.38
Nodes (6): DailyPuzzle, GET(), getTodayDate(), POST(), WordleGameData, WordleUserData

### Community 79 - "Eslint Config"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 80 - "Pool Subscription"
Cohesion: 0.50
Nodes (4): ActivePoolSubscription(), existSubscriptionPool(), PoolSubscription(), PoolSubscriptionForm()

### Community 81 - "Button Group"
Cohesion: 0.50
Nodes (4): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants

### Community 82 - "Semester Planner"
Cohesion: 0.67
Nodes (3): fetchDraftsAndCourses(), SemesterPlannerPage(), SemesterPlannerClient()

### Community 83 - "Types Auth"
Cohesion: 0.50
Nodes (3): JWT, Session, User

## Knowledge Gaps
- **498 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Sidebar Index` to `Page Apl`, `Components Section`, `Cgpa Planner`, `Course Reviews`, `Components Assetdialog`, `Combobox Index`, `Accordion Sheet`, `Calendar Components`, `Morphing Dialog`, `Page Results`, `Dialog Components`, `Dropdown Menu`, `Planner Trajectory`, `Index Toggle`, `Semester Planner`, `Page Components`, `Components Tooltip`, `Announcement Index`, `Banner Index`, `Tabs Index`, `Motion Highlight`, `Drawer Speedtest`, `Components Gameboard`, `Components Keyboard`, `Dashboard Columns`, `Asset Components`, `Components Category`, `Grid Flickering`, `Button Group`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `Button()` connect `Page Components` to `Page Apl`, `Components Section`, `Cgpa Planner`, `Course Reviews`, `Components Assetdialog`, `Combobox Index`, `Sidebar Index`, `Accordion Sheet`, `Calendar Components`, `Page Results`, `Dialog Components`, `Layout Components`, `Dropdown Menu`, `Planner Trajectory`, `Components Form`, `Index Toggle`, `Semester Planner`, `Components Tooltip`, `Data Page`, `Components Editor`, `Announcement Index`, `Banner Index`, `When2meet Types`, `Tabs Index`, `Components Tour`, `Text Page`, `Ashokan Around`, `Drawer Speedtest`, `Page Ashoka`, `Components Friendspanel`, `Dashboard Columns`, `Outbox Columns`, `Components Form`, `Unauthorized Page`, `Gamecard Components`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `strapiGet()` connect `Route Strapi` to `Components Section`, `Route Pool`, `Calendar Components`, `Route Src`, `Route Lib`, `Trajectories Templates`, `Route Preferences`, `Drive Apis`, `When2meet Types`, `Route Apl`, `Matches Route`, `Route Apis`, `Cgpa Planner`, `Semester Planner`, `Page Ashoka`, `Dept Rep`, `Leaderboard Route`, `Wordle Route`, `Pool Subscription`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `strapiGet()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`strapiGet()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getUserIdByEmail()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`getUserIdByEmail()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Page Apl` be split into smaller, more focused modules?**
  _Cohesion score 0.05112347969490827 - nodes in this community are weakly interconnected._