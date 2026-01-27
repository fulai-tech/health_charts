/**
 * ========================================================
 * 【通信层】NativeBridge - 纯通信模块（与业务完全解耦）
 * ========================================================
 * 
 * 职责：仅负责 Android ↔ JS 的数据传输
 * 不包含任何业务逻辑、渲染逻辑
 * 
 * 使用方式：
 *   // 1. 引入脚本
 *   <script src="js/app.js"></script>
 * 
 *   // 2. 注册数据接收回调
 *   NativeBridge.onDataReceived = (data) => { 你的业务逻辑 }
 * 
 *   // 3. 发送事件给原生
 *   NativeBridge.send('eventName', data)
 * 
 *   // 4. 页面就绪时通知原生
 *   NativeBridge.notifyReady({ pageId: 'xxx', pageName: 'xxx' })
 */
(function() {
  'use strict';

  // ===== 通信层核心 =====
  const NativeBridge = {
    // 版本号
    version: '1.0.0',

    // 日志开关
    debug: true,

    // 回调注册表
    _callbacks: {},

    // ===== 日志工具 =====
    _log: function(level, ...args) {
      if (!this.debug) return;
      const prefix = `[NativeBridge][${level}]`;
      console[level === 'ERROR' ? 'error' : 'log'](prefix, ...args);
    },

    // ===== 注册数据接收回调（业务层调用） =====
    onDataReceived: null, // 主回调：收到数据时触发

    // ===== Android -> JS：接收数据入口 =====
    receiveData: function(payload) {
      this._log('INFO', '收到原生数据', payload);
      
      let data = payload;
      
      // 自动解析 JSON 字符串
      if (typeof payload === 'string') {
        try {
          data = JSON.parse(payload);
        } catch (e) {
          this._log('ERROR', 'JSON 解析失败', e);
          this._notifyError({ code: 'PARSE_ERROR', message: e.message, raw: payload });
          return;
        }
      }

      // 打印解析后的对象
      this._log('INFO', '解析后的数据对象：', data);
      console.log('═══════════════════════════════════════');
      console.log('📦 NativeBridge 收到数据：');
      console.log(JSON.stringify(data, null, 2));
      console.log('═══════════════════════════════════════');

      // 触发业务层回调
      if (typeof this.onDataReceived === 'function') {
        this.onDataReceived(data);
      } else {
        this._log('WARN', '未注册 onDataReceived 回调，数据未被处理');
      }

      // 通知原生：数据已接收
      this.send('dataReceived', { success: true, timestamp: Date.now() });
    },

    // ===== JS -> Android：发送数据 =====
    send: function(eventName, data) {
      this._log('INFO', `发送事件: ${eventName}`, data);
      
      const payload = JSON.stringify({
        event: eventName,
        data: data,
        timestamp: Date.now()
      });

      // 调用原生接口
      if (typeof android !== 'undefined' && typeof android.onJsMessage === 'function') {
        android.onJsMessage(payload);
      } else {
        this._log('WARN', '原生接口 android.onJsMessage 不存在');
      }
    },

    // ===== JS -> Android：请求数据 =====
    requestData: function(params) {
      this._log('INFO', '请求原生数据', params);
      this.send('requestData', params || {});
    },

    // ===== 错误通知 =====
    _notifyError: function(error) {
      this.send('error', error);
      if (typeof this.onError === 'function') {
        this.onError(error);
      }
    },

    // 错误回调（业务层可选注册）
    onError: null,

    // ===== 页面就绪通知 =====
    notifyReady: function(pageInfo) {
      this._log('INFO', '通知原生页面已就绪', pageInfo);
      this.send('pageReady', pageInfo || { page: 'unknown' });
    }
  };

  // 暴露到全局
  window.NativeBridge = NativeBridge;
})();
