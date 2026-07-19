# Frontend Exercises (Angular)

Home assignment project for frontend candidates. The project is an Angular 21 application containing three independent assignments, reachable from the main menu when running the app.

## Prerequisites

- Node.js `^20.19.0`, `^22.12.0` or newer
- npm 10+
- Chrome (for unit tests)

## Setup

```bash
npm install
npm start        # serves on http://localhost:4200
npm test         # unit tests (Karma + Jasmine)
npm run build    # production build
```

## Assignments

Each assignment has its own instruction file with the full requirements and design assets:

| Assignment | Instructions | Focus |
| --- | --- | --- |
| D3 Collapsible Tree | `src/app/assets/d3_tree_assignment/d3 collapsable tree instructions.md` | D3.js, SVG, SCSS |
| Vulnerability Card | `src/app/assets/vuln-card-assignment/Vulnerability card instructions.md` | Component design, SCSS, performance (virtual list) |
| Vulnerability Feed (NgRx) | `src/app/assets/vuln-feed-assignment/NgRx vulnerability feed instructions.md` | NgRx, debugging, RxJS |

Your interviewer will tell you which assignment(s) to complete.

## Working with AI agents

You are encouraged to use AI coding agents and assistants (Claude Code, Cursor, Copilot, etc.) while completing the assignments. **How** you use them is part of the evaluation:

- How you break the task down and prompt the agent.
- Whether you verify, test and review the generated code — and catch the agent's mistakes.
- You must fully understand every line you submit. During the review you will be asked to explain your changes and the reasoning behind them.
- Keep commit history clean and meaningful — small commits with clear messages, one logical change per commit.

**Bonus:** add an `AI-NOTES.md` file to your submission describing how you used the agent — the prompts/approach that worked, what the agent got wrong, and what you had to fix or decide yourself.

## General guidelines

- Write code as if it were going into a production codebase: clear naming, small components, no dead code.
- Use SCSS best practices; severity colors are available as CSS variables in `src/styles.scss`.
- Pay attention to clear and short commits, comments and code structure.
