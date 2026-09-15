self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "MLPEKAYOU",
      body: event.data ? event.data.text() : "You have a new notification.",
    };
  }

  const title = payload.title || "MLPEKAYOU";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: payload.icon || "/website-assets/mlpekayouwiki4.webp",
    badge: payload.badge || "/website-assets/mlpekayouwiki4.webp",
    tag: payload.tag || "mlpekayou-notification",
    renotify: true,
    data: {
      url: payload.url || "/inbox",
    },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      "setAppBadge" in self.navigator
        ? self.navigator.setAppBadge().catch(() => undefined)
        : Promise.resolve(),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/inbox",
    self.location.origin,
  ).href;

  event.waitUntil(
    Promise.all([
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(async (windowClients) => {
          const existingClient = windowClients.find(
            (client) => new URL(client.url).origin === self.location.origin,
          );
          if (existingClient) {
            if ("navigate" in existingClient) {
              await existingClient.navigate(targetUrl);
            }
            return existingClient.focus();
          }
          return self.clients.openWindow(targetUrl);
        }),
      "clearAppBadge" in self.navigator
        ? self.navigator.clearAppBadge().catch(() => undefined)
        : Promise.resolve(),
    ]),
  );
});
