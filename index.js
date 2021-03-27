#!/usr/bin/env node
const prompts = require('./source/prompts');
const Socket = require('./source/Socket');
const { getPot } = require('./source/util');

const type2cmd = {
  内功: 'force',
  拳脚: 'unarmed',
  招架: 'parry',
  轻功: 'dodge',
  剑法: 'sword',
  刀法: 'blade',
  棍法: 'club',
  杖法: 'staff',
  暗器: 'throwing',
  鞭法: 'whip',
};

let id;
let types;
let socket;
let havaCreateSkill = false;
let remainPot = 0;
let skillsPot = 0;
let baseSkillsPot = 0;
let updatePot = 0;
let createPot = 0;

async function onMessage(data) {
  const { type } = data;
  if (type === 'roles') {
    if (data.roles.length < 1) {
      console.log('无角色，请确认账号区服信息。');
      process.exit();
    }

    const userId = await prompts.getRole(
      data.roles.map((role) => ({
        title: role.name,
        value: role.id,
      })),
    );

    socket.send(`login ${userId}`);
  }

  if (type === 'login') {
    id = data.id;
    socket.send('stopstate,cha');
  }

  if (type === 'dialog' && data.dialog === 'skills' && data.items) {
    remainPot = data.pot;
    console.log(`剩余潜能: ${remainPot}`);
    data.items.forEach((skill) => {
      if (skill.id === id) havaCreateSkill = true;
      if (skill.name.includes('wht')) {
        baseSkillsPot += getPot(skill.name, skill.level);
      } else {
        skillsPot += getPot(skill.name, skill.level);
      }
    });

    console.log(`基础技能: ${baseSkillsPot}`);
    console.log(`特殊技能: ${skillsPot}`);
    socket.send(havaCreateSkill ? `checkskill ${id} help` : 'lingwu reset,xiulian');
  }

  if (type === 'tip') {
    if (data.msg.includes('所创造的武功')) {
      types = Array.from(data.msg.matchAll(/当装备为基本(.+?)时/g)).map((sk) => sk[1]);
      types.forEach((skillName) => socket.send(`enable ${type2cmd[skillName]} none`));
      types.forEach((skillName) => socket.send(`zc typedel ${type2cmd[skillName]}`));
      types.forEach((skillName) => socket.send(`enable ${type2cmd[skillName]} ${id}`));
      socket.send('lingwu reset,xiulian');
    }

    if (data.msg.includes('没有设置')) {
      socket.send('lingwu reset,xiulian');
    }

    if (data.msg.includes('将返回你消耗的')) {
      const info = data.msg.match(/移除.+?的【(.+?)】类型.+武道书，(.*?)潜能/);
      createPot += Number(info[2]);
      console.log(`自创${info[1]}: ${info[2]}`);
    }

    if (data.msg.includes('并返回你消耗的')) {
      updatePot = Number(data.msg.match(/并返回你消耗的(.*?)潜能/)[1]);
      console.log(`进阶潜能: ${updatePot}`);
      console.log(`总潜能: ${remainPot + skillsPot + baseSkillsPot + updatePot + createPot}`);
      socket.socket.close();
    }

    if (data.msg.includes('必须先取消融合才可以重置武道')) {
      console.log(`总潜能: ${remainPot + skillsPot + baseSkillsPot + createPot}`);
      console.log('因存在进阶后融合的技能，无法获取进阶潜能。')
      socket.socket.close();
    }

    if (data.msg.includes('没有领悟') || data.msg.includes('没有这个技能')) {
      console.log(`总潜能: ${remainPot + skillsPot + baseSkillsPot + updatePot + createPot}`);
      socket.socket.close();
    }
  }
}

(async () => {
  const wsUrl = await prompts.getServer();
  socket = new Socket(wsUrl, onMessage);
  const account = await prompts.getAccount();
  const token = await prompts.getPassword(account);
  socket.send(token);
})();
