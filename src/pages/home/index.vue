<template>
    <view class="home-container">
        <view class="page-content">
            <transition name="fade-slide" mode="out-in">
                <view v-if="currentTab === 0" key="index" class="tab-page">
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
                                <view class="stat-item stat-blue" @tap="quickSwitch(1, 'pending')">
                                    <view class="stat-icon">📋</view>
                                    <view class="stat-content">
                                        <text class="stat-value">{{ stats.pendingTasks || 0 }}</text>
                                        <text class="stat-label">待接任务</text>
                                    </view>
                                </view>
                                <view class="stat-item stat-green" @tap="quickSwitch(1, 'accepted')">
                                    <view class="stat-icon">✅</view>
                                    <view class="stat-content">
                                        <text class="stat-value">{{ stats.acceptedTasks || 0 }}</text>
                                        <text class="stat-label">待巡检</text>
                                    </view>
                                </view>
                                <view class="stat-item stat-orange" @tap="quickSwitch(1, 'processing')">
                                    <view class="stat-icon">🔄</view>
                                    <view class="stat-content">
                                        <text class="stat-value">{{ stats.processingTasks || 0 }}</text>
                                        <text class="stat-label">巡检中</text>
                                    </view>
                                </view>
                                <view class="stat-item stat-red" @tap="quickSwitch(2)">
                                    <view class="stat-icon">⚠️</view>
                                    <view class="stat-content">
                                        <text class="stat-value">{{ stats.todayHazards || 0 }}</text>
                                        <text class="stat-label">今日隐患</text>
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
                                <view class="action-item" @tap="switchTab(1)">
                                    <view class="action-icon action-icon-blue">📑</view>
                                    <text class="action-text">巡检任务</text>
                                </view>
                                <view class="action-item" @tap="goRectify">
                                    <view class="action-icon action-icon-orange">🛠️</view>
                                    <text class="action-text">整改跟踪</text>
                                </view>
                                <view class="action-item" @tap="switchTab(3)">
                                    <view class="action-icon action-icon-green">📊</view>
                                    <text class="action-text">数据分析</text>
                                </view>
                            </view>
                        </view>

                        <view class="bottom-space-tab"></view>
                    </view>
                </view>

                <view v-else-if="currentTab === 1" key="task" class="tab-page">
                    <view class="task-list-page">
                        <view class="page-navbar">
                            <text class="navbar-title">巡检任务</text>
                        </view>
                        <view class="search-bar">
                            <view class="search-input-wrap">
                                <text class="search-icon">🔍</text>
                                <input 
                                    class="search-input" 
                                    type="text" 
                                    v-model="taskKeyword" 
                                    placeholder="搜索任务编号、标题"
                                    placeholder-class="search-placeholder"
                                />
                                <text v-if="taskKeyword" class="clear-icon" @tap="taskKeyword = ''">✕</text>
                            </view>
                        </view>
                        <scroll-view class="status-tabs" scroll-x :show-scrollbar="false">
                            <view class="tabs-inner">
                                <view 
                                    v-for="tab in taskStatusTabs" 
                                    :key="tab.value"
                                    class="tab-item"
                                    :class="{ active: taskCurrentStatus === tab.value }"
                                    @tap="taskCurrentStatus = tab.value"
                                >
                                    <text class="tab-text">{{ tab.label }}</text>
                                </view>
                            </view>
                        </scroll-view>
                        <scroll-view class="task-scroll" scroll-y>
                            <view v-if="filteredTaskList.length > 0" class="task-container">
                                <view 
                                    v-for="(task, index) in filteredTaskList" 
                                    :key="task.id" 
                                    class="task-card"
                                    @tap="goTaskDetail(task.id)"
                                >
                                    <view class="card-header">
                                        <view class="task-type">
                                            <text>{{ task.typeName }}</text>
                                        </view>
                                        <view class="task-status" :class="'status-' + task.status">
                                            {{ getTaskStatusText(task.status) }}
                                        </view>
                                    </view>
                                    <view class="card-body">
                                        <text class="task-title">{{ task.title }}</text>
                                        <view class="task-info-grid">
                                            <view class="info-item">
                                                <text class="info-icon">📍</text>
                                                <text class="info-text">{{ task.area }}</text>
                                            </view>
                                            <view class="info-item">
                                                <text class="info-icon">⏰</text>
                                                <text class="info-text">截止：{{ task.deadline }}</text>
                                            </view>
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <view v-else class="empty-state">
                                <view class="empty-icon">📋</view>
                                <text class="empty-title">暂无任务</text>
                            </view>
                            <view class="list-bottom-space"></view>
                        </scroll-view>
                    </view>
                </view>

                <view v-else-if="currentTab === 2" key="hazard" class="tab-page">
                    <view class="hazard-list-page">
                        <view class="page-navbar">
                            <text class="navbar-title">安全隐患</text>
                        </view>
                        <view class="search-bar">
                            <view class="search-input-wrap">
                                <text class="search-icon">🔍</text>
                                <input 
                                    class="search-input" 
                                    type="text" 
                                    v-model="hazardKeyword" 
                                    placeholder="搜索隐患标题、位置"
                                    placeholder-class="search-placeholder"
                                />
                                <text v-if="hazardKeyword" class="clear-icon" @tap="hazardKeyword = ''">✕</text>
                            </view>
                        </view>
                        <scroll-view class="status-tabs" scroll-x :show-scrollbar="false">
                            <view class="tabs-inner">
                                <view 
                                    v-for="tab in hazardStatusTabs" 
                                    :key="tab.value"
                                    class="tab-item"
                                    :class="{ active: hazardCurrentStatus === tab.value }"
                                    @tap="hazardCurrentStatus = tab.value"
                                >
                                    <text class="tab-text">{{ tab.label }}</text>
                                </view>
                            </view>
                        </scroll-view>
                        <scroll-view class="hazard-scroll" scroll-y>
                            <view v-if="filteredHazardList.length > 0" class="hazard-container">
                                <view 
                                    v-for="hazard in filteredHazardList" 
                                    :key="hazard.id" 
                                    class="hazard-card"
                                    @tap="goHazardDetail(hazard.id)"
                                >
                                    <view class="card-header">
                                        <view class="hazard-level" :class="'level-tag-' + hazard.level">
                                            <text class="level-dot"></text>
                                            <text>{{ hazard.levelName }}</text>
                                        </view>
                                        <view class="hazard-status" :class="'status-' + hazard.status">
                                            {{ getHazardStatusText(hazard.status) }}
                                        </view>
                                    </view>
                                    <view class="card-body">
                                        <text class="hazard-title">{{ hazard.title }}</text>
                                        <view class="hazard-info-list">
                                            <view class="info-item">
                                                <text class="info-icon">📍</text>
                                                <text class="info-text">{{ hazard.location }}</text>
                                            </view>
                                            <view class="info-item">
                                                <text class="info-icon">🕐</text>
                                                <text class="info-text">{{ hazard.reportTime }}</text>
                                            </view>
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <view v-else class="empty-state">
                                <view class="empty-icon">⚠️</view>
                                <text class="empty-title">暂无隐患</text>
                            </view>
                            <view class="list-bottom-space"></view>
                        </scroll-view>
                        <view class="fab-button" @tap="goReportHazard">
                            <text class="fab-icon">+</text>
                        </view>
                    </view>
                </view>

                <view v-else-if="currentTab === 3" key="stat" class="tab-page">
                    <view class="statistics-page">
                        <view class="page-navbar navbar-blue">
                            <text class="navbar-title">数据分析</text>
                        </view>
                        <view class="overview-section">
                            <view class="section-title-wrap">
                                <text class="section-title-text">数据概览</text>
                                <text class="section-date">{{ currentDate }}</text>
                            </view>
                            <view class="overview-grid">
                                <view class="overview-card">
                                    <view class="ring-progress">
                                        <view class="ring-inner">
                                            <text class="ring-value">{{ statOverview.totalTasks }}</text>
                                            <text class="ring-label">任务总数</text>
                                        </view>
                                    </view>
                                    <view class="progress-hint">
                                        <text class="hint-dot hint-blue"></text>
                                        <text class="hint-text">完成率 {{ taskCompleteRate }}%</text>
                                    </view>
                                </view>
                                <view class="overview-card">
                                    <view class="ring-progress ring-orange">
                                        <view class="ring-inner">
                                            <text class="ring-value">{{ statOverview.totalHazards }}</text>
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
                            </view>
                            <view class="trend-list">
                                <view v-for="(item, index) in trendData" :key="index" class="trend-item">
                                    <text class="trend-label">{{ item.label }}</text>
                                    <view class="trend-bars">
                                        <view class="trend-bar-wrap">
                                            <view class="trend-bar bar-blue" :style="{ width: getTrendBarWidth(item.tasks) + '%' }"></view>
                                        </view>
                                        <text class="trend-bar-value">{{ item.tasks }}任务</text>
                                    </view>
                                    <view class="trend-bars">
                                        <view class="trend-bar-wrap">
                                            <view class="trend-bar bar-orange" :style="{ width: getTrendBarWidth(item.hazards) + '%' }"></view>
                                        </view>
                                        <text class="trend-bar-value">{{ item.hazards }}隐患</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                        <view class="bottom-space-tab"></view>
                    </view>
                </view>

                <view v-else-if="currentTab === 4" key="mine" class="tab-page">
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
                                    </view>
                                    <view class="user-no-row">
                                        <text class="no-label">工号：</text>
                                        <text class="no-value">{{ userEmployeeNo }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                        <view class="stats-section">
                            <view class="stats-card">
                                <view class="stat-cell" @tap="switchTab(1)">
                                    <text class="stat-value stat-blue">{{ monthTasks }}</text>
                                    <text class="stat-label">本月任务</text>
                                </view>
                                <view class="stat-divider"></view>
                                <view class="stat-cell" @tap="switchTab(2)">
                                    <text class="stat-value stat-orange">{{ foundHazards }}</text>
                                    <text class="stat-label">发现隐患</text>
                                </view>
                                <view class="stat-divider"></view>
                                <view class="stat-cell">
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
                                <view class="menu-item" @tap="showAbout">
                                    <view class="menu-icon-wrap icon-orange">
                                        <text class="menu-icon">ℹ️</text>
                                    </view>
                                    <view class="menu-content">
                                        <text class="menu-title">关于我们</text>
                                    </view>
                                    <text class="menu-arrow">›</text>
                                </view>
                            </view>
                        </view>
                        <view class="logout-section">
                            <button class="btn-logout" @tap="handleLogout">
                                <text>退出登录</text>
                            </button>
                        </view>
                        <view class="bottom-space-tab"></view>
                    </view>
                </view>
            </transition>
        </view>

        <TabBar 
            :tabs="tabList" 
            :current="currentTab" 
            @change="onTabChange"
        />
    </view>
</template>

<script>
import TabBar from '@/components/tab-bar/index.vue'

export default {
    name: 'HomePage',
    components: { TabBar },
    data() {
        return {
            currentTab: 0,
            tabList: [
                {
                    key: 'index',
                    text: '工作台',
                    iconPath: '/static/tabbar/home.png',
                    selectedIconPath: '/static/tabbar/home-active.png'
                },
                {
                    key: 'task',
                    text: '任务',
                    iconPath: '/static/tabbar/task.png',
                    selectedIconPath: '/static/tabbar/task-active.png',
                    badge: 3
                },
                {
                    key: 'hazard',
                    text: '隐患',
                    iconPath: '/static/tabbar/hazard.png',
                    selectedIconPath: '/static/tabbar/hazard-active.png'
                },
                {
                    key: 'stat',
                    text: '统计',
                    iconPath: '/static/tabbar/stat.png',
                    selectedIconPath: '/static/tabbar/stat-active.png'
                },
                {
                    key: 'mine',
                    text: '我的',
                    iconPath: '/static/tabbar/mine.png',
                    selectedIconPath: '/static/tabbar/mine-active.png'
                }
            ],
            taskKeyword: '',
            taskCurrentStatus: 'all',
            taskStatusTabs: [
                { label: '全部', value: 'all' },
                { label: '待接收', value: 'pending' },
                { label: '待巡检', value: 'accepted' },
                { label: '巡检中', value: 'processing' },
                { label: '已完成', value: 'completed' }
            ],
            hazardKeyword: '',
            hazardCurrentStatus: 'all',
            hazardStatusTabs: [
                { label: '全部', value: 'all' },
                { label: '已上报', value: 'reported' },
                { label: '整改中', value: 'rectifying' },
                { label: '待复查', value: 'review' },
                { label: '已闭环', value: 'closed' }
            ],
            stats: {
                pendingTasks: 5,
                acceptedTasks: 8,
                processingTasks: 3,
                todayHazards: 2
            },
            mockTasks: [
                { id: 1, title: 'A区3号楼脚手架安全检查', typeName: '日常巡检', status: 'pending', area: 'A区3号楼', deadline: '2024-01-15', taskNo: 'T202401001' },
                { id: 2, title: 'B区临边防护设施专项检查', typeName: '专项检查', status: 'accepted', area: 'B区施工现场', deadline: '2024-01-14', taskNo: 'T202401002' },
                { id: 3, title: 'C区临时用电安全巡检', typeName: '日常巡检', status: 'processing', area: 'C区加工区', deadline: '2024-01-16', taskNo: 'T202401003' },
                { id: 4, title: 'D区消防安全月度检查', typeName: '月检', status: 'completed', area: 'D区生活区', deadline: '2024-01-10', taskNo: 'T202401004' },
                { id: 5, title: 'E区基坑支护安全巡检', typeName: '日常巡检', status: 'pending', area: 'E区基坑', deadline: '2024-01-18', taskNo: 'T202401005' }
            ],
            mockHazards: [
                { id: 1, title: '3号楼东侧临边防护缺失', level: 'high', levelName: '较大', status: 'rectifying', location: 'A区3号楼东侧', reportTime: '2024-01-12 09:30', hazardNo: 'H202401001', categoryName: '安全防护' },
                { id: 2, title: '加工区电箱未上锁管理', level: 'medium', levelName: '一般', status: 'reported', location: 'C区钢筋加工区', reportTime: '2024-01-12 14:20', hazardNo: 'H202401002', categoryName: '临时用电' },
                { id: 3, title: '脚手架扣件松动', level: 'critical', levelName: '重大', status: 'review', location: 'B区2号楼外架', reportTime: '2024-01-11 16:45', hazardNo: 'H202401003', categoryName: '脚手架' },
                { id: 4, title: '工人未正确佩戴安全帽', level: 'low', levelName: '轻微', status: 'closed', location: 'D区材料堆场', reportTime: '2024-01-11 10:15', hazardNo: 'H202401004', categoryName: '文明施工' }
            ],
            statOverview: {
                totalTasks: 256,
                completedTasks: 189,
                totalHazards: 342,
                rectifiedHazards: 268
            },
            trendData: [],
            monthTasks: 28,
            foundHazards: 45,
            completedRectify: 38
        }
    },
    computed: {
        userName() {
            return this.$store.state.user ? this.$store.state.user.name : '张三'
        },
        userRoleName() {
            return this.$store.state.user ? this.$store.state.user.roleName : '安全员'
        },
        userRole() {
            const roleMap = { admin: '项目经理', inspector: '安全员', worker: '施工员' }
            const user = this.$store.state.user
            return user ? (roleMap[user.role] || '安全员') : '安全员'
        },
        userEmployeeNo() {
            const user = this.$store.state.user
            return user ? (user.employeeNo || 'EMP001') : 'EMP001'
        },
        userInitial() {
            return this.userName.charAt(0)
        },
        networkStatus() {
            return this.$store.state.networkStatus !== false
        },
        pendingSyncCount() {
            return this.$store.getters ? (this.$store.getters.getPendingSyncCount || 0) : 0
        },
        currentProjectName() {
            const projects = this.$store.state.projects || []
            return projects.length > 0 ? projects[0].name : '城东新区商业综合体项目'
        },
        todayStr() {
            const d = new Date()
            return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
        },
        currentDate() {
            const d = new Date()
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        },
        taskCompleteRate() {
            if (this.statOverview.totalTasks === 0) return 0
            return Math.round(this.statOverview.completedTasks / this.statOverview.totalTasks * 100)
        },
        hazardRectifyRate() {
            if (this.statOverview.totalHazards === 0) return 0
            return Math.round(this.statOverview.rectifiedHazards / this.statOverview.totalHazards * 100)
        },
        filteredTaskList() {
            let tasks = [...this.mockTasks]
            if (this.taskCurrentStatus !== 'all') {
                tasks = tasks.filter(t => t.status === this.taskCurrentStatus)
            }
            if (this.taskKeyword.trim()) {
                const kw = this.taskKeyword.trim().toLowerCase()
                tasks = tasks.filter(t => 
                    t.title.toLowerCase().includes(kw) || 
                    t.taskNo.toLowerCase().includes(kw)
                )
            }
            return tasks
        },
        filteredHazardList() {
            let hazards = [...this.mockHazards]
            if (this.hazardCurrentStatus !== 'all') {
                hazards = hazards.filter(h => h.status === this.hazardCurrentStatus)
            }
            if (this.hazardKeyword.trim()) {
                const kw = this.hazardKeyword.trim().toLowerCase()
                hazards = hazards.filter(h => 
                    h.title.toLowerCase().includes(kw) || 
                    h.location.toLowerCase().includes(kw)
                )
            }
            return hazards
        },
        maxTrendValue() {
            let max = 10
            this.trendData.forEach(item => {
                max = Math.max(max, item.tasks, item.hazards)
            })
            return max
        }
    },
    onShow() {
        if (this.$store.getters && !this.$store.getters.isLoggedIn) {
            uni.reLaunch({ url: '/pages/login/login' })
            return
        }
        this.loadTrendData()
    },
    methods: {
        loadTrendData() {
            const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            this.trendData = labels.map(label => ({
                label,
                tasks: Math.floor(Math.random() * 30) + 15,
                hazards: Math.floor(Math.random() * 25) + 10
            }))
        },
        getTrendBarWidth(value) {
            if (this.maxTrendValue === 0) return 0
            return (value / this.maxTrendValue) * 100
        },
        onTabChange(index, item) {
            this.currentTab = index
            uni.vibrateShort && uni.vibrateShort({ type: 'light' })
        },
        switchTab(index) {
            this.currentTab = index
        },
        quickSwitch(tabIndex, status) {
            this.currentTab = tabIndex
            if (tabIndex === 1 && status) {
                this.taskCurrentStatus = status
            }
        },
        getTaskStatusText(status) {
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
        goTaskDetail(id) {
            uni.navigateTo({ url: `/pages/task/detail?id=${id}` })
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
        goSync() {
            uni.navigateTo({ url: '/pages/mine/sync' })
        },
        showAbout() {
            uni.showModal({
                title: '关于智慧工地巡检',
                content: '智慧工地安全巡检系统 v1.0.0\n\n致力于提升工地安全管理水平。',
                showCancel: false
            })
        },
        handleLogout() {
            uni.showModal({
                title: '确认退出',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.$store.commit && this.$store.commit('CLEAR_AUTH')
                        uni.reLaunch({ url: '/pages/login/login' })
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.home-container {
    min-height: 100vh;
    background: #F5F6FA;
    position: relative;
}

.page-content {
    padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
    min-height: 100vh;
    box-sizing: border-box;
}

.tab-page {
    width: 100%;
    min-height: calc(100vh - 100rpx - env(safe-area-inset-bottom));
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter {
    opacity: 0;
    transform: translateX(20rpx);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20rpx);
}

.page-navbar {
    padding: 0 32rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    background: #fff;
    border-bottom: 2rpx solid #F0F2F5;
    padding-top: var(--status-bar-height, 0px);
}

.navbar-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #1a1a1a;
}

.navbar-blue {
    background: linear-gradient(180deg, #1E88E5 0%, #1565C0 100%);
}

.navbar-blue .navbar-title {
    color: #fff;
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

.task-scroll,
.hazard-scroll {
    height: calc(100vh - 88rpx - var(--status-bar-height, 0px) - 160rpx - 100rpx - env(safe-area-inset-bottom));
}

.task-container,
.hazard-container {
    padding: 24rpx;
}

.task-card,
.hazard-card {
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
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

.task-status,
.hazard-status {
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
.status-reported { background: #E3F2FD; color: #1565C0; }
.status-rectifying { background: #FFF3E0; color: #E65100; }
.status-review { background: #F3E5F5; color: #6A1B9A; }
.status-closed { background: #F5F5F5; color: #616161; }

.card-body {
    padding: 20rpx 24rpx;
}

.task-title,
.hazard-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 12rpx;
    display: block;
}

.task-info-grid,
.hazard-info-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
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

.level-tag-critical { background: #FFEBEE; }
.level-tag-critical text { color: #C62828; }
.level-tag-critical .level-dot { background: #E53935; }

.level-tag-high { background: #FFF3E0; }
.level-tag-high text { color: #E65100; }
.level-tag-high .level-dot { background: #FB8C00; }

.level-tag-medium { background: #FFF8E1; }
.level-tag-medium text { color: #F57C00; }
.level-tag-medium .level-dot { background: #FBC02D; }

.level-tag-low { background: #E8F5E9; }
.level-tag-low text { color: #2E7D32; }
.level-tag-low .level-dot { background: #43A047; }

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
}

.list-bottom-space {
    height: 40rpx;
}

.fab-button {
    position: fixed;
    right: 40rpx;
    bottom: calc(160rpx + env(safe-area-inset-bottom));
    width: 112rpx;
    height: 112rpx;
    background: linear-gradient(135deg, #E53935, #C62828);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 32rpx rgba(229, 57, 53, 0.4);
    z-index: 99;
}

.fab-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
}

.workbench {
    min-height: 100%;
    background: #F5F6FA;
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

.stat-blue { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); }
.stat-green { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
.stat-orange { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
.stat-red { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); }

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

.action-text {
    font-size: 24rpx;
    color: #333;
    text-align: center;
}

.statistics-page {
    min-height: 100%;
    background: #F5F6FA;
}

.overview-section,
.chart-section {
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
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: conic-gradient(#1E88E5 0deg, #42A5F5 216deg, #64B5F6 340deg, #E8EAF6 340deg, #E8EAF6 360deg);
    box-shadow: inset 0 2rpx 8rpx rgba(30, 136, 229, 0.1);
}

.ring-orange {
    background: conic-gradient(#43A047 0deg, #66BB6A 216deg, #A5D6A7 280deg, #E8EAF6 280deg, #E8EAF6 360deg);
}

.ring-inner {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.ring-value {
    font-size: 36rpx;
    font-weight: 800;
    color: #1E88E5;
    line-height: 1.2;
}

.ring-label {
    font-size: 20rpx;
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

.trend-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.trend-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 16rpx;
    background: #FAFBFC;
    border-radius: 12rpx;
}

.trend-label {
    font-size: 24rpx;
    color: #666;
    font-weight: 500;
}

.trend-bars {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.trend-bar-wrap {
    flex: 1;
    height: 16rpx;
    background: #F0F2F5;
    border-radius: 8rpx;
    overflow: hidden;
}

.trend-bar {
    height: 100%;
    border-radius: 8rpx;
    transition: width 0.6s ease;
}

.bar-blue {
    background: linear-gradient(90deg, #64B5F6, #1E88E5);
}

.bar-orange {
    background: linear-gradient(90deg, #FFB74D, #FB8C00);
}

.trend-bar-value {
    font-size: 20rpx;
    color: #999;
    width: 120rpx;
    flex-shrink: 0;
}

.mine-page {
    min-height: 100%;
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

.avatar-wrap .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #64B5F6 0%, #1E88E5 100%);
}

.avatar-wrap .avatar-text {
    font-size: 48rpx;
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

.status-dot.online { background: #43A047; }
.status-dot.offline { background: #9E9E9E; }

.mine-page .user-info {
    flex: 1;
    min-width: 0;
}

.mine-page .user-name {
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

.stats-section {
    padding: 24rpx;
}

.stats-card {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx 16rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    margin: 0;
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
    margin-bottom: 0;
}

.section-title::before {
    display: none;
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

.icon-green { background: #E8F5E9; }
.icon-orange { background: #FFF3E0; }

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

.logout-section {
    padding: 24rpx 24rpx 0;
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

.bottom-space-tab {
    height: 40rpx;
}
</style>
