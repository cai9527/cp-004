<template>
    <view class="hazard-list-page">
        <view class="search-bar">
            <view class="search-input-wrap">
                <text class="search-icon">🔍</text>
                <input 
                    class="search-input" 
                    type="text" 
                    v-model="keyword" 
                    placeholder="搜索隐患标题、编号、位置"
                    placeholder-class="search-placeholder"
                    @confirm="handleSearch"
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

        <scroll-view class="level-tabs" scroll-x :show-scrollbar="false">
            <view class="level-inner">
                <view 
                    v-for="level in levelTabs" 
                    :key="level.value"
                    class="level-item"
                    :class="[level.value !== 'all' ? 'level-' + level.value : '', { active: currentLevel === level.value }]"
                    @tap="switchLevel(level.value)"
                >
                    <text class="level-text">{{ level.label }}</text>
                </view>
            </view>
        </scroll-view>

        <view class="filter-bar">
            <view class="filter-item" @tap="showProjectFilter">
                <text class="filter-label">项目</text>
                <text class="filter-value">{{ currentProjectLabel }}</text>
                <text class="filter-arrow">▼</text>
            </view>
        </view>

        <scroll-view 
            class="hazard-scroll" 
            scroll-y 
            :refresher-enabled="true"
            :refresher-triggered="isRefreshing"
            @refresherrefresh="onRefresh"
            @scrolltolower="loadMore"
        >
            <view v-if="filteredHazards.length > 0" class="hazard-container">
                <view 
                    v-for="(hazard, index) in filteredHazards" 
                    :key="hazard.id" 
                    class="hazard-card"
                    @tap="goDetail(hazard.id)"
                >
                    <view class="card-header">
                        <view class="hazard-level" :class="'level-tag-' + hazard.level">
                            <text class="level-dot"></text>
                            <text>{{ hazard.levelName }}</text>
                        </view>
                        <view v-if="hazard._offline" class="offline-tag">
                            <text>待同步</text>
                        </view>
                    </view>

                    <view class="card-body">
                        <view class="hazard-title-row">
                            <text class="hazard-title">{{ hazard.title }}</text>
                            <view class="hazard-status" :class="'status-' + hazard.status">
                                {{ getStatusText(hazard.status) }}
                            </view>
                        </view>
                        <view class="hazard-no-row">
                            <text class="hazard-no">编号：{{ hazard.hazardNo }}</text>
                        </view>
                        <view class="hazard-info-list">
                            <view class="info-item">
                                <text class="info-icon">🏗️</text>
                                <text class="info-text">{{ hazard.projectName }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">📍</text>
                                <text class="info-text">{{ hazard.location }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">📂</text>
                                <text class="info-text">{{ hazard.categoryName }}</text>
                            </view>
                            <view class="info-item">
                                <text class="info-icon">🕐</text>
                                <text class="info-text">{{ hazard.reportTime }}</text>
                            </view>
                        </view>
                    </view>

                    <view v-if="hazard.images && hazard.images.length > 0" class="card-images">
                        <image 
                            v-for="(img, imgIndex) in hazard.images.slice(0, 4)" 
                            :key="imgIndex"
                            class="hazard-image"
                            :src="img"
                            mode="aspectFill"
                        />
                        <view v-if="hazard.images.length > 4" class="image-more">
                            <text>+{{ hazard.images.length - 4 }}</text>
                        </view>
                    </view>

                    <view class="card-footer">
                        <view class="reporter-info">
                            <text class="reporter-label">上报人：</text>
                            <text class="reporter-name">{{ hazard.reporterName }}</text>
                        </view>
                        <view class="action-btn" @tap.stop="goDetail(hazard.id)">
                            <text>查看详情</text>
                            <text class="arrow">›</text>
                        </view>
                    </view>
                </view>
            </view>

            <view v-else-if="!loading" class="empty-state">
                <view class="empty-icon">⚠️</view>
                <text class="empty-title">暂无隐患</text>
                <text class="empty-desc">{{ getEmptyDesc() }}</text>
            </view>

            <view v-if="loading" class="loading-state">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载中...</text>
            </view>

            <view v-if="!loading && filteredHazards.length > 0 && !hasMore" class="no-more">
                <text>— 没有更多了 —</text>
            </view>

            <view class="list-bottom-space"></view>
        </scroll-view>

        <view class="fab-button" @tap="goReport">
            <view class="fab-inner">
                <text class="fab-icon">+</text>
            </view>
            <text class="fab-text">快捷上报</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            keyword: '',
            currentStatus: 'all',
            currentLevel: 'all',
            currentProject: 'all',
            statusTabs: [
                { label: '全部', value: 'all' },
                { label: '已上报', value: 'reported' },
                { label: '整改中', value: 'rectifying' },
                { label: '待复查', value: 'review' },
                { label: '已闭环', value: 'closed' }
            ],
            levelTabs: [
                { label: '全部等级', value: 'all' },
                { label: '重大', value: 'critical' },
                { label: '较大', value: 'high' },
                { label: '一般', value: 'medium' },
                { label: '轻微', value: 'low' }
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
        projects() {
            return this.$store.state.projects || []
        },
        currentProjectLabel() {
            if (this.currentProject === 'all') return '全部项目'
            const p = this.projects.find(p => p.id === this.currentProject)
            return p ? (p.name.length > 8 ? p.name.substr(0, 8) + '...' : p.name) : '全部项目'
        },
        filteredHazards() {
            let hazards = [...this.allHazards]

            if (this.currentStatus !== 'all') {
                hazards = hazards.filter(h => h.status === this.currentStatus)
            }

            if (this.currentLevel !== 'all') {
                hazards = hazards.filter(h => h.level === this.currentLevel)
            }

            if (this.currentProject !== 'all') {
                hazards = hazards.filter(h => h.projectId === this.currentProject)
            }

            if (this.keyword.trim()) {
                const kw = this.keyword.trim().toLowerCase()
                hazards = hazards.filter(h =>
                    (h.title && h.title.toLowerCase().includes(kw)) ||
                    (h.hazardNo && h.hazardNo.toLowerCase().includes(kw)) ||
                    (h.location && h.location.toLowerCase().includes(kw))
                )
            }

            const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            hazards.sort((a, b) => {
                const orderA = levelOrder[a.level] ?? 9
                const orderB = levelOrder[b.level] ?? 9
                if (orderA !== orderB) return orderA - orderB
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
                await this.$store.dispatch('loadProjects')
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

        getCount(status) {
            if (status === 'all') return this.allHazards.length
            return this.allHazards.filter(h => h.status === status).length
        },

        switchTab(status) {
            this.currentStatus = status
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        switchLevel(level) {
            this.currentLevel = level
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },

        handleSearch() {},

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

        getStatusText(status) {
            const map = {
                reported: '已上报',
                assigned: '已分配',
                rectifying: '整改中',
                review: '待复查',
                closed: '已闭环',
                cancelled: '已取消'
            }
            return map[status] || status
        },

        getEmptyDesc() {
            if (this.keyword.trim()) return '没有找到匹配的隐患记录'
            if (this.currentStatus !== 'all' || this.currentLevel !== 'all' || this.currentProject !== 'all') {
                return '当前筛选条件下没有隐患记录'
            }
            return '当前没有任何隐患记录'
        },

        goDetail(id) {
            uni.navigateTo({ url: `/pages/hazard/detail?id=${id}` })
        },

        goReport() {
            uni.navigateTo({ url: '/pages/hazard/report' })
        }
    }
}
</script>

<style lang="scss" scoped>
.hazard-list-page {
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

.level-tabs {
    background: #fff;
    white-space: nowrap;
    padding: 12rpx 24rpx 20rpx;
    border-bottom: 2rpx solid #F0F2F5;
}

.level-inner {
    display: inline-flex;
    gap: 16rpx;
}

.level-item {
    display: inline-flex;
    align-items: center;
    padding: 12rpx 24rpx;
    border-radius: 32rpx;
    background: #F5F6FA;
    border: 2rpx solid transparent;
    transition: all 0.2s;
}

.level-text {
    font-size: 24rpx;
    color: #666;
}

.level-item.active {
    background: #E3F2FD;
    border-color: #1E88E5;
}

.level-item.active .level-text {
    color: #1565C0;
    font-weight: 500;
}

.level-item.level-critical {
    background: #FFEBEE;
}

.level-item.level-critical .level-text {
    color: #C62828;
}

.level-item.level-critical.active {
    border-color: #E53935;
}

.level-item.level-high {
    background: #FFF3E0;
}

.level-item.level-high .level-text {
    color: #E65100;
}

.level-item.level-high.active {
    border-color: #FB8C00;
}

.level-item.level-medium {
    background: #FFF8E1;
}

.level-item.level-medium .level-text {
    color: #F57C00;
}

.level-item.level-medium.active {
    border-color: #FBC02D;
}

.level-item.level-low {
    background: #E8F5E9;
}

.level-item.level-low .level-text {
    color: #2E7D32;
}

.level-item.level-low.active {
    border-color: #43A047;
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

.filter-label {
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

.hazard-scroll {
    flex: 1;
    height: 0;
}

.hazard-container {
    padding: 24rpx;
}

.hazard-card {
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

.hazard-level {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
}

.hazard-level text {
    font-size: 22rpx;
    font-weight: 500;
}

.level-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    margin-right: 10rpx;
}

.level-tag-critical {
    background: #FFEBEE;
}

.level-tag-critical text {
    color: #C62828;
}

.level-tag-critical .level-dot {
    background: #E53935;
}

.level-tag-high {
    background: #FFF3E0;
}

.level-tag-high text {
    color: #E65100;
}

.level-tag-high .level-dot {
    background: #FB8C00;
}

.level-tag-medium {
    background: #FFF8E1;
}

.level-tag-medium text {
    color: #F57C00;
}

.level-tag-medium .level-dot {
    background: #FBC02D;
}

.level-tag-low {
    background: #E8F5E9;
}

.level-tag-low text {
    color: #2E7D32;
}

.level-tag-low .level-dot {
    background: #43A047;
}

.offline-tag {
    padding: 6rpx 14rpx;
    background: #F5F5F5;
    border-radius: 6rpx;
}

.offline-tag text {
    font-size: 20rpx;
    color: #616161;
}

.card-body {
    padding: 20rpx 24rpx;
}

.hazard-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12rpx;
}

.hazard-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
    margin-right: 16rpx;
    line-height: 1.4;
}

.hazard-status {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
    font-weight: 500;
}

.status-reported { background: #E3F2FD; color: #1565C0; }
.status-assigned { background: #FFF8E1; color: #F57C00; }
.status-rectifying { background: #FFF3E0; color: #E65100; }
.status-review { background: #E8F5E9; color: #2E7D32; }
.status-closed { background: #F5F5F5; color: #616161; }
.status-cancelled { background: #F5F5F5; color: #616161; }

.hazard-no-row {
    margin-bottom: 16rpx;
}

.hazard-no {
    font-size: 22rpx;
    color: #999;
}

.hazard-info-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
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

.card-images {
    display: flex;
    gap: 12rpx;
    padding: 0 24rpx 20rpx;
    flex-wrap: wrap;
}

.hazard-image {
    width: calc((100% - 36rpx) / 4);
    height: 140rpx;
    border-radius: 12rpx;
    background: #F5F6FA;
}

.image-more {
    width: calc((100% - 36rpx) / 4);
    height: 140rpx;
    border-radius: 12rpx;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-more text {
    color: #fff;
    font-size: 28rpx;
    font-weight: 500;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #FAFBFC;
    border-top: 2rpx solid #F0F2F5;
}

.reporter-info {
    display: flex;
    align-items: center;
}

.reporter-label {
    font-size: 22rpx;
    color: #999;
}

.reporter-name {
    font-size: 24rpx;
    color: #1a1a1a;
    font-weight: 500;
}

.action-btn {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    background: #E3F2FD;
    border-radius: 8rpx;
}

.action-btn text {
    font-size: 22rpx;
    color: #1565C0;
}

.action-btn .arrow {
    margin-left: 4rpx;
    font-size: 26rpx;
    font-weight: 300;
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
    height: 180rpx;
}

.fab-button {
    position: fixed;
    right: 32rpx;
    bottom: calc(140rpx + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 99;
}

.fab-inner {
    width: 104rpx;
    height: 104rpx;
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 32rpx rgba(30, 136, 229, 0.4);
}

.fab-icon {
    font-size: 52rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
}

.fab-text {
    font-size: 22rpx;
    color: #1565C0;
    margin-top: 8rpx;
    font-weight: 500;
}
</style>
