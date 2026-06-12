<template>
    <view class="login-page">
        <view class="login-header">
            <view class="login-bg">
                <view class="bg-circle bg-circle-1"></view>
                <view class="bg-circle bg-circle-2"></view>
            </view>
            <view class="logo-area">
                <view class="logo-icon">
                    <view class="logo-shape">
                        <text class="logo-icon-text">安</text>
                    </view>
                </view>
                <text class="app-title">智慧工地巡检</text>
                <text class="app-subtitle">Smart Site Inspection</text>
            </view>
        </view>

        <view class="login-body">
            <view class="form-card">
                <view class="form-title">
                    <text>账号登录</text>
                </view>

                <view class="form-item">
                    <view class="input-icon">
                        <text class="iconfont">👤</text>
                    </view>
                    <input 
                        class="form-input" 
                        type="text" 
                        v-model="form.username" 
                        placeholder="请输入用户名"
                        placeholder-class="input-placeholder"
                    />
                </view>

                <view class="form-item">
                    <view class="input-icon">
                        <text class="iconfont">🔒</text>
                    </view>
                    <input 
                        class="form-input" 
                        :password="!showPassword" 
                        v-model="form.password" 
                        placeholder="请输入密码"
                        placeholder-class="input-placeholder"
                        @confirm="handleLogin"
                    />
                    <view class="toggle-password" @tap="showPassword = !showPassword">
                        <text>{{ showPassword ? '🙈' : '👁️' }}</text>
                    </view>
                </view>

                <view class="form-options">
                    <view class="remember-me" @tap="toggleRemember">
                        <checkbox 
                            :checked="rememberMe" 
                            color="#1E88E5"
                            class="remember-checkbox"
                            @tap.stop="toggleRemember"
                        />
                        <text class="remember-text">记住密码</text>
                    </view>
                    <text class="forgot-password" @tap="showTip">忘记密码？</text>
                </view>

                <button 
                    class="btn-login" 
                    :class="{ loading: isLoading }" 
                    @tap="handleLogin"
                    :disabled="isLoading"
                >
                    <text v-if="!isLoading">登 录</text>
                    <view v-else class="loading-spinner"></view>
                </button>

                <view class="demo-accounts">
                    <text class="demo-title">演示账号：</text>
                    <view class="demo-list">
                        <view class="demo-item" @tap="fillAccount('admin')">
                            <text class="demo-role">项目经理</text>
                            <text class="demo-account">admin/123456</text>
                        </view>
                        <view class="demo-item" @tap="fillAccount('inspector')">
                            <text class="demo-role">安全员</text>
                            <text class="demo-account">inspector/123456</text>
                        </view>
                        <view class="demo-item" @tap="fillAccount('worker')">
                            <text class="demo-role">施工员</text>
                            <text class="demo-account">worker/123456</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="login-footer">
                <text>© 2024 智慧工地安全管理系统 v1.0.0</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            showPassword: false,
            rememberMe: false,
            isLoading: false
        }
    },
    onLoad() {
        const saved = uni.getStorageSync('remember_account')
        if (saved) {
            try {
                const account = JSON.parse(saved)
                this.form.username = account.username
                this.form.password = account.password
                this.rememberMe = true
            } catch (e) {}
        }
    },
    methods: {
        async handleLogin() {
            if (!this.form.username.trim()) {
                return uni.showToast({ title: '请输入用户名', icon: 'none' })
            }
            if (!this.form.password.trim()) {
                return uni.showToast({ title: '请输入密码', icon: 'none' })
            }

            this.isLoading = true
            try {
                const res = await this.$store.dispatch('login', {
                    username: this.form.username.trim(),
                    password: this.form.password.trim()
                })

                if (res.code === 200) {
                    if (this.rememberMe) {
                        uni.setStorageSync('remember_account', JSON.stringify(this.form))
                    } else {
                        uni.removeStorageSync('remember_account')
                    }
                    uni.showToast({ title: '登录成功', icon: 'success' })
                    setTimeout(() => {
                        uni.switchTab({ url: '/pages/index/index' })
                    }, 1000)
                } else {
                    uni.showToast({ title: res.message || '登录失败', icon: 'none' })
                }
            } catch (err) {
                uni.showToast({ title: '网络异常，请重试', icon: 'none' })
            } finally {
                this.isLoading = false
            }
        },

        fillAccount(type) {
            const accounts = {
                admin: { username: 'admin', password: '123456' },
                inspector: { username: 'inspector', password: '123456' },
                worker: { username: 'worker', password: '123456' }
            }
            this.form = { ...accounts[type] }
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        showTip() {
            uni.showToast({ title: '请联系系统管理员重置密码', icon: 'none' })
        },

        toggleRemember() {
            this.rememberMe = !this.rememberMe
        }
    }
}
</script>

<style lang="scss" scoped>
.login-page {
    min-height: 100vh;
    background: #F5F6FA;
    display: flex;
    flex-direction: column;
}

.login-header {
    position: relative;
    background: linear-gradient(135deg, #1565C0 0%, #1E88E5 50%, #42A5F5 100%);
    padding: 100rpx 48rpx 80rpx;
    overflow: hidden;
}

.login-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
}

.bg-circle-1 {
    width: 500rpx;
    height: 500rpx;
    top: -150rpx;
    right: -100rpx;
}

.bg-circle-2 {
    width: 400rpx;
    height: 400rpx;
    bottom: -100rpx;
    left: -150rpx;
}

.logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
}

.logo-icon {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
    filter: drop-shadow(0 8rpx 24rpx rgba(0, 0, 0, 0.15));
}

.logo-shape {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #FFD54F 0%, #FFA726 100%);
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(45deg);
}

.logo-icon-text {
    transform: rotate(-45deg);
    font-size: 72rpx;
    font-weight: 800;
    color: #fff;
}

.app-title {
    font-size: 48rpx;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8rpx;
    letter-spacing: 4rpx;
}

.app-subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 2rpx;
}

.login-body {
    flex: 1;
    padding: 0 48rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
}

.form-card {
    background: #ffffff;
    border-radius: 28rpx;
    padding: 48rpx 44rpx;
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.1);
}

.form-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 48rpx;
    text-align: center;
}

.form-item {
    display: flex;
    align-items: center;
    background: #F8F9FC;
    border-radius: 20rpx;
    padding: 0 28rpx;
    height: 120rpx;
    margin-bottom: 28rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
}

.form-item:focus-within {
    border-color: #1E88E5;
    background: #ffffff;
    box-shadow: 0 4rpx 16rpx rgba(30, 136, 229, 0.1);
}

.input-icon {
    width: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.iconfont {
    font-size: 40rpx;
}

.form-input {
    flex: 1;
    height: 100%;
    font-size: 32rpx;
    color: #1a1a1a;
}

.input-placeholder {
    color: #B0B8C4;
    font-size: 32rpx;
}

.toggle-password {
    padding: 16rpx;
    margin-right: -16rpx;
}

.toggle-password text {
    font-size: 40rpx;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 44rpx;
    margin-top: 12rpx;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-checkbox {
    transform: scale(0.8);
    margin-right: 4rpx;
}

.remember-text {
    font-size: 28rpx;
    color: #555;
    margin-left: 4rpx;
}

.forgot-password {
    font-size: 28rpx;
    color: #1E88E5;
}

.btn-login {
    width: 100%;
    height: 104rpx;
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 34rpx;
    font-weight: 600;
    letter-spacing: 8rpx;
    box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
    transition: all 0.3s;
    border: none;
    line-height: 104rpx;
    padding: 0;
}

.btn-login::after {
    border: none;
}

.btn-login:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(30, 136, 229, 0.3);
}

.btn-login.loading {
    opacity: 0.8;
}

.loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.demo-accounts {
    margin-top: 44rpx;
    padding-top: 36rpx;
    border-top: 2rpx solid #F0F2F5;
}

.demo-title {
    font-size: 26rpx;
    color: #999;
    display: block;
    margin-bottom: 20rpx;
}

.demo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.demo-item {
    flex: 1;
    min-width: 180rpx;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 16rpx;
    text-align: center;
    transition: all 0.2s;
}

.demo-item:active {
    background: #E3F2FD;
    transform: scale(0.96);
}

.demo-role {
    display: block;
    font-size: 24rpx;
    color: #1E88E5;
    font-weight: 500;
    margin-bottom: 4rpx;
}

.demo-account {
    display: block;
    font-size: 20rpx;
    color: #999;
}

.login-footer {
    padding: 48rpx 24rpx 36rpx;
    text-align: center;
}

.login-footer text {
    font-size: 22rpx;
    color: #B0B8C4;
}
</style>
