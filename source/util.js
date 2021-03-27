const qs = require('qs');
const axios = require('axios');

const color = {
  wht: 1,
  hig: 2,
  hic: 3,
  hiy: 4,
  hiz: 5,
  hio: 6,
  ord: 7,
};

function getPot(name, level) {
  const lv = name.match(/<(.+?)>/)[1];
  if (level <= 100 || !(lv in color)) {
    return 0;
  }
  return (((level + 100) * (level - 100)) / 2) * color[lv] * 5;
}

async function getWsUrl(serverNum) {
  const res = await axios.get('http://game.wsmud.com/game/getserver');
  if (res.status !== 200 || !Array.isArray(res.data) || res.data.length < serverNum) {
    console.log('获取服务器地址失败。');
    process.exit();
  }

  const serverIndo = res.data[serverNum];
  return `ws://${serverIndo.IP}:${serverIndo.Port}`;
}

async function getToken(account, password) {
  const res = await axios.post(
    'http://game.wsmud.com/userapi/login',
    qs.stringify({ code: account, pwd: password }),
  );
  if (res.status !== 200 || res.data.code !== 1) {
    return null;
  }
  const token = res.headers['set-cookie'].map((cookie) => cookie.match(/^(u|p)=(.+?);/)[2]);
  return token.join(' ');
}

module.exports = {
  getWsUrl,
  getToken,
  getPot,
};
