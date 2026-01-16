"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CreditRequirementsEditor } from "./_components/credit-requirements-editor"
import { CourseListEditor } from "./_components/course-list-editor"
import { TrajectoryEditor } from "./_components/trajectory-editor"

interface DeptInfo {
    id?: number
    dept_code: string
    dept_name: string
    degree_templates: any[]
    ideal_trajectories: any[]
    last_updated_by?: string
    updatedAt?: string
}

export default function RepDashboardPage() {
    const { data: session } = useSession()
    const [deptInfo, setDeptInfo] = useState<DeptInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
    const [expandedTrajectories, setExpandedTrajectories] = useState<Set<string>>(new Set())

    // Fetch department info
    useEffect(() => {
        async function fetchDeptInfo() {
            try {
                const res = await fetch("/api/platform/rep/dept-info")
                const data = await res.json()

                if (res.ok) {
                    if (data.data) {
                        setDeptInfo(data.data)
                    } else {
                        setDeptInfo({
                            dept_code: data.dept_code,
                            dept_name: data.dept_name,
                            degree_templates: [],
                            ideal_trajectories: []
                        })
                    }
                } else {
                    setError(data.error || "Failed to fetch department info")
                }
            } catch (e) {
                setError("Failed to connect to server")
            } finally {
                setLoading(false)
            }
        }

        if (session?.user) {
            fetchDeptInfo()
        }
    }, [session])

    const handleSave = async () => {
        if (!deptInfo) return

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/platform/rep/dept-info", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    degree_templates: deptInfo.degree_templates,
                    ideal_trajectories: deptInfo.ideal_trajectories
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess("Changes saved successfully!")
                if (data.data) {
                    setDeptInfo(prev => prev ? { ...prev, ...data.data } : null)
                }
            } else {
                setError(data.error || "Failed to save changes")
            }
        } catch (e) {
            setError("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    const addNewTemplate = () => {
        if (!deptInfo) return

        const newId = `${deptInfo.dept_code.toLowerCase()}-new-${Date.now()}`
        const newTemplate = {
            id: newId,
            name: `New ${deptInfo.dept_name} Degree`,
            batch: "2024",
            requiredCredits: {
                major: 80,
                minor: 0,
                fc: 36,
                cc: 4,
                concentration: 0,
                openCredits: 38,
                total: 160
            },
            defaultCourses: []
        }

        setDeptInfo({
            ...deptInfo,
            degree_templates: [...deptInfo.degree_templates, newTemplate]
        })
        setExpandedTemplates(new Set([...expandedTemplates, newId]))
    }

    const removeTemplate = (templateId: string) => {
        if (!deptInfo) return
        setDeptInfo({
            ...deptInfo,
            degree_templates: deptInfo.degree_templates.filter(t => t.id !== templateId),
            ideal_trajectories: deptInfo.ideal_trajectories.filter(t => t.templateId !== templateId)
        })
    }

    const updateTemplate = (templateId: string, updates: any) => {
        if (!deptInfo) return
        setDeptInfo({
            ...deptInfo,
            degree_templates: deptInfo.degree_templates.map(t =>
                t.id === templateId ? { ...t, ...updates } : t
            )
        })
    }

    const updateTrajectory = (templateId: string, updates: any) => {
        if (!deptInfo) return
        const existingIndex = deptInfo.ideal_trajectories.findIndex(t => t.templateId === templateId)

        if (existingIndex >= 0) {
            const updated = [...deptInfo.ideal_trajectories]
            updated[existingIndex] = { ...updated[existingIndex], ...updates }
            setDeptInfo({ ...deptInfo, ideal_trajectories: updated })
        } else {
            setDeptInfo({
                ...deptInfo,
                ideal_trajectories: [...deptInfo.ideal_trajectories, { templateId, ...updates }]
            })
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!deptInfo) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || "Failed to load department info"}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-background">
                <div>
                    <h1 className="text-2xl font-bold">{deptInfo.dept_name} Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage degree templates and ideal trajectories
                    </p>
                    {deptInfo.last_updated_by && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Last updated by {deptInfo.last_updated_by} on {new Date(deptInfo.updatedAt!).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Alerts */}
            {(error || success) && (
                <div className="px-6 pt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="border-green-500 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="templates" className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="templates">
                                Degree Templates ({deptInfo.degree_templates.length})
                            </TabsTrigger>
                            <TabsTrigger value="trajectories">
                                Ideal Trajectories ({deptInfo.ideal_trajectories.length})
                            </TabsTrigger>
                        </TabsList>
                        <Button onClick={addNewTemplate} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Degree
                        </Button>
                    </div>

                    <TabsContent value="templates" className="flex-1 space-y-4 mt-0">
                        {deptInfo.degree_templates.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No degree templates yet. Click "Add New Degree" to create one.
                                </CardContent>
                            </Card>
                        ) : (
                            deptInfo.degree_templates.map((template) => (
                                <Collapsible
                                    key={template.id}
                                    open={expandedTemplates.has(template.id)}
                                    onOpenChange={(open) => {
                                        const newSet = new Set(expandedTemplates)
                                        open ? newSet.add(template.id) : newSet.delete(template.id)
                                        setExpandedTemplates(newSet)
                                    }}
                                >
                                    <Card>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {expandedTemplates.has(template.id) ? (
                                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                        <div>
                                                            <CardTitle className="text-base">{template.name}</CardTitle>
                                                            <CardDescription className="text-xs">
                                                                ID: {template.id} • Batch: {template.batch} • {template.defaultCourses?.length || 0} courses
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeTemplate(template.id)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-6 pt-0">
                                                {/* Basic Info */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <Label>Template ID</Label>
                                                        <Input
                                                            value={template.id}
                                                            onChange={(e) => updateTemplate(template.id, { id: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Degree Name</Label>
                                                        <Input
                                                            value={template.name}
                                                            onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Batch</Label>
                                                        <Input
                                                            value={template.batch}
                                                            onChange={(e) => updateTemplate(template.id, { batch: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Credit Requirements */}
                                                <div>
                                                    <Label className="mb-2 block">Credit Requirements</Label>
                                                    <CreditRequirementsEditor
                                                        credits={template.requiredCredits || {
                                                            major: 0, minor: 0, fc: 0, cc: 0, concentration: 0, openCredits: 0, total: 0
                                                        }}
                                                        onChange={(credits) => updateTemplate(template.id, { requiredCredits: credits })}
                                                    />
                                                </div>

                                                {/* Default Courses */}
                                                <div>
                                                    <Label className="mb-2 block">Default Courses</Label>
                                                    <CourseListEditor
                                                        courses={template.defaultCourses || []}
                                                        onChange={(courses) => updateTemplate(template.id, { defaultCourses: courses })}
                                                        deptCode={deptInfo.dept_code}
                                                    />
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="trajectories" className="flex-1 space-y-4 mt-0">
                        {deptInfo.degree_templates.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    Create degree templates first, then add ideal trajectories for each.
                                </CardContent>
                            </Card>
                        ) : (
                            deptInfo.degree_templates.map((template) => {
                                const trajectory = deptInfo.ideal_trajectories.find(t => t.templateId === template.id)
                                const isExpanded = expandedTrajectories.has(template.id)

                                return (
                                    <Collapsible
                                        key={template.id}
                                        open={isExpanded}
                                        onOpenChange={(open) => {
                                            const newSet = new Set(expandedTrajectories)
                                            open ? newSet.add(template.id) : newSet.delete(template.id)
                                            setExpandedTrajectories(newSet)
                                        }}
                                    >
                                        <Card>
                                            <CollapsibleTrigger asChild>
                                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                            <div>
                                                                <CardTitle className="text-base">{template.name}</CardTitle>
                                                                <CardDescription className="text-xs">
                                                                    {trajectory
                                                                        ? `${trajectory.semesters?.length || 0} semesters defined`
                                                                        : "No trajectory defined yet"}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                        <Badge variant={trajectory ? "default" : "secondary"}>
                                                            {trajectory ? "Has Trajectory" : "No Trajectory"}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent className="pt-0">
                                                    <TrajectoryEditor
                                                        semesters={trajectory?.semesters || []}
                                                        onChange={(semesters) => updateTrajectory(template.id, { semesters })}
                                                        notes={trajectory?.notes}
                                                        onNotesChange={(notes) => updateTrajectory(template.id, { notes })}
                                                        policyDocPath={trajectory?.policyDocPath}
                                                        onPolicyDocChange={(path) => updateTrajectory(template.id, { policyDocPath: path })}
                                                        deptCode={deptInfo.dept_code}
                                                    />
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                )
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
