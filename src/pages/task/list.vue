<template>
    <view class="task-list-page">
        <view class="search-bar">
            <view class="search-input-wrap">
                <text class="search-icon">🔍</text>
                <input 
                    class="search-input" 
                    type="text" 
                    v-model="keyword" 
                    placeholder="搜索任务编号、标题"
                    placeholder-class="search-placeholder"
                    @confirm="handleSearch"
                    @input="onKeywordInput"
                />
                <text v-if="keyword" class="clear-icon" @tap="clearKeyword">✕</text>
            </view>
        </view>

        <scroll-view class="status-tabs" scroll-x :show-scrollbar="false">
            <view class="tabs-inner">
                <view 
                    v-for="tab in statusTabs" 
                    :key="tab.value"
                    class="tab-item"
                    :class="{ active: currentStatus === tab.value }"
                    @tap="switchTab(tab.value)"
                >
                    <text class="tab-text">{{ tab.label }}</text>
                    <view v-if="getCount(tab.value) > 0" class="tab-badge">
                        {{ getCount(tab.value) }}
                    </view>
                </view>
            </view>
        </scroll-view>

        <view class="filter-bar">
            <view class="filter-item" @tap="showProjectFilter">
                <text class="filter-label">项目</text>
                <text class="filter-value">{{ currentProjectLabel }}</text>
                <text class="filter-arrow">▼</text>
            </view>
            <view class="filter-item" @tap="showTypeFilter">
                <text class="filter-label">类型</text>
                <text class="filter-value">{{ currentTypeLabel }}</text>
                <text class="filter-arrow">▼</text>
            </view>
            <view class="filter-item" @tap="showDateFilter">
                <text class="filter-icon">📅</text>
                <text class="filter-arrow">▼</text>
            </view>
        </view>

        <scroll-view 
            class="task-scroll" 
            scroll-y 
            :refresher-enabled="true"
            :refresher-triggered="isRefreshing"
            @refresherrefresh="onRefresh"
            @scrolltolower="loadMore"
        >
            <view v-if="filteredTasks.length > 0" class="task-container">
                <view 
                    v-for="(task, index) in filteredTasks" 
                    :key="task.id" 
                    class="task-card"
                    @tap="goDetail(task.id)"
                >
                    <view class="card-header">
                        <view class="task-type" :class="'type-' + task.type">
                            <text class="type-icon">{{ getTypeIcon(task.type) }}</text>
                            <text>{{ task.typeName }}</text>
                        </view>
                        <view class="task-priority" :class="'priority-' + task.priority">
                            {{ getPriorityText(task.priority) }}
                        </view>
                    </view>

                    <view class="card-body">
                        <view class="task-title-row">
                            <text class="task-title">{{ task.title }}</text>
                            <view class="task-status" :class="'status-' + task.status">
                                {{ getStatusText(task.status) }}
                            </view>
                        </view>
                        <view class="task-no-row">
                            <text class="task-no">编号：{{ task.taskNo }}</text>
                        </view>
                        <view class="task-info-grid">
                            <view class="info-item">
                                <text class="info-icon">🏗️</text>
                                <text class="info-text">{{ task.projectName }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">📍</text>
                                <text class="info-text">{{ task.area }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">📅</text>
                                <text class="info-text">计划：{{ task.planDate }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">⏰</text>
                                <text class="info-text" :class="{ overdue: isOverdue(task) }">
                                    截止：{{ task.deadline }}
                                </text>
                            </view>
                        </view>
                        <view class="check-summary">
                            <view class="check-item-count">
                                <text class="count-label">检查项：</text>
                                <text class="count-value">{{ task.checkItems ? task.checkItems.length : 0 }}项</text>
                            </view>
                        </view>
                    </view>

                    <view class="card-footer">
                        <view class="assignee-info">
                            <text class="assignee-label">执行人：</text>
                            <text class="assignee-name">{{ task.assigneeName }}</text>
                        </view>
                        <view class="action-buttons">
                            <button 
                                v-if="task.status === 'pending'" 
                                class="btn-accent btn-sm"
                                @tap.stop="acceptTask(task.id)"
                            >
                                接收任务
                            </button>
                            <button 
                                v-else-if="task.status === 'accepted'" 
                                class="btn-primary btn-sm"
                                @tap.stop="startInspection(task.id)"
                            >
                                开始巡检
                            </button>
                            <button 
                                v-else-if="task.status === 'processing'" 
                                class="btn-success btn-sm"
                                @tap.stop="goInspection(task.id)"
                            >
                                继续巡检
                            </button>
                            <button 
                                v-else-if="task.status === 'completed'" 
                                class="btn-outline btn-sm"
                                @tap.stop="goDetail(task.id)"
                            >
                                查看报告
                            </button>
                            <button 
                                v-else 
                                class="btn-outline btn-sm"
                                @tap.stop="goDetail(task.id)"
                            >
                                查看详情
                            </button>
                        </view>
                    </view>

                    <view v-if="task.status === 'overdue' || isOverdue(task)" class="overdue-banner">
                        <text class="overdue-icon">⚠️</text>
                        <text>任务已逾期，请尽快处理</text>
                    </view>
                </view>
            </view>

            <view v-else-if="!loading" class="empty-state">
                <view class="empty-icon">📋</view>
                <text class="empty-title">暂无任务</text>
                <text class="empty-desc">{{ currentStatus === 'all' ? '您当前没有任何巡检任务' : '当前筛选条件下没有任务' }}</text>
            </view>

            <view v-if="loading" class="loading-state">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载中...</text>
            </view>

            <view v-if="!loading && filteredTasks.length > 0 && !hasMore" class="no-more">
                <text>— 没有更多了 —</text>
            </view>

            <view class="list-bottom-space"></view>
        </scroll-view>

        <view class="fab-button" @tap="quickCreate">
            <text class="fab-icon">+</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            keyword: '',
            currentStatus: 'all',
            currentProject: 'all',
            currentType: 'all',
            statusTabs: [
                { label: '全部', value: 'all' },
                { label: '待接收', value: 'pending' },
                { label: '待巡检', value: 'accepted' },
                { label: '巡检中', value: 'processing' },
                { label: '已完成', value: 'completed' },
                { label: '已逾期', value: 'overdue' }
            ],
            isRefreshing: false,
            loading: false,
            hasMore: true,
            page: 1,
            pageSize: 20,
            allTasks: []
        }
    },
    computed: {
        projects() {
            return this.$store.state.projects || []
        },
        currentProjectLabel() {
            if (this.currentProject === 'all') return '全部项目'
            const p = this.projects.find(p => p.id === this.currentProject)
            return p ? p.name.substr(0, 8) + (p.name.length > 8 ? '...' : '') : '全部项目'
        },
        currentTypeLabel() {
            const map = { all: '全部类型', daily: '日常巡检', weekly: '周检', monthly: '月检', special: '专项检查', seasonal: '季节性检查' }
            return map[this.currentType] || '全部类型'
        },
        filteredTasks() {
            let tasks = [...this.allTasks]
            const today = new Date().toISOString().slice(0, 10)
            
            tasks = tasks.map(t => {
                if (t.status !== 'completed' && t.status !== 'cancelled' && t.deadline < today) {
                    return { ...t, _overdue: true }
                }
                return t
            })

            if (this.currentStatus === 'overdue') {
                tasks = tasks.filter(t => t.status === 'overdue' || t._overdue)
            } else if (this.currentStatus !== 'all') {
                tasks = tasks.filter(t => t.status === this.currentStatus && !t._overdue)
            }

            if (this.currentProject !== 'all') {
                tasks = tasks.filter(t => t.projectId === this.currentProject)
            }

            if (this.currentType !== 'all') {
                tasks = tasks.filter(t => t.type === this.currentType)
            }

            if (this.keyword.trim()) {
                const kw = this.keyword.trim().toLowerCase()
                tasks = tasks.filter(t =>
                    t.title.toLowerCase().includes(kw) ||
                    t.taskNo.toLowerCase().includes(kw) ||
                    t.area.toLowerCase().includes(kw)
                )
            }

            tasks.sort((a, b) => {
                const statusOrder = { pending: 0, accepted: 1, processing: 2, overdue: 3, completed: 4, cancelled: 5 }
                const orderA = a._overdue ? 3 : (statusOrder[a.status] ?? 9)
                const orderB = b._overdue ? 3 : (statusOrder[b.status] ?? 9)
                if (orderA !== orderB) return orderA - orderB
                return new Date(b.createdAt) - new Date(a.createdAt)
            })

            return tasks
        }
    },
    mounted() {
        uni.$on('filterTasks', this.onFilterTasks)
    },
    beforeDestroy() {
        uni.$off('filterTasks', this.onFilterTasks)
    },
    onShow() {
        this.loadTasks()
    },
    methods: {
        onFilterTasks(data) {
            if (data && data.status) {
                this.currentStatus = data.status
            }
        },

        async loadTasks(showLoading = true) {
            if (showLoading) this.loading = true
            try {
                await this.$store.dispatch('loadProjects')
                const params = {}
                const user = this.$store.state.user
                if (user && user.role === 'inspector') {
                    params.assigneeId = user.id
                }
                const res = await this.$store.dispatch('loadTasks', params)
                if (res.code === 200) {
                    this.allTasks = res.data || []
                }
            } catch (e) {
                console.error(e)
                uni.showToast({ title: '加载失败', icon: 'none' })
            } finally {
                this.loading = false
                this.isRefreshing = false
            }
        },

        async onRefresh() {
            this.isRefreshing = true
            await this.loadTasks(false)
        },

        loadMore() {
            if (this.loading || !this.hasMore) return
        },

        getCount(status) {
            const today = new Date().toISOString().slice(0, 10)
            if (status === 'all') return this.allTasks.length
            if (status === 'overdue') {
                return this.allTasks.filter(t => 
                    (t.status === 'overdue' || (t.deadline < today && t.status !== 'completed' && t.status !== 'cancelled'))
                ).length
            }
            return this.allTasks.filter(t => t.status === status).length
        },

        switchTab(status) {
            this.currentStatus = status
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        onKeywordInput() {
        },

        handleSearch() {
        },

        clearKeyword() {
            this.keyword = ''
        },

        showProjectFilter() {
            const items = ['全部项目', ...this.projects.map(p => p.name)]
            uni.showActionSheet({
                itemList: items,
                success: (res) => {
                    this.currentProject = res.tapIndex === 0 ? 'all' : this.projects[res.tapIndex - 1].id
                }
            })
        },

        showTypeFilter() {
            const types = [
                { label: '全部类型', value: 'all' },
                { label: '日常巡检', value: 'daily' },
                { label: '周检', value: 'weekly' },
                { label: '月检', value: 'monthly' },
                { label: '专项检查', value: 'special' },
                { label: '季节性检查', value: 'seasonal' }
            ]
            uni.showActionSheet({
                itemList: types.map(t => t.label),
                success: (res) => {
                    this.currentType = types[res.tapIndex].value
                }
            })
        },

        showDateFilter() {
            uni.showToast({ title: '日期筛选功能', icon: 'none' })
        },

        getTypeIcon(type) {
            const icons = { daily: '📋', weekly: '📅', monthly: '🗓️', special: '🔍', seasonal: '🌤️' }
            return icons[type] || '📋'
        },

        getPriorityText(priority) {
            const map = { critical: '紧急', high: '高', medium: '中', low: '低' }
            return map[priority] || priority
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

        isOverdue(task) {
            const today = new Date().toISOString().slice(0, 10)
            return task.status !== 'completed' && task.status !== 'cancelled' && task.deadline < today
        },

        goDetail(id) {
            uni.navigateTo({ url: `/pages/task/detail?id=${id}` })
        },

        goInspection(id) {
            uni.navigateTo({ url: `/pages/inspection/record?taskId=${id}` })
        },

        async acceptTask(id) {
            uni.showModal({
                title: '确认接收',
                content: '确定要接收此巡检任务吗？',
                success: async (res) => {
                    if (res.confirm) {
                        uni.showLoading({ title: '接收中...' })
                        try {
                            const result = await this.$store.dispatch('acceptTask', id)
                            uni.hideLoading()
                            if (result.code === 200) {
                                uni.showToast({ title: '接收成功', icon: 'success' })
                                this.loadTasks(false)
                            } else {
                                uni.showToast({ title: result.message || '接收失败', icon: 'none' })
                            }
                        } catch (e) {
                            uni.hideLoading()
                            uni.showToast({ title: '操作失败', icon: 'none' })
                        }
                    }
                }
            })
        },

        startInspection(id) {
            uni.navigateTo({ url: `/pages/inspection/record?taskId=${id}&start=1` })
        },

        quickCreate() {
            uni.showActionSheet({
                itemList: ['新建日常巡检', '新建专项检查', '扫描二维码创建'],
                success: (res) => {
                    if (res.tapIndex === 2) {
                        uni.scanCode({
                            success: (scanRes) => {
                                uni.showToast({ title: '扫码: ' + scanRes.result, icon: 'none' })
                            },
                            fail: () => {
                                uni.showToast({ title: '扫码功能演示', icon: 'none' })
                            }
                        })
                    } else {
                        uni.showToast({ title: '任务创建功能开发中', icon: 'none' })
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.task-list-page {
    min-height: 100vh;
    background: #F5F6FA;
    display: flex;
    flex-direction: column;
}

.search-bar {
    padding: 20rpx 24rpx;
    background: #fff;
}

.search-input-wrap {
    display: flex;
    align-items: center;
    background: #F5F6FA;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;
}

.search-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    opacity: 0.5;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #1a1a1a;
}

.search-placeholder {
    color: #B0B8C4;
}

.clear-icon {
    font-size: 28rpx;
    color: #B0B8C4;
    padding: 0 12rpx;
}

.status-tabs {
    background: #fff;
    white-space: nowrap;
    border-bottom: 2rpx solid #F0F2F5;
}

.tabs-inner {
    display: inline-flex;
    padding: 0 12rpx;
}

.tab-item {
    display: inline-flex;
    align-items: center;
    padding: 24rpx 20rpx;
    position: relative;
}

.tab-text {
    font-size: 28rpx;
    color: #666;
    transition: all 0.2s;
}

.tab-item.active .tab-text {
    color: #1E88E5;
    font-weight: 600;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 4rpx;
    background: #1E88E5;
    border-radius: 2rpx;
}

.tab-badge {
    min-width: 32rpx;
    height: 32rpx;
    background: #E53935;
    color: #fff;
    border-radius: 16rpx;
    font-size: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8rpx;
    padding: 0 8rpx;
    font-weight: 500;
}

.filter-bar {
    display: flex;
    background: #fff;
    padding: 16rpx 24rpx;
    border-bottom: 2rpx solid #F0F2F5;
    gap: 16rpx;
}

.filter-item {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background: #F5F6FA;
    border-radius: 24rpx;
    flex: 1;
}

.filter-label,
.filter-icon {
    font-size: 24rpx;
    color: #666;
    margin-right: 8rpx;
}

.filter-value {
    flex: 1;
    font-size: 24rpx;
    color: #1a1a1a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.filter-arrow {
    font-size: 18rpx;
    color: #999;
    margin-left: 4rpx;
}

.task-scroll {
    flex: 1;
    height: 0;
}

.task-container {
    padding: 24rpx;
}

.task-card {
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    position: relative;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    border-bottom: 2rpx solid #F8F9FC;
}

.task-type {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    background: #E3F2FD;
}

.task-type text {
    font-size: 22rpx;
    color: #1565C0;
    font-weight: 500;
}

.type-icon {
    margin-right: 8rpx;
}

.type-special { background: #FFEBEE; }
.type-special text { color: #C62828; }
.type-monthly { background: #E8F5E9; }
.type-monthly text { color: #2E7D32; }

.task-priority {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.priority-critical { background: #FFEBEE; color: #C62828; }
.priority-high { background: #FFF3E0; color: #E65100; }
.priority-medium { background: #FFF8E1; color: #F57C00; }
.priority-low { background: #E8F5E9; color: #2E7D32; }

.card-body {
    padding: 20rpx 24rpx;
}

.task-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12rpx;
}

.task-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
    margin-right: 16rpx;
    line-height: 1.4;
}

.task-status {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
    font-weight: 500;
}

.status-pending { background: #FFF8E1; color: #F57C00; }
.status-accepted { background: #E3F2FD; color: #1565C0; }
.status-processing { background: #E8F5E9; color: #2E7D32; }
.status-completed { background: #E8F5E9; color: #2E7D32; }
.status-overdue { background: #FFEBEE; color: #C62828; }
.status-cancelled { background: #F5F5F5; color: #616161; }

.task-no-row {
    margin-bottom: 16rpx;
}

.task-no {
    font-size: 22rpx;
    color: #999;
}

.task-info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
}

.info-item {
    display: flex;
    align-items: center;
    width: calc(50% - 6rpx);
    min-width: 0;
}

.info-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
    flex-shrink: 0;
}

.info-text {
    font-size: 24rpx;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.info-text.overdue {
    color: #E53935;
    font-weight: 500;
}

.check-summary {
    padding-top: 12rpx;
    border-top: 2rpx dashed #F0F2F5;
}

.check-item-count {
    display: flex;
    align-items: center;
}

.count-label {
    font-size: 24rpx;
    color: #666;
}

.count-value {
    font-size: 24rpx;
    color: #1E88E5;
    font-weight: 600;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #FAFBFC;
    border-top: 2rpx solid #F0F2F5;
}

.assignee-info {
    display: flex;
    align-items: center;
}

.assignee-label {
    font-size: 22rpx;
    color: #999;
}

.assignee-name {
    font-size: 24rpx;
    color: #1a1a1a;
    font-weight: 500;
}

.action-buttons {
    display: flex;
}

.btn-sm {
    font-size: 24rpx;
    padding: 12rpx 24rpx;
    height: auto;
    line-height: 1.2;
    border-radius: 8rpx;
    border: none;
    margin: 0;
}

.btn-sm::after {
    border: none;
}

.btn-accent {
    background: linear-gradient(135deg, #FB8C00, #F57C00);
    color: #fff;
}

.btn-primary {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    color: #fff;
}

.btn-success {
    background: linear-gradient(135deg, #43A047, #2E7D32);
    color: #fff;
}

.btn-outline {
    background: #fff;
    color: #1E88E5;
    border: 2rpx solid #1E88E5;
}

.overdue-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12rpx 24rpx;
    background: linear-gradient(90deg, #FFEBEE, #FFCDD2);
}

.overdue-banner text {
    font-size: 24rpx;
    color: #C62828;
    font-weight: 500;
}

.overdue-icon {
    margin-right: 8rpx;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 48rpx;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    opacity: 0.5;
}

.empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #999;
    text-align: center;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx;
}

.loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #E3F2FD;
    border-top-color: #1E88E5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16rpx;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    font-size: 26rpx;
    color: #999;
}

.no-more {
    padding: 40rpx;
    text-align: center;
}

.no-more text {
    font-size: 24rpx;
    color: #CCC;
}

.list-bottom-space {
    height: 140rpx;
}

.fab-button {
    position: fixed;
    right: 40rpx;
    bottom: calc(140rpx + env(safe-area-inset-bottom));
    width: 112rpx;
    height: 112rpx;
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 32rpx rgba(30, 136, 229, 0.4);
    z-index: 99;
}

.fab-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
}
</style>
