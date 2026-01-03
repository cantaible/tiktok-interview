<!--
SYNC IMPACT REPORT
===================
Version Change: Initial → 1.0.0
Action: Initial constitution ratification
Modified Principles: N/A (new constitution)
Added Sections: Core Principles (3), Technical Constraints, Governance
Removed Sections: None
Templates Status:
  ✅ spec-template.md - aligned with spec-driven principle
  ✅ plan-template.md - aligned with development workflow
  ✅ tasks-template.md - aligned with MVP scope principle
  ✅ checklist-template.md - compatible with current principles
  ✅ agent-file-template.md - compatible with current principles
Follow-up TODOs: None
-->

# Local News Harvester Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
All features MUST be defined in natural language technical specification documents before any implementation code is written. AI tools (Cursor, Claude Code, Windsurf) generate code exclusively from these specs. Direct coding without a spec is prohibited.

**Rationale**: This project is a demonstration of AI-native development methodology. The spec serves as the single source of truth and enables reproducible, AI-assisted implementation while reducing miscommunication between intent and code.

### II. Local-First Architecture
The application MUST run entirely on the local machine without requiring cloud deployment or external backend services. All data persistence MUST use local storage mechanisms (SQLite, IndexedDB, or local JSON files).

**Rationale**: This MVP prioritizes ease of setup, user data privacy, and eliminates infrastructure complexity. Users should be able to run the application with simple commands (npm run dev) without server provisioning.

### III. MVP Scope Discipline
Implementation MUST deliver only the four core modules: (1) Data Source Configuration, (2) Local Scraping & Processing with LLM integration via Aliyun Bailian, (3) Structured Presentation with filtering, (4) Local Storage & Export. No feature beyond the defined functional requirements may be added without spec amendment.

**Rationale**: Time-boxed interview project requires strict scope control to ensure end-to-end completion. Feature creep undermines delivery of a working, demonstrable product.

## Technical Constraints

All development MUST comply with the following non-negotiable constraints:

- **AI Tooling**: Use Cursor (Composer Mode), Claude Code (CLI), or Windsurf for code generation
- **LLM API**: Backend LLM capabilities (summarization, tagging) MUST use Aliyun Bailian platform (DeepSeek-V3, DeepSeek-R1, or Qwen-Max recommended)
- **API Security**: API keys MUST be stored in .env files and loaded via environment variables; hardcoded keys are prohibited
- **Technology Stack**: Recommended Next.js/React or pure frontend serverless solution; backend if used must run locally
- **Deliverables**: Must include spec.md, source code with package.json/requirements.txt, process documentation, and proof-of-work screenshots

## Governance

This constitution is the authoritative guide for all development decisions. Any deviation from stated principles must be documented with explicit justification.

**Amendment Process**: Constitution changes require updating this document with version increment, rationale documentation, and propagation to dependent templates (spec-template.md, plan-template.md, tasks-template.md).

**Versioning Policy**: Follow semantic versioning—MAJOR for principle removals/redefinitions, MINOR for new principles, PATCH for clarifications.

**Compliance**: All specs and implementation reviews must verify adherence to the three core principles and technical constraints.

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
