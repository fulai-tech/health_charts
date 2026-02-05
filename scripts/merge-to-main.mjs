#!/usr/bin/env node

/**
 * 合并当前分支到 main 的脚本
 * 
 * 流程：
 * 1. 运行 yarn ci 确保代码质量
 * 2. 获取当前分支名
 * 3. 推送到远程
 * 4. 创建 PR（如果不存在）
 * 5. 合并 PR 到 main
 */

import { execSync, spawnSync } from 'child_process';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`📌 ${message}`, colors.cyan);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (e) {
    if (options.silent) {
      return null;
    }
    throw e;
  }
}

function execOutput(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const targetBranch = process.argv[2] || 'main';
  
  log('\n🚀 开始合并流程...\n', colors.bold);
  
  // 1. 检查是否有未提交的更改
  info('检查工作区状态...');
  const status = execOutput('git status --porcelain');
  if (status) {
    error('存在未提交的更改，请先提交或暂存：');
    console.log(status);
    process.exit(1);
  }
  success('工作区干净');

  // 2. 获取当前分支
  const currentBranch = execOutput('git branch --show-current');
  if (!currentBranch) {
    error('无法获取当前分支名');
    process.exit(1);
  }
  
  if (currentBranch === targetBranch) {
    error(`当前已在 ${targetBranch} 分支，无需合并`);
    process.exit(1);
  }
  
  info(`当前分支: ${currentBranch}`);
  info(`目标分支: ${targetBranch}`);

  // 3. 运行 CI 检查
  log('\n📋 运行 CI 检查 (lint + typecheck + test)...\n', colors.bold);
  try {
    exec('yarn ci');
    success('CI 检查通过！');
  } catch {
    error('CI 检查失败，请修复后重试');
    process.exit(1);
  }

  // 4. 推送当前分支到远程
  log('\n📤 推送分支到远程...\n', colors.bold);
  try {
    exec(`git push -u origin ${currentBranch}`);
    success('分支已推送');
  } catch {
    error('推送失败');
    process.exit(1);
  }

  // 5. 检查是否已有 PR
  info('检查现有 PR...');
  const existingPR = execOutput(`gh pr view --json number,url --jq ".url" 2>nul || echo ""`);
  
  let prUrl;
  if (existingPR) {
    info(`已存在 PR: ${existingPR}`);
    prUrl = existingPR;
  } else {
    // 6. 创建 PR
    log('\n📝 创建 Pull Request...\n', colors.bold);
    try {
      // 获取最新的 commit message 作为 PR 标题
      const commitMsg = execOutput('git log -1 --format=%s');
      const prTitle = commitMsg || `Merge ${currentBranch} into ${targetBranch}`;
      
      const result = execOutput(`gh pr create --base ${targetBranch} --title "${prTitle}" --body "Auto-generated PR from \`yarn merge\` command" --fill`);
      if (result) {
        prUrl = result;
        success(`PR 创建成功: ${prUrl}`);
      }
    } catch {
      // PR 可能已存在
      prUrl = execOutput(`gh pr view --json url --jq ".url"`);
      if (prUrl) {
        info(`PR 已存在: ${prUrl}`);
      } else {
        error('创建 PR 失败');
        process.exit(1);
      }
    }
  }

  // 7. 等待 CI 检查（如果有 GitHub Actions）
  info('检查 GitHub PR 状态...');
  
  // 8. 合并 PR
  log('\n🔀 合并 Pull Request...\n', colors.bold);
  try {
    // 使用 squash 合并，保持 main 分支整洁
    exec(`gh pr merge --squash --delete-branch`);
    success('PR 合并成功！分支已删除');
  } catch {
    warn('自动合并失败，可能需要等待 CI 或手动处理冲突');
    info(`请访问 PR 页面手动操作: ${prUrl}`);
    process.exit(1);
  }

  // 9. 切换回 main 并拉取最新代码
  log('\n🔄 同步本地 main 分支...\n', colors.bold);
  try {
    exec(`git checkout ${targetBranch}`);
    exec('git pull');
    success(`已切换到 ${targetBranch} 并拉取最新代码`);
  } catch {
    warn('切换分支失败，请手动操作');
  }

  log('\n🎉 合并完成！\n', `${colors.bold}${colors.green}`);
}

main().catch((e) => {
  error(`脚本执行出错: ${e.message}`);
  process.exit(1);
});
