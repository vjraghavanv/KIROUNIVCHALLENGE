# Bonus Lesson 1 · 250 Credits

## Kiro Web, cloud sessions, and cloud configuration

> **Kiro Web, cloud sessions, and cloud configuration** are available in US East
> (N. Virginia) and included with Pro, Pro+, Pro Max, and Power subscriptions.
> This lesson is not required on the final exam to be eligible for the
> 1000-credit completion reward. Use these features in your final project build
> and submission to earn an extra 250 Kiro credits.

Explore agentic engineering in the cloud with Kiro Web, cloud sessions, and
cloud configuration, shifting your work off your local machine. Kiro Web
introduced working with Kiro in a cloud sandbox, and cloud sessions extend that
to the CLI and IDE, so your Kiro sessions stay with your account and follow you
across Kiro tools. Cloud configuration complements this by syncing your local
Kiro setup into your cloud sessions, so your steering files, hooks, skills,
powers, and custom agents can follow you as well.

## Key concepts

- **Kiro Web** — Work with Kiro in a browser-based cloud sandbox. No local setup
  required; the environment (runtimes, git, tools) runs in the cloud.
- **Cloud sessions** — Sessions are tied to your account rather than a single
  machine. A session started in Kiro Web can continue in the CLI or IDE, so your
  in-progress work follows you across Kiro surfaces.
- **Cloud configuration** — Your local Kiro configuration is synced up into cloud
  sessions. Steering files, hooks, skills, powers, and custom agents that you use
  locally become available in the cloud automatically.

## Availability

| Aspect | Detail |
| --- | --- |
| Region | US East (N. Virginia) |
| Included with | Pro, Pro+, Pro Max, Power subscriptions |
| Final-exam requirement | Not required for the 1000-credit completion reward |
| Bonus reward | Extra 250 Kiro credits when used in the final project build/submission |

## How this repo demonstrates it

This challenge repo was itself built in a **Kiro Web** cloud sandbox using a
**cloud session**, and its **cloud configuration** carries the artifacts from the
earlier lessons that "follow" the session:

- **Steering** — `kiro-university-lesson-2/.kiro/steering/typescript-standards.md`
- **Hooks** — `kiro-university-lesson-3/.kiro/hooks/format-on-save.json` and the
  repo-level `.kiro/hooks/kironomics.json`
- **Powers** — the Postman power used in `kiro-university-lesson-5`
- **MCP servers** — `kiro-university-lesson-6/.kiro/settings/mcp.json`
- **Custom agents** — `kiro-university-lesson-7/.kiro/agents/web-tester.json`

Because cloud configuration syncs these into the cloud session, the same
steering, hooks, powers, MCP servers, and agents are available whether the work
happens in Kiro Web, the CLI, or the IDE.
