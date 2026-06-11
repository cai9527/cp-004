export function showToast(title, icon = 'none', duration = 2000) {
    uni.showToast({
        title,
        icon,
        duration
    })
}

export function showLoading(title = '加载中...', mask = true) {
    uni.showLoading({
        title,
        mask
    })
}

export function hideLoading() {
    uni.hideLoading()
}

export function showModal(title, content, options = {}) {
    return new Promise((resolve) => {
        uni.showModal({
            title,
            content,
            confirmText: options.confirmText || '确定',
            cancelText: options.cancelText || '取消',
            confirmColor: options.confirmColor || '#1E88E5',
            showCancel: options.showCancel !== false,
            success: (res) => {
                resolve(res.confirm)
            }
        })
    })
}

export function showActionSheet(itemList) {
    return new Promise((resolve) => {
        uni.showActionSheet({
            itemList,
            success: (res) => {
                resolve(res.tapIndex)
            },
            fail: () => {
                resolve(-1)
            }
        })
    })
}

export function navigateTo(url) {
    uni.navigateTo({ url })
}

export function redirectTo(url) {
    uni.redirectTo({ url })
}

export function switchTab(url) {
    uni.switchTab({ url })
}

export function reLaunch(url) {
    uni.reLaunch({ url })
}

export function navigateBack(delta = 1) {
    uni.navigateBack({ delta })
}

export function getLocation() {
    return new Promise((resolve, reject) => {
        uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            success: (res) => {
                resolve({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    address: res.address || ''
                })
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

export function chooseImage(count = 9) {
    return new Promise((resolve, reject) => {
        uni.chooseImage({
            count,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                resolve(res.tempFilePaths)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

export function takePhoto() {
    return new Promise((resolve, reject) => {
        uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success: (res) => {
                resolve(res.tempFilePaths[0])
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

export function previewImage(urls, current = '') {
    uni.previewImage({
        urls,
        current
    })
}

export function vibrateShort() {
    uni.vibrateShort({
        type: 'light'
    })
}

export function setClipboardData(text) {
    return new Promise((resolve, reject) => {
        uni.setClipboardData({
            data: text,
            success: () => {
                showToast('已复制到剪贴板', 'success')
                resolve()
            },
            fail: reject
        })
    })
}

export function checkNetwork() {
    return new Promise((resolve) => {
        uni.getNetworkType({
            success: (res) => {
                resolve(res.networkType !== 'none')
            }
        })
    })
}
