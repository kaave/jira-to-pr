import { spawn } from 'child_process';
import type { JiraIssue } from './types.js';

/**
 * Claude Codeの起動を管理するクラス
 * Jiraの課題情報を元にClaude Codeセッションを開始する
 */
export class ClaudeLauncher {
  /**
   * Claude Codeを起動して課題の実装を開始する
   * @param issue - 実装する課題の情報
   * @param projectPath - プロジェクトのパス
   * @param dryRun - dry-runモード（実際に起動せず情報のみ表示）
   */
  async launchClaudeCode(issue: JiraIssue, projectPath: string = process.cwd(), dryRun: boolean = false): Promise<void> {
    const prompt = this.buildPrompt(issue);
    
    if (dryRun) {
      this.displayDryRunOutput(issue, projectPath, prompt);
      return;
    }

    console.log(`🚀 Launching Claude Code for ${issue.key}...`);
    console.log(`📁 Project path: ${projectPath}`);
    console.log(`💬 Prompt: ${prompt.substring(0, 100)}...\n`);

    try {
      const claudeProcess = spawn('claude', [prompt], {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true,
      });

      claudeProcess.on('error', (error) => {
        console.error(`❌ Failed to launch Claude Code: ${error.message}`);
        console.log('💡 Make sure Claude Code is installed and available in your PATH');
        console.log('🔗 Install from: https://claude.ai/code');
      });

      claudeProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Claude Code session completed for ${issue.key}`);
        } else {
          console.log(`⚠️  Claude Code exited with code ${code}`);
        }
      });

    } catch (error) {
      console.error(`❌ Error launching Claude Code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * dry-runモードの出力を表示する
   * @param issue - 課題情報
   * @param projectPath - プロジェクトパス
   * @param prompt - Claude Codeに渡すプロンプト
   */
  private displayDryRunOutput(issue: JiraIssue, projectPath: string, prompt: string): void {
    console.log('\n🧪 DRY RUN MODE - Claude Code would be launched with:');
    console.log('='.repeat(60));
    console.log(`Command: claude`);
    console.log(`Working Directory: ${projectPath}`);
    console.log(`Issue: ${issue.key}`);
    console.log(`Title: ${issue.fields.summary}`);
    console.log('='.repeat(60));
    console.log('Prompt:');
    console.log('-'.repeat(60));
    console.log(prompt);
    console.log('-'.repeat(60));
    console.log('\n💡 To actually launch Claude Code, run without --dry-run option');
  }

  /**
   * 課題情報からClaude Code用のプロンプトを生成する
   * @param issue - 課題情報
   * @returns 生成されたプロンプト
   */
  private buildPrompt(issue: JiraIssue): string {
    const parts = [
      `Implement the following Jira ticket: ${issue.key}`,
      ``,
      `**Title:** ${issue.fields.summary}`,
      ``,
    ];

    if (issue.fields.description) {
      parts.push(`**Description:**`);
      parts.push(issue.fields.description);
      parts.push(``);
    }

    parts.push(`**Status:** ${issue.fields.status.name}`);
    parts.push(`**Priority:** ${issue.fields.priority.name}`);
    
    if (issue.fields.assignee) {
      parts.push(`**Assignee:** ${issue.fields.assignee.displayName}`);
    }

    parts.push(``);
    parts.push(`Please analyze the codebase and implement this feature according to the requirements.`);

    return parts.join('\n');
  }
}