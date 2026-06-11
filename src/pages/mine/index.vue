<template>
    <view class="mine-page">
        <view class="user-header">
            <view class="header-bg"></view>
            <view class="user-card">
                <view class="avatar-wrap">
                    <view class="avatar">
                        <text class="avatar-text">{{ userInitial }}</text>
                    </view>
                    <view v-if="networkStatus" class="status-dot online"></view>
                    <view v-else class="status-dot offline"></view>
                </view>
                <view class="user-info">
                    <text class="user-name">{{ userName }}</text>
                    <view class="user-meta-row">
                        <view class="meta-tag role-tag">
                            <text class="meta-icon">👤</text>
                            <text class="meta-text">{{ userRole }}</text>
                        </view>
                        <view class="meta-tag">
                            <text class="meta-icon">🏢</text>
                            <text class="meta-text">{{ userDept }}</text>
                        </view>
                    </view>
                    <view class="user-no-row">
                        <text class="no-label">工号：</text>
                        <text class="no-value">{{ userEmployeeNo }}</text>
                    </view>
                </view>
                <view class="edit-icon">
                    <text>›</text>
                </view>
            </view>
        </view>

        <view class="stats-section">
            <view class="stats-card">
                <view class="stat-cell" @tap="goTaskList">
                    <text class="stat-value stat-blue">{{ monthTasks }}</text>
                    <text class="stat-label">本月任务</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-cell" @tap="goHazardList">
                    <text class="stat-value stat-orange">{{ foundHazards }}</text>
                    <text class="stat-label">发现隐患</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-cell" @tap="goRectify">
                    <text class="stat-value stat-green">{{ completedRectify }}</text>
                    <text class="stat-label">整改完成</text>
                </view>
            </view>
        </view>

        <view class="menu-section">
            <view class="section-title-wrap">
                <text class="section-title">常用功能</text>
            </view>
            <view class="menu-card">
                <view class="menu-item" @tap="goMessage">
                    <view class="menu-icon-wrap icon-blue">
                        <text class="menu-icon">💬</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">我的消息</text>
                    </view>
                    <view class="menu-badge" v-if="msgCount > 0">{{ msgCount > 99 ? '99+' : msgCount }}</view>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-item" @tap="goChangePassword">
                    <view class="menu-icon-wrap icon-purple">
                        <text class="menu-icon">🔒</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">修改密码</text>
                    </view>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-item" @tap="goSync">
                    <view class="menu-icon-wrap icon-green">
                        <text class="menu-icon">🔄</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">离线同步</text>
                    </view>
                    <view class="menu-badge sync-badge" v-if="pendingSyncCount > 0">
                        {{ pendingSyncCount }}
                    </view>
                    <text class="menu-arrow">›</text>
                </view>
            </view>
        </view>

        <view class="menu-section">
            <view class="section-title-wrap">
                <text class="section-title">系统设置</text>
            </view>
            <view class="menu-card">
                <view class="menu-item" @tap="goAbout">
                    <view class="menu-icon-wrap icon-orange">
                        <text class="menu-icon">ℹ️</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">关于我们</text>
                    </view>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-item" @tap="goHelp">
                    <view class="menu-icon-wrap icon-cyan">
                        <text class="menu-icon">❓</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">帮助中心</text>
                    </view>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-item" @tap="goFeedback">
                    <view class="menu-icon-wrap icon-pink">
                        <text class="menu-icon">📝</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">意见反馈</text>
                    </view>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-item" @tap="toggleNetwork">
                    <view class="menu-icon-wrap" :class="networkStatus ? 'icon-green' : 'icon-red'">
                        <text class="menu-icon">{{ networkStatus ? '📶' : '📵' }}</text>
                    </view>
                    <view class="menu-content">
                        <text class="menu-title">网络状态</text>
                        <text class="menu-desc">{{ networkStatus ? '已连接' : '离线模式' }}</text>
                    </view>
                    <switch 
                        :checked="networkStatus" 
                        @change="onNetworkChange" 
                        color="#1E88E5"
                    />
                </view>
            </view>
        </view>

        <view class="version-section">
            <text class="version-text">版本 v1.0.0</text>
        </view>

        <view class="logout-section">
            <button class="btn-logout" @tap="handleLogout">
                <text>退出登录</text>
            </button>
        </view>

        <view class="bottom-space"></view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            msgCount: 5,
            monthTasks: 28,
            foundHazards: 45,
            completedRectify: 38
        }
    },
    computed: {
        user() {
            return this.$store.state.user || {}
        },
        userName() {
            return this.user.name || '未登录'
        },
        userInitial() {
            return this.user.name ? this.user.name.charAt(0) : 'U'
        },
        userRole() {
            const roleMap = {
                admin: '项目经理',
                inspector: '安全员',
                worker: '施工员'
            }
            return roleMap[this.user.role] || '未知角色'
        },
        userDept() {
            return this.user.department || '安全管理部'
        },
        userEmployeeNo() {
            return this.user.employeeNo || 'EMP000'
        },
        networkStatus() {
            return this.$store.state.networkStatus
        },
        pendingSyncCount() {
            return this.$store.getters.getPendingSyncCount
        }
    },
    onShow() {
        this.loadStats()
    },
    methods: {
        loadStats() {
            const tasks = this.$store.state.tasks || []
            const hazards = this.$store.state.hazards || []
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            
            this.monthTasks = tasks.filter(t => new Date(t.createdAt) >= monthStart).length
            this.foundHazards = hazards.filter(h => 
                h.reporterId === this.user.id && new Date(h.reportTime) >= monthStart
            ).length
            this.completedRectify = hazards.filter(h => 
                h.rectifierId === this.user.id && h.status === 'closed' && 
                new Date(h.closeTime || h.updatedAt) >= monthStart
            ).length
        },

        goTaskList() {
            uni.switchTab({ url: '/pages/task/list' })
        },

        goHazardList() {
            uni.switchTab({ url: '/pages/hazard/list' })
        },

        goRectify() {
            uni.navigateTo({ url: '/pages/rectify/list' })
        },

        goMessage() {
            uni.showToast({ title: '消息功能开发中', icon: 'none' })
        },

        goChangePassword() {
            uni.showToast({ title: '修改密码功能开发中', icon: 'none' })
        },

        goSync() {
            uni.navigateTo({ url: '/pages/mine/sync' })
        },

        goAbout() {
            uni.showModal({
                title: '关于智慧工地巡检',
                content: '智慧工地安全巡检系统 v1.0.0\n\n致力于提升工地安全管理水平，实现巡检流程数字化、智能化。\n\n© 2024 智慧工地科技有限公司',
                showCancel: false
            })
        },

        goHelp() {
            uni.showToast({ title: '帮助中心开发中', icon: 'none' })
        },

        goFeedback() {
            uni.showToast({ title: '意见反馈开发中', icon: 'none' })
        },

        toggleNetwork() {},

        onNetworkChange(e) {
            const isConnected = e.detail.value
            this.$store.commit('SET_NETWORK_STATUS', isConnected)
            uni.showToast({
                title: isConnected ? '已切换到在线模式' : '已切换到离线模式',
                icon: 'none'
            })
            if (isConnected) {
                this.$store.dispatch('autoSyncOfflineData')
            }
        },

        handleLogout() {
            uni.showModal({
                title: '确认退出',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.$store.commit('CLEAR_AUTH')
                        uni.reLaunch({ url: '/pages/login/login' })
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.mine-page {
    min-height: 100vh;
    background: #F5F6FA;
}

.user-header {
    position: relative;
    padding-top: 20rpx;
}

.header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 280rpx;
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%);
    border-radius: 0 0 40rpx 40rpx;
}

.user-card {
    position: relative;
    display: flex;
    align-items: center;
    background: #fff;
    margin: 0 24rpx;
    padding: 32rpx;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.avatar-wrap {
    position: relative;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #64B5F6 0%, #1E88E5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(30, 136, 229, 0.3);
}

.avatar-text {
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
}

.status-dot {
    position: absolute;
    bottom: 4rpx;
    right: 4rpx;
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
}

.status-dot.online {
    background: #43A047;
}

.status-dot.offline {
    background: #9E9E9E;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
    display: block;
    margin-bottom: 12rpx;
}

.user-meta-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 8rpx;
    flex-wrap: wrap;
}

.meta-tag {
    display: flex;
    align-items: center;
    padding: 6rpx 12rpx;
    background: #F5F6FA;
    border-radius: 8rpx;
}

.role-tag {
    background: #E3F2FD;
}

.meta-icon {
    font-size: 20rpx;
    margin-right: 6rpx;
}

.meta-text {
    font-size: 22rpx;
    color: #666;
}

.role-tag .meta-text {
    color: #1565C0;
    font-weight: 500;
}

.user-no-row {
    display: flex;
    align-items: center;
}

.no-label {
    font-size: 22rpx;
    color: #999;
}

.no-value {
    font-size: 22rpx;
    color: #666;
}

.edit-icon {
    flex-shrink: 0;
    padding: 16rpx;
}

.edit-icon text {
    font-size: 40rpx;
    color: #CCC;
    font-weight: 300;
}

.stats-section {
    padding: 24rpx;
}

.stats-card {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx 16rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 48rpx;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 8rpx;
}

.stat-blue { color: #1E88E5; }
.stat-orange { color: #FB8C00; }
.stat-green { color: #43A047; }

.stat-label {
    font-size: 24rpx;
    color: #999;
}

.stat-divider {
    width: 2rpx;
    background: #F0F2F5;
    margin: 0 8rpx;
}

.menu-section {
    padding: 0 24rpx 24rpx;
}

.section-title-wrap {
    padding: 16rpx 8rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #666;
}

.menu-card {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 2rpx solid #F8F9FC;
    position: relative;
}

.menu-item:last-child {
    border-bottom: none;
}

.menu-icon-wrap {
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.icon-blue { background: #E3F2FD; }
.icon-green { background: #E8F5E9; }
.icon-orange { background: #FFF3E0; }
.icon-purple { background: #F3E5F5; }
.icon-cyan { background: #E0F7FA; }
.icon-pink { background: #FCE4EC; }
.icon-red { background: #FFEBEE; }

.menu-icon {
    font-size: 32rpx;
}

.menu-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.menu-title {
    font-size: 30rpx;
    color: #1a1a1a;
    font-weight: 500;
}

.menu-desc {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
}

.menu-badge {
    min-width: 36rpx;
    height: 36rpx;
    background: #E53935;
    color: #fff;
    border-radius: 18rpx;
    font-size: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12rpx;
    padding: 0 10rpx;
    font-weight: 500;
}

.sync-badge {
    background: #FB8C00;
}

.menu-arrow {
    font-size: 32rpx;
    color: #CCC;
    font-weight: 300;
    flex-shrink: 0;
}

.version-section {
    padding: 24rpx;
    text-align: center;
}

.version-text {
    font-size: 24rpx;
    color: #CCC;
}

.logout-section {
    padding: 0 24rpx 24rpx;
}

.btn-logout {
    width: 100%;
    height: 96rpx;
    background: #fff;
    border: 2rpx solid #E53935;
    border-radius: 48rpx;
    color: #E53935;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-logout::after {
    border: none;
}

.bottom-space {
    height: 40rpx;
}
</style>
