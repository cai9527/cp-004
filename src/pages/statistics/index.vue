<template>
    <view class="statistics-page">
        <view class="overview-section">
            <view class="section-title-wrap">
                <text class="section-title-text">数据概览</text>
                <text class="section-date">{{ currentDate }}</text>
            </view>
            <view class="overview-grid">
                <view class="overview-card">
                    <view class="ring-progress" :style="ringStyle(taskCompleteRate)">
                        <view class="ring-inner">
                            <text class="ring-value">{{ overview.totalTasks }}</text>
                            <text class="ring-label">任务总数</text>
                        </view>
                    </view>
                    <view class="progress-hint">
                        <text class="hint-dot hint-blue"></text>
                        <text class="hint-text">完成率 {{ taskCompleteRate }}%</text>
                    </view>
                </view>
                <view class="overview-card">
                    <view class="ring-progress" :style="ringStyle(hazardRectifyRate)">
                        <view class="ring-inner">
                            <text class="ring-value">{{ overview.totalHazards }}</text>
                            <text class="ring-label">隐患总数</text>
                        </view>
                    </view>
                    <view class="progress-hint">
                        <text class="hint-dot hint-green"></text>
                        <text class="hint-text">整改率 {{ hazardRectifyRate }}%</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="chart-section">
            <view class="section-title-wrap">
                <text class="section-title-text">近7天趋势</text>
                <view class="legend-wrap">
                    <view class="legend-item">
                        <text class="legend-bar legend-blue"></text>
                        <text class="legend-text">任务</text>
                    </view>
                    <view class="legend-item">
                        <text class="legend-bar legend-orange"></text>
                        <text class="legend-text">隐患</text>
                    </view>
                </view>
            </view>
            <view class="bar-chart">
                <view class="chart-y-axis">
                    <text class="y-label">{{ maxTrendValue }}</text>
                    <text class="y-label">{{ Math.floor(maxTrendValue * 0.75) }}</text>
                    <text class="y-label">{{ Math.floor(maxTrendValue * 0.5) }}</text>
                    <text class="y-label">{{ Math.floor(maxTrendValue * 0.25) }}</text>
                    <text class="y-label">0</text>
                </view>
                <view class="chart-content">
                    <view class="chart-grid">
                        <view class="grid-line"></view>
                        <view class="grid-line"></view>
                        <view class="grid-line"></view>
                        <view class="grid-line"></view>
                    </view>
                    <view class="bars-wrap">
                        <view v-for="(item, index) in trendData" :key="index" class="bar-group">
                            <view class="bar-pair">
                                <view 
                                    class="bar bar-blue" 
                                    :style="{ height: getBarHeight(item.tasks) + '%' }"
                                >
                                    <text class="bar-value">{{ item.tasks }}</text>
                                </view>
                                <view 
                                    class="bar bar-orange" 
                                    :style="{ height: getBarHeight(item.hazards) + '%' }"
                                >
                                    <text class="bar-value">{{ item.hazards }}</text>
                                </view>
                            </view>
                            <text class="bar-label">{{ item.label }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="chart-section">
            <view class="section-title-wrap">
                <text class="section-title-text">隐患分类分布</text>
            </view>
            <view class="pie-container">
                <view class="pie-chart-wrap">
                    <view class="pie-chart">
                        <view 
                            v-for="(seg, i) in pieSegments" 
                            :key="i" 
                            class="pie-segment"
                            :style="seg.style"
                        ></view>
                        <view class="pie-center">
                            <text class="pie-total">{{ overview.totalHazards }}</text>
                            <text class="pie-label">总计</text>
                        </view>
                    </view>
                </view>
                <view class="pie-legend">
                    <view 
                        v-for="(cat, index) in categoryData" 
                        :key="index" 
                        class="pie-legend-item"
                    >
                        <view class="legend-color" :style="{ background: cat.color }"></view>
                        <text class="legend-name">{{ cat.name }}</text>
                        <text class="legend-count">{{ cat.count }}</text>
                        <text class="legend-percent">{{ cat.percent }}%</text>
                    </view>
                </view>
            </view>
            <view class="bar-list">
                <view 
                    v-for="(cat, index) in categoryData" 
                    :key="'bar-' + index" 
                    class="bar-list-item"
                >
                    <view class="bar-list-header">
                        <text class="bar-list-name">{{ cat.name }}</text>
                        <text class="bar-list-value">{{ cat.count }}条 ({{ cat.percent }}%)</text>
                    </view>
                    <view class="bar-list-track">
                        <view 
                            class="bar-list-fill" 
                            :style="{ width: cat.percent + '%', background: cat.color }"
                        ></view>
                    </view>
                </view>
            </view>
        </view>

        <view class="ranking-section">
            <view class="section-title-wrap">
                <text class="section-title-text">项目排名</text>
            </view>
            <view class="ranking-table">
                <view class="ranking-header">
                    <text class="rank-cell rank-head">排名</text>
                    <text class="rank-cell project-head">项目名称</text>
                    <text class="rank-cell num-head">任务</text>
                    <text class="rank-cell num-head">隐患</text>
                    <text class="rank-cell rate-head">整改率</text>
                </view>
                <view 
                    v-for="(proj, index) in rankingData" 
                    :key="proj.id" 
                    class="ranking-row"
                >
                    <view class="rank-cell rank-num">
                        <view v-if="index < 3" class="rank-badge" :class="'rank-' + (index + 1)">
                            {{ index + 1 }}
                        </view>
                        <text v-else class="rank-normal">{{ index + 1 }}</text>
                    </view>
                    <view class="rank-cell project-name">
                        <text class="project-text">{{ proj.name }}</text>
                    </view>
                    <text class="rank-cell num-cell">{{ proj.tasks }}</text>
                    <text class="rank-cell num-cell">{{ proj.hazards }}</text>
                    <view class="rank-cell rate-cell">
                        <view class="rate-bar-wrap">
                            <view 
                                class="rate-bar-fill" 
                                :style="{ width: proj.rectifyRate + '%' }"
                                :class="getRateClass(proj.rectifyRate)"
                            ></view>
                        </view>
                        <text class="rate-text">{{ proj.rectifyRate }}%</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="action-section">
            <button class="btn-export" @tap="exportReport">
                <text class="export-icon">📤</text>
                <text>导出报表</text>
            </button>
        </view>

        <view class="bottom-space"></view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            overview: {
                totalTasks: 256,
                completedTasks: 189,
                totalHazards: 342,
                rectifiedHazards: 268
            },
            trendData: [],
            categoryData: [],
            rankingData: []
        }
    },
    computed: {
        currentDate() {
            const d = new Date()
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        },
        taskCompleteRate() {
            if (this.overview.totalTasks === 0) return 0
            return Math.round(this.overview.completedTasks / this.overview.totalTasks * 100)
        },
        hazardRectifyRate() {
            if (this.overview.totalHazards === 0) return 0
            return Math.round(this.overview.rectifiedHazards / this.overview.totalHazards * 100)
        },
        maxTrendValue() {
            let max = 10
            this.trendData.forEach(item => {
                max = Math.max(max, item.tasks, item.hazards)
            })
            return Math.ceil(max / 5) * 5
        },
        pieSegments() {
            const segments = []
            let currentAngle = 0
            const colors = ['#1E88E5', '#FB8C00', '#43A047', '#E53935', '#8E24AA', '#00ACC1']
            this.categoryData.forEach((cat, i) => {
                const angle = (cat.percent / 100) * 360
                segments.push({
                    style: {
                        background: cat.color || colors[i % colors.length],
                        transform: `rotate(${currentAngle}deg)`,
                        clipPath: this.getClipPath(angle)
                    }
                })
                currentAngle += angle
            })
            return segments
        }
    },
    onShow() {
        this.loadMockData()
    },
    onPullDownRefresh() {
        this.loadMockData()
        setTimeout(() => {
            uni.stopPullDownRefresh()
        }, 500)
    },
    methods: {
        ringStyle(percent) {
            const deg = (percent / 100) * 360
            return {
                background: `conic-gradient(#1E88E5 0deg, #42A5F5 ${deg * 0.6}deg, #64B5F6 ${deg}deg, #E8EAF6 ${deg}deg, #E8EAF6 360deg)`
            }
        },
        getBarHeight(value) {
            if (this.maxTrendValue === 0) return 0
            return (value / this.maxTrendValue) * 100
        },
        getClipPath(angle) {
            if (angle <= 180) {
                return `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((angle - 90) * Math.PI / 180)}% 0%, 100% ${50 - 50 * Math.tan((angle - 180) * Math.PI / 180)}%, 100% 100%, 50% 100%)`
            }
            return 'none'
        },
        getRateClass(rate) {
            if (rate >= 90) return 'rate-excellent'
            if (rate >= 75) return 'rate-good'
            if (rate >= 60) return 'rate-normal'
            return 'rate-poor'
        },
        loadMockData() {
            const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            this.trendData = labels.map(label => ({
                label,
                tasks: Math.floor(Math.random() * 30) + 15,
                hazards: Math.floor(Math.random() * 25) + 10
            }))

            const total = this.overview.totalHazards
            this.categoryData = [
                { name: '安全防护', count: 98, color: '#1E88E5' },
                { name: '临时用电', count: 76, color: '#FB8C00' },
                { name: '机械设备', count: 62, color: '#43A047' },
                { name: '消防安全', count: 54, color: '#E53935' },
                { name: '文明施工', count: 32, color: '#8E24AA' },
                { name: '其他', count: 20, color: '#00ACC1' }
            ]
            this.categoryData.forEach(cat => {
                cat.percent = Math.round(cat.count / total * 100)
            })

            this.rankingData = [
                { id: 1, name: '城东新区商业综合体', tasks: 68, hazards: 92, rectifyRate: 94 },
                { id: 2, name: '滨江路住宅项目A区', tasks: 56, hazards: 78, rectifyRate: 88 },
                { id: 3, name: '科技创新园3号楼', tasks: 48, hazards: 65, rectifyRate: 82 },
                { id: 4, name: '地铁5号线车辆段', tasks: 42, hazards: 58, rectifyRate: 76 },
                { id: 5, name: '文化艺术中心项目', tasks: 35, hazards: 49, rectifyRate: 71 }
            ]
        },
        exportReport() {
            uni.showActionSheet({
                itemList: ['导出PDF报表', '导出Excel表格', '导出图片'],
                success: (res) => {
                    uni.showLoading({ title: '正在生成...' })
                    setTimeout(() => {
                        uni.hideLoading()
                        const types = ['PDF', 'Excel', '图片']
                        uni.showToast({
                            title: types[res.tapIndex] + '报表已生成',
                            icon: 'success'
                        })
                    }, 1200)
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.statistics-page {
    min-height: 100vh;
    background: #F5F6FA;
}

.overview-section,
.chart-section,
.ranking-section {
    background: #fff;
    margin: 24rpx;
    border-radius: 24rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28rpx;
}

.section-title-text {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
}

.section-title-text::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 28rpx;
    background: #1E88E5;
    border-radius: 3rpx;
    margin-right: 12rpx;
}

.section-date {
    font-size: 24rpx;
    color: #999;
}

.overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
}

.overview-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    background: linear-gradient(180deg, #F8FAFF 0%, #F0F4FF 100%);
    border-radius: 20rpx;
    border: 2rpx solid #E8EFFB;
}

.ring-progress {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: inset 0 2rpx 8rpx rgba(30, 136, 229, 0.1);
}

.ring-inner {
    width: 136rpx;
    height: 136rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.ring-value {
    font-size: 40rpx;
    font-weight: 800;
    color: #1E88E5;
    line-height: 1.2;
}

.ring-label {
    font-size: 22rpx;
    color: #666;
    margin-top: 4rpx;
}

.progress-hint {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
}

.hint-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 4rpx;
    margin-right: 8rpx;
}

.hint-blue { background: #1E88E5; }
.hint-green { background: #43A047; }

.hint-text {
    font-size: 22rpx;
    color: #666;
}

.legend-wrap {
    display: flex;
    gap: 24rpx;
}

.legend-item {
    display: flex;
    align-items: center;
}

.legend-bar {
    width: 20rpx;
    height: 20rpx;
    border-radius: 4rpx;
    margin-right: 8rpx;
}

.legend-blue { background: #1E88E5; }
.legend-orange { background: #FB8C00; }

.legend-text {
    font-size: 22rpx;
    color: #666;
}

.bar-chart {
    display: flex;
    height: 320rpx;
    position: relative;
}

.chart-y-axis {
    width: 60rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 40rpx;
    padding-right: 8rpx;
}

.y-label {
    font-size: 20rpx;
    color: #999;
    text-align: right;
}

.chart-content {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
}

.chart-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
}

.grid-line {
    height: 2rpx;
    background: #F0F2F5;
}

.bars-wrap {
    flex: 1;
    display: flex;
    align-items: flex-end;
    padding-bottom: 40rpx;
    padding-left: 8rpx;
    position: relative;
    z-index: 1;
}

.bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    height: 100%;
}

.bar-pair {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6rpx;
    width: 100%;
}

.bar {
    width: 20rpx;
    border-radius: 6rpx 6rpx 0 0;
    position: relative;
    min-height: 4rpx;
    transition: height 0.6s ease;
}

.bar-blue {
    background: linear-gradient(180deg, #64B5F6 0%, #1E88E5 100%);
}

.bar-orange {
    background: linear-gradient(180deg, #FFB74D 0%, #FB8C00 100%);
}

.bar-value {
    position: absolute;
    top: -32rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18rpx;
    color: #666;
    white-space: nowrap;
}

.bar-label {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: #666;
    position: absolute;
    bottom: 0;
}

.pie-container {
    display: flex;
    align-items: center;
    gap: 32rpx;
    margin-bottom: 32rpx;
}

.pie-chart-wrap {
    flex-shrink: 0;
}

.pie-chart {
    width: 220rpx;
    height: 220rpx;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    background: #F0F2F5;
}

.pie-segment {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform-origin: center;
}

.pie-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.pie-total {
    font-size: 36rpx;
    font-weight: 800;
    color: #1E88E5;
    line-height: 1.2;
}

.pie-label {
    font-size: 20rpx;
    color: #999;
}

.pie-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.pie-legend-item {
    display: flex;
    align-items: center;
}

.legend-color {
    width: 16rpx;
    height: 16rpx;
    border-radius: 4rpx;
    margin-right: 10rpx;
    flex-shrink: 0;
}

.legend-name {
    flex: 1;
    font-size: 22rpx;
    color: #333;
}

.legend-count {
    font-size: 22rpx;
    color: #1E88E5;
    font-weight: 600;
    margin-right: 12rpx;
    width: 60rpx;
    text-align: right;
}

.legend-percent {
    font-size: 22rpx;
    color: #999;
    width: 70rpx;
    text-align: right;
}

.bar-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    border-top: 2rpx solid #F5F6FA;
    padding-top: 24rpx;
}

.bar-list-item {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}

.bar-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bar-list-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

.bar-list-value {
    font-size: 24rpx;
    color: #666;
}

.bar-list-track {
    height: 16rpx;
    background: #F0F2F5;
    border-radius: 8rpx;
    overflow: hidden;
}

.bar-list-fill {
    height: 100%;
    border-radius: 8rpx;
    transition: width 0.6s ease;
}

.ranking-table {
    border-radius: 16rpx;
    overflow: hidden;
    border: 2rpx solid #E8EAF6;
}

.ranking-header {
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%);
    padding: 20rpx 12rpx;
}

.rank-head,
.project-head,
.num-head,
.rate-head {
    font-size: 24rpx;
    font-weight: 600;
    color: #1565C0;
}

.ranking-row {
    display: flex;
    align-items: center;
    padding: 20rpx 12rpx;
    border-top: 2rpx solid #F5F6FA;
    background: #fff;
}

.ranking-row:nth-child(even) {
    background: #FAFBFC;
}

.rank-cell {
    font-size: 24rpx;
    color: #333;
}

.rank-num {
    width: 64rpx;
    text-align: center;
    flex-shrink: 0;
}

.rank-badge {
    width: 40rpx;
    height: 40rpx;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 700;
    color: #fff;
    margin: 0 auto;
}

.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA000); }
.rank-2 { background: linear-gradient(135deg, #B0BEC5, #78909C); }
.rank-3 { background: linear-gradient(135deg, #FFAB91, #D84315); }

.rank-normal {
    font-size: 26rpx;
    font-weight: 500;
    color: #666;
}

.project-name {
    flex: 1;
    padding: 0 8rpx;
    min-width: 0;
}

.project-text {
    font-size: 24rpx;
    color: #1a1a1a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.num-cell {
    width: 80rpx;
    text-align: center;
    flex-shrink: 0;
    font-weight: 600;
    color: #1E88E5;
}

.rate-cell {
    width: 140rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.rate-bar-wrap {
    flex: 1;
    height: 12rpx;
    background: #F0F2F5;
    border-radius: 6rpx;
    overflow: hidden;
}

.rate-bar-fill {
    height: 100%;
    border-radius: 6rpx;
    transition: width 0.6s ease;
}

.rate-excellent { background: linear-gradient(90deg, #43A047, #66BB6A); }
.rate-good { background: linear-gradient(90deg, #1E88E5, #42A5F5); }
.rate-normal { background: linear-gradient(90deg, #FB8C00, #FFB74D); }
.rate-poor { background: linear-gradient(90deg, #E53935, #EF5350); }

.rate-text {
    font-size: 22rpx;
    color: #333;
    font-weight: 600;
    width: 60rpx;
    text-align: right;
    flex-shrink: 0;
}

.action-section {
    padding: 24rpx;
}

.btn-export {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
    border-radius: 48rpx;
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
    border: none;
}

.btn-export::after {
    border: none;
}

.export-icon {
    font-size: 32rpx;
}

.bottom-space {
    height: 60rpx;
}
</style>
