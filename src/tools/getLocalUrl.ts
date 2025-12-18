export const getLocalUrl = () => {
    if (process.env.DEV) {
        return "http://192.168.0.89:4545"
    }
    
    const url = process.env.URL
    return url
}
