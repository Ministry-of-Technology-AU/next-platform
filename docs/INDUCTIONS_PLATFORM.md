# Inductions Platform - Developer & Agent Guide

This document outlines the architecture, data models, and specific pages that make up the SG-Inductions Platform. Agents picking up tasks related to inductions should read this to understand how the feature is distributed across the codebase.

## 1. High-Level Architecture

The Inductions Platform spans three distinct user personas and interfaces:
1. **Admin Portal (`/admin/organizations`)**: For Student Government admins to oversee all organizations and globally manage induction states.
2. **Organization Portal (`/organisations/inductions`)**: For club/society representatives to manage their specific recruitment pipelines, roles, and applicants.
3. **Student Portal (`/platform/induction`)**: For students to discover active inductions, track organizations, and manage their ongoing applications.

---

## 2. Admin Portal (`/admin/organizations`)

### Purpose
Allows global administrators to view the status of all organizations, including whether they are actively recruiting.

### Key Features
- **Organizations Table**: Displays all organizations. Shows an "Active Inductions" column (`true`/`false`).
- **Organization Dashboard (`/admin/organizations/about/[slug]`)**: Displays detailed stats for a specific organization, including its Induction Status (Active/Closed), Induction End Date, and a mock Induction Timeline.

### Data Model
Induction status is primarily controlled by fields on the **Organization** Strapi model:
- `induction` (boolean): Master toggle for if inductions are currently open.
- `induction_end` (datetime): The deadline for the induction cycle.
- `induction_description` (text): A description of the current recruitment cycle.

---

## 3. Organization Portal (`/organisations/inductions`)

### Purpose
The workspace for an organization's core team to build their application pipelines, manage open roles, and track candidates.

### Key Features
- **Cycle Management**: Organizations can create "Induction Cycles" (e.g., "Monsoon 2026 Recruitment").
- **Roles & Tiers**: Organizations can define specific roles (e.g., Core Member, Event Coordinator) and categorize them into tiers.
- **Pipeline Rounds**: Organizations can define the stages of their induction (e.g., Round 1: Form, Round 2: Interview). A round can be linked to a specific Form ID.

### Types (Reference `src/app/organisations/inductions/types.ts`)
- `InductionCycleSummary`: Represents a cycle (draft, active, completed, archived) with associated stats (opens, fills).
- `InductionRole`: Represents a position (name, department, tier).
- `PipelineRound`: Represents a stage in the cycle (type: 'form' | 'interview', formId).

*(Note: Cycle and Role structures are currently modeled in the frontend and may be mocked or lack full Strapi backend CRUD endpoints.)*

---

## 4. Student Portal (`/platform/induction`)

### Purpose
The unified interface for students to explore open roles across campus and manage their application drafts/submissions.

### Key Features
- **Active Inductions Catalog**: 
  - A grid of cards (`InductionCatalogCard`) showing organizations where `inductionsOpen === true`.
  - Displays the organization name, type, induction description, deadline, and a list of Open Positions / Departments. *(Note: Positions are currently mocked in the UI until the backend `InductionRole` model is fully integrated with the catalog endpoint).*
  - Students can "Track" an organization to easily follow its updates.
- **My Ongoing Applications**:
  - A grid of cards (`ApplicationCard`) showing forms the student has interacted with (draft or submitted).
  - Submitted applications feature a **"Check Update"** button. This opens a modal displaying the organization's decision (`application_status`: pending, approved, rejected) and feedback (`status_message`).
- **Filters & Preferences Sidebar**: Allows students to filter the catalog by organization type and view their tracked inductions list. (Color coding and custom palettes are specifically disabled here to keep it distinct from the generic Orgs Catalog).
- **Notifications Popover**: A bell icon in the top right that alerts students if an application is nearing its deadline (within 3 days) or if an organization has updated their status (Approved/Rejected).

### API & Data Fetching
- **`GET /api/platform/organisations-catalogue`**: Fetches all organizations. The student portal filters this down to `org.inductionsOpen === true`.
- **`GET /api/platform/inductions/applications`**: A custom endpoint that returns the authenticated user's form responses, populated with the associated `form` and `form.organisation`.
- **`src/lib/forms/strapi-forms.ts`**: Contains `getResponsesByUserEmail`, which executes the deep-populated Strapi query to fetch a user's applications across all organizations.

---

## 5. Next Steps / Agent Action Items

When extending this platform, consider the following missing links:
1. **Strapi Models**: Ensure the `InductionCycle`, `InductionRole`, and `PipelineRound` models are fully deployed in Strapi and linked to the `Organization` model.
2. **Catalog Positions**: Update the `GET /api/platform/organisations-catalogue` endpoint (or create a new one) to populate `InductionRoles` so that the `InductionCatalogCard` can display real positions instead of mock data.
3. **Application Status Webhook/UI**: Organizations need a UI in `/organisations/inductions/[cycleId]/applicants` to actually change a student's `applicationStatus` to 'approved' or 'rejected', which updates the `form-response` in Strapi.
