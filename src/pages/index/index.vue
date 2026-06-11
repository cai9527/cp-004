<template>
    <view class="workbench">
        <view class="header-section">
            <view class="user-info">
                <view class="avatar">
                    <text class="avatar-text">{{ userInitial }}</text>
                </view>
                <view class="user-detail">
                    <text class="user-name">{{ userName }}</text>
                    <view class="user-role">
                        <text class="role-tag">{{ userRoleName }}</text>
                        <view v-if="!networkStatus" class="offline-tag">
                            <text class="offline-dot"></text>
                            <text>离线</text>
                        </view>
                    </view>
                </view>
                <view class="header-right">
                    <view class="bell-icon" @tap="goSync">
                        <text>🔔</text>
                        <view v-if="pendingSyncCount > 0" class="badge">{{ pendingSyncCount > 99 ? '99+' : pendingSyncCount }}</view>
                    </view>
                </view>
            </view>

            <view class="project-banner">
                <view class="project-icon">🏗️</view>
                <view class="project-info">
                    <text class="project-label">当前项目</text>
                    <text class="project-name">{{ currentProjectName }}</text>
                </view>
                <view class="project-arrow">›</view>
            </view>
        </view>

        <view class="stats-card">
            <view class="stats-header">
                <text class="stats-title">今日概览</text>
                <text class="stats-date">{{ todayStr }}</text>
            </view>
            <view class="stats-grid">
                <view class="stat-item stat-blue" @tap="goTaskList('pending')">
                    <view class="stat-icon">📋</view>
                    <view class="stat-content">
                        <text class="stat-value">{{ stats.pendingTasks || 0 }}</text>
                        <text class="stat-label">待接任务</text>
                    </view>
                </view>
                <view class="stat-item stat-green" @tap="goTaskList('accepted')">
                    <view class="stat-icon">✅</view>
                    <view class="stat-content">
                        <text class="stat-value">{{ stats.acceptedTasks || 0 }}</text>
                        <text class="stat-label">待巡检</text>
                    </view>
                </view>
                <view class="stat-item stat-orange" @tap="goTaskList('processing')">
                    <view class="stat-icon">🔄</view>
                    <view class="stat-content">
                        <text class="stat-value">{{ stats.processingTasks || 0 }}</text>
                        <text class="stat-label">巡检中</text>
                    </view>
                </view>
                <view class="stat-item stat-red" @tap="goHazardList">
                    <view class="stat-icon">⚠️</view>
                    <view class="stat-content">
                        <text class="stat-value">{{ stats.todayHazards || 0 }}</text>
                        <text class="stat-label">今日隐患</text>
                    </view>
                </view>
            </view>

            <view class="stats-extra">
                <view class="extra-item" @tap="goRectify">
                    <text class="extra-label">我的整改</text>
                    <view class="extra-value-wrap">
                        <text class="extra-value">{{ stats.myRectify || 0 }}</text>
                        <text class="extra-arrow">›</text>
                    </view>
                </view>
                <view class="extra-divider"></view>
                <view class="extra-item" @tap="goHazardList('review')">
                    <text class="extra-label">待复查</text>
                    <view class="extra-value-wrap">
                        <text class="extra-value">{{ stats.pendingReview || 0 }}</text>
                        <text class="extra-arrow">›</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="quick-actions">
            <view class="section-title">
                <text>快捷功能</text>
            </view>
            <view class="action-grid">
                <view class="action-item" @tap="goReportHazard">
                    <view class="action-icon action-icon-red">📝</view>
                    <text class="action-text">隐患上报</text>
                </view>
                <view class="action-item" @tap="goTaskList">
                    <view class="action-icon action-icon-blue">📑</view>
                    <text class="action-text">巡检任务</text>
                </view>
                <view class="action-item" @tap="goRectify">
                    <view class="action-icon action-icon-orange">🛠️</view>
                    <text class="action-text">整改跟踪</text>
                </view>
                <view class="action-item" @tap="goStatistics">
                    <view class="action-icon action-icon-green">📊</view>
                    <text class="action-text">数据分析</text>
                </view>
                <view class="action-item" @tap="goScan">
                    <view class="action-icon action-icon-purple">📷</view>
                    <text class="action-text">扫码检查</text>
                </view>
                <view class="action-item" @tap="goSync">
                    <view class="action-icon action-icon-cyan">🔄</view>
                    <text class="action-text">离线同步</text>
                </view>
                <view class="action-item" @tap="showOfflineMap">
                    <view class="action-icon action-icon-yellow">🗺️</view>
                    <text class="action-text">现场地图</text>
                </view>
                <view class="action-item" @tap="showHelp">
                    <view class="action-icon action-icon-gray">❓</view>
                    <text class="action-text">帮助中心</text>
                </view>
            </view>
        </view>

        <view class="recent-section">
            <view class="section-header">
                <view class="section-title">
                    <text>最新任务</text>
                </view>
                <view class="section-more" @tap="goTaskList">
                    <text>查看全部</text>
                    <text class="more-arrow">›</text>
                </view>
            </view>
            <view v-if="recentTasks.length > 0" class="task-list">
                <view 
                    v-for="(task, index) in recentTasks" 
                    :key="task.id" 
                    class="task-item"
                    @tap="goTaskDetail(task.id)"
                >
                    <view class="task-left">
                        <view class="task-type-tag" :class="'type-' + task.type">
                            {{ task.typeName }}
                        </view>
                    </view>
                    <view class="task-content">
                        <view class="task-header">
                            <text class="task-title">{{ task.title }}</text>
                            <view class="task-status" :class="'status-' + task.status">
                                {{ getStatusText(task.status) }}
                            </view>
                        </view>
                        <view class="task-meta">
                            <text class="task-no">{{ task.taskNo }}</text>
                            <text class="task-deadline">截止: {{ task.deadline }}</text>
                        </view>
                        <view class="task-area">
                            <text>📍 {{ task.area }}</text>
                        </view>
                    </view>
                </view>
            </view>
            <view v-else class="empty-mini">
                <text>暂无任务</text>
            </view>
        </view>

        <view class="recent-section">
            <view class="section-header">
                <view class="section-title">
                    <text>最新隐患</text>
                </view>
                <view class="section-more" @tap="goHazardList">
                    <text>查看全部</text>
                    <text class="more-arrow">›</text>
                </view>
            </view>
            <view v-if="recentHazards.length > 0" class="hazard-list">
                <view 
                    v-for="hazard in recentHazards" 
                    :key="hazard.id" 
                    class="hazard-item"
                    @tap="goHazardDetail(hazard.id)"
                >
                    <view class="hazard-level-bar" :class="'level-' + hazard.level"></view>
                    <view class="hazard-content">
                        <view class="hazard-header">
                            <text class="hazard-title">{{ hazard.title }}</text>
                            <view class="hazard-level-tag" :class="'level-tag-' + hazard.level">
                                {{ hazard.levelName }}
                            </view>
                        </view>
                        <view class="hazard-meta">
                            <text class="hazard-location">📍 {{ hazard.location }}</text>
                        </view>
                        <view class="hazard-footer">
                            <text class="hazard-no">{{ hazard.hazardNo }}</text>
                            <view class="hazard-status" :class="'hstatus-' + hazard.status">
                                {{ getHazardStatusText(hazard.status) }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view v-else class="empty-mini">
                <text>暂无隐患记录</text>
            </view>
        </view>

        <view class="bottom-space"></view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            stats: {},
            recentTasks: [],
            recentHazards: []
        }
    },
    computed: {
        userName() {
            return this.$store.state.user ? this.$store.state.user.name : '未登录'
        },
        userRoleName() {
            return this.$store.state.user ? this.$store.state.user.roleName : ''
        },
        userInitial() {
            return this.userName.charAt(0)
        },
        networkStatus() {
            return this.$store.state.networkStatus
        },
        pendingSyncCount() {
            return this.$store.getters.getPendingSyncCount
        },
        currentProjectName() {
            const projects = this.$store.state.projects
            return projects.length > 0 ? projects[0].name : '城东新区商业综合体项目'
        },
        todayStr() {
            const d = new Date()
            return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
        }
    },
    onShow() {
        if (!this.$store.getters.isLoggedIn) {
            uni.reLaunch({ url: '/pages/login/login' })
            return
        }
        this.loadData()
    },
    onPullDownRefresh() {
        this.loadData().finally(() => {
            uni.stopPullDownRefresh()
        })
    },
    methods: {
        async loadData() {
            this.loading = true
            try {
                await this.$store.dispatch('loadProjects')
                const res = await this.$store.dispatch('loadWorkbench')
                if (res.code === 200) {
                    this.stats = res.data.stats || {}
                    this.recentTasks = res.data.recentTasks || []
                    this.recentHazards = res.data.recentHazards || []
                }
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },

        getStatusText(status) {
            const map = {
                pending: '待接收',
                accepted: '待巡检',
                processing: '巡检中',
                completed: '已完成',
                cancelled: '已取消',
                overdue: '已逾期'
            }
            return map[status] || status
        },

        getHazardStatusText(status) {
            const map = {
                reported: '已上报',
                assigned: '已指派',
                rectifying: '整改中',
                review: '待复查',
                closed: '已闭环',
                rejected: '已驳回'
            }
            return map[status] || status
        },

        goTaskList(status) {
            const url = status ? `/pages/task/list?status=${status}` : '/pages/task/list'
            uni.switchTab({ url: '/pages/task/list' })
            setTimeout(() => {
                uni.$emit('filterTasks', { status })
            }, 100)
        },

        goTaskDetail(id) {
            uni.navigateTo({ url: `/pages/task/detail?id=${id}` })
        },

        goHazardList(status) {
            uni.switchTab({ url: '/pages/hazard/list' })
            if (status) {
                setTimeout(() => {
                    uni.$emit('filterHazards', { status })
                }, 100)
            }
        },

        goHazardDetail(id) {
            uni.navigateTo({ url: `/pages/hazard/detail?id=${id}` })
        },

        goReportHazard() {
            uni.navigateTo({ url: '/pages/hazard/report' })
        },

        goRectify() {
            uni.navigateTo({ url: '/pages/rectify/list' })
        },

        goStatistics() {
            uni.switchTab({ url: '/pages/statistics/index' })
        },

        goSync() {
            uni.navigateTo({ url: '/pages/mine/sync' })
        },

        goScan() {
            uni.scanCode({
                success: (res) => {
                    uni.showToast({ title: '扫码: ' + res.result, icon: 'none' })
                },
                fail: () => {
                    uni.showToast({ title: '扫码功能演示', icon: 'none' })
                }
            })
        },

        showOfflineMap() {
            uni.showToast({ title: '现场地图功能开发中', icon: 'none' })
        },

        showHelp() {
            uni.showModal({
                title: '帮助中心',
                content: '使用说明：\n1. 在"任务"页面接收并执行巡检任务\n2. 发现安全隐患可在"隐患上报"页面登记\n3. 整改人员在"整改跟踪"中处理整改任务\n4. 所有操作均支持离线采集，联网后自动同步',
                showCancel: false,
                confirmText: '我知道了'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.workbench {
    min-height: 100vh;
    background: #F5F6FA;
    padding-bottom: 120rpx;
}

.header-section {
    background: linear-gradient(180deg, #1E88E5 0%, #1565C0 100%);
    padding: 0 32rpx 120rpx;
    padding-top: calc(var(--status-bar-height, 44px) + 20rpx);
}

.user-info {
    display: flex;
    align-items: center;
    padding: 24rpx 0 40rpx;
}

.avatar {
    width: 96rpx;
    height: 96rpx;
    background: linear-gradient(135deg, #FFD54F, #FFA726);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.avatar-text {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
}

.user-detail {
    flex: 1;
    margin-left: 20rpx;
}

.user-name {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8rpx;
}

.user-role {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.role-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    color: #fff;
}

.offline-tag {
    display: flex;
    align-items: center;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    background: rgba(255, 87, 34, 0.9);
    border-radius: 20rpx;
    color: #fff;
}

.offline-dot {
    width: 12rpx;
    height: 12rpx;
    background: #fff;
    border-radius: 50%;
    margin-right: 8rpx;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.header-right {
    display: flex;
    align-items: center;
}

.bell-icon {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
}

.badge {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    min-width: 32rpx;
    height: 32rpx;
    background: #E53935;
    border-radius: 16rpx;
    font-size: 20rpx;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    font-weight: 600;
}

.project-banner {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 20rpx;
    padding: 28rpx 24rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.project-icon {
    width: 80rpx;
    height: 80rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 20rpx;
}

.project-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.project-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6rpx;
}

.project-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
    line-height: 1.4;
}

.project-arrow {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-left: 16rpx;
}

.stats-card {
    background: #fff;
    margin: -80rpx 24rpx 24rpx;
    border-radius: 24rpx;
    padding: 32rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28rpx;
}

.stats-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
}

.stats-date {
    font-size: 24rpx;
    color: #999;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    margin-bottom: 28rpx;
}

.stat-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-radius: 16rpx;
    transition: transform 0.2s;
}

.stat-item:active {
    transform: scale(0.96);
}

.stat-blue {
    background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
}
.stat-green {
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
}
.stat-orange {
    background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
}
.stat-red {
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
}

.stat-icon {
    width: 72rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    margin-right: 20rpx;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 44rpx;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1.2;
}

.stat-label {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
}

.stats-extra {
    display: flex;
    align-items: center;
    background: #F8F9FC;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
}

.extra-item {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.extra-label {
    font-size: 26rpx;
    color: #666;
}

.extra-value-wrap {
    display: flex;
    align-items: center;
}

.extra-value {
    font-size: 32rpx;
    font-weight: 700;
    color: #1E88E5;
    margin-right: 4rpx;
}

.extra-arrow {
    font-size: 28rpx;
    color: #999;
}

.extra-divider {
    width: 2rpx;
    height: 40rpx;
    background: #E0E4E8;
    margin: 0 24rpx;
}

.quick-actions {
    margin: 24rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
}

.section-title::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 28rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 12rpx;
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 8rpx;
    transition: transform 0.2s;
}

.action-item:active {
    transform: scale(0.92);
}

.action-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-bottom: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.action-icon-red { background: linear-gradient(135deg, #FFCDD2, #FFEBEE); }
.action-icon-blue { background: linear-gradient(135deg, #BBDEFB, #E3F2FD); }
.action-icon-orange { background: linear-gradient(135deg, #FFE0B2, #FFF3E0); }
.action-icon-green { background: linear-gradient(135deg, #C8E6C9, #E8F5E9); }
.action-icon-purple { background: linear-gradient(135deg, #E1BEE7, #F3E5F5); }
.action-icon-cyan { background: linear-gradient(135deg, #B2EBF2, #E0F7FA); }
.action-icon-yellow { background: linear-gradient(135deg, #FFF9C4, #FFFDE7); }
.action-icon-gray { background: linear-gradient(135deg, #E0E0E0, #F5F5F5); }

.action-text {
    font-size: 24rpx;
    color: #333;
    text-align: center;
}

.recent-section {
    margin: 24rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
}

.section-header .section-title {
    margin-bottom: 0;
}

.section-more {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #1E88E5;
}

.more-arrow {
    margin-left: 4rpx;
    font-size: 28rpx;
}

.task-list,
.hazard-list {
    display: flex;
    flex-direction: column;
}

.task-item {
    display: flex;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F5F6FA;
}

.task-item:last-child {
    border-bottom: none;
}

.task-left {
    margin-right: 16rpx;
}

.task-type-tag {
    font-size: 20rpx;
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
    background: #E3F2FD;
    color: #1565C0;
    font-weight: 500;
}

.type-special { background: #FFEBEE; color: #C62828; }
.type-daily { background: #E8F5E9; color: #2E7D32; }

.task-content {
    flex: 1;
    min-width: 0;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8rpx;
}

.task-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
    margin-right: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.task-status {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
}

.status-pending { background: #FFF8E1; color: #F57C00; }
.status-accepted { background: #E3F2FD; color: #1565C0; }
.status-processing { background: #E8F5E9; color: #2E7D32; }
.status-completed { background: #E8F5E9; color: #2E7D32; }
.status-overdue { background: #FFEBEE; color: #C62828; }

.task-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
}

.task-no,
.task-deadline {
    font-size: 22rpx;
    color: #999;
}

.task-area {
    font-size: 24rpx;
    color: #666;
}

.hazard-item {
    display: flex;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F5F6FA;
}

.hazard-item:last-child {
    border-bottom: none;
}

.hazard-level-bar {
    width: 6rpx;
    border-radius: 3rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.level-critical, .level-high { background: #E53935; }
.level-medium { background: #FB8C00; }
.level-low { background: #43A047; }

.hazard-content {
    flex: 1;
    min-width: 0;
}

.hazard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8rpx;
}

.hazard-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
    margin-right: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.hazard-level-tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-weight: 500;
    flex-shrink: 0;
}

.level-tag-critical, .level-tag-high { background: #FFEBEE; color: #C62828; }
.level-tag-medium { background: #FFF8E1; color: #F57C00; }
.level-tag-low { background: #E8F5E9; color: #2E7D32; }

.hazard-meta {
    margin-bottom: 10rpx;
}

.hazard-location {
    font-size: 24rpx;
    color: #666;
}

.hazard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hazard-no {
    font-size: 22rpx;
    color: #999;
}

.hazard-status {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
}

.hstatus-reported { background: #FFF8E1; color: #F57C00; }
.hstatus-assigned { background: #E3F2FD; color: #1565C0; }
.hstatus-rectifying { background: #FFF3E0; color: #E65100; }
.hstatus-review { background: #F3E5F5; color: #6A1B9A; }
.hstatus-closed { background: #E8F5E9; color: #2E7D32; }

.empty-mini {
    padding: 60rpx 0;
    text-align: center;
    color: #999;
    font-size: 26rpx;
}

.bottom-space {
    height: 40rpx;
}
</style>
