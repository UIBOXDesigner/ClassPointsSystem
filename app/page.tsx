"use client";

import { useEffect, useMemo, useState } from "react";

type PetType = {
  id: string;
  name: string;
  emoji: string;
  trait: string;
  accent: string;
};

type AttributeKey = "knowledge" | "focus" | "action" | "cooperation";

type Task = {
  id: string;
  title: string;
  type: "每日" | "每周" | "阶段" | "挑战" | "补救";
  description: string;
  growth: number;
  stars: number;
  attribute: AttributeKey;
  limit: string;
};

type Reward = {
  id: string;
  title: string;
  type: "虚拟装扮" | "学习权益" | "实体奖励" | "公益奖励";
  price: number;
  stock: number;
  description: string;
};

type Ledger = {
  id: string;
  date: string;
  source: string;
  note: string;
  growthDelta: number;
  starsDelta: number;
};

type Pet = {
  typeId: string;
  name: string;
  level: number;
  stage: string;
  mood: string;
  knowledge: number;
  focus: number;
  action: number;
  cooperation: number;
  outfit: string[];
  room: string[];
};

type Learner = {
  id: string;
  name: string;
  nickname: string;
  className: string;
  course: string;
  pet: Pet;
  account: {
    totalGrowth: number;
    totalStars: number;
    stars: number;
  };
  streak: number;
  attendanceRate: number;
  homeworkRate: number;
  quizTrend: number;
  completedTasks: string[];
  ownedRewards: string[];
  ledger: Ledger[];
};

type LearnerDraft = {
  name: string;
  nickname: string;
  className: string;
  course: string;
  petType: string;
  petName: string;
};

type ActivityGoal = {
  id: string;
  title: string;
  current: number;
  target: number;
  metric: string;
};

type SeasonActivity = {
  id: string;
  title: string;
  theme: string;
  period: string;
  description: string;
  reward: string;
  goals: ActivityGoal[];
};

type Recommendation = {
  title: string;
  reason: string;
  action: string;
  priority: "高" | "中" | "低";
  taskId?: string;
};

type AuditItem = {
  learner: Learner;
  level: "高" | "中" | "低";
  reasons: string[];
};

type SectionId =
  | "roleHome"
  | "overview"
  | "learners"
  | "tasks"
  | "pet"
  | "shop"
  | "activities"
  | "reports"
  | "insights"
  | "audit"
  | "ledger"
  | "teacher"
  | "admin";

type PortalRole = "student" | "teacher" | "parent";
type StudentTab = "home" | "tasks" | "pet" | "badges" | "points" | "shop" | "records" | "ranking";

const STORAGE_KEY = "learning-pet-mvp-v2";
const LEVEL_STEP = 200;

const PETS: PetType[] = [
  {
    id: "dog",
    name: "勇气犬",
    emoji: "🐶",
    trait: "行动力强，适合鼓励主动练习和表达",
    accent: "#f59e0b",
  },
  {
    id: "cat",
    name: "智慧猫",
    emoji: "🐱",
    trait: "知识值高，适合语言、学科和考试培训",
    accent: "#8b5cf6",
  },
  {
    id: "rabbit",
    name: "专注兔",
    emoji: "🐰",
    trait: "专注稳定，适合习惯养成和长期复习",
    accent: "#ec4899",
  },
  {
    id: "fox",
    name: "探索狐",
    emoji: "🦊",
    trait: "好奇心强，适合项目制和职业技能课程",
    accent: "#ef4444",
  },
  {
    id: "bear",
    name: "合作熊",
    emoji: "🐻",
    trait: "团队属性突出，适合小组项目和企业内训",
    accent: "#10b981",
  },
];

const TASKS: Task[] = [
  {
    id: "daily-checkin",
    title: "完成今日签到",
    type: "每日",
    description: "到课日完成签到，帮助学伴积累基础成长值。",
    growth: 2,
    stars: 1,
    attribute: "focus",
    limit: "每日 1 次",
  },
  {
    id: "on-time-class",
    title: "准时到课",
    type: "每日",
    description: "按时进入课堂，建立稳定学习节奏。",
    growth: 5,
    stars: 2,
    attribute: "focus",
    limit: "每节课 1 次",
  },
  {
    id: "homework-submit",
    title: "按时提交作业",
    type: "每周",
    description: "按截止时间提交作业，可额外触发教师优秀奖励。",
    growth: 10,
    stars: 5,
    attribute: "action",
    limit: "按作业任务发放",
  },
  {
    id: "class-practice",
    title: "完成课堂练习",
    type: "每日",
    description: "完成老师布置的课堂小练习。",
    growth: 5,
    stars: 2,
    attribute: "knowledge",
    limit: "每节课 1 次",
  },
  {
    id: "active-answer",
    title: "主动回答问题",
    type: "每日",
    description: "主动参与课堂互动，每节课设置奖励上限。",
    growth: 3,
    stars: 2,
    attribute: "cooperation",
    limit: "每节课最多 3 次",
  },
  {
    id: "review-task",
    title: "完成 10 分钟复习",
    type: "每日",
    description: "复习旧知识、查看错题或完成知识卡片。",
    growth: 6,
    stars: 3,
    attribute: "knowledge",
    limit: "每日最多 20 成长值",
  },
  {
    id: "three-day-streak",
    title: "连续学习 3 天",
    type: "挑战",
    description: "连续三天完成任意学习任务。",
    growth: 10,
    stars: 5,
    attribute: "focus",
    limit: "每周期 1 次",
  },
  {
    id: "team-project",
    title: "完成小组任务",
    type: "阶段",
    description: "与同组伙伴完成作品、展示或讨论任务。",
    growth: 15,
    stars: 8,
    attribute: "cooperation",
    limit: "阶段任务发放",
  },
  {
    id: "unit-test",
    title: "完成阶段测验",
    type: "阶段",
    description: "完成单元测验，不只奖励高分，也奖励进步。",
    growth: 8,
    stars: 4,
    attribute: "knowledge",
    limit: "每次测验 1 次",
  },
  {
    id: "remedy-corrections",
    title: "完成错题订正",
    type: "补救",
    description: "针对近期薄弱点完成订正，帮助重新进入成长循环。",
    growth: 8,
    stars: 3,
    attribute: "action",
    limit: "教师发布后完成",
  },
];

const REWARDS: Reward[] = [
  {
    id: "blue-scarf",
    title: "可爱围巾",
    type: "虚拟装扮",
    price: 80,
    stock: 99,
    description: "给宠物换上清爽围巾，展示稳定学习状态。",
  },
  {
    id: "star-hat",
    title: "星星帽子",
    type: "虚拟装扮",
    price: 120,
    stock: 80,
    description: "完成阶段任务后最适合搭配的荣誉装扮。",
  },
  {
    id: "green-cap",
    title: "棒球帽",
    type: "虚拟装扮",
    price: 100,
    stock: 80,
    description: "绿色学习帽，适合连续学习后给宠物换装。",
  },
  {
    id: "knowledge-bag",
    title: "知识小书包",
    type: "虚拟装扮",
    price: 120,
    stock: 60,
    description: "装满学习资料的小书包，展示认真准备状态。",
  },
  {
    id: "hint-card",
    title: "作业提示卡",
    type: "学习权益",
    price: 150,
    stock: 30,
    description: "兑换一次老师的思路提示，不直接免除任务。",
  },
  {
    id: "priority-seat",
    title: "优先座位卡",
    type: "学习权益",
    price: 120,
    stock: 20,
    description: "下次课堂可优先选择座位或展示顺序。",
  },
  {
    id: "forest-room",
    title: "彩虹房子",
    type: "虚拟装扮",
    price: 200,
    stock: 50,
    description: "把宠物房间布置成彩虹主题学习小屋。",
  },
  {
    id: "starry-room",
    title: "星空背景",
    type: "虚拟装扮",
    price: 150,
    stock: 45,
    description: "夜空主题背景，适合复习季和挑战任务。",
  },
  {
    id: "wrong-question",
    title: "错题讲解券",
    type: "学习权益",
    price: 200,
    stock: 25,
    description: "获得一次错题讲解和学习建议。",
  },
  {
    id: "art-pens",
    title: "实体彩绘笔套装",
    type: "实体奖励",
    price: 300,
    stock: 12,
    description: "适合作品展示和学习笔记装饰。",
  },
  {
    id: "limited-frame",
    title: "限定头像框",
    type: "公益奖励",
    price: 180,
    stock: 100,
    description: "主题活动限定头像框，赛季结束后保留纪念。",
  },
  {
    id: "teacher-feedback",
    title: "教师语音点评",
    type: "学习权益",
    price: 240,
    stock: 20,
    description: "获得一次个性化学习点评和下一步建议。",
  },
  {
    id: "notebook",
    title: "成长笔记本",
    type: "实体奖励",
    price: 260,
    stock: 12,
    description: "适合记录错题、灵感和阶段学习总结。",
  },
  {
    id: "donate-book",
    title: "公益图书积分",
    type: "公益奖励",
    price: 220,
    stock: 100,
    description: "班级累计兑换后由机构统一捐赠图书。",
  },
];


const SEASON_ACTIVITIES: SeasonActivity[] = [
  {
    id: "forest-season",
    title: "探索森林学习季",
    theme: "习惯建立",
    period: "4 周",
    description: "围绕签到、作业、复习和课堂互动，帮助新学员完成宠物第一次进化。",
    reward: "限定森林房间背景 + 阶段成长证书",
    goals: [
      { id: "attendance", title: "班级出勤率", current: 92, target: 95, metric: "%" },
      { id: "homework", title: "作业完成率", current: 89, target: 92, metric: "%" },
      { id: "review", title: "复习任务完成", current: 64, target: 80, metric: "次" },
    ],
  },
  {
    id: "speak-month",
    title: "勇气表达月",
    theme: "课堂互动",
    period: "30 天",
    description: "重点鼓励首次发言、作品展示和同伴互助，用进步型奖励替代单纯排名。",
    reward: "勇敢发言徽章 + 星星帽子兑换券",
    goals: [
      { id: "answer", title: "主动回答次数", current: 38, target: 60, metric: "次" },
      { id: "showcase", title: "作品展示人数", current: 12, target: 20, metric: "人" },
      { id: "help", title: "互助记录", current: 18, target: 30, metric: "次" },
    ],
  },
  {
    id: "graduation",
    title: "毕业成长礼",
    theme: "阶段总结",
    period: "课程结束前 1 周",
    description: "自动整理宠物最终形态、任务数量、徽章、连续学习纪录和教师寄语。",
    reward: "电子毕业证书 + 成长时间线分享图",
    goals: [
      { id: "test", title: "阶段测验完成", current: 21, target: 30, metric: "人" },
      { id: "summary", title: "学习总结提交", current: 16, target: 30, metric: "份" },
      { id: "report", title: "家长报告查看", current: 10, target: 24, metric: "次" },
    ],
  },
];

const MESSAGE_TEMPLATES = [
  {
    title: "连续学习鼓励",
    content: "今天完成一个复习任务，就能帮助你的学伴积累新的成长值。保持自己的节奏就很好。",
  },
  {
    title: "作业截止提醒",
    content: "本周作业即将截止，完成后可获得成长值和星币。需要帮助时可以先兑换作业提示卡。",
  },
  {
    title: "宠物进化提醒",
    content: "你的学伴已经接近下一阶段，完成阶段测验和一次课堂互动就能继续进化。",
  },
  {
    title: "家长周报提示",
    content: "本周孩子在出勤、作业和互动方面都有新的记录，建议一起查看成长报告。",
  },
];

const AUDIT_RULES = [
  { title: "同一任务去重", description: "同一学员同一任务在一个周期内只允许计分一次。" },
  { title: "教师奖励上限", description: "手动奖励建议每名学员每周不超过 30 成长值。" },
  { title: "异常增长预警", description: "单名学员累计成长值显著高于班级均值时进入复核。" },
  { title: "补救优先", description: "普通学习中断不扣历史积分，优先发布补救任务。" },
];

const SECTION_META: Record<SectionId, { label: string; hint: string }> = {
  roleHome: { label: "入口首页", hint: "核心数据与快捷操作" },
  overview: { label: "成长概览", hint: "当前学习状态" },
  learners: { label: "学员管理", hint: "新增、搜索、编辑学员" },
  tasks: { label: "今日任务", hint: "签到、作业、复习" },
  pet: { label: "我的宠物", hint: "等级、属性、互动" },
  shop: { label: "奖励兑换", hint: "装扮、权益、实体奖励" },
  activities: { label: "班级活动", hint: "赛季、共同目标、通知" },
  reports: { label: "成长报告", hint: "周报、证书、教师寄语" },
  insights: { label: "智能建议", hint: "任务推荐、干预策略" },
  audit: { label: "风控审计", hint: "异常检测、规则模拟" },
  ledger: { label: "积分明细", hint: "成长值与星币记录" },
  teacher: { label: "课堂计分", hint: "批量发放与预警" },
  admin: { label: "数据看板", hint: "规则、成本、运营指标" },
};

const ROLE_PORTALS: {
  id: PortalRole;
  label: string;
  badge: string;
  title: string;
  description: string;
  entrySection: SectionId;
  sections: SectionId[];
  actions: string[];
}[] = [
  {
    id: "teacher",
    label: "教师端",
    badge: "上课管理",
    title: "教师只处理学员、计分、建议和班级运营。",
    description: "适合课前查看预警，课中快速发放积分，课后跟进补救任务和成长建议。",
    entrySection: "roleHome",
    sections: ["roleHome", "teacher", "learners", "insights", "activities", "audit", "admin"],
    actions: ["发放积分", "管理学员", "查看建议"],
  },
  {
    id: "student",
    label: "学生端",
    badge: "学习养成",
    title: "学生只看任务、宠物、奖励和自己的积分。",
    description: "减少后台感，学员进入后可以直接完成今日任务、培养宠物、兑换奖励。",
    entrySection: "roleHome",
    sections: ["roleHome", "overview", "tasks", "pet", "shop", "ledger"],
    actions: ["完成任务", "培养宠物", "兑换奖励"],
  },
  {
    id: "parent",
    label: "家长端",
    badge: "成长查看",
    title: "家长只看过程报告、成长变化和老师反馈。",
    description: "隐藏复杂运营操作，重点呈现出勤、作业、进步、宠物成长和阶段报告。",
    entrySection: "roleHome",
    sections: ["roleHome", "reports", "overview", "ledger"],
    actions: ["看周报", "看成长", "看明细"],
  },
];

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  knowledge: "知识值",
  focus: "专注值",
  action: "行动力",
  cooperation: "合作值",
};

const BADGES = [
  {
    id: "first-checkin",
    icon: "🌱",
    title: "初次见面",
    description: "完成第一次签到",
  },
  {
    id: "homework-pro",
    icon: "📘",
    title: "作业能手",
    description: "完成按时提交作业任务",
  },
  {
    id: "brave-answer",
    icon: "🎤",
    title: "勇敢发言",
    description: "主动回答一次问题",
  },
  {
    id: "three-day",
    icon: "🔥",
    title: "三日坚持",
    description: "连续学习至少 3 天",
  },
  {
    id: "team-star",
    icon: "🤝",
    title: "合作之星",
    description: "完成一次小组任务",
  },
  {
    id: "first-evolution",
    icon: "✨",
    title: "第一次进化",
    description: "宠物达到成长期",
  },
];

const TEACHER_PRESETS = [
  { label: "完成一节课程", growth: 10, stars: 5, attr: "knowledge" as AttributeKey },
  { label: "作业优秀", growth: 5, stars: 3, attr: "action" as AttributeKey },
  { label: "测验进步", growth: 10, stars: 5, attr: "knowledge" as AttributeKey },
  { label: "帮助同学", growth: 5, stars: 3, attr: "cooperation" as AttributeKey },
  { label: "教师表扬", growth: 5, stars: 3, attr: "focus" as AttributeKey },
];

function stageFromLevel(level: number) {
  if (level <= 1) return "宠物蛋";
  if (level <= 5) return "幼年期";
  if (level <= 10) return "成长期";
  if (level <= 20) return "进阶期";
  if (level <= 30) return "成熟期";
  return "荣誉期";
}

function levelFromGrowth(totalGrowth: number) {
  return Math.min(31, Math.floor(totalGrowth / LEVEL_STEP) + 1);
}

function formatNow() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function getPet(typeId: string) {
  return PETS.find((pet) => pet.id === typeId) ?? PETS[0];
}

function createLearner(params: {
  id: string;
  name: string;
  nickname: string;
  className: string;
  course: string;
  petType: string;
  petName: string;
  growth: number;
  stars: number;
  streak: number;
  attendanceRate: number;
  homeworkRate: number;
  quizTrend: number;
  completedTasks: string[];
  attributes: Record<AttributeKey, number>;
}): Learner {
  const level = levelFromGrowth(params.growth);
  return {
    id: params.id,
    name: params.name,
    nickname: params.nickname,
    className: params.className,
    course: params.course,
    pet: {
      typeId: params.petType,
      name: params.petName,
      level,
      stage: stageFromLevel(level),
      mood: "精神饱满",
      knowledge: params.attributes.knowledge,
      focus: params.attributes.focus,
      action: params.attributes.action,
      cooperation: params.attributes.cooperation,
      outfit: [],
      room: [],
    },
    account: {
      totalGrowth: params.growth,
      totalStars: params.stars,
      stars: params.stars,
    },
    streak: params.streak,
    attendanceRate: params.attendanceRate,
    homeworkRate: params.homeworkRate,
    quizTrend: params.quizTrend,
    completedTasks: params.completedTasks,
    ownedRewards: [],
    ledger: [
      {
        id: `${params.id}-seed-1`,
        date: "07/16 09:00",
        source: "系统初始化",
        note: "导入试点班级初始学习数据",
        growthDelta: params.growth,
        starsDelta: params.stars,
      },
    ],
  };
}

function createInitialLearners(): Learner[] {
  return [
    createLearner({
      id: "stu-001",
      name: "李小明",
      nickname: "小明",
      className: "三年级2班",
      course: "学伴成长计划",
      petType: "dog",
      petName: "勇气犬",
      growth: 2860,
      stars: 568,
      streak: 7,
      attendanceRate: 100,
      homeworkRate: 96,
      quizTrend: 10,
      completedTasks: ["daily-checkin", "homework-submit", "review-task", "active-answer"],
      attributes: { knowledge: 85, focus: 72, action: 68, cooperation: 55 },
    }),
    createLearner({
      id: "stu-002",
      name: "周航",
      nickname: "阿航",
      className: "英语 A 班",
      course: "青少年英语提升",
      petType: "dog",
      petName: "闪电",
      growth: 198,
      stars: 64,
      streak: 4,
      attendanceRate: 92,
      homeworkRate: 88,
      quizTrend: 6,
      completedTasks: ["daily-checkin", "class-practice", "review-task"],
      attributes: { knowledge: 62, focus: 70, action: 79, cooperation: 52 },
    }),
    createLearner({
      id: "stu-003",
      name: "陈一诺",
      nickname: "一诺",
      className: "英语 A 班",
      course: "青少年英语提升",
      petType: "rabbit",
      petName: "团团",
      growth: 334,
      stars: 110,
      streak: 12,
      attendanceRate: 100,
      homeworkRate: 100,
      quizTrend: 8,
      completedTasks: [
        "daily-checkin",
        "on-time-class",
        "homework-submit",
        "review-task",
        "three-day-streak",
        "unit-test",
      ],
      attributes: { knowledge: 81, focus: 88, action: 80, cooperation: 63 },
    }),
    createLearner({
      id: "stu-004",
      name: "许然",
      nickname: "小然",
      className: "英语 A 班",
      course: "青少年英语提升",
      petType: "fox",
      petName: "橘子",
      growth: 142,
      stars: 48,
      streak: 2,
      attendanceRate: 84,
      homeworkRate: 72,
      quizTrend: -3,
      completedTasks: ["daily-checkin"],
      attributes: { knowledge: 48, focus: 55, action: 50, cooperation: 46 },
    }),
    createLearner({
      id: "stu-005",
      name: "王可乐",
      nickname: "可乐",
      className: "英语 A 班",
      course: "青少年英语提升",
      petType: "bear",
      petName: "抱抱",
      growth: 220,
      stars: 73,
      streak: 5,
      attendanceRate: 96,
      homeworkRate: 91,
      quizTrend: 7,
      completedTasks: ["daily-checkin", "team-project", "active-answer"],
      attributes: { knowledge: 60, focus: 68, action: 64, cooperation: 85 },
    }),
  ];
}

function clampAttribute(value: number) {
  return Math.max(0, Math.min(100, value));
}

function addLedger(
  learner: Learner,
  source: string,
  note: string,
  growthDelta: number,
  starsDelta: number,
) {
  return {
    ...learner,
    ledger: [
      {
        id: `${learner.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: formatNow(),
        source,
        note,
        growthDelta,
        starsDelta,
      },
      ...learner.ledger,
    ].slice(0, 30),
  };
}

function applyPoints(
  learner: Learner,
  source: string,
  note: string,
  growthDelta: number,
  starsDelta: number,
  attribute: AttributeKey,
) {
  const totalGrowth = Math.max(0, learner.account.totalGrowth + growthDelta);
  const level = levelFromGrowth(totalGrowth);
  const nextLearner: Learner = {
    ...learner,
    pet: {
      ...learner.pet,
      level,
      stage: stageFromLevel(level),
      mood: growthDelta > 0 ? "正在学习" : learner.pet.mood,
      [attribute]: clampAttribute(learner.pet[attribute] + Math.ceil(Math.max(growthDelta, 0) / 3)),
    },
    account: {
      totalGrowth,
      totalStars: Math.max(0, learner.account.totalStars + Math.max(starsDelta, 0)),
      stars: Math.max(0, learner.account.stars + starsDelta),
    },
  };
  return addLedger(nextLearner, source, note, growthDelta, starsDelta);
}

function earnedBadgeIds(learner: Learner) {
  const ids = new Set<string>();
  if (learner.completedTasks.includes("daily-checkin")) ids.add("first-checkin");
  if (learner.completedTasks.includes("homework-submit")) ids.add("homework-pro");
  if (learner.completedTasks.includes("active-answer")) ids.add("brave-answer");
  if (learner.streak >= 3 || learner.completedTasks.includes("three-day-streak")) ids.add("three-day");
  if (learner.completedTasks.includes("team-project")) ids.add("team-star");
  if (learner.pet.level >= 6) ids.add("first-evolution");
  return ids;
}

function riskLabels(learner: Learner) {
  const risks: string[] = [];
  if (learner.attendanceRate < 88) risks.push("出勤预警");
  if (learner.homeworkRate < 80) risks.push("作业预警");
  if (learner.quizTrend < 0) risks.push("学习下降");
  if (learner.streak <= 2) risks.push("连续学习待恢复");
  return risks;
}

function progressToNextLevel(totalGrowth: number, level: number) {
  if (level >= 31) return 100;
  return Math.round(((totalGrowth % LEVEL_STEP) / LEVEL_STEP) * 100);
}

function classAverage(learners: Learner[], key: "attendanceRate" | "homeworkRate") {
  return Math.round(learners.reduce((sum, learner) => sum + learner[key], 0) / learners.length);
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function taskById(taskId: string) {
  return TASKS.find((task) => task.id === taskId);
}

function recommendationsForLearner(learner: Learner): Recommendation[] {
  const recommendations: Recommendation[] = [];
  if (learner.attendanceRate < 88) {
    recommendations.push({
      title: "恢复到课节奏",
      reason: "最近出勤率低于 88%，建议先恢复稳定参与。",
      action: "发布一次准时到课目标，并配合鼓励提醒。",
      priority: "高",
      taskId: "on-time-class",
    });
  }
  if (learner.homeworkRate < 80) {
    recommendations.push({
      title: "作业补救闭环",
      reason: "作业完成率偏低，直接追加新任务容易造成压力。",
      action: "优先完成错题订正或补交任务，再恢复正常作业节奏。",
      priority: "高",
      taskId: "remedy-corrections",
    });
  }
  if (learner.quizTrend < 0) {
    recommendations.push({
      title: "阶段测验复盘",
      reason: "测验表现下降，适合用复盘任务替代扣分。",
      action: "安排 10 分钟复习和一次教师点评，观察下一次趋势。",
      priority: "中",
      taskId: "review-task",
    });
  }
  if (!learner.completedTasks.includes("active-answer")) {
    recommendations.push({
      title: "首次课堂表达",
      reason: "尚未解锁勇敢发言徽章，可用低门槛互动建立信心。",
      action: "设置一次可提前准备的问题，让学员完成首次回答。",
      priority: "中",
      taskId: "active-answer",
    });
  }
  if (!learner.completedTasks.includes("team-project")) {
    recommendations.push({
      title: "加入小组协作",
      reason: "合作值还有提升空间，团队任务可降低单人竞争压力。",
      action: "分配一个小组展示或同伴互助任务。",
      priority: "低",
      taskId: "team-project",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: "保持进阶挑战",
      reason: "当前学习状态稳定，可以安排更有成就感的阶段挑战。",
      action: "推进阶段测验或作品展示，帮助宠物进入下一阶段。",
      priority: "低",
      taskId: "unit-test",
    });
  }
  return recommendations.slice(0, 4);
}

function auditLearners(learners: Learner[]): AuditItem[] {
  const averageGrowth = learners.reduce((sum, learner) => sum + learner.account.totalGrowth, 0) / learners.length;
  return learners.map((learner) => {
    const reasons: string[] = [];
    if (learner.account.totalGrowth > averageGrowth * 1.45) reasons.push("成长值显著高于班级均值");
    if (learner.account.stars > learner.account.totalStars) reasons.push("星币余额大于累计获得");
    if (learner.ledger.some((item) => item.growthDelta >= 30 || item.starsDelta >= 15)) reasons.push("存在高额单次积分流水");
    if (riskLabels(learner).length >= 2) reasons.push("学习预警项目较多，需要教师跟进");
    const level = reasons.length >= 2 ? "高" : reasons.length === 1 ? "中" : "低";
    return { learner, level, reasons: reasons.length ? reasons : ["暂无明显异常"] };
  });
}

export default function Home() {
  const [learners, setLearners] = useState<Learner[]>(createInitialLearners);
  const [selectedLearnerId, setSelectedLearnerId] = useState("stu-001");
  const [activePortal, setActivePortal] = useState<PortalRole | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("roleHome");
  const [studentTab, setStudentTab] = useState<StudentTab>("home");
  const [message, setMessage] = useState("已载入试点班级数据，可直接体验任务、积分和宠物成长。");
  const [teacherTargetId, setTeacherTargetId] = useState("stu-001");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Learner[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLearners(parsed);
        setSelectedLearnerId(parsed[0].id);
        setTeacherTargetId(parsed[0].id);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(learners));
  }, [learners]);

  const selectedLearner = useMemo(
    () => learners.find((learner) => learner.id === selectedLearnerId) ?? learners[0],
    [learners, selectedLearnerId],
  );

  const selectedPet = getPet(selectedLearner.pet.typeId);
  const selectedBadges = BADGES.filter((badge) => earnedBadgeIds(selectedLearner).has(badge.id));
  const selectedRisks = riskLabels(selectedLearner);
  const activePortalConfig = ROLE_PORTALS.find((portal) => portal.id === activePortal) ?? ROLE_PORTALS[1];
  const visibleNavItems = activePortalConfig.sections.map((id) => ({ id, ...SECTION_META[id] }));
  const nextProgress = progressToNextLevel(
    selectedLearner.account.totalGrowth,
    selectedLearner.pet.level,
  );
  const growthRemainder = selectedLearner.account.totalGrowth % LEVEL_STEP;
  const nextNeed = selectedLearner.pet.level >= 31 ? 0 : LEVEL_STEP - growthRemainder;

  const leaderboard = useMemo(
    () => [...learners].sort((a, b) => b.account.totalGrowth - a.account.totalGrowth),
    [learners],
  );

  const completedCount = selectedLearner.completedTasks.length;
  const classTaskRate = Math.round(
    (learners.reduce((sum, learner) => sum + learner.completedTasks.length, 0) /
      (learners.length * TASKS.length)) *
      100,
  );
  const totalStarsIssued = learners.reduce((sum, learner) => sum + learner.account.totalStars, 0);
  const totalStarsBalance = learners.reduce((sum, learner) => sum + learner.account.stars, 0);
  const redemptionRate = Math.round(((totalStarsIssued - totalStarsBalance) / Math.max(totalStarsIssued, 1)) * 100);

  function updateLearner(learnerId: string, updater: (learner: Learner) => Learner) {
    setLearners((current) =>
      current.map((learner) => (learner.id === learnerId ? updater(learner) : learner)),
    );
  }

  function enterPortal(portalId: PortalRole) {
    const portal = ROLE_PORTALS.find((item) => item.id === portalId) ?? ROLE_PORTALS[1];
    setActivePortal(portal.id);
    setActiveSection(portal.entrySection);
    if (portal.id === "student") setStudentTab("home");
    setMessage(`已进入${portal.label}：${portal.description}`);
  }

  function completeTask(task: Task) {
    if (selectedLearner.completedTasks.includes(task.id)) {
      setMessage(`${task.title} 已完成，防刷规则阻止重复发放积分。`);
      return;
    }
    updateLearner(selectedLearner.id, (learner) => {
      const withTask = {
        ...learner,
        streak: task.type === "每日" ? Math.max(learner.streak, learner.streak + 1) : learner.streak,
        completedTasks: [...learner.completedTasks, task.id],
      };
      return applyPoints(
        withTask,
        task.title,
        `${task.type}任务完成：${task.description}`,
        task.growth,
        task.stars,
        task.attribute,
      );
    });
    setMessage(`已为 ${selectedLearner.nickname} 发放 ${task.growth} 成长值和 ${task.stars} 星币。`);
  }

  function interactPet(action: string, cost: number, mood: string) {
    if (selectedLearner.account.stars < cost) {
      setMessage(`星币不足，${action} 需要 ${cost} 星币。`);
      return;
    }
    updateLearner(selectedLearner.id, (learner) =>
      addLedger(
        {
          ...learner,
          pet: { ...learner.pet, mood },
          account: { ...learner.account, stars: learner.account.stars - cost },
        },
        action,
        `宠物互动：${learner.pet.name} 当前状态变为「${mood}」`,
        0,
        -cost,
      ),
    );
    setMessage(`${selectedLearner.pet.name} 已完成「${action}」，状态更新为 ${mood}。`);
  }

  function redeemReward(reward: Reward) {
    if (selectedLearner.ownedRewards.includes(reward.id)) {
      setMessage(`${selectedLearner.nickname} 已拥有「${reward.title}」。`);
      return;
    }
    if (selectedLearner.account.stars < reward.price) {
      setMessage(`星币不足，兑换「${reward.title}」需要 ${reward.price} 星币。`);
      return;
    }
    updateLearner(selectedLearner.id, (learner) => {
      const outfit = reward.type === "虚拟装扮" ? [...learner.pet.outfit, reward.title] : learner.pet.outfit;
      const room = reward.id.includes("room") ? [...learner.pet.room, reward.title] : learner.pet.room;
      return addLedger(
        {
          ...learner,
          ownedRewards: [...learner.ownedRewards, reward.id],
          pet: { ...learner.pet, outfit, room, mood: "期待互动" },
          account: { ...learner.account, stars: learner.account.stars - reward.price },
        },
        "奖励商城兑换",
        `兑换 ${reward.type}：${reward.title}`,
        0,
        -reward.price,
      );
    });
    setMessage(`兑换成功：${reward.title} 已加入 ${selectedLearner.nickname} 的奖励记录。`);
  }

  function applyTeacherPreset(targetId: string, preset: (typeof TEACHER_PRESETS)[number]) {
    updateLearner(targetId, (learner) =>
      applyPoints(learner, "教师手动奖励", preset.label, preset.growth, preset.stars, preset.attr),
    );
    const target = learners.find((learner) => learner.id === targetId);
    setMessage(`教师已为 ${target?.nickname ?? "学员"} 发放「${preset.label}」奖励。`);
  }

  function batchClassReward() {
    setLearners((current) =>
      current.map((learner) =>
        applyPoints(learner, "班级共同目标", "全班出勤率与作业完成率达标", 10, 5, "cooperation"),
      ),
    );
    setMessage("已为全班发放班级共同养成奖励：每人 10 成长值、5 星币。");
  }

  function addLearner(draft: LearnerDraft) {
    const newLearner = createLearner({
      id: `stu-${Date.now()}`,
      name: draft.name.trim(),
      nickname: draft.nickname.trim() || draft.name.trim(),
      className: draft.className.trim() || "新学员班级",
      course: draft.course.trim() || "未设置课程",
      petType: draft.petType,
      petName: draft.petName.trim() || "新学伴",
      growth: 0,
      stars: 0,
      streak: 0,
      attendanceRate: 100,
      homeworkRate: 100,
      quizTrend: 0,
      completedTasks: [],
      attributes: { knowledge: 10, focus: 10, action: 10, cooperation: 10 },
    });
    setLearners((current) => [...current, newLearner]);
    setSelectedLearnerId(newLearner.id);
    setTeacherTargetId(newLearner.id);
    setActivePortal("teacher");
    setActiveSection("learners");
    setMessage(`已新增学员 ${newLearner.nickname}，并创建宠物 ${newLearner.pet.name}。`);
  }

  function updateLearnerProfile(learnerId: string, draft: LearnerDraft) {
    updateLearner(learnerId, (learner) => ({
      ...learner,
      name: draft.name.trim() || learner.name,
      nickname: draft.nickname.trim() || learner.nickname,
      className: draft.className.trim() || learner.className,
      course: draft.course.trim() || learner.course,
      pet: {
        ...learner.pet,
        typeId: draft.petType,
        name: draft.petName.trim() || learner.pet.name,
      },
    }));
    setMessage("学员资料已更新，当前演示数据已保存到本机浏览器。");
  }

  function exportClassData() {
    const rows = [
      ["学员", "昵称", "班级", "课程", "宠物", "阶段", "等级", "成长值", "可用星币", "连续学习", "出勤率", "作业率", "预警"],
      ...learners.map((learner) => [
        learner.name,
        learner.nickname,
        learner.className,
        learner.course,
        learner.pet.name,
        learner.pet.stage,
        learner.pet.level,
        learner.account.totalGrowth,
        learner.account.stars,
        `${learner.streak}天`,
        `${learner.attendanceRate}%`,
        `${learner.homeworkRate}%`,
        riskLabels(learner).join(" / ") || "稳定",
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `学伴成长数据-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("已导出班级数据 CSV，可用于运营复盘或导入表格。");
  }

  function resetDemo() {
    const initial = createInitialLearners();
    setLearners(initial);
    setSelectedLearnerId(initial[0].id);
    setTeacherTargetId(initial[0].id);
    setMessage("演示数据已恢复为试点班级初始状态。");
  }

  if (!activePortal) {
    return (
      <main className="entry-landing">
        <header className="entry-header">
          <div className="brand entry-logo">
            <span className="entry-paw" aria-hidden="true">🐾</span>
            <div>
              <strong>学伴成长计划</strong>
              <small>学员积分宠物培养系统</small>
            </div>
          </div>
          <div className="entry-header-actions">
            <button type="button">▣ 系统公告</button>
            <button type="button" className="help-pill">? 帮助中心</button>
          </div>
        </header>

        <section className="entry-scene" aria-label="选择系统入口">
          <div className="entry-sky" aria-hidden="true">
            <span className="entry-cloud cloud-one" />
            <span className="entry-cloud cloud-two" />
            <span className="entry-tree tree-left" />
            <span className="entry-tree tree-right" />
            <span className="entry-school">🏫</span>
          </div>

          <div className="entry-title-block">
            <h1><span>学习成长</span><i>·</i><em>宠爱相伴</em></h1>
            <p>通过学习获得积分，培养你的专属宠物，见证每一步成长！</p>
          </div>

          <div className="role-card-grid">
            <button className="role-card student-role-card" onClick={() => enterPortal("student")}>
              <span className="role-icon">👤</span>
              <strong>学员入口</strong>
              <p>登录后开始你的学习之旅<br />积累积分，培养专属宠物</p>
              <b>进入学员端 →</b>
              <i className="role-pet">🐶</i>
              <div className="role-features">
                <span>☑ 完成任务</span>
                <span>✪ 获得积分</span>
                <span>🐾 培养宠物</span>
                <span>🎁 兑换奖励</span>
              </div>
            </button>

            <button className="role-card teacher-role-card" onClick={() => enterPortal("teacher")}>
              <span className="role-icon">🎓</span>
              <strong>教师入口</strong>
              <p>登录后管理班级与学员<br />布置任务，查看成长数据</p>
              <b>进入教师端 →</b>
              <i className="role-pet">🐱</i>
              <div className="role-features">
                <span>👥 班级管理</span>
                <span>📋 任务发布</span>
                <span>📈 学员成长</span>
                <span>◔ 数据分析</span>
              </div>
            </button>
          </div>

          <button className="parent-entry-strip" onClick={() => enterPortal("parent")}>
            <span>💚 家长入口</span>
            <small>查看成长报告、积分明细和教师反馈</small>
            <b>进入家长端 →</b>
          </button>

          <div className="entry-values">
            <div><span>🛡️</span><strong>安全可靠</strong><small>数据加密存储<br />保障信息安全</small></div>
            <div><span>🏅</span><strong>公平激励</strong><small>科学积分体系<br />鼓励持续成长</small></div>
            <div><span>📊</span><strong>成长可视</strong><small>多维成长记录<br />见证点滴进步</small></div>
            <div><span>🧡</span><strong>寓教于乐</strong><small>游戏化学习体验<br />激发学习兴趣</small></div>
          </div>
        </section>

        <footer className="entry-footer">
          <span>关于我们</span><i>|</i><span>使用条款</span><i>|</i><span>隐私政策</span><i>|</i><span>联系我们</span>
          <small>© 2026 学伴成长计划 - 学员积分宠物培养系统</small>
        </footer>
      </main>
    );
  }

  if (activePortal === "student") {
    return (
      <StudentPortal
        learner={selectedLearner}
        petType={selectedPet}
        tasks={TASKS}
        rewards={REWARDS}
        badges={BADGES}
        leaderboard={leaderboard}
        activeTab={studentTab}
        onTabChange={setStudentTab}
        onCompleteTask={completeTask}
        onInteract={interactPet}
        onRedeem={redeemReward}
        onBack={() => setActivePortal(null)}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="topbar" aria-label="主导航">
          <div className="brand">
            <span className="brand-mark">学</span>
            <div>
              <strong>学伴成长计划</strong>
              <small>培训班学员积分宠物培养系统</small>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="active-portal-pill" onClick={() => setActivePortal(null)}>
              切换入口
            </button>
            <div className="learner-picker">
              <label htmlFor="learner-select">当前学员</label>
              <select
                id="learner-select"
                value={selectedLearnerId}
                onChange={(event) => setSelectedLearnerId(event.target.value)}
              >
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.nickname} · {learner.className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{activePortalConfig.badge}</span>
            <h1>{activePortalConfig.title}</h1>
            <p>
              {activePortalConfig.description}
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setActiveSection(activePortalConfig.entrySection)}>
                进入{activePortalConfig.label}
              </button>
              <button className="secondary-button" onClick={resetDemo}>
                重置演示数据
              </button>
            </div>

            <div className="portal-entry-grid" aria-label="选择使用入口">
              {ROLE_PORTALS.map((portal) => (
                <button
                  key={portal.id}
                  className={`portal-entry-card ${activePortal === portal.id ? "active" : ""}`}
                  onClick={() => enterPortal(portal.id)}
                >
                  <span>{portal.badge}</span>
                  <strong>{portal.label}</strong>
                  <small>{portal.actions.join(" · ")}</small>
                </button>
              ))}
            </div>
          </div>

          <PetCard learner={selectedLearner} petType={selectedPet} progress={nextProgress} nextNeed={nextNeed} />
        </section>
      </header>

      <section className="notice" role="status">
        <span>系统提示</span>
        <p>{message}</p>
      </section>

      <section className="summary-grid" aria-label="核心指标">
        <MetricCard label="宠物等级" value={`Lv.${selectedLearner.pet.level}`} detail={selectedLearner.pet.stage} tone="purple" />
        <MetricCard label="累计成长值" value={selectedLearner.account.totalGrowth} detail="不随兑换减少" tone="blue" />
        <MetricCard label="可用星币" value={selectedLearner.account.stars} detail={`累计获得 ${selectedLearner.account.totalStars}`} tone="amber" />
        <MetricCard label="连续学习" value={`${selectedLearner.streak} 天`} detail="中断后可做补救任务" tone="green" />
      </section>

      <div className="workspace">
        <aside className="side-nav" aria-label={`${activePortalConfig.label}操作菜单`}>
          <div className="side-nav-title">
            <span>{activePortalConfig.label}</span>
            <small>{activePortalConfig.badge}</small>
          </div>
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </aside>

        <section className="panel-area">
          {activeSection === "roleHome" && (
            <RoleHomePanel
              portal={activePortalConfig}
              learner={selectedLearner}
              petType={selectedPet}
              learners={learners}
              badges={selectedBadges}
              risks={selectedRisks}
              classTaskRate={classTaskRate}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === "overview" && (
            <OverviewPanel
              learner={selectedLearner}
              badges={selectedBadges}
              leaderboard={leaderboard}
              risks={selectedRisks}
              completedCount={completedCount}
            />
          )}

          {activeSection === "learners" && (
            <LearnersPanel
              learners={learners}
              selectedLearnerId={selectedLearnerId}
              onSelect={(learnerId) => {
                setSelectedLearnerId(learnerId);
                setTeacherTargetId(learnerId);
                setMessage("已切换当前学员，可继续查看任务、宠物和积分流水。");
              }}
              onAdd={addLearner}
              onUpdate={updateLearnerProfile}
              onExport={exportClassData}
            />
          )}

          {activeSection === "tasks" && (
            <TasksPanel learner={selectedLearner} tasks={TASKS} onComplete={completeTask} />
          )}

          {activeSection === "pet" && (
            <PetPanel learner={selectedLearner} petType={selectedPet} onInteract={interactPet} />
          )}

          {activeSection === "shop" && (
            <ShopPanel learner={selectedLearner} rewards={REWARDS} onRedeem={redeemReward} />
          )}

          {activeSection === "activities" && (
            <ActivitiesPanel
              learners={learners}
              activities={SEASON_ACTIVITIES}
              templates={MESSAGE_TEMPLATES}
              onBatch={batchClassReward}
            />
          )}

          {activeSection === "reports" && (
            <ReportsPanel learner={selectedLearner} petType={selectedPet} badges={selectedBadges} />
          )}

          {activeSection === "insights" && (
            <InsightsPanel learner={selectedLearner} onCompleteTask={completeTask} />
          )}

          {activeSection === "audit" && (
            <AuditPanel learners={learners} />
          )}

          {activeSection === "ledger" && <LedgerPanel learner={selectedLearner} />}

          {activeSection === "teacher" && (
            <TeacherPanel
              learners={learners}
              teacherTargetId={teacherTargetId}
              setTeacherTargetId={setTeacherTargetId}
              onPreset={applyTeacherPreset}
              onBatch={batchClassReward}
            />
          )}

          {activeSection === "admin" && (
            <AdminPanel
              learners={learners}
              classTaskRate={classTaskRate}
              attendanceAvg={classAverage(learners, "attendanceRate")}
              homeworkAvg={classAverage(learners, "homeworkRate")}
              redemptionRate={redemptionRate}
              onExport={exportClassData}
            />
          )}
        </section>
      </div>

      <nav className="bottom-role-nav" aria-label={`${activePortalConfig.label}底部导航`}>
        {visibleNavItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={activeSection === item.id ? "active" : ""}
            onClick={() => setActiveSection(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function StudentPortal({
  learner,
  petType,
  tasks,
  rewards,
  badges,
  leaderboard,
  activeTab,
  onTabChange,
  onCompleteTask,
  onInteract,
  onRedeem,
  onBack,
}: {
  learner: Learner;
  petType: PetType;
  tasks: Task[];
  rewards: Reward[];
  badges: typeof BADGES;
  leaderboard: Learner[];
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
  onCompleteTask: (task: Task) => void;
  onInteract: (action: string, cost: number, mood: string) => void;
  onRedeem: (reward: Reward) => void;
  onBack: () => void;
}) {
  const navItems: { id: StudentTab; label: string; icon: string }[] = [
    { id: "home", label: "首页", icon: "⌂" },
    { id: "tasks", label: "任务中心", icon: "▣" },
    { id: "pet", label: "宠物中心", icon: "♧" },
    { id: "badges", label: "成就徽章", icon: "◉" },
    { id: "points", label: "积分中心", icon: "◈" },
    { id: "shop", label: "奖励商城", icon: "□" },
    { id: "records", label: "学习记录", icon: "▤" },
    { id: "ranking", label: "排行榜", icon: "▥" },
  ];
  const earnedBadges = badges.filter((badge) => earnedBadgeIds(learner).has(badge.id));
  const rank = leaderboard.findIndex((item) => item.id === learner.id) + 1;

  return (
    <main className="student-shell">
      <aside className="student-sidebar">
        <div className="student-side-brand">
          <span>🐾</span>
          <strong>学伴成长计划</strong>
        </div>

        <nav className="student-nav" aria-label="学员端功能菜单">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => onTabChange(item.id)}
            >
              <i>{item.icon}</i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="student-user-card">
          <span>👦</span>
          <div>
            <strong>{learner.nickname}同学</strong>
            <small>{learner.className}</small>
          </div>
        </div>

        <button className="student-back-button" onClick={onBack}>切换入口</button>
      </aside>

      <section className="student-main">
        <div className="student-page-title">
          <h1>{activeTab === "home" ? "学生端 - 首页（学习仪表盘）" : navItems.find((item) => item.id === activeTab)?.label}</h1>
        </div>

        {activeTab === "home" && (
          <StudentDashboard
            learner={learner}
            petType={petType}
            tasks={tasks}
            rank={rank}
            earnedBadges={earnedBadges}
            onCompleteTask={onCompleteTask}
          />
        )}
        {activeTab === "tasks" && <StudentTasksPage learner={learner} tasks={tasks} onCompleteTask={onCompleteTask} />}
        {activeTab === "pet" && <StudentPetPage learner={learner} petType={petType} onInteract={onInteract} />}
        {activeTab === "badges" && <StudentBadgesPage learner={learner} badges={badges} />}
        {activeTab === "points" && <StudentPointsPage learner={learner} />}
        {activeTab === "shop" && <StudentShopPage learner={learner} rewards={rewards} onRedeem={onRedeem} />}
        {activeTab === "records" && <StudentRecordsPage learner={learner} />}
        {activeTab === "ranking" && <StudentRankingPage learner={learner} leaderboard={leaderboard} />}
      </section>
    </main>
  );
}

function StudentDashboard({
  learner,
  petType,
  tasks,
  rank,
  earnedBadges,
  onCompleteTask,
}: {
  learner: Learner;
  petType: PetType;
  tasks: Task[];
  rank: number;
  earnedBadges: typeof BADGES;
  onCompleteTask: (task: Task) => void;
}) {
  const todayTasks = ["daily-checkin", "class-practice", "review-task", "active-answer"]
    .map((id) => taskById(id))
    .filter(Boolean) as Task[];
  const progress = progressToNextLevel(learner.account.totalGrowth, learner.pet.level);

  return (
    <div className="student-dashboard">
      <section className="student-welcome-card">
        <span>🌞</span>
        <div>
          <h2>欢迎回来，小{learner.nickname}同学！</h2>
          <p>今天也是努力成长的一天！</p>
        </div>
      </section>

      <div className="student-dashboard-grid">
        <section className="student-pet-showcase">
          <div className="student-card-label">我的宠物</div>
          <h2>{petType.name}</h2>
          <div className="student-pet-scene">
            <span>{petType.emoji}</span>
          </div>
          <div className="student-level-row">
            <strong>Lv.{learner.pet.level}</strong>
            <div className="student-progress"><i style={{ width: `${progress}%` }} /></div>
            <small>{learner.account.totalGrowth} / {(learner.pet.level + 1) * LEVEL_STEP}</small>
          </div>
        </section>

        <section className="student-stats-and-tasks">
          <div className="student-stat-grid">
            <StudentStatCard icon="🏥" label="成长值" value={learner.account.totalGrowth.toLocaleString()} detail={`较昨日 +${Math.max(learner.completedTasks.length * 20, 80)}`} />
            <StudentStatCard icon="🪙" label="星币" value={learner.account.stars} detail="今日 +25" />
            <StudentStatCard icon="❤️" label="连续学习" value={`${learner.streak} 天`} detail="继续加油！" />
          </div>

          <article className="student-task-card">
            <h3>今日任务</h3>
            <div className="student-task-list">
              {todayTasks.map((task) => {
                const done = learner.completedTasks.includes(task.id);
                return (
                  <button key={task.id} disabled={done} onClick={() => onCompleteTask(task)}>
                    <span>{task.attribute === "knowledge" ? "📗" : task.attribute === "focus" ? "✅" : task.attribute === "cooperation" ? "🤝" : "🎯"}</span>
                    <strong>{task.title.replace("完成 ", "").replace("10 分钟", "10分钟")}</strong>
                    <small>+{task.growth}成长值　+{task.stars}星币</small>
                    <b>{done ? "已完成" : "去完成"}</b>
                  </button>
                );
              })}
            </div>
          </article>
        </section>
      </div>

      <div className="student-bottom-grid">
        <article>
          <strong>宠物状态</strong>
          <span>😊 开心</span>
          <small>状态良好，继续陪伴成长</small>
        </article>
        <article>
          <strong>今日小贴士</strong>
          <span>☀️ 坚持复习</span>
          <small>坚持复习可以帮助你的宠物获得更多经验值！</small>
        </article>
        <article>
          <strong>我的排名</strong>
          <span>🏆 第 {rank} 名</span>
          <small>已点亮 {earnedBadges.length} 枚徽章</small>
        </article>
      </div>
    </div>
  );
}

function StudentStatCard({ icon, label, value, detail }: { icon: string; label: string; value: string | number; detail: string }) {
  return (
    <article className="student-stat-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function StudentTasksPage({ learner, tasks, onCompleteTask }: { learner: Learner; tasks: Task[]; onCompleteTask: (task: Task) => void }) {
  const taskTabs: { label: string; type: Task["type"] }[] = [
    { label: "每日任务", type: "每日" },
    { label: "每周任务", type: "每周" },
    { label: "课程任务", type: "阶段" },
    { label: "挑战任务", type: "挑战" },
    { label: "补救任务", type: "补救" },
  ];
  const [activeType, setActiveType] = useState<Task["type"]>("每日");
  const visibleTasks = tasks.filter((task) => task.type === activeType);
  const dailyTasks = tasks.filter((task) => task.type === "每日");
  const dailyDone = dailyTasks.filter((task) => learner.completedTasks.includes(task.id)).length;
  const activityScore = Math.min(100, Math.max(80, Math.round((dailyDone / Math.max(dailyTasks.length, 1)) * 100)));
  const weeklyTotal = 6;
  const weeklyDone = Math.min(weeklyTotal, learner.completedTasks.length);
  const weeklyPercent = Math.round((weeklyDone / weeklyTotal) * 100);

  function taskProgress(task: Task, done: boolean) {
    if (task.id === "homework-submit") return { current: done ? 6 : 0, target: 8 };
    if (task.id === "three-day-streak") return { current: Math.min(learner.streak, 7), target: 7 };
    if (task.id === "team-project") return { current: done ? 1 : 0, target: 1 };
    if (task.id === "unit-test") return { current: done ? 1 : 0, target: 1 };
    return { current: done ? 1 : 0, target: 1 };
  }

  return (
    <div className="student-page-card student-task-center-card">
      <div className="student-tabs-row" role="tablist" aria-label="任务分类">
        {taskTabs.map((tab) => (
          <button
            key={tab.label}
            className={activeType === tab.type ? "active" : ""}
            onClick={() => setActiveType(tab.type)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="student-task-center-layout">
        <section className="student-task-board" aria-label="任务列表">
          {visibleTasks.map((task) => {
            const done = learner.completedTasks.includes(task.id);
            const progress = taskProgress(task, done);
            const percent = Math.min(100, Math.round((progress.current / progress.target) * 100));
            return (
              <article className={`student-task-row-card ${done ? "done" : ""}`} key={task.id}>
                <span className={`student-task-icon ${done ? "done" : ""}`}>
                  {task.attribute === "knowledge" ? "▣" : task.attribute === "focus" ? "✓" : task.attribute === "cooperation" ? "♡" : "◎"}
                </span>
                <div className="student-task-row-main">
                  <strong>{task.title.replace("完成 ", "")}</strong>
                  <div className="student-task-progress-line">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <small>{progress.current}/{progress.target}</small>
                <em>总任务</em>
                <b>+{task.growth}成长值　+{task.stars}星币</b>
                <button disabled={done} onClick={() => onCompleteTask(task)} type="button">
                  {done ? "已完成" : "去完成"}
                </button>
              </article>
            );
          })}
        </section>

        <aside className="student-task-insights" aria-label="任务进度">
          <article className="student-activity-card">
            <strong>今日活跃度</strong>
            <span>{activityScore}</span>
            <div className="student-gift-track">
              <i style={{ width: `${activityScore}%` }} />
              <b style={{ left: "22%" }}>🎁</b>
              <b style={{ left: "50%" }}>🎁</b>
              <b style={{ left: "78%" }}>🎁</b>
              <b className="muted" style={{ left: "96%" }}>🎁</b>
            </div>
            <div className="student-track-labels"><small>30</small><small>60</small><small>90</small><small>100</small></div>
          </article>

          <article className="student-week-card">
            <strong>本周任务进度</strong>
            <div className="student-week-progress">
              <div className="student-ring" style={{ ["--ring" as string]: `${weeklyPercent}%` }}><span>{weeklyPercent}%</span></div>
              <div>
                <p>已完成　{weeklyDone}/{weeklyTotal}</p>
                <button onClick={() => setActiveType("阶段")} type="button">查看全部任务</button>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

function StudentPetPage({ learner, petType, onInteract }: { learner: Learner; petType: PetType; onInteract: (action: string, cost: number, mood: string) => void }) {
  const levelProgress = progressToNextLevel(learner.account.totalGrowth, learner.pet.level);
  const stages = ["幼年期", "成长初期", "进阶期", "成熟期", "荣誉期"];
  const stageIndex = learner.pet.level >= 31 ? 4 : learner.pet.level >= 21 ? 3 : learner.pet.level >= 11 ? 2 : learner.pet.level >= 6 ? 1 : 0;
  const conditions = [
    { label: "达到等级 Lv.20", current: Math.min(learner.pet.level, 20), target: 20 },
    { label: "完成作业 8 次", current: learner.completedTasks.includes("homework-submit") ? 6 : 0, target: 8 },
    { label: "连续学习 5 天", current: Math.min(learner.streak, 5), target: 5 },
    { label: "完成测验 1 次", current: learner.completedTasks.includes("unit-test") ? 1 : 0, target: 1 },
    { label: "课堂互动 1 次", current: learner.completedTasks.includes("active-answer") ? 1 : 0, target: 1 },
  ];
  const completedConditions = conditions.filter((item) => item.current >= item.target).length;
  const interactions = [
    { name: "喂食", icon: "🍖", cost: 3, mood: "精神饱满", gain: "+10经验" },
    { name: "训练", icon: "🎧", cost: 5, mood: "正在学习", gain: "+15经验" },
    { name: "洗澡", icon: "🛁", cost: 4, mood: "期待互动", gain: "+10心情" },
  ];
  const accessories = ["🧣", "🧢", "🕶️", "🐕", "🔒", "🔒", "🦄"];

  return (
    <div className="student-page-card student-pet-cultivate-card">
      <div className="student-pet-layout-pro">
        <aside className="student-pet-left-panel">
          <article className="student-pet-info-card">
            <div className="student-pet-name-row">
              <h2>{learner.pet.name}</h2>
              <button type="button" aria-label="修改宠物名称">✎</button>
            </div>
            <div className="student-level-chip-row">
              <strong>Lv.{learner.pet.level}</strong>
              <span>{learner.pet.stage}</span>
            </div>
            <div className="student-pet-level-bar"><i style={{ width: `${levelProgress}%` }} /></div>
            <small>{learner.account.totalGrowth % LEVEL_STEP}/{LEVEL_STEP} 经验</small>
          </article>

          <article className="student-growth-stage-card">
            <strong>成长阶段</strong>
            <div className="student-stage-track">
              {stages.map((stage, index) => (
                <span className={index <= stageIndex ? "active" : ""} key={stage}>
                  <i>{index <= stageIndex ? "🐾" : "🔒"}</i>
                  <small>{stage}</small>
                </span>
              ))}
            </div>
          </article>

          <article className="student-evolution-card">
            <strong>进化条件（{completedConditions}/5）</strong>
            {conditions.map((condition) => {
              const percent = Math.min(100, Math.round((condition.current / condition.target) * 100));
              return (
                <div className="student-condition-row" key={condition.label}>
                  <span>{condition.current >= condition.target ? "☑" : "☐"}</span>
                  <small>{condition.label}</small>
                  <em>{condition.current}/{condition.target}</em>
                  <div><i style={{ width: `${percent}%` }} /></div>
                </div>
              );
            })}
            <p>满足所有条件即可进化为进阶期</p>
          </article>
        </aside>

        <section className="student-pet-stage-main" aria-label="宠物展示">
          <div className="student-pet-glow" />
          <div className="student-pet-avatar-pro"><span>{petType.emoji}</span></div>
          <div className="student-pedestal" />
        </section>

        <aside className="student-pet-right-panel">
          <article className="student-attribute-card-pro">
            <div className="student-card-headline"><strong>属性成长</strong><button type="button">查看详情 ›</button></div>
            {(Object.keys(ATTRIBUTE_LABELS) as AttributeKey[]).map((key) => (
              <div className="student-attribute-row-pro" key={key}>
                <span>{key === "knowledge" ? "🛡" : key === "focus" ? "●" : key === "action" ? "⚡" : "♧"}</span>
                <small>{ATTRIBUTE_LABELS[key]}</small>
                <div><i style={{ width: `${learner.pet[key]}%` }} /></div>
                <em>{learner.pet[key]} / 100</em>
              </div>
            ))}
          </article>

          <div className="student-interaction-row-pro">
            {interactions.map((item) => (
              <button key={item.name} onClick={() => onInteract(item.name, item.cost, item.mood)} type="button">
                <span>{item.icon}</span>
                <strong>{item.name}</strong>
                <small>可获得 {item.gain}</small>
              </button>
            ))}
          </div>

          <article className="student-outfit-panel">
            <div className="student-outfit-tabs"><button className="active" type="button">装扮</button><button type="button">技能</button><button type="button">成长日记</button></div>
            <div className="student-accessory-grid">
              {accessories.map((item, index) => (
                <span className={item === "🔒" ? "locked" : ""} key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
            <button className="student-training-button" onClick={() => onInteract("训练", 5, "正在学习")} type="button">立即开始训练</button>
          </article>
        </aside>
      </div>
    </div>
  );
}

function StudentBadgesPage({ learner, badges }: { learner: Learner; badges: typeof BADGES }) {
  const earned = earnedBadgeIds(learner);
  return (
    <div className="student-page-card">
      <StudentSectionTitle title="成就徽章" desc="记录学习过程中的每一次突破。" />
      <div className="student-function-grid badge-view">
        {badges.map((badge) => (
          <article className={`student-badge-card ${earned.has(badge.id) ? "active" : ""}`} key={badge.id}>
            <span>{badge.icon}</span>
            <h3>{badge.title}</h3>
            <p>{badge.description}</p>
            <b>{earned.has(badge.id) ? "已获得" : "待点亮"}</b>
          </article>
        ))}
      </div>
    </div>
  );
}

function StudentPointsPage({ learner }: { learner: Learner }) {
  return (
    <div className="student-page-card">
      <StudentSectionTitle title="积分中心" desc="成长值用于宠物升级，星币用于兑换奖励。" />
      <div className="student-stat-grid wide">
        <StudentStatCard icon="🏥" label="累计成长值" value={learner.account.totalGrowth} detail="不会因兑换减少" />
        <StudentStatCard icon="🪙" label="可用星币" value={learner.account.stars} detail={`累计获得 ${learner.account.totalStars}`} />
        <StudentStatCard icon="🔥" label="连续学习" value={`${learner.streak} 天`} detail="坚持越久奖励越多" />
      </div>
      <div className="student-rule-box">
        <strong>积分说明</strong>
        <p>完成签到、作业、复习、互动和阶段挑战可以获得成长值与星币。重复提交任务不会重复发放积分。</p>
      </div>
    </div>
  );
}

const SHOP_CATEGORIES: { label: string; type?: Reward["type"] }[] = [
  { label: "全部" },
  { label: "宠物装扮", type: "虚拟装扮" },
  { label: "学习权益", type: "学习权益" },
  { label: "实物奖品", type: "实体奖励" },
  { label: "限定活动", type: "公益奖励" },
];

const REWARD_ICON_MAP: Record<string, string> = {
  "blue-scarf": "🧣",
  "star-hat": "🎩",
  "green-cap": "🧢",
  "knowledge-bag": "🎒",
  "hint-card": "📜",
  "priority-seat": "🎟️",
  "forest-room": "🏠",
  "starry-room": "🌌",
  "wrong-question": "🎫",
  "art-pens": "🖍️",
  "limited-frame": "🖼️",
  "teacher-feedback": "🎙️",
  notebook: "📒",
  "donate-book": "📚",
};

function rewardIcon(reward: Reward) {
  return REWARD_ICON_MAP[reward.id] ?? (reward.type === "虚拟装扮" ? "🎁" : reward.type === "学习权益" ? "🎟️" : reward.type === "实体奖励" ? "📦" : "💝");
}

function StudentShopPage({ learner, rewards, onRedeem }: { learner: Learner; rewards: Reward[]; onRedeem: (reward: Reward) => void }) {
  const [activeCategory, setActiveCategory] = useState("全部");
  const selectedCategory = SHOP_CATEGORIES.find((item) => item.label === activeCategory);
  const orderedIds = ["blue-scarf", "green-cap", "knowledge-bag", "hint-card", "priority-seat", "forest-room", "starry-room", "wrong-question", "art-pens", "limited-frame", "teacher-feedback", "notebook"];
  const sortedRewards = [...rewards].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
  const visibleRewards = selectedCategory?.type ? sortedRewards.filter((reward) => reward.type === selectedCategory.type) : sortedRewards;

  return (
    <div className="student-page-card student-shop-center-card">
      <div className="student-shop-toolbar">
        <div className="student-tabs-row shop-tabs" role="tablist" aria-label="商城分类">
          {SHOP_CATEGORIES.map((category) => (
            <button
              key={category.label}
              className={activeCategory === category.label ? "active" : ""}
              onClick={() => setActiveCategory(category.label)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
        <strong className="student-coin-balance">🪙 我的星币：{learner.account.stars}</strong>
      </div>

      <div className="student-reward-grid-pro">
        {visibleRewards.map((reward) => {
          const owned = learner.ownedRewards.includes(reward.id);
          const disabled = owned || learner.account.stars < reward.price;
          return (
            <article className={`student-reward-card-pro ${owned ? "owned" : ""}`} key={reward.id}>
              <div className="student-reward-illustration"><span>{rewardIcon(reward)}</span></div>
              <h3>{reward.title}</h3>
              <p>{reward.type === "公益奖励" ? "限定活动" : reward.type}</p>
              <div className="student-reward-card-bottom">
                <small><i>🪙</i>{reward.price}</small>
                <button disabled={disabled} onClick={() => onRedeem(reward)} type="button">
                  {owned ? "已拥有" : learner.account.stars < reward.price ? "星币不足" : "兑换"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StudentRecordsPage({ learner }: { learner: Learner }) {
  return (
    <div className="student-page-card">
      <StudentSectionTitle title="学习记录" desc="查看近期积分流水、出勤、作业和测验趋势。" />
      <div className="student-stat-grid wide">
        <StudentStatCard icon="📅" label="出勤率" value={`${learner.attendanceRate}%`} detail="近期课程" />
        <StudentStatCard icon="📝" label="作业率" value={`${learner.homeworkRate}%`} detail="按时提交" />
        <StudentStatCard icon="📈" label="测验趋势" value={`${learner.quizTrend > 0 ? "+" : ""}${learner.quizTrend}`} detail="较上阶段" />
      </div>
      <div className="student-record-list">
        {learner.ledger.slice(0, 8).map((item) => (
          <div key={item.id}>
            <span>{item.date}</span>
            <strong>{item.source}</strong>
            <small>{item.note}</small>
            <b>{item.growthDelta >= 0 ? "+" : ""}{item.growthDelta} / {item.starsDelta >= 0 ? "+" : ""}{item.starsDelta}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentRankingPage({ learner, leaderboard }: { learner: Learner; leaderboard: Learner[] }) {
  return (
    <div className="student-page-card">
      <StudentSectionTitle title="排行榜" desc="只展示正向成长，不显示倒数排名。" />
      <div className="student-ranking-list">
        {leaderboard.map((item, index) => (
          <div className={item.id === learner.id ? "self" : ""} key={item.id}>
            <span>#{index + 1}</span>
            <strong>{item.nickname}</strong>
            <small>{item.pet.name} · Lv.{item.pet.level}</small>
            <b>{item.account.totalGrowth} 成长值</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentSectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="student-section-title">
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
}

function RoleHomePanel({
  portal,
  learner,
  petType,
  learners,
  badges,
  risks,
  classTaskRate,
  onNavigate,
}: {
  portal: (typeof ROLE_PORTALS)[number];
  learner: Learner;
  petType: PetType;
  learners: Learner[];
  badges: typeof BADGES;
  risks: string[];
  classTaskRate: number;
  onNavigate: (section: SectionId) => void;
}) {
  const portalActions: Record<PortalRole, { icon: string; title: string; desc: string; section: SectionId }[]> = {
    teacher: [
      { icon: "✅", title: "课堂计分", desc: "快速发放课程、作业、表扬奖励", section: "teacher" },
      { icon: "👥", title: "学员管理", desc: "新增、搜索、编辑和切换学员", section: "learners" },
      { icon: "💡", title: "智能建议", desc: "查看补救任务和干预策略", section: "insights" },
      { icon: "🛡️", title: "风控审计", desc: "复核异常积分和规则模拟", section: "audit" },
    ],
    student: [
      { icon: "🎯", title: "今日任务", desc: "签到、作业、复习、互动", section: "tasks" },
      { icon: petType.emoji, title: "我的宠物", desc: "喂养、互动、查看成长属性", section: "pet" },
      { icon: "🛒", title: "奖励兑换", desc: "用星币兑换装扮和权益", section: "shop" },
      { icon: "📒", title: "积分明细", desc: "查看每一笔成长值和星币", section: "ledger" },
    ],
    parent: [
      { icon: "📊", title: "成长报告", desc: "查看周报、证书和教师寄语", section: "reports" },
      { icon: "🌱", title: "成长概览", desc: "了解出勤、作业和进步趋势", section: "overview" },
      { icon: "📒", title: "积分明细", desc: "查看奖励来源和学习过程", section: "ledger" },
      { icon: "🏅", title: "徽章成就", desc: "关注孩子阶段性正向反馈", section: "reports" },
    ],
  };

  const stats =
    portal.id === "teacher"
      ? [
          { label: "班级学员", value: learners.length, detail: "当前试点班", tone: "blue" },
          { label: "任务完成率", value: `${classTaskRate}%`, detail: "全班综合进度", tone: "green" },
          { label: "待关注", value: risks.length, detail: "当前学员预警", tone: risks.length ? "amber" : "purple" },
        ]
      : portal.id === "parent"
        ? [
            { label: "出勤率", value: `${learner.attendanceRate}%`, detail: "本阶段记录", tone: "green" },
            { label: "作业率", value: `${learner.homeworkRate}%`, detail: "按时完成情况", tone: "blue" },
            { label: "已获徽章", value: badges.length, detail: "阶段成就", tone: "amber" },
          ]
        : [
            { label: "净能量", value: learner.account.totalGrowth, detail: "累计成长值", tone: "blue" },
            { label: "班币", value: learner.account.stars, detail: "可用星币", tone: "amber" },
            { label: "连续", value: `${learner.streak}天`, detail: "学习连击", tone: "green" },
          ];

  const feed = learner.ledger.slice(0, 4);
  const nextProgress = progressToNextLevel(learner.account.totalGrowth, learner.pet.level);

  return (
    <div className="panel-stack role-home">
      <div className="mobile-app-hero">
        <div className="mobile-app-top">
          <div>
            <span>{portal.label}</span>
            <h2>{learner.nickname} 的成长空间</h2>
          </div>
          <strong>{learner.className}</strong>
        </div>

        <section className="core-data-card" aria-label="今日核心数据">
          <div className="section-title-row">
            <h3>今日核心数据</h3>
            <span>{portal.badge}</span>
          </div>
          <div className="core-data-grid">
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="home-pet-card">
          <div className="home-pet-emoji" aria-hidden="true">{petType.emoji}</div>
          <div>
            <span>{learner.pet.stage} · Lv.{learner.pet.level}</span>
            <h3>{learner.pet.name}</h3>
            <p>{portal.id === "parent" ? "孩子的学习行为会同步转化为宠物成长。" : petType.trait}</p>
            <div className="progress-track small" aria-label="成长进度">
              <i style={{ width: `${nextProgress}%` }} />
            </div>
          </div>
        </section>
      </div>

      <article className="card channel-card">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">频道入口</span>
            <h3>{portal.label}快捷操作</h3>
          </div>
          <small>{portal.actions.join(" / ")}</small>
        </div>
        <div className="channel-grid">
          {portalActions[portal.id].map((action) => (
            <button key={action.title} onClick={() => onNavigate(action.section)}>
              <span>{action.icon}</span>
              <strong>{action.title}</strong>
              <small>{action.desc}</small>
            </button>
          ))}
        </div>
      </article>

      <article className="card">
        <div className="section-title-row">
          <h3>{portal.id === "teacher" ? "最近课堂动态" : "成长记录"}</h3>
          <button className="secondary-button small-button" onClick={() => onNavigate("ledger")}>查看更多</button>
        </div>
        <div className="home-feed">
          {feed.map((item) => (
            <div key={item.id}>
              <span>{item.growthDelta >= 0 ? "⚡" : "🧾"}</span>
              <p><strong>{item.source}</strong><small>{item.note}</small></p>
              <b>{item.date}</b>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function PetCard({
  learner,
  petType,
  progress,
  nextNeed,
}: {
  learner: Learner;
  petType: PetType;
  progress: number;
  nextNeed: number;
}) {
  return (
    <article className="pet-card" style={{ "--pet-accent": petType.accent } as React.CSSProperties}>
      <div className="pet-stage">
        <span>{learner.pet.stage}</span>
        <strong>{petType.name}</strong>
      </div>
      <div className="pet-orb" aria-hidden="true">
        <span>{petType.emoji}</span>
      </div>
      <div className="pet-card-body">
        <h2>{learner.pet.name}</h2>
        <p>{petType.trait}</p>
        <div className="level-row">
          <span>Lv.{learner.pet.level}</span>
          <div className="progress-track" aria-label="升级进度">
            <i style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
        <small>{nextNeed === 0 ? "已达到当前版本最高荣誉阶段" : `距离升级还差 ${nextNeed} 成长值`}</small>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function OverviewPanel({
  learner,
  badges,
  leaderboard,
  risks,
  completedCount,
}: {
  learner: Learner;
  badges: typeof BADGES;
  leaderboard: Learner[];
  risks: string[];
  completedCount: number;
}) {
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">学员端首页</span>
          <h2>{learner.nickname} 的学习成长概览</h2>
        </div>
        <p>家长或负责人可看到学习过程数据，而不是只看到考试成绩。</p>
      </div>

      <div className="two-column">
        <article className="card learner-report">
          <h3>阶段学习报告</h3>
          <div className="report-grid">
            <ProgressItem label="出勤率" value={learner.attendanceRate} suffix="%" />
            <ProgressItem label="作业完成率" value={learner.homeworkRate} suffix="%" />
            <ProgressItem label="测验变化" value={learner.quizTrend} suffix=" 分" positiveNegative />
            <ProgressItem label="任务完成" value={completedCount} suffix={` / ${TASKS.length}`} />
          </div>
          <div className="teacher-note">
            <strong>教师建议</strong>
            <p>
              {learner.quizTrend >= 0
                ? "继续保持当前节奏，下一阶段可以增加表达和复习挑战。"
                : "优先完成补救任务和错题订正，先恢复连续学习记录。"}
            </p>
          </div>
        </article>

        <article className="card">
          <h3>成就徽章</h3>
          <div className="badge-grid">
            {BADGES.map((badge) => {
              const earned = badges.some((item) => item.id === badge.id);
              return (
                <div className={earned ? "badge earned" : "badge"} key={badge.id}>
                  <span>{badge.icon}</span>
                  <strong>{badge.title}</strong>
                  <small>{earned ? "已获得" : badge.description}</small>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="two-column">
        <article className="card">
          <h3>学习属性</h3>
          <AttributeBars pet={learner.pet} />
        </article>

        <article className="card">
          <h3>多维榜单</h3>
          <div className="leaderboard">
            {leaderboard.map((item, index) => (
              <div className="leader-row" key={item.id}>
                <span className="rank">{index + 1}</span>
                <div>
                  <strong>{item.nickname}</strong>
                  <small>{item.pet.name} · {item.pet.stage}</small>
                </div>
                <b>{item.account.totalGrowth}</b>
              </div>
            ))}
          </div>
          <p className="soft-note">榜单默认展示成长值，不公开倒数排名；真实产品可切换进步榜、合作榜和连续学习榜。</p>
        </article>
      </div>

      <article className="card warning-card">
        <h3>教师私有预警</h3>
        {risks.length === 0 ? (
          <p className="empty-state">当前无风险预警，可继续保持学习节奏。</p>
        ) : (
          <div className="risk-list">
            {risks.map((risk) => (
              <span key={risk}>{risk}</span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}


function LearnersPanel({
  learners,
  selectedLearnerId,
  onSelect,
  onAdd,
  onUpdate,
  onExport,
}: {
  learners: Learner[];
  selectedLearnerId: string;
  onSelect: (learnerId: string) => void;
  onAdd: (draft: LearnerDraft) => void;
  onUpdate: (learnerId: string, draft: LearnerDraft) => void;
  onExport: () => void;
}) {
  const emptyDraft: LearnerDraft = {
    name: "",
    nickname: "",
    className: "英语 A 班",
    course: "青少年英语提升",
    petType: PETS[0].id,
    petName: "",
  };
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<LearnerDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<LearnerDraft>(emptyDraft);

  const filteredLearners = learners.filter((learner) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [learner.name, learner.nickname, learner.className, learner.course, learner.pet.name]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  function updateDraft(key: keyof LearnerDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateEditingDraft(key: keyof LearnerDraft, value: string) {
    setEditingDraft((current) => ({ ...current, [key]: value }));
  }

  function startEditing(learner: Learner) {
    setEditingId(learner.id);
    setEditingDraft({
      name: learner.name,
      nickname: learner.nickname,
      className: learner.className,
      course: learner.course,
      petType: learner.pet.typeId,
      petName: learner.pet.name,
    });
  }

  function submitNewLearner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onAdd(draft);
    setDraft(emptyDraft);
  }

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">学员管理</span>
          <h2>新增学员、搜索资料和维护宠物档案</h2>
        </div>
        <button className="primary-button small-button" onClick={onExport}>导出班级数据</button>
      </div>

      <div className="two-column learner-management-grid">
        <article className="card">
          <h3>新增学员</h3>
          <form className="form-grid" onSubmit={submitNewLearner}>
            <label>
              <span>姓名</span>
              <input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="例如：李明" required />
            </label>
            <label>
              <span>昵称</span>
              <input value={draft.nickname} onChange={(event) => updateDraft("nickname", event.target.value)} placeholder="用于榜单展示" />
            </label>
            <label>
              <span>班级</span>
              <input value={draft.className} onChange={(event) => updateDraft("className", event.target.value)} />
            </label>
            <label>
              <span>课程</span>
              <input value={draft.course} onChange={(event) => updateDraft("course", event.target.value)} />
            </label>
            <label>
              <span>初始宠物</span>
              <select value={draft.petType} onChange={(event) => updateDraft("petType", event.target.value)}>
                {PETS.map((pet) => <option key={pet.id} value={pet.id}>{pet.emoji} {pet.name}</option>)}
              </select>
            </label>
            <label>
              <span>宠物名</span>
              <input value={draft.petName} onChange={(event) => updateDraft("petName", event.target.value)} placeholder="例如：小星" />
            </label>
            <button className="primary-button form-submit" type="submit">添加到试点班</button>
          </form>
        </article>

        <article className="card">
          <h3>管理说明</h3>
          <div className="ops-list">
            <div><span>当前学员数</span><strong>{learners.length} 人</strong></div>
            <div><span>平均成长值</span><strong>{Math.round(learners.reduce((sum, learner) => sum + learner.account.totalGrowth, 0) / learners.length)}</strong></div>
            <div><span>预警人数</span><strong>{learners.filter((learner) => riskLabels(learner).length > 0).length} 人</strong></div>
            <div><span>数据保存</span><strong>本机浏览器</strong></div>
          </div>
          <p className="soft-note">当前版本适合试点演示。正式上线时，可把这些学员资料接入数据库和登录权限。</p>
        </article>
      </div>

      <article className="card">
        <div className="filter-bar">
          <label>
            <span>搜索学员</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入姓名、昵称、班级、课程或宠物名" />
          </label>
          <span className="filter-summary">已显示 {filteredLearners.length} / {learners.length} 人</span>
        </div>
        <div className="learner-card-grid">
          {filteredLearners.map((learner) => {
            const petType = getPet(learner.pet.typeId);
            const isEditing = editingId === learner.id;
            return (
              <div className={learner.id === selectedLearnerId ? "learner-card selected" : "learner-card"} key={learner.id}>
                <div className="learner-card-head">
                  <span>{petType.emoji}</span>
                  <div>
                    <strong>{learner.name}</strong>
                    <small>{learner.nickname} · {learner.className}</small>
                  </div>
                </div>

                {isEditing ? (
                  <div className="form-grid compact-form">
                    <label><span>姓名</span><input value={editingDraft.name} onChange={(event) => updateEditingDraft("name", event.target.value)} /></label>
                    <label><span>昵称</span><input value={editingDraft.nickname} onChange={(event) => updateEditingDraft("nickname", event.target.value)} /></label>
                    <label><span>班级</span><input value={editingDraft.className} onChange={(event) => updateEditingDraft("className", event.target.value)} /></label>
                    <label><span>课程</span><input value={editingDraft.course} onChange={(event) => updateEditingDraft("course", event.target.value)} /></label>
                    <label><span>宠物</span><select value={editingDraft.petType} onChange={(event) => updateEditingDraft("petType", event.target.value)}>{PETS.map((pet) => <option key={pet.id} value={pet.id}>{pet.emoji} {pet.name}</option>)}</select></label>
                    <label><span>宠物名</span><input value={editingDraft.petName} onChange={(event) => updateEditingDraft("petName", event.target.value)} /></label>
                    <div className="card-actions wide-actions">
                      <button className="primary-button small-button" onClick={() => { onUpdate(learner.id, editingDraft); setEditingId(null); }}>保存</button>
                      <button className="secondary-button small-button" onClick={() => setEditingId(null)}>取消</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="learner-stats">
                      <span>Lv.{learner.pet.level}</span>
                      <span>{learner.account.totalGrowth} 成长值</span>
                      <span>{learner.account.stars} 星币</span>
                    </div>
                    <div className="mini-tags">
                      {riskLabels(learner).length === 0 ? <span className="ok">状态稳定</span> : riskLabels(learner).map((risk) => <span key={risk}>{risk}</span>)}
                    </div>
                    <div className="card-actions">
                      <button className="primary-button small-button" onClick={() => onSelect(learner.id)}>设为当前</button>
                      <button className="secondary-button small-button" onClick={() => startEditing(learner)}>编辑资料</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function ProgressItem({
  label,
  value,
  suffix,
  positiveNegative = false,
}: {
  label: string;
  value: number;
  suffix: string;
  positiveNegative?: boolean;
}) {
  const display = positiveNegative && value > 0 ? `+${value}` : `${value}`;
  const percent = positiveNegative ? Math.min(100, Math.abs(value) * 8) : Math.min(100, value);
  return (
    <div className="progress-item">
      <div>
        <span>{label}</span>
        <strong className={positiveNegative && value < 0 ? "negative" : ""}>{display}{suffix}</strong>
      </div>
      <div className="progress-track small">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function AttributeBars({ pet }: { pet: Pet }) {
  const entries: [AttributeKey, number][] = [
    ["knowledge", pet.knowledge],
    ["focus", pet.focus],
    ["action", pet.action],
    ["cooperation", pet.cooperation],
  ];
  return (
    <div className="attribute-list">
      {entries.map(([key, value]) => (
        <div className="attribute-row" key={key}>
          <div>
            <span>{ATTRIBUTE_LABELS[key]}</span>
            <b>{value}</b>
          </div>
          <div className="progress-track">
            <i style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksPanel({
  learner,
  tasks,
  onComplete,
}: {
  learner: Learner;
  tasks: Task[];
  onComplete: (task: Task) => void;
}) {
  const groups = ["每日", "每周", "阶段", "挑战", "补救"] as const;
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"全部" | Task["type"]>("全部");
  const visibleTasks = tasks.filter((task) => {
    const matchesType = typeFilter === "全部" || task.type === typeFilter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword || [task.title, task.description, task.limit, ATTRIBUTE_LABELS[task.attribute]]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    return matchesType && matchesQuery;
  });

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">任务系统</span>
          <h2>用真实学习行为获取成长值和星币</h2>
        </div>
        <p>核心任务绑定学习动作，重复任务会被防刷规则拦截。</p>
      </div>

      <article className="card task-filter-card">
        <div className="filter-bar">
          <label>
            <span>搜索任务</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入作业、复习、测验、合作等关键词" />
          </label>
          <label>
            <span>任务类型</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "全部" | Task["type"])}>
              <option value="全部">全部任务</option>
              {groups.map((group) => <option key={group} value={group}>{group}任务</option>)}
            </select>
          </label>
          <span className="filter-summary">已显示 {visibleTasks.length} / {tasks.length} 个任务</span>
        </div>
      </article>

      {groups.map((group) => {
        const groupTasks = visibleTasks.filter((task) => task.type === group);
        if (groupTasks.length === 0) return null;
        return (
          <section className="task-group" key={group}>
            <h3>{group}任务</h3>
            <div className="task-grid">
              {groupTasks.map((task) => {
                const done = learner.completedTasks.includes(task.id);
                return (
                  <article className={done ? "task-card done" : "task-card"} key={task.id}>
                    <div>
                      <span className="task-type">{task.type}</span>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                    </div>
                    <div className="task-reward">
                      <span>+{task.growth} 成长值</span>
                      <span>+{task.stars} 星币</span>
                    </div>
                    <small>{task.limit} · 提升{ATTRIBUTE_LABELS[task.attribute]}</small>
                    <button onClick={() => onComplete(task)} disabled={done}>
                      {done ? "已完成" : "完成并发放"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PetPanel({
  learner,
  petType,
  onInteract,
}: {
  learner: Learner;
  petType: PetType;
  onInteract: (action: string, cost: number, mood: string) => void;
}) {
  const evolutionChecks = [
    { label: "达到 10 级", done: learner.pet.level >= 10 },
    { label: "完成 8 次作业", done: learner.completedTasks.includes("homework-submit") },
    { label: "连续学习 5 天", done: learner.streak >= 5 },
    { label: "完成阶段测验", done: learner.completedTasks.includes("unit-test") },
    { label: "至少参与 1 次课堂互动", done: learner.completedTasks.includes("active-answer") },
  ];
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">宠物培养体系</span>
          <h2>{learner.pet.name} 的成长中心</h2>
        </div>
        <p>宠物成长来自学习任务，不使用死亡、离家出走等高压机制。</p>
      </div>

      <div className="two-column pet-detail-grid">
        <article className="card pet-profile" style={{ "--pet-accent": petType.accent } as React.CSSProperties}>
          <div className="big-pet">{petType.emoji}</div>
          <h3>{learner.pet.name}</h3>
          <p>{petType.name} · {learner.pet.stage} · 当前状态：{learner.pet.mood}</p>
          <div className="chip-row">
            {learner.pet.outfit.length === 0 ? <span>暂无装扮</span> : learner.pet.outfit.map((item) => <span key={item}>{item}</span>)}
            {learner.pet.room.map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>

        <article className="card">
          <h3>下一阶段进化条件</h3>
          <div className="check-list">
            {evolutionChecks.map((check) => (
              <div className={check.done ? "check done" : "check"} key={check.label}>
                <span>{check.done ? "✓" : "·"}</span>
                <p>{check.label}</p>
              </div>
            ))}
          </div>
          <p className="soft-note">进化绑定多种学习行为，避免只靠单一动作刷积分。</p>
        </article>
      </div>

      <div className="two-column">
        <article className="card">
          <h3>学习属性</h3>
          <AttributeBars pet={learner.pet} />
        </article>
        <article className="card">
          <h3>每日互动</h3>
          <div className="interaction-grid">
            <button onClick={() => onInteract("喂食", 2, "开心")}>喂食 · 2 星币</button>
            <button onClick={() => onInteract("抚摸", 1, "期待互动")}>抚摸 · 1 星币</button>
            <button onClick={() => onInteract("训练", 3, "正在学习")}>训练 · 3 星币</button>
            <button onClick={() => onInteract("休息", 0, "休息中")}>休息 · 免费</button>
          </div>
          <p className="soft-note">真实产品建议每日免费互动 3 次，更多互动由学习任务解锁。</p>
        </article>
      </div>
    </div>
  );
}

function ShopPanel({
  learner,
  rewards,
  onRedeem,
}: {
  learner: Learner;
  rewards: Reward[];
  onRedeem: (reward: Reward) => void;
}) {
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">奖励商城</span>
          <h2>优先使用低成本、高感知价值奖励</h2>
        </div>
        <p>当前可用星币：<strong>{learner.account.stars}</strong></p>
      </div>
      <div className="shop-grid">
        {rewards.map((reward) => {
          const owned = learner.ownedRewards.includes(reward.id);
          return (
            <article className={owned ? "reward-card owned" : "reward-card"} key={reward.id}>
              <span className="reward-type">{reward.type}</span>
              <h3>{reward.title}</h3>
              <p>{reward.description}</p>
              <div className="reward-meta">
                <strong>{reward.price} 星币</strong>
                <small>库存 {reward.stock}</small>
              </div>
              <button onClick={() => onRedeem(reward)} disabled={owned}>
                {owned ? "已拥有" : "兑换"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}


function ActivitiesPanel({
  learners,
  activities,
  templates,
  onBatch,
}: {
  learners: Learner[];
  activities: SeasonActivity[];
  templates: typeof MESSAGE_TEMPLATES;
  onBatch: () => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].content);
  const classPetProgress = Math.round(
    (learners.reduce((sum, learner) => sum + Math.min(100, learner.pet.level * 4), 0) / learners.length),
  );
  const stableLearners = learners.filter((learner) => riskLabels(learner).length === 0).length;

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">运营活动中心</span>
          <h2>把试点班级变成可持续运营的赛季活动</h2>
        </div>
        <button className="primary-button small-button" onClick={onBatch}>完成共同目标并发奖</button>
      </div>

      <section className="summary-grid compact">
        <MetricCard label="班级宠物成长" value={`${classPetProgress}%`} detail="按全班宠物等级估算" tone="green" />
        <MetricCard label="稳定学员" value={`${stableLearners}/${learners.length}`} detail="暂无出勤/作业预警" tone="blue" />
        <MetricCard label="活动模板" value={activities.length} detail="赛季、表达、毕业" tone="purple" />
        <MetricCard label="通知文案" value={templates.length} detail="低压力提醒" tone="amber" />
      </section>

      <div className="activity-grid">
        {activities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <div className="activity-head">
              <span>{activity.theme}</span>
              <small>{activity.period}</small>
            </div>
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
            <div className="activity-goals">
              {activity.goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div className="goal-row" key={goal.id}>
                    <div>
                      <strong>{goal.title}</strong>
                      <small>{goal.current}{goal.metric} / {goal.target}{goal.metric}</small>
                    </div>
                    <div className="progress-track small"><i style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <div className="reward-banner">活动奖励：{activity.reward}</div>
          </article>
        ))}
      </div>

      <div className="two-column">
        <article className="card">
          <h3>班级共同养成</h3>
          <div className="class-pet-card">
            <div className="class-pet-orb">🌳</div>
            <div>
              <strong>班级宠物：知识树</strong>
              <p>由全班出勤率、作业完成率、复习次数和互助记录共同推动成长。</p>
              <div className="progress-track"><i style={{ width: `${classPetProgress}%` }} /></div>
            </div>
          </div>
        </article>

        <article className="card">
          <h3>低压力通知文案</h3>
          <select className="wide-select" value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>
            {templates.map((template) => <option key={template.title} value={template.content}>{template.title}</option>)}
          </select>
          <div className="message-preview">{selectedTemplate}</div>
          <p className="soft-note">避免“宠物快饿坏了”等威胁式提醒，优先强调下一步行动。</p>
        </article>
      </div>
    </div>
  );
}

function ReportsPanel({
  learner,
  petType,
  badges,
}: {
  learner: Learner;
  petType: PetType;
  badges: typeof BADGES;
}) {
  const reportItems = [
    { label: "出勤率", value: `${learner.attendanceRate}%` },
    { label: "作业完成率", value: `${learner.homeworkRate}%` },
    { label: "连续学习", value: `${learner.streak} 天` },
    { label: "任务完成", value: `${learner.completedTasks.length} 项` },
    { label: "获得徽章", value: `${badges.length} 枚` },
    { label: "测验变化", value: learner.quizTrend > 0 ? `+${learner.quizTrend} 分` : `${learner.quizTrend} 分` },
  ];
  const timeline = [
    "完成首次签到并孵化专属学伴",
    `宠物成长至 ${learner.pet.stage}，当前等级 Lv.${learner.pet.level}`,
    `累计获得 ${learner.account.totalGrowth} 成长值与 ${learner.account.totalStars} 星币`,
    badges.length > 0 ? `获得 ${badges.map((badge) => badge.title).join("、")}` : "正在解锁第一枚成就徽章",
  ];

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">家长成长报告</span>
          <h2>{learner.nickname} 的阶段成长记录</h2>
        </div>
        <button className="primary-button small-button" onClick={() => window.print()}>打印 / 保存 PDF</button>
      </div>

      <article className="report-certificate card">
        <div className="certificate-top">
          <div>
            <span className="eyebrow">Learning Companion Report</span>
            <h3>{learner.name} · {learner.course}</h3>
            <p>{learner.className} 的阶段学习过程报告，重点展示努力、习惯和进步。</p>
          </div>
          <div className="certificate-pet">{petType.emoji}</div>
        </div>
        <div className="report-stat-grid">
          {reportItems.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </article>

      <div className="two-column">
        <article className="card">
          <h3>成长时间线</h3>
          <div className="report-timeline">
            {timeline.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>教师寄语</h3>
          <div className="teacher-comment">
            <p>
              {learner.quizTrend >= 0
                ? `${learner.nickname} 本阶段保持了较好的学习节奏，建议继续强化复习和课堂表达。`
                : `${learner.nickname} 近期需要先恢复作业和复习节奏，完成补救任务后可以重新进入成长循环。`}
            </p>
          </div>
          <div className="badge-strip">
            {badges.length === 0 ? <span>暂无徽章</span> : badges.map((badge) => <span key={badge.id}>{badge.icon} {badge.title}</span>)}
          </div>
        </article>
      </div>
    </div>
  );
}


function InsightsPanel({
  learner,
  onCompleteTask,
}: {
  learner: Learner;
  onCompleteTask: (task: Task) => void;
}) {
  const recommendations = recommendationsForLearner(learner);
  const riskCount = riskLabels(learner).length;
  const nextAction = recommendations[0];

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">智能建议</span>
          <h2>根据学员状态推荐下一步任务</h2>
        </div>
        <p>当前为规则驱动的智能建议，可作为教师决策辅助，最终仍由老师确认。</p>
      </div>

      <section className="summary-grid compact">
        <MetricCard label="干预优先级" value={nextAction.priority} detail={nextAction.title} tone={nextAction.priority === "高" ? "amber" : "blue"} />
        <MetricCard label="预警数量" value={riskCount} detail="出勤、作业、趋势、连续学习" tone={riskCount > 0 ? "amber" : "green"} />
        <MetricCard label="推荐任务" value={recommendations.length} detail="最多显示 4 条" tone="purple" />
        <MetricCard label="可执行任务" value={recommendations.filter((item) => item.taskId && !learner.completedTasks.includes(item.taskId)).length} detail="可一键模拟完成" tone="green" />
      </section>

      <div className="recommendation-grid">
        {recommendations.map((recommendation) => {
          const linkedTask = recommendation.taskId ? taskById(recommendation.taskId) : undefined;
          const done = Boolean(linkedTask && learner.completedTasks.includes(linkedTask.id));
          return (
            <article className={`recommendation-card priority-${recommendation.priority}`} key={recommendation.title}>
              <div className="recommendation-head">
                <span>{recommendation.priority}优先级</span>
                {linkedTask && <small>{linkedTask.type}任务</small>}
              </div>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.reason}</p>
              <div className="action-box">建议动作：{recommendation.action}</div>
              {linkedTask && (
                <button className="primary-button small-button" disabled={done} onClick={() => onCompleteTask(linkedTask)}>
                  {done ? "任务已完成" : `执行：${linkedTask.title}`}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <article className="card">
        <h3>个性化激励策略</h3>
        <div className="strategy-list">
          <div><strong>反馈方式</strong><span>{learner.streak >= 5 ? "强化连续学习成就，使用进阶挑战。" : "先恢复短周期反馈，使用每日小任务。"}</span></div>
          <div><strong>奖励节奏</strong><span>{learner.account.stars >= 60 ? "引导兑换学习权益，降低实体奖励成本。" : "优先发放小额星币，建立即时反馈。"}</span></div>
          <div><strong>家长沟通</strong><span>{riskCount > 0 ? "建议发送过程型周报，强调补救路径。" : "建议展示徽章和宠物阶段，强化正向认可。"}</span></div>
        </div>
      </article>
    </div>
  );
}

function AuditPanel({ learners }: { learners: Learner[] }) {
  const [lessonCount, setLessonCount] = useState(2);
  const [homeworkCount, setHomeworkCount] = useState(2);
  const [reviewCount, setReviewCount] = useState(3);
  const [interactionCount, setInteractionCount] = useState(3);
  const auditItems = auditLearners(learners);
  const highRiskCount = auditItems.filter((item) => item.level === "高").length;
  const simulatedGrowth = lessonCount * 10 + homeworkCount * 10 + reviewCount * 6 + interactionCount * 3;
  const simulatedStars = lessonCount * 5 + homeworkCount * 5 + reviewCount * 3 + interactionCount * 2;

  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">风控审计</span>
          <h2>积分异常检测与规则模拟器</h2>
        </div>
        <p>用可解释规则识别异常，不直接处罚学员，先进入教师复核。</p>
      </div>

      <section className="summary-grid compact">
        <MetricCard label="高风险记录" value={highRiskCount} detail="需管理员复核" tone={highRiskCount > 0 ? "amber" : "green"} />
        <MetricCard label="审计人数" value={auditItems.length} detail="当前试点班" tone="blue" />
        <MetricCard label="模拟成长值" value={simulatedGrowth} detail="按输入行为计算" tone="purple" />
        <MetricCard label="模拟星币" value={simulatedStars} detail="用于奖励成本估算" tone="amber" />
      </section>

      <div className="two-column">
        <article className="card">
          <h3>积分规则模拟器</h3>
          <div className="simulator-grid">
            <label><span>完成课程数</span><input type="number" min="0" max="12" value={lessonCount} onChange={(event) => setLessonCount(Number(event.target.value))} /></label>
            <label><span>按时作业数</span><input type="number" min="0" max="12" value={homeworkCount} onChange={(event) => setHomeworkCount(Number(event.target.value))} /></label>
            <label><span>复习任务数</span><input type="number" min="0" max="20" value={reviewCount} onChange={(event) => setReviewCount(Number(event.target.value))} /></label>
            <label><span>课堂互动数</span><input type="number" min="0" max="20" value={interactionCount} onChange={(event) => setInteractionCount(Number(event.target.value))} /></label>
          </div>
          <div className="simulation-result">
            <strong>本周期预计发放</strong>
            <span>{simulatedGrowth} 成长值 / {simulatedStars} 星币</span>
          </div>
        </article>

        <article className="card">
          <h3>防刷规则</h3>
          <div className="audit-rule-list">
            {AUDIT_RULES.map((rule) => (
              <div key={rule.title}>
                <strong>{rule.title}</strong>
                <span>{rule.description}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="card table-card">
        <h3>学员审计列表</h3>
        <table>
          <thead>
            <tr>
              <th>学员</th>
              <th>风险等级</th>
              <th>审计原因</th>
              <th>成长值</th>
              <th>星币</th>
              <th>流水数</th>
            </tr>
          </thead>
          <tbody>
            {auditItems.map((item) => (
              <tr key={item.learner.id}>
                <td>{item.learner.name}</td>
                <td><span className={`audit-level level-${item.level}`}>{item.level}</span></td>
                <td>{item.reasons.join("；")}</td>
                <td>{item.learner.account.totalGrowth}</td>
                <td>{item.learner.account.stars}</td>
                <td>{item.learner.ledger.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}

function LedgerPanel({ learner }: { learner: Learner }) {
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">积分流水</span>
          <h2>{learner.nickname} 的积分明细</h2>
        </div>
        <p>所有积分操作都保留来源、时间和变更记录。</p>
      </div>
      <article className="card table-card">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>来源</th>
              <th>说明</th>
              <th>成长值</th>
              <th>星币</th>
            </tr>
          </thead>
          <tbody>
            {learner.ledger.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.source}</td>
                <td>{item.note}</td>
                <td className={item.growthDelta >= 0 ? "positive" : "negative"}>{item.growthDelta >= 0 ? "+" : ""}{item.growthDelta}</td>
                <td className={item.starsDelta >= 0 ? "positive" : "negative"}>{item.starsDelta >= 0 ? "+" : ""}{item.starsDelta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}

function TeacherPanel({
  learners,
  teacherTargetId,
  setTeacherTargetId,
  onPreset,
  onBatch,
}: {
  learners: Learner[];
  teacherTargetId: string;
  setTeacherTargetId: (id: string) => void;
  onPreset: (targetId: string, preset: (typeof TEACHER_PRESETS)[number]) => void;
  onBatch: () => void;
}) {
  const target = learners.find((learner) => learner.id === teacherTargetId) ?? learners[0];
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">教师端</span>
          <h2>三分钟完成课后积分操作</h2>
        </div>
        <button className="primary-button small-button" onClick={onBatch}>发放班级共同奖励</button>
      </div>

      <div className="two-column">
        <article className="card">
          <h3>选择学员并发放奖励</h3>
          <select className="wide-select" value={teacherTargetId} onChange={(event) => setTeacherTargetId(event.target.value)}>
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>{learner.name} · {learner.pet.name}</option>
            ))}
          </select>
          <div className="preset-grid">
            {TEACHER_PRESETS.map((preset) => (
              <button key={preset.label} onClick={() => onPreset(target.id, preset)}>
                <strong>{preset.label}</strong>
                <span>+{preset.growth} 成长值 / +{preset.stars} 星币</span>
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>待关注学员</h3>
          <div className="student-list">
            {learners.map((learner) => {
              const risks = riskLabels(learner);
              return (
                <div className="student-row" key={learner.id}>
                  <div>
                    <strong>{learner.name}</strong>
                    <small>{learner.pet.name} · Lv.{learner.pet.level}</small>
                  </div>
                  <div className="mini-tags">
                    {risks.length === 0 ? <span className="ok">稳定</span> : risks.map((risk) => <span key={risk}>{risk}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <article className="card table-card">
        <h3>班级学员列表</h3>
        <table>
          <thead>
            <tr>
              <th>学员</th>
              <th>宠物</th>
              <th>等级</th>
              <th>成长值</th>
              <th>星币</th>
              <th>出勤</th>
              <th>作业</th>
            </tr>
          </thead>
          <tbody>
            {learners.map((learner) => (
              <tr key={learner.id}>
                <td>{learner.name}</td>
                <td>{learner.pet.name}</td>
                <td>Lv.{learner.pet.level}</td>
                <td>{learner.account.totalGrowth}</td>
                <td>{learner.account.stars}</td>
                <td>{learner.attendanceRate}%</td>
                <td>{learner.homeworkRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}

function AdminPanel({
  learners,
  classTaskRate,
  attendanceAvg,
  homeworkAvg,
  redemptionRate,
  onExport,
}: {
  learners: Learner[];
  classTaskRate: number;
  attendanceAvg: number;
  homeworkAvg: number;
  redemptionRate: number;
  onExport: () => void;
}) {
  const abnormalCount = learners.filter((learner) => riskLabels(learner).length > 0).length;
  return (
    <div className="panel-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">管理端数据看板</span>
          <h2>规则、成本和风险一屏管理</h2>
        </div>
        <div className="panel-actions">
          <p>首版建议用于 30 人试点班，稳定后再扩展多校区和家长端。</p>
          <button className="secondary-button small-button" onClick={onExport}>导出数据</button>
        </div>
      </div>

      <section className="summary-grid compact">
        <MetricCard label="周活跃率" value="82%" detail="目标 70%+" tone="green" />
        <MetricCard label="任务完成率" value={`${classTaskRate}%`} detail="含每日与阶段任务" tone="blue" />
        <MetricCard label="出勤率" value={`${attendanceAvg}%`} detail="试点班均值" tone="purple" />
        <MetricCard label="商城兑换率" value={`${redemptionRate}%`} detail="用于控制成本" tone="amber" />
      </section>

      <div className="two-column">
        <article className="card">
          <h3>积分规则模板</h3>
          <div className="rule-list">
            {TASKS.slice(0, 8).map((task) => (
              <div className="rule-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.limit}</small>
                </div>
                <span>{task.growth} 成长值 / {task.stars} 星币</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>风控与成本</h3>
          <div className="ops-list">
            <div><span>预警学员</span><strong>{abnormalCount} 人</strong></div>
            <div><span>教师手动奖励上限</span><strong>每周 30 成长值</strong></div>
            <div><span>推荐奖励结构</span><strong>70% 虚拟 / 20% 权益 / 10% 实体</strong></div>
            <div><span>作业完成率</span><strong>{homeworkAvg}%</strong></div>
          </div>
          <p className="soft-note">上线正式系统时，应增加教师权限、审核流、操作日志导出和异常积分撤销。</p>
        </article>
      </div>

      <article className="card rollout-card">
        <h3>试点落地排期</h3>
        <div className="timeline">
          <div><b>第 1 周</b><span>新学员孵化：注册、选宠物、签到、首次作业</span></div>
          <div><b>第 2 周</b><span>习惯建立：准时到课、三日复习、首次发言</span></div>
          <div><b>第 3 周</b><span>合作成长：小组任务、互助、班级宠物</span></div>
          <div><b>第 4 周</b><span>阶段挑战：测验、总结、第一次进化与商城兑换</span></div>
        </div>
      </article>
    </div>
  );
}
