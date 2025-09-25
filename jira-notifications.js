// https://aui.atlassian.com/aui/latest/docs/flag.html
function showNotification({ title, body }) {
  window.AJS.flag({
    type: "success",
    close: "auto",
    title,
    body,
  });
}

window.addEventListener("message", (evt) => {
  if (evt.data.type === "jira_success_copied_to_clipboard")
    showNotification(evt.data.options);
});
