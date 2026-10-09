const pages = {
  home: ["我的小島", "大廳"],
  chat: ["我的小島", "和 Aria 聊聊"],
  tasks: ["我的小島", "今日任務"],
  history: ["我的小島", "心情紀錄"],
  profile: ["我的小島", "個人中心"]
};
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function goToPage(page) {
  if (!pages[page]) return;
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.id === `page-${page}`));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  const crumb = document.getElementById("breadcrumb");
  crumb.innerHTML = `${pages[page][0]} <span>／</span> ${pages[page][1]}`;
  window.scrollTo({top: 0, behavior: "smooth"});
}
document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => goToPage(button.dataset.page));
});

const dialog = document.getElementById("simpleDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");
function openDialog(title, text) {
  dialogTitle.textContent = title;
  dialogText.textContent = text;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else showToast(`${title}：${text}`);
}
document.getElementById("dialogConfirm").addEventListener("click", () => dialog.close());

document.querySelectorAll(".scene-object").forEach(object => {
  object.addEventListener("click", () => {
    const tip = object.dataset.tip || "在這座小島上，依照自己的步調探索就好。";
    document.getElementById("sceneHint").innerHTML = `<span>✦</span> ${tip}`;
  });
});
let rotated = false;
document.getElementById("rotateIsland").addEventListener("click", () => {
  rotated = !rotated;
  const scene = document.getElementById("islandScene");
  scene.style.transform = rotated ? "translate(-50%,-44%) rotate(5deg) scale(.98)" : "";
  if (!rotated) scene.style.transform = "";
  showToast(rotated ? "小島輕輕轉了一個角度 ✧" : "小島回到原本的角度");
});

document.querySelectorAll("[data-mood]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-mood]").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    const mood = button.dataset.mood;
    document.getElementById("moodFeedback").textContent = `你現在感覺有些「${mood}」。謝謝你停下來留意自己。`;
  });
});

const chatMessages = document.getElementById("chatMessages");
function addMessage(text, who) {
  const row = document.createElement("div");
  row.className = `message-row ${who === "user" ? "user-row" : "aria-row"}`;
  if (who !== "user") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "♡";
    row.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);
  const time = document.createElement("time");
  time.textContent = "剛剛";
  bubble.appendChild(time);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function localReply(text) {
  const t = text.toLowerCase();
  if (text.includes("累") || text.includes("煩") || text.includes("壓力") || text.includes("難過")) {
    return "聽起來這件事真的讓你不太好受。謝謝你願意說出來。你現在比較想有人聽你說，還是想一起慢慢整理看看？";
  }
  if (text.includes("不知道")) return "不知道怎麼說也沒關係，我們不用急著整理。你可以先從現在最明顯的感覺開始，或只是待在這裡一會兒。";
  if (text.includes("開心") || text.includes("很好")) return "聽到你這麼說真好。你願意多分享一點，今天哪個時刻讓你有這樣的感覺嗎？";
  return "我有在聽。你不需要馬上找到答案，我們可以照你的步調慢慢聊。你覺得這件事裡，最讓你在意的是什麼呢？";
}
document.getElementById("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  setTimeout(() => addMessage(localReply(text), "aria"), 450);
});
document.querySelectorAll(".quick-prompts button").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById("chatInput");
    input.value = button.textContent;
    input.focus();
  });
});
document.getElementById("clearChat").addEventListener("click", () => {
  chatMessages.innerHTML = "";
  addMessage("我們可以重新開始。今天的你，想從哪裡聊起？", "aria");
});
document.getElementById("supportToggle").addEventListener("click", () => {
  document.getElementById("supportDetails").classList.toggle("hidden");
});
document.getElementById("closeSupport").addEventListener("click", () => {
  document.getElementById("supportDetails").classList.add("hidden");
});

const taskButtons = [...document.querySelectorAll("[data-task]")];
function updateTaskCount() {
  const count = taskButtons.filter(b => b.classList.contains("completed")).length;
  document.getElementById("taskCount").textContent = `${count} / 3`;
  const navCount = document.querySelector(".nav-count");
  navCount.textContent = `${3 - count}`;
}
taskButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.classList.contains("completed")) {
      showToast("這個任務已經完成，不需要再做一次。");
      return;
    }
    const index = Number(button.dataset.task);
    const taskNames = ["感受現在的心情", "留意身體的訊號", "寫下一件在意的事"];
    openDialog(taskNames[index], index === 1
      ? "先停下來，感受一下呼吸或肩膀的狀態。準備好後，按「完成任務」即可。"
      : "花一點時間陪伴自己就好。沒有標準答案，也不需要做得完美。");
    document.getElementById("dialogConfirm").textContent = "完成任務";
    document.getElementById("dialogConfirm").onclick = () => {
      dialog.close();
      button.classList.add("completed");
      button.textContent = "已完成 ✓";
      updateTaskCount();
      showToast("任務已完成，謝謝你照顧自己 ✧");
      document.getElementById("dialogConfirm").textContent = "知道了";
      document.getElementById("dialogConfirm").onclick = () => dialog.close();
    };
  });
});

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    let visible = 0;
    document.querySelectorAll(".history-entry").forEach(entry => {
      const show = filter === "all" || entry.dataset.emotion === filter;
      entry.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    document.getElementById("emptyHistory").classList.toggle("hidden", visible !== 0);
  });
});
document.getElementById("newRecord").addEventListener("click", () => {
  openDialog("新增心情紀錄", "正式版本可在這裡讓你自行輸入心情、標題與摘要。這份原型目前使用示範資料，尚未連接資料庫。");
});
document.querySelectorAll(".entry-more").forEach(button => {
  button.addEventListener("click", () => {
    const entry = button.closest(".history-entry");
    openDialog(entry.querySelector("h3").textContent, entry.querySelector(".history-main p").textContent);
  });
});
document.getElementById("editProfile").addEventListener("click", () => {
  openDialog("編輯個人資料", "此為介面示意。正式版本可在這裡編輯暱稱、頭像與選填的個人偏好。");
});
document.querySelectorAll("[data-setting]").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.setting;
    const details = {
      "紀錄保存": "請清楚說明聊天原文與摘要各自如何保存、何時刪除，並讓使用者能自行管理。",
      "資料刪除": "正式版本應提供明確的資料刪除流程，並告知刪除範圍與結果。",
      "支持資源": "可以放入經過確認的校園輔導、專業支持與緊急協助資訊。",
      "Aria 回應風格": "正式版本可讓使用者選擇回應較簡短、較溫柔或多一點引導。",
      "通知與提醒": "由使用者自行決定是否接收提醒，並可以隨時關閉。"
    };
    openDialog(name, details[name] || "這是個人中心的互動示意，正式版本可在此加入對應的設定功能。");
  });
});
document.getElementById("dialogConfirm").textContent = "知道了";
