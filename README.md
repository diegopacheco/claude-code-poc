# NoSugar Coaching

A Simple Team Coaching App without sugar. <br/>
Claude-code-poc: POC using Claude code

<img src="logo-app.png" width="200" />

## Features

* Create and manage team members
* Assign members to teams
* Provide feedback on team performance
* Provide feedback on people performance

## Results

Claude Code in action (my linux terminal)<br/>
<img src="results/claude-code-1.png" width="600" />

Claude Code doing a task <br/>
<img src="results/claude-code-2.png" width="600" />

## Stack

* Frontend: React, TypeScript, Bun and Vite
* Backend: Go, Gin, Gorm, MySQL
* Database: MySQL running in a Docker container

## Developmement

This POC was developed using Claude Code(https://www.anthropic.com/claude-code), AI Engineering agent that can help you to develop software. <br/>

PROS

* It's running in your local machine.
* It tells you how many tokens are being used.

CONS

* Does not run on a isolated/docker env(like Codex or Jules).
* Does not open PRs on GitHub automatically.


### Related POCs

* OpenAI Codex POC https://github.com/diegopacheco/codex-poc
* Google Jules https://github.com/diegopacheco/google-jules-poc
* Cursor POC https://github.com/diegopacheco/docker-cleanup
