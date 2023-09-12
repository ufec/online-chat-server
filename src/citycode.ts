const adCode = '110105';
const provinceCode = `8${adCode.substring(0, 2)}`;
const cityCode = `8${adCode.substring(0, 4)}00`;
console.log('provinceCode', provinceCode);
console.log('cityCode', cityCode);
// https://restapi.amap.com/v3/geocode/regeo?key=5e420d82a4effe7beaeb5c64e05b8f42&location=109.582351%2C32.317487&extensions=all&s=rsx&platform=WXJS&appname=5e420d82a4effe7beaeb5c64e05b8f42&sdkversion=1.2.0&logversion=2.0
export {};
