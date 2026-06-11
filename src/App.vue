<script>
export default {
    onLaunch: function() {
        console.log('App Launch')
        this.initApp()
    },
    onShow: function() {
        console.log('App Show')
        this.checkNetworkStatus()
    },
    onHide: function() {
        console.log('App Hide')
    },
    methods: {
        initApp() {
            const token = uni.getStorageSync('token')
            if (!token) {
                setTimeout(() => {
                    uni.reLaunch({
                        url: '/pages/login/login'
                    })
                }, 500)
            }
            this.checkPendingSync()
        },
        checkNetworkStatus() {
            uni.getNetworkType({
                success: (res) => {
                    this.$store.commit('SET_NETWORK_STATUS', res.networkType !== 'none')
                    if (res.networkType !== 'none') {
                        this.$store.dispatch('autoSyncOfflineData')
                    }
                }
            })
            uni.onNetworkStatusChange((res) => {
                this.$store.commit('SET_NETWORK_STATUS', res.isConnected)
                if (res.isConnected) {
                    this.$store.dispatch('autoSyncOfflineData')
                }
            })
        },
        checkPendingSync() {
            const pendingCount = this.$store.getters.getPendingSyncCount
            if (pendingCount > 0) {
                uni.setTabBarBadge({
                    index: 4,
                    text: String(pendingCount)
                })
            }
        }
    }
}
</script>

<style>
@import "./uni.scss";

page {
    background-color: #F5F6FA;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

view, text, image, scroll-view {
    box-sizing: border-box;
}

.container {
    padding: 24rpx;
}

.card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
    background: linear-gradient(135deg, #1E88E5, #1565C0);
    color: #fff;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    padding: 20rpx 40rpx;
    text-align: center;
    border: none;
}

.btn-primary::after {
    border: none;
}

.btn-danger {
    background: linear-gradient(135deg, #E53935, #C62828);
    color: #fff;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    padding: 20rpx 40rpx;
    text-align: center;
    border: none;
}

.btn-danger::after {
    border: none;
}

.btn-warning {
    background: linear-gradient(135deg, #FB8C00, #F57C00);
    color: #fff;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    padding: 20rpx 40rpx;
    text-align: center;
    border: none;
}

.btn-warning::after {
    border: none;
}

.btn-success {
    background: linear-gradient(135deg, #43A047, #2E7D32);
    color: #fff;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
    padding: 20rpx 40rpx;
    text-align: center;
    border: none;
}

.btn-success::after {
    border: none;
}

.btn-outline {
    background: #fff;
    color: #1E88E5;
    border: 2rpx solid #1E88E5;
    border-radius: 12rpx;
    font-size: 30rpx;
    padding: 18rpx 40rpx;
    text-align: center;
}

.btn-outline::after {
    border: none;
}

.tag {
    display: inline-block;
    padding: 6rpx 16rpx;
    border-radius: 6rpx;
    font-size: 22rpx;
    font-weight: 500;
}

.tag-blue {
    background: #E3F2FD;
    color: #1565C0;
}

.tag-green {
    background: #E8F5E9;
    color: #2E7D32;
}

.tag-yellow {
    background: #FFF8E1;
    color: #F57C00;
}

.tag-red {
    background: #FFEBEE;
    color: #C62828;
}

.tag-gray {
    background: #F5F5F5;
    color: #616161;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20rpx;
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

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    color: #999;
}

.empty image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 24rpx;
    opacity: 0.6;
}

.empty text {
    font-size: 26rpx;
}

.input-item {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 20rpx;
}

.input-item .label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 10rpx;
}

.input-item input,
.input-item textarea,
.input-item .picker-value {
    font-size: 28rpx;
    color: #1a1a1a;
    width: 100%;
}

.text-muted {
    color: #999;
    font-size: 24rpx;
}

.flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.flex-between {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.flex-wrap {
    flex-wrap: wrap;
}

.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mt-40 { margin-top: 40rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
</style>
