export const openTaskManager = (clientId) => {
  window.open(
    `/taskmanager/${clientId}`,
    "taskManager",
    "width=500,height=550"
  );
};
