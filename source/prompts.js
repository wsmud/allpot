const prompts = require('prompts');
const util = require('./util');

async function getAccount() {
  const response = await prompts(
    {
      type: 'text',
      name: 'account',
      message: '账号？',
      validate: (value) => (/^[a-z0-9]+$/.test(value) ? true : '账号输入错误，请重新输入。'),
    },
    {
      onCancel: () => process.exit(),
    },
  );
  return response.account;
}

async function getPassword(account) {
  let token = '';
  await prompts(
    {
      type: 'password',
      name: 'password',
      message: '密码？',
      validate: async (value) => {
        const pass = await util.getToken(account, value);
        token = pass;
        return pass ? true : '密码输入错误，请重新输入。';
      },
    },
    {
      onCancel: () => process.exit(),
    },
  );
  return token;
}

async function getServer() {
  const response = await prompts(
    {
      type: 'select',
      name: 'wsUrl',
      message: '服务器？',
      choices: [
        { title: '一区', value: 0 },
        { title: '二区', value: 1 },
        { title: '三区', value: 2 },
        { title: '四区', value: 3 },
        { title: '测试服', value: 4 },
      ],
      initial: 0,
    },
    {
      onCancel: () => process.exit(),
    },
  );
  const wsUrl = await util.getWsUrl(response.wsUrl);
  return wsUrl;
}

async function getRole(roles) {
  const response = await prompts(
    {
      type: 'select',
      name: 'role',
      message: '哪个角色？',
      choices: roles,
      initial: 0,
    },
    {
      onCancel: () => process.exit(),
    },
  );

  return response.role;
}

module.exports = {
  getServer,
  getAccount,
  getPassword,
  getRole,
};
