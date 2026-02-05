#!/usr/bin/env node

/**
 * 自动化部署脚本
 * 
 * 将 docs 目录内容部署到远程服务器
 * 服务器: root@43.138.100.224
 * 路径: /www/wwwroot/h5.fulai.tech
 * 
 * 使用方式: yarn deploy
 */

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================
// 配置
// ============================================

const CONFIG = {
  // 服务器配置
  server: {
    host: '43.138.100.224',
    user: 'root',
    // 密码备用（优先使用 SSH 公钥）
    password: 'A#D82*saA4f',
    remotePath: '/www/wwwroot/h5.fulai.tech',
  },
  // 本地 docs 目录
  localDocsPath: resolve(__dirname, '../docs'),
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, colors.green)
}

function error(message) {
  log(`❌ ${message}`, colors.red)
}

function info(message) {
  log(`📌 ${message}`, colors.cyan)
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

// ============================================
// 检查依赖
// ============================================

function checkDependencies() {
  // 检查 docs 目录是否存在
  if (!existsSync(CONFIG.localDocsPath)) {
    error(`docs 目录不存在: ${CONFIG.localDocsPath}`)
    error('请先运行 yarn build 生成构建文件')
    process.exit(1)
  }

  // 检查是否是 Windows
  const isWindows = process.platform === 'win32'
  
  if (isWindows) {
    // Windows 下检查 scp 是否可用
    try {
      execSync('where scp', { stdio: 'pipe' })
    } catch {
      error('未找到 scp 命令')
      error('请确保已安装 OpenSSH 客户端（Windows 10+ 自带）')
      process.exit(1)
    }
  }

  return isWindows
}

// ============================================
// 部署函数
// ============================================

async function deploy() {
  log('\n🚀 开始部署到服务器...\n', colors.bold)

  const { host, user, remotePath } = CONFIG.server
  const sshTarget = `${user}@${host}`

  const isWindows = checkDependencies()

  // Step 1: 测试 SSH 连接
  info('测试 SSH 连接...')
  try {
    execSync(`ssh -o BatchMode=yes -o ConnectTimeout=5 ${sshTarget} "echo ok"`, {
      stdio: 'pipe',
    })
    success('SSH 连接成功（使用公钥认证）')
  } catch {
    warn('公钥认证失败，将尝试使用密码')
    error('请确保已将公钥添加到服务器，或手动输入密码')
    // 继续执行，让用户手动输入密码
  }

  // Step 2: 清空远程目录（保留目录本身）
  info('清空远程目录...')
  try {
    const cleanCmd = `ssh ${sshTarget} "cd ${remotePath} && rm -rf ./* ./.[!.]* 2>/dev/null || true"`
    execSync(cleanCmd, { stdio: 'inherit' })
    success('远程目录已清空')
  } catch (e) {
    error(`清空远程目录失败: ${e.message}`)
    process.exit(1)
  }

  // Step 3: 上传文件
  info('上传文件到服务器...')
  try {
    if (isWindows) {
      // Windows: 使用 scp -r 上传整个目录，然后在服务器端移动文件
      // 先上传到临时目录，再移动内容
      const tempDir = `${remotePath}_temp_${Date.now()}`
      
      // 上传整个 docs 目录到临时位置
      const scpCmd = `scp -r -o StrictHostKeyChecking=no "${CONFIG.localDocsPath}" ${sshTarget}:${tempDir}`
      execSync(scpCmd, { stdio: 'inherit' })
      
      // 在服务器端移动文件内容到目标目录
      const moveCmd = `ssh ${sshTarget} "cp -r ${tempDir}/* ${remotePath}/ && rm -rf ${tempDir}"`
      execSync(moveCmd, { stdio: 'inherit' })
    } else {
      // Linux/Mac 可以使用 rsync
      const rsyncCmd = `rsync -avz --delete ${CONFIG.localDocsPath}/ ${sshTarget}:${remotePath}/`
      execSync(rsyncCmd, { stdio: 'inherit' })
    }
    success('文件上传完成')
  } catch (e) {
    error(`文件上传失败: ${e.message}`)
    process.exit(1)
  }

  // Step 4: 验证部署
  info('验证部署...')
  try {
    const verifyCmd = `ssh ${sshTarget} "ls -la ${remotePath}"`
    execSync(verifyCmd, { stdio: 'inherit' })
    success('部署验证完成')
  } catch (e) {
    warn('部署验证失败，请手动检查')
  }

  log('\n🎉 部署完成！\n', `${colors.bold}${colors.green}`)
  info(`访问地址: https://h5.fulai.tech`)
}

// ============================================
// 主入口
// ============================================

deploy().catch((e) => {
  error(`部署失败: ${e.message}`)
  process.exit(1)
})
