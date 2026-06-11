<template>
    <view class="task-detail">
        <view v-if="task" class="detail-content">
            <view class="header-card">
                <view class="header-top">
                    <view class="task-type" :class="'type-' + task.type">
                        {{ task.typeName }}
                    </view>
                    <view class="task-status" :class="'status-' + task.status">
                        {{ getStatusText(task.status) }}
                    </view>
                </view>
                <text class="task-title">{{ task.title }}</text>
                <view class="task-meta">
                    <text class="task-no">{{ task.taskNo }}</text>
                    <view class="task-priority" :class="'priority-' + task.priority">
                        {{ getPriorityText(task.priority) }}优先级
                    </view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">任务信息</view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">所属项目</text>
                        <text class="info-value">{{ task.projectName }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">检查区域</text>
                        <text class="info-value">{{ task.area }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">计划日期</text>
                        <text class="info-value">{{ task.planDate }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">截止日期</text>
                        <text class="info-value" :class="{ danger: isOverdue }">{{ task.deadline }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">任务派发</text>
                        <text class="info-value">{{ task.assigner }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">执行人员</text>
                        <text class="info-value">{{ task.assigneeName }}</text>
                    </view>
                    <view class="info-row info-row-desc">
                        <text class="info-label">任务说明</text>
                        <text class="info-value info-desc">{{ task.description }}</text>
                    </view>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">
                    <text>检查清单</text>
                    <text class="check-count">共{{ checkItems.length }}项</text>
                </view>
                <view v-if="checkItems.length > 0" class="check-list">
                    <view 
                        v-for="(item, index) in checkItems" 
                        :key="item.id" 
                        class="check-item"
                    >
                        <view class="check-index">{{ index + 1 }}</view>
                        <view class="check-info">
                            <view class="check-name">{{ item.name }}</view>
                            <view class="check-category">
                                <text class="category-tag">{{ item.categoryName }}</text>
                                <text v-if="item.required" class="required-tag">必检项</text>
                            </view>
                        </view>
                        <view class="check-result">
                            <view v-if="getRecordResult(item.id) === 'pass'" class="result-pass">
                                <text>✓</text>
                            </view>
                            <view v-else-if="getRecordResult(item.id) === 'fail'" class="result-fail">
                                <text>✕</text>
                            </view>
                            <view v-else class="result-pending">
                                <text>待检</text>
                            </view>
                        </view>
                    </view>
                </view>
                <view v-else class="empty-mini">
                    <text>暂无检查项</text>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">
                    <text>关联隐患</text>
                    <view v-if="hazards.length > 0" class="hazard-count-tags">
                        <view class="hazard-count high" v-if="highHazardCount > 0">
                            较大+重大 {{ highHazardCount }}
                        </view>
                        <view class="hazard-count medium" v-if="mediumHazardCount > 0">
                            一般 {{ mediumHazardCount }}
                        </view>
                    </view>
                </view>
                <view v-if="hazards.length > 0" class="hazard-mini-list">
                    <view 
                        v-for="h in hazards" 
                        :key="h.id" 
                        class="hazard-mini-item"
                        @tap="goHazardDetail(h.id)"
                    >
                        <view class="hazard-level-dot" :class="'level-' + h.level"></view>
                        <view class="hazard-mini-content">
                            <text class="hazard-mini-title">{{ h.title }}</text>
                            <view class="hazard-mini-meta">
                                <text>{{ h.hazardNo }}</text>
                                <view class="hazard-status" :class="'hstatus-' + h.status">
                                    {{ getHazardStatusText(h.status) }}
                                </view>
                            </view>
                        </view>
                        <text class="arrow">›</text>
                    </view>
                </view>
                <view v-else class="empty-mini">
                    <text>暂无关联隐患</text>
                </view>
            </view>

            <view class="info-card">
                <view class="card-title">执行记录</view>
                <view class="timeline">
                    <view class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">任务创建</text>
                            <text class="timeline-time">{{ task.createdAt }}</text>
                        </view>
                    </view>
                    <view v-if="task.acceptAt" class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">任务已接收</text>
                            <text class="timeline-time">{{ task.acceptAt }}</text>
                        </view>
                    </view>
                    <view v-if="task.startAt" class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">开始巡检</text>
                            <text class="timeline-time">{{ task.startAt }}</text>
                        </view>
                    </view>
                    <view v-if="task.completeAt" class="timeline-item timeline-active">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">巡检完成</text>
                            <text class="timeline-time">{{ task.completeAt }}</text>
                            <text v-if="task.result" class="timeline-result">结果：{{ task.result }}</text>
                        </view>
                    </view>
                    <view v-if="!task.completeAt" class="timeline-item">
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="timeline-title">待完成</text>
                            <text class="timeline-time">预计截止 {{ task.deadline }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="bottom-action-bar">
            <button 
                v-if="task && task.status === 'pending'"
                class="btn btn-warning"
                @tap="acceptTask"
            >
                接收任务
            </button>
            <button 
                v-else-if="task && task.status === 'accepted'"
                class="btn btn-primary"
                @tap="startInspection"
            >
                开始巡检
            </button>
            <button 
                v-else-if="task && task.status === 'processing'"
                class="btn btn-success"
                @tap="goInspection"
            >
                继续巡检
            </button>
            <button 
                v-else-if="task && task.status === 'completed'"
                class="btn btn-outline"
                @tap="exportReport"
            >
                导出报告
            </button>
            <button 
                v-if="task && ['processing', 'accepted'].includes(task.status)"
                class="btn btn-outline ml-20"
                @tap="reportHazardQuick"
            >
                快速上报隐患
            </button>
        </view>

        <view v-if="!task" class="loading-state">
            <view class="loading-spinner"></view>
            <text>加载中...</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            taskId: '',
            task: null,
            checkItems: [],
            records: [],
            hazards: []
        }
    },
    computed: {
        isOverdue() {
            if (!this.task) return false
            const today = new Date().toISOString().slice(0, 10)
            return this.task.status !== 'completed' && this.task.deadline < today
        },
        highHazardCount() {
            return this.hazards.filter(h => ['high', 'critical'].includes(h.level)).length
        },
        mediumHazardCount() {
            return this.hazards.filter(h => h.level === 'medium').length
        }
    },
    onLoad(options) {
        if (options.id) {
            this.taskId = options.id
            this.loadDetail()
        }
    },
    onShow() {
        if (this.taskId) {
            this.loadDetail()
        }
    },
    methods: {
        async loadDetail() {
            uni.showLoading({ title: '加载中...' })
            try {
                const api = (await import('../../utils/api.js')).default
                const res = await api.getTaskDetail(this.taskId)
                uni.hideLoading()
                if (res.code === 200) {
                    this.task = res.data
                    this.checkItems = res.data.checkItems || []
                    this.records = res.data.records || []
                    this.hazards = res.data.hazards || []
                } else {
                    uni.showToast({ title: res.message || '加载失败', icon: 'none' })
                }
            } catch (e) {
                uni.hideLoading()
                uni.showToast({ title: '加载失败', icon: 'none' })
            }
        },

        getRecordResult(checkItemId) {
            const record = this.records.find(r => r.checkItemId === checkItemId)
            return record ? record.result : null
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

        getPriorityText(priority) {
            const map = { critical: '紧急', high: '高', medium: '中', low: '低' }
            return map[priority] || priority
        },

        getHazardStatusText(status) {
            const map = {
                reported: '已上报', assigned: '已指派', rectifying: '整改中',
                review: '待复查', closed: '已闭环', rejected: '已驳回'
            }
            return map[status] || status
        },

        async acceptTask() {
            uni.showModal({
                title: '确认接收',
                content: '确定要接收此巡检任务吗？',
                success: async (res) => {
                    if (res.confirm) {
                        const result = await this.$store.dispatch('acceptTask', this.taskId)
                        if (result.code === 200) {
                            uni.showToast({ title: '接收成功', icon: 'success' })
                            this.loadDetail()
                        } else {
                            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
                        }
                    }
                }
            })
        },

        startInspection() {
            uni.navigateTo({ url: `/pages/inspection/record?taskId=${this.taskId}&start=1` })
        },

        goInspection() {
            uni.navigateTo({ url: `/pages/inspection/record?taskId=${this.taskId}` })
        },

        goHazardDetail(id) {
            uni.navigateTo({ url: `/pages/hazard/detail?id=${id}` })
        },

        reportHazardQuick() {
            uni.navigateTo({ url: `/pages/hazard/report?taskId=${this.taskId}&projectId=${this.task.projectId}` })
        },

        exportReport() {
            uni.showToast({ title: '报告导出功能开发中', icon: 'none' })
        }
    }
}
</script>

<style lang="scss" scoped>
.task-detail {
    min-height: 100vh;
    background: #F5F6FA;
    padding-bottom: 180rpx;
}

.detail-content {
    padding: 24rpx;
}

.header-card {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    color: #fff;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.task-type {
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    font-weight: 500;
}

.type-special { background: rgba(229, 57, 53, 0.8); }
.type-monthly { background: rgba(67, 160, 71, 0.8); }

.task-status {
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.2);
}

.status-pending { background: #FB8C00; }
.status-accepted { background: #42A5F5; }
.status-processing { background: #66BB6A; }
.status-completed { background: #43A047; }
.status-overdue { background: #EF5350; }

.task-title {
    display: block;
    font-size: 36rpx;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 16rpx;
}

.task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.task-no {
    font-size: 24rpx;
    opacity: 0.8;
}

.task-priority {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    background: rgba(255, 255, 255, 0.2);
}

.priority-critical { background: #E53935; }
.priority-high { background: #FB8C00; }

.info-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #F5F6FA;
}

.card-title::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 28rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 12rpx;
    vertical-align: middle;
}

.card-title {
    display: flex;
    align-items: center;
}

.card-title > text:first-child {
    flex: 1;
}

.check-count {
    font-size: 24rpx;
    color: #1E88E5;
    font-weight: 500;
}

.info-list {
    display: flex;
    flex-direction: column;
}

.info-row {
    display: flex;
    padding: 12rpx 0;
}

.info-row-desc {
    align-items: flex-start;
}

.info-label {
    width: 160rpx;
    flex-shrink: 0;
    font-size: 26rpx;
    color: #999;
}

.info-value {
    flex: 1;
    font-size: 26rpx;
    color: #1a1a1a;
}

.info-value.danger {
    color: #E53935;
    font-weight: 500;
}

.info-desc {
    line-height: 1.6;
}

.check-list {
    display: flex;
    flex-direction: column;
}

.check-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #F8F9FC;
}

.check-item:last-child {
    border-bottom: none;
}

.check-index {
    width: 48rpx;
    height: 48rpx;
    background: #F5F6FA;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #666;
    margin-right: 16rpx;
    font-weight: 600;
    flex-shrink: 0;
}

.check-info {
    flex: 1;
}

.check-name {
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 500;
    margin-bottom: 8rpx;
}

.check-category {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.category-tag {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    background: #F0F4FF;
    color: #5B7BD5;
    border-radius: 4rpx;
}

.required-tag {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    background: #FFEBEE;
    color: #E53935;
    border-radius: 4rpx;
}

.check-result {
    margin-left: 16rpx;
    flex-shrink: 0;
}

.result-pass {
    width: 48rpx;
    height: 48rpx;
    background: #E8F5E9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #43A047;
    font-weight: 700;
    font-size: 28rpx;
}

.result-fail {
    width: 48rpx;
    height: 48rpx;
    background: #FFEBEE;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E53935;
    font-weight: 700;
    font-size: 28rpx;
}

.result-pending {
    width: 48rpx;
    height: 48rpx;
    background: #F5F6FA;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 20rpx;
}

.hazard-count-tags {
    display: flex;
    gap: 8rpx;
}

.hazard-count {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.hazard-count.high {
    background: #FFEBEE;
    color: #C62828;
}

.hazard-count.medium {
    background: #FFF8E1;
    color: #F57C00;
}

.hazard-mini-list {
    display: flex;
    flex-direction: column;
}

.hazard-mini-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 2rpx solid #F8F9FC;
}

.hazard-mini-item:last-child {
    border-bottom: none;
}

.hazard-level-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.level-critical, .level-high { background: #E53935; }
.level-medium { background: #FB8C00; }
.level-low { background: #43A047; }

.hazard-mini-content {
    flex: 1;
    min-width: 0;
}

.hazard-mini-title {
    display: block;
    font-size: 26rpx;
    color: #1a1a1a;
    margin-bottom: 6rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hazard-mini-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.hazard-mini-meta > text:first-child {
    font-size: 22rpx;
    color: #999;
}

.hazard-status {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    border-radius: 4rpx;
}

.hstatus-reported { background: #FFF8E1; color: #F57C00; }
.hstatus-assigned { background: #E3F2FD; color: #1565C0; }
.hstatus-rectifying { background: #FFF3E0; color: #E65100; }
.hstatus-review { background: #F3E5F5; color: #6A1B9A; }
.hstatus-closed { background: #E8F5E9; color: #2E7D32; }

.arrow {
    font-size: 32rpx;
    color: #CCC;
    margin-left: 8rpx;
}

.timeline {
    padding-left: 8rpx;
}

.timeline-item {
    display: flex;
    padding-bottom: 28rpx;
    position: relative;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 32rpx;
    bottom: 0;
    width: 2rpx;
    background: #E0E4E8;
}

.timeline-item:last-child::before {
    display: none;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-dot {
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background: #E0E4E8;
    border: 4rpx solid #F5F6FA;
    box-sizing: border-box;
    margin-right: 20rpx;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.timeline-active .timeline-dot {
    background: #1E88E5;
    box-shadow: 0 0 0 4rpx rgba(30, 136, 229, 0.15);
}

.timeline-content {
    flex: 1;
}

.timeline-title {
    display: block;
    font-size: 26rpx;
    color: #1a1a1a;
    font-weight: 500;
    margin-bottom: 6rpx;
}

.timeline-item:not(.timeline-active) .timeline-title {
    color: #999;
}

.timeline-time {
    display: block;
    font-size: 22rpx;
    color: #999;
}

.timeline-result {
    display: block;
    font-size: 24rpx;
    color: #43A047;
    margin-top: 8rpx;
}

.empty-mini {
    padding: 48rpx 0;
    text-align: center;
    color: #999;
    font-size: 26rpx;
}

.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    display: flex;
    z-index: 100;
}

.btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    padding: 0;
}

.btn::after {
    border: none;
}

.btn-warning {
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
    flex: 1;
}

.ml-20 {
    margin-left: 20rpx;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    color: #999;
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
</style>
