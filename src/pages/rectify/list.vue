<template>
    <view class="rectify-list-page">
        <view class="search-bar">
            <view class="search-input-wrap">
                <text class="search-icon">🔍</text>
                <input 
                    class="search-input" 
                    type="text" 
                    v-model="keyword" 
                    placeholder="搜索隐患编号、标题、位置"
                    placeholder-class="search-placeholder"
                    @confirm="handleSearch"
                    @input="onKeywordInput"
                />
                <text v-if="keyword" class="clear-icon" @tap="clearKeyword">✕</text>
            </view>
        </view>

        <view class="role-tabs">
            <view 
                v-for="tab in roleTabs" 
                :key="tab.value"
                class="role-tab-item"
                :class="{ active: currentRoleTab === tab.value }"
                @tap="switchRoleTab(tab.value)"
            >
                <text class="role-tab-text">{{ tab.label }}</text>
                <view v-if="getRoleCount(tab.value) > 0" class="role-tab-badge">
                    {{ getRoleCount(tab.value) }}
                </view>
            </view>
        </view>

        <scroll-view class="status-chips" scroll-x :show-scrollbar="false">
            <view class="chips-inner">
                <view 
                    v-for="chip in statusChips" 
                    :key="chip.value"
                    class="chip-item"
                    :class="{ active: currentStatus === chip.value }"
                    @tap="switchStatus(chip.value)"
                >
                    <text class="chip-text">{{ chip.label }}</text>
                </view>
            </view>
        </scroll-view>

        <scroll-view 
            class="rectify-scroll" 
            scroll-y 
            :refresher-enabled="true"
            :refresher-triggered="isRefreshing"
            @refresherrefresh="onRefresh"
            @scrolltolower="loadMore"
        >
            <view v-if="filteredList.length > 0" class="list-container">
                <view 
                    v-for="(item, index) in filteredList" 
                    :key="item.id" 
                    class="rectify-card"
                    :class="{ overdue: isOverdue(item) }"
                    @tap="goDetail(item.id)"
                >
                    <view class="card-level-bar" :class="'level-' + item.level"></view>
                    <view class="card-content">
                        <view class="card-header">
                            <view class="level-tag" :class="'level-tag-' + item.level">
                                {{ item.levelName }}
                            </view>
                            <view class="status-tag" :class="'status-tag-' + item.status">
                                {{ getStatusText(item.status) }}
                            </view>
                        </view>

                        <text class="hazard-title">{{ item.title }}</text>

                        <view class="hazard-meta">
                            <text class="hazard-no">{{ item.hazardNo }}</text>
                        </view>

                        <view class="info-grid">
                            <view class="info-item">
                                <text class="info-icon">🏗️</text>
                                <text class="info-text">{{ item.projectName }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">📍</text>
                                <text class="info-text">{{ item.location }}</text>
                            </view>
                        </view>

                        <view class="card-footer">
                            <view class="deadline-info">
                                <text class="deadline-label">整改期限：</text>
                                <text class="deadline-value" :class="{ danger: isOverdue(item) }">
                                    {{ item.rectifyDeadline || '未设置' }}
                                </text>
                            </view>
                            <view class="days-remaining" :class="getDaysClass(item)">
                                <text class="days-num">{{ getRemainingDays(item) }}</text>
                                <text class="days-unit">{{ getDaysUnit(item) }}</text>
                            </view>
                        </view>

                        <view v-if="item.rectifierName" class="rectifier-row">
                            <text class="rectifier-label">整改人：</text>
                            <text class="rectifier-name">{{ item.rectifierName }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view v-else-if="!loading" class="empty-state">
                <view class="empty-icon">📋</view>
                <text class="empty-title">暂无整改任务</text>
                <text class="empty-desc">{{ getEmptyDesc() }}</text>
            </view>

            <view v-if="loading" class="loading-state">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载中...</text>
            </view>

            <view v-if="!loading && filteredList.length > 0 && !hasMore" class="no-more">
                <text>— 没有更多了 —</text>
            </view>

            <view class="list-bottom-space"></view>
        </scroll-view>
    </view>
</template>

<script>
import { getDaysBetween, getTodayStr } from '../../utils/date.js'

export default {
    data() {
        return {
            keyword: '',
            currentRoleTab: 'responsible',
            currentStatus: 'all',
            roleTabs: [
                { label: '我负责的', value: 'responsible' },
                { label: '我指派的', value: 'assigned' },
                { label: '我复查的', value: 'review' }
            ],
            statusChips: [
                { label: '全部', value: 'all' },
                { label: '待整改', value: 'assigned' },
                { label: '整改中', value: 'rectifying' },
                { label: '待复查', value: 'review' },
                { label: '已完成', value: 'closed' },
                { label: '已逾期', value: 'overdue' }
            ],
            isRefreshing: false,
            loading: false,
            hasMore: true,
            page: 1,
            pageSize: 20,
            allHazards: []
        }
    },
    computed: {
        currentUser() {
            return this.$store.state.user || {}
        },
        filteredList() {
            let hazards = [...this.allHazards]

            if (this.currentRoleTab === 'responsible') {
                hazards = hazards.filter(h => h.rectifierId === this.currentUser.id)
            } else if (this.currentRoleTab === 'assigned') {
                hazards = hazards.filter(h => h.assignerId === this.currentUser.id)
            } else if (this.currentRoleTab === 'review') {
                hazards = hazards.filter(h => h.reviewerId === this.currentUser.id)
            }

            if (this.currentStatus === 'overdue') {
                hazards = hazards.filter(h => this.isOverdue(h))
            } else if (this.currentStatus !== 'all') {
                hazards = hazards.filter(h => h.status === this.currentStatus)
            }

            if (this.keyword.trim()) {
                const kw = this.keyword.trim().toLowerCase()
                hazards = hazards.filter(h =>
                    (h.title && h.title.toLowerCase().includes(kw)) ||
                    (h.hazardNo && h.hazardNo.toLowerCase().includes(kw)) ||
                    (h.location && h.location.toLowerCase().includes(kw))
                )
            }

            hazards.sort((a, b) => {
                const overdueA = this.isOverdue(a) ? 0 : 1
                const overdueB = this.isOverdue(b) ? 0 : 1
                if (overdueA !== overdueB) return overdueA - overdueB

                const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                const orderA = levelOrder[a.level] ?? 9
                const orderB = levelOrder[b.level] ?? 9
                if (orderA !== orderB) return orderA - orderB

                if (a.rectifyDeadline && b.rectifyDeadline) {
                    return new Date(a.rectifyDeadline) - new Date(b.rectifyDeadline)
                }
                return new Date(b.reportTime) - new Date(a.reportTime)
            })

            return hazards
        }
    },
    onShow() {
        this.loadHazards()
    },
    methods: {
        async loadHazards(showLoading = true) {
            if (showLoading) this.loading = true
            try {
                const res = await this.$store.dispatch('loadHazards', {})
                if (res.code === 200) {
                    this.allHazards = res.data || []
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
            await this.loadHazards(false)
        },

        loadMore() {
            if (this.loading || !this.hasMore) return
        },

        getRoleCount(roleTab) {
            const userId = this.currentUser.id
            let hazards = [...this.allHazards]

            if (roleTab === 'responsible') {
                hazards = hazards.filter(h => h.rectifierId === userId)
            } else if (roleTab === 'assigned') {
                hazards = hazards.filter(h => h.assignerId === userId)
            } else if (roleTab === 'review') {
                hazards = hazards.filter(h => h.reviewerId === userId)
            }

            return hazards.length
        },

        switchRoleTab(tab) {
            this.currentRoleTab = tab
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        switchStatus(status) {
            this.currentStatus = status
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        handleSearch() {},

        onKeywordInput() {},

        clearKeyword() {
            this.keyword = ''
        },

        isOverdue(item) {
            if (!item.rectifyDeadline) return false
            if (item.status === 'closed' || item.status === 'cancelled') return false
            const today = getTodayStr()
            return getDaysBetween(today, item.rectifyDeadline) < 0
        },

        getRemainingDays(item) {
            if (!item.rectifyDeadline) return '-'
            const today = getTodayStr()
            const days = getDaysBetween(today, item.rectifyDeadline)
            return Math.abs(days)
        },

        getDaysUnit(item) {
            if (!item.rectifyDeadline) return '天'
            const today = getTodayStr()
            const days = getDaysBetween(today, item.rectifyDeadline)
            if (days < 0) return '天前'
            if (days === 0) return '今天'
            return '天后'
        },

        getDaysClass(item) {
            if (!item.rectifyDeadline) return 'days-normal'
            const days = this.getRemainingDays(item)
            if (this.isOverdue(item)) return 'days-danger'
            if (days <= 1) return 'days-warning'
            return 'days-normal'
        },

        getStatusText(status) {
            const map = {
                reported: '已上报',
                assigned: '待整改',
                rectifying: '整改中',
                review: '待复查',
                closed: '已完成',
                cancelled: '已取消'
            }
            return map[status] || status
        },

        getEmptyDesc() {
            if (this.keyword.trim()) return '没有找到匹配的整改任务'
            if (this.currentRoleTab === 'responsible') {
                return '您当前没有负责的整改任务'
            } else if (this.currentRoleTab === 'assigned') {
                return '您当前没有指派的整改任务'
            } else if (this.currentRoleTab === 'review') {
                return '您当前没有待复查的整改任务'
            }
            return '当前没有整改任务'
        },

        goDetail(id) {
            uni.navigateTo({ url: `/pages/rectify/detail?id=${id}` })
        }
    }
}
</script>

<style lang="scss" scoped>
.rectify-list-page {
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

.role-tabs {
    display: flex;
    background: #fff;
    border-bottom: 2rpx solid #F0F2F5;
}

.role-tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 12rpx;
    position: relative;
}

.role-tab-text {
    font-size: 28rpx;
    color: #666;
    transition: all 0.2s;
}

.role-tab-item.active .role-tab-text {
    color: #1E88E5;
    font-weight: 600;
}

.role-tab-item.active::after {
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

.role-tab-badge {
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

.status-chips {
    background: #fff;
    white-space: nowrap;
    padding: 16rpx 24rpx;
    border-bottom: 2rpx solid #F0F2F5;
}

.chips-inner {
    display: inline-flex;
    gap: 16rpx;
}

.chip-item {
    display: inline-flex;
    align-items: center;
    padding: 12rpx 24rpx;
    border-radius: 32rpx;
    background: #F5F6FA;
    border: 2rpx solid transparent;
    transition: all 0.2s;
}

.chip-text {
    font-size: 24rpx;
    color: #666;
}

.chip-item.active {
    background: #E3F2FD;
    border-color: #1E88E5;
}

.chip-item.active .chip-text {
    color: #1565C0;
    font-weight: 500;
}

.rectify-scroll {
    flex: 1;
    height: 0;
}

.list-container {
    padding: 24rpx;
}

.rectify-card {
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    display: flex;
    position: relative;
}

.rectify-card.overdue {
    border: 2rpx solid #E53935;
}

.card-level-bar {
    width: 8rpx;
    flex-shrink: 0;
}

.level-critical { background: #E53935; }
.level-high { background: #FB8C00; }
.level-medium { background: #FBC02D; }
.level-low { background: #43A047; }

.card-content {
    flex: 1;
    padding: 20rpx 24rpx;
    min-width: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.level-tag {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.level-tag-critical { background: #FFEBEE; color: #C62828; }
.level-tag-high { background: #FFF3E0; color: #E65100; }
.level-tag-medium { background: #FFF8E1; color: #F57C00; }
.level-tag-low { background: #E8F5E9; color: #2E7D32; }

.status-tag {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.status-tag-reported { background: #E3F2FD; color: #1565C0; }
.status-tag-assigned { background: #FFF8E1; color: #F57C00; }
.status-tag-rectifying { background: #FFF3E0; color: #E65100; }
.status-tag-review { background: #E8F5E9; color: #2E7D32; }
.status-tag-closed { background: #F5F5F5; color: #616161; }
.status-tag-cancelled { background: #F5F5F5; color: #616161; }

.hazard-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    display: block;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hazard-meta {
    margin-bottom: 16rpx;
}

.hazard-no {
    font-size: 22rpx;
    color: #999;
}

.info-grid {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    margin-bottom: 16rpx;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-icon {
    font-size: 24rpx;
    margin-right: 10rpx;
    flex-shrink: 0;
}

.info-text {
    font-size: 24rpx;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 2rpx solid #F8F9FC;
    margin-bottom: 8rpx;
}

.deadline-info {
    display: flex;
    align-items: center;
}

.deadline-label {
    font-size: 22rpx;
    color: #999;
}

.deadline-value {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
}

.deadline-value.danger {
    color: #E53935;
}

.days-remaining {
    display: flex;
    align-items: baseline;
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
}

.days-normal {
    background: #E8F5E9;
}

.days-warning {
    background: #FFF3E0;
}

.days-danger {
    background: #FFEBEE;
}

.days-num {
    font-size: 28rpx;
    font-weight: 700;
    margin-right: 4rpx;
}

.days-normal .days-num { color: #2E7D32; }
.days-warning .days-num { color: #E65100; }
.days-danger .days-num { color: #C62828; }

.days-unit {
    font-size: 20rpx;
}

.days-normal .days-unit { color: #2E7D32; }
.days-warning .days-unit { color: #E65100; }
.days-danger .days-unit { color: #C62828; }

.rectifier-row {
    display: flex;
    align-items: center;
}

.rectifier-label {
    font-size: 22rpx;
    color: #999;
}

.rectifier-name {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
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
    height: 60rpx;
}
</style>
