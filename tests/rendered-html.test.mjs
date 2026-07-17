import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the learning pet MVP", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>学伴成长计划 · 积分宠物培养系统<\/title>/i);
  assert.match(html, /学员积分宠物培养系统/);
  assert.match(html, /学员端/);
  assert.match(html, /教师端/);
  assert.match(html, /家长端/);
  assert.match(html, /学习成长/);
  assert.match(html, /宠爱相伴/);
  assert.match(html, /学员入口/);
  assert.match(html, /教师入口/);
  assert.match(html, /家长入口/);
  assert.match(html, /选择系统入口/);
  assert.doesNotMatch(html, /今日核心数据|频道入口|今日任务|我的宠物|奖励兑换/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("removes disposable starter preview and skeleton dependency", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /学伴成长计划/);
  assert.match(page, /createInitialLearners/);
  assert.match(page, /StudentPortal/);
  assert.match(page, /StudentOnboardingPage/);
  assert.match(page, /欢迎加入/);
  assert.match(page, /选择你的宠物蛋/);
  assert.match(page, /孵化我的宠物蛋/);
  assert.match(page, /勇气犬蛋/);
  assert.match(page, /任务中心/);
  assert.match(page, /宠物中心/);
  assert.match(page, /成就徽章/);
  assert.match(page, /积分中心/);
  assert.match(page, /奖励商城/);
  assert.match(page, /学习记录/);
  assert.match(page, /排行榜/);
  assert.match(page, /今日活跃度/);
  assert.match(page, /本周任务进度/);
  assert.match(page, /属性成长/);
  assert.match(page, /进化条件/);
  assert.match(page, /我的星币/);
  assert.match(page, /限定头像框/);
  assert.match(page, /TeacherPortal/);
  assert.match(page, /班级总览/);
  assert.match(page, /学员管理/);
  assert.match(page, /任务管理/);
  assert.match(page, /作业管理/);
  assert.match(page, /积分管理/);
  assert.match(page, /课堂互动/);
  assert.match(page, /成长报告/);
  assert.match(page, /系统设置/);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(layout, /积分宠物培养系统/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
