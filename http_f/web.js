/**
 * 设备信息采集脚本（新增Windows Build号采集）
 */
class DeviceReporter {
    static CONFIG = {
        // REPORT_API: 'http://localhost:3000/api/device-report',
        REPORT_API: 'http://localhost:3001/api/device-report',
        TIMEOUT: 10000,
        DEBUG: true,
        FP_LOAD_OPTIONS: {
            monitoring: false,
            delayFallback: 500
        }
    };

    // ========== 核心：提取Windows Build号 ==========
    static getWindowsBuildNumber(ua) {
        // 从UA中匹配Build号（格式：Build/19045、Build 22621等）
        const buildMatch = ua.match(/Build[\/\s](\d+)/i);
        if (buildMatch && buildMatch[1]) {
            return parseInt(buildMatch[1]); // 返回数字格式Build号（如19045、22621）
        }
        // 兜底：从UserAgentData提取（现代浏览器）
        if (window.navigator?.userAgentData?.platformVersion) {
            const versionParts = window.navigator.userAgentData.platformVersion.split('.');
            if (versionParts.length >= 3) {
                return parseInt(versionParts[2]); // platformVersion: "10.0.22621" → 22621
            }
        }
        return 'unknown'; // 非Windows/无Build号
    }

    // ========== 采集基础信息（新增Build号字段） ==========
    static collectBasicInfo() {
        const nav = window.navigator || {};
        const scr = window.screen || {};
        const loc = window.location || {};
        const ua = nav.userAgent || '';
        
        // 解析基础OS/浏览器信息
        const parsedInfo = this.parseUserAgent(ua);
        // 提取Windows Build号
        const windowsBuildNumber = this.getWindowsBuildNumber(ua);

        return {
            timestamp: Date.now(),
            currentUrl: loc.href,
            referrer: document.referrer,

            // 浏览器信息
            browser: {
                name: parsedInfo.browser.name,
                version: parsedInfo.browser.version,
                cookieEnabled: window.location.protocol !== 'file:' ? nav.cookieEnabled || false : false,
                hardwareConcurrency: nav.hardwareConcurrency || 'unknown'
            },

            // 操作系统信息（核心：新增buildNumber字段）
            os: {
                name: parsedInfo.os.name,
                version: parsedInfo.os.version,
                buildNumber: windowsBuildNumber, // 上报Build号（关键字段）
                rawUA: ua // 原始UA（溯源用）
            },

            // 屏幕信息
            screen: {
                width: scr.width,
                height: scr.height,
                pixelRatio: window.devicePixelRatio || 'unknown'
            },

            // FingerprintJS后续补充...
            rawUserAgent: ua
        };
    }

    // ========== 简化版UA解析（仅基础OS/浏览器） ==========
    static parseUserAgent(ua) {
        const result = { browser: { name: 'unknown', version: 'unknown' }, os: { name: 'unknown', version: 'unknown' } };
        
        // 解析浏览器
        if (/Chrome/i.test(ua)) result.browser = { name: 'Chrome', version: /Chrome\/(\d+)/i.exec(ua)[1] || 'unknown' };
        else if (/Firefox/i.test(ua)) result.browser = { name: 'Firefox', version: /Firefox\/(\d+)/i.exec(ua)[1] || 'unknown' };
        else if (/Edge/i.test(ua)) result.browser = { name: 'Edge', version: /Edge\/(\d+)/i.exec(ua)[1] || 'unknown' };
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) result.browser = { name: 'Safari', version: /Version\/(\d+)/i.exec(ua)[1] || 'unknown' };

        // 解析操作系统
        if (/Windows NT 10.0/i.test(ua)) result.os = { name: 'Windows', version: '10/11' };
        else if (/Windows NT 6./i.test(ua)) result.os = { name: 'Windows', version: '7/8/8.1' };
        else if (/Mac OS X/i.test(ua)) result.os = { name: 'macOS', version: /Mac OS X (\d+)/i.exec(ua)[1] || 'unknown' };
        else if (/Android/i.test(ua)) result.os = { name: 'Android', version: /Android (\d+)/i.exec(ua)[1] || 'unknown' };
        else if (/iOS/i.test(ua)) result.os = { name: 'iOS', version: /OS (\d+)/i.exec(ua)[1] || 'unknown' };

        return result;
    }

    // ========== 采集FingerprintJS信息 ==========
    static async collectFingerprint() {
        try {
            if (!window.FingerprintJS) throw new Error('FingerprintJS未加载');
            const fp = await window.FingerprintJS.load(this.CONFIG.FP_LOAD_OPTIONS);
            const res = await fp.get();
            return {
                visitorId: res.visitorId,
                confidence: res.confidence.score,
                rawComponents: res.components
            };
        } catch (e) {
            this.log('Fingerprint采集失败:', e.message);
            return { visitorId: 'unknown', confidence: 0, rawComponents: {} };
        }
    }

    // ========== 上报数据（含Build号） ==========
    static async reportData(data) {
        try {
            const response = await fetch(this.CONFIG.REPORT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                timeout: this.CONFIG.TIMEOUT,
                credentials: 'same-origin'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const resData = await response.json();
            this.log('上报成功:', resData);
            return resData;
        } catch (e) {
            this.log('上报失败:', e.message);
            return null;
        }
    }

    // ========== 辅助日志 ==========
    static log(...args) {
        if (this.CONFIG.DEBUG) console.log('[DeviceReporter]', ...args);
    }

    // ========== 主流程 ==========
    static async run() {
        try {
            this.log('开始采集...');
            const basicInfo = this.collectBasicInfo(); // 含Build号
            const fingerprintInfo = await this.collectFingerprint();
            const reportData = { ...basicInfo, fingerprint: fingerprintInfo };
            
            // 关键：打印Build号（验证）
            this.log('采集到Windows Build号:', basicInfo.os.buildNumber);
            
            await this.reportData(reportData);
        } catch (e) {
            this.log('流程失败:', e.message);
        }
    }
}

// 页面加载后执行
document.addEventListener('DOMContentLoaded', () => DeviceReporter.run());