#!/usr/bin/env node

import { Command } from 'commander';
import { JiraClient } from './jira-client.js';
import { CLI } from './cli.js';
import { ClaudeLauncher } from './claude-launcher.js';
import { loadJiraConfig } from './config.js';

const program = new Command();

program
  .name('jira-to-pr')
  .description('Fetch Jira tickets and launch Claude Code for implementation')
  .version('1.0.0');

program
  .option('-j, --jql <query>', 'Custom JQL query for filtering issues')
  .option('-p, --project <path>', 'Project path for Claude Code', process.cwd())
  .option('--dry-run', 'Show what would be executed without actually launching Claude Code')
  .action(async (options) => {
    const cli = new CLI();
    
    try {
      cli.displayInfo('Loading configuration...');
      const jiraConfig = loadJiraConfig();
      
      cli.displayInfo('Connecting to Jira...');
      const jiraClient = new JiraClient(jiraConfig);
      
      cli.displayInfo('Fetching issues...');
      const jql = options.jql ?? 'assignee = currentUser() AND status != Done';
      const issues = await jiraClient.searchIssues(jql);
      
      const selection = await cli.selectTask(issues);
      
      if (!selection || selection.action === 'cancel') {
        cli.displayInfo('Operation cancelled.');
        return;
      }
      
      const claudeLauncher = new ClaudeLauncher();
      await claudeLauncher.launchClaudeCode(selection.issue, options.project, options.dryRun);
      
    } catch (error) {
      cli.displayError(error instanceof Error ? error.message : 'Unknown error occurred');
      process.exit(1);
    }
  });

program.parse();