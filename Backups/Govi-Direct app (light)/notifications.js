(() => {
  'use strict';

  const STORAGE_KEY = 'goviDirectNotifications';
  const MAX_NOTIFICATIONS = 100;
  const POPUP_DURATION = 6000;

  let activePopupTimeout = null;

  function normalizeIdentity(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim().toLowerCase();
  }

  function getCurrentUserIdentities() {
    const identities = new Set();

    try {
      if (
        window.GoviDirectAuth &&
        typeof window.GoviDirectAuth.getCurrentUser === 'function'
      ) {
        const user = window.GoviDirectAuth.getCurrentUser();

        if (user && typeof user === 'object') {
          const possibleValues = [
            user.username,
            user.userName,
            user.accountName,
            user.name,
            user.displayName,
            user.email
          ];

          possibleValues.forEach(value => {
            const normalized = normalizeIdentity(value);

            if (normalized) {
              identities.add(normalized);
            }
          });
        }
      }
    } catch (error) {
      console.warn(
        'Could not read GoviDirectAuth user:',
        error
      );
    }

    try {
      const sessionRaw =
        localStorage.getItem('goviDirectSession');

      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);

        if (session && typeof session === 'object') {
          const possibleValues = [
            session.username,
            session.userName,
            session.accountName,
            session.name,
            session.displayName,
            session.email
          ];

          possibleValues.forEach(value => {
            const normalized = normalizeIdentity(value);

            if (normalized) {
              identities.add(normalized);
            }
          });
        }
      }
    } catch (error) {
      console.warn(
        'Could not read goviDirectSession:',
        error
      );
    }

    return identities;
  }

  function getNotificationRecipients(notification) {
    const recipients = [];

    if (!notification || typeof notification !== 'object') {
      return recipients;
    }

    if (
      notification.recipientUsername !== null &&
      notification.recipientUsername !== undefined
    ) {
      recipients.push(notification.recipientUsername);
    }

    if (
      notification.recipient !== null &&
      notification.recipient !== undefined
    ) {
      recipients.push(notification.recipient);
    }

    return recipients;
  }

  function notificationBelongsToIdentities(
    notification,
    identities
  ) {
    if (!notification) {
      return false;
    }

    const recipients =
      getNotificationRecipients(notification);

    if (recipients.length === 0) {
      return true;
    }

    for (const recipient of recipients) {
      const normalized =
        normalizeIdentity(recipient);

      if (
        normalized &&
        identities.has(normalized)
      ) {
        return true;
      }
    }

    return false;
  }

  function getStoredNotifications() {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error(
        'Failed to read notifications:',
        error
      );

      return [];
    }
  }

  function saveStoredNotifications(
    notifications
  ) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error(
        'Failed to save notifications:',
        error
      );
    }
  }

  function getNotifications() {
    const stored =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    if (identities.size === 0) {
      return stored.filter(
        notification =>
          getNotificationRecipients(notification)
            .length === 0
      );
    }

    return stored.filter(
      notification =>
        notificationBelongsToIdentities(
          notification,
          identities
        )
    );
  }

  function saveNotifications(
    notifications
  ) {
    const existing =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    const currentIds =
      new Set(
        notifications.map(
          notification => notification.id
        )
      );

    const preserved =
      existing.filter(notification => {
        if (
          currentIds.has(notification.id)
        ) {
          return false;
        }

        return !notificationBelongsToIdentities(
          notification,
          identities
        );
      });

    const combined = [
      ...notifications,
      ...preserved
    ];

    combined.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    saveStoredNotifications(
      combined.slice(
        0,
        MAX_NOTIFICATIONS
      )
    );
  }

  function createNotificationId() {
    return (
      'notification-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );
  }

  function addNotification({
    title,
    message,
    icon = 'notifications',
    type = 'general',
    data = null,
    recipient = null,
    recipientUsername = null,
    recipientAccountType = null
  }) {
    const resolvedRecipient =
      recipientUsername ||
      recipient ||
      null;

    const notification = {
      id: createNotificationId(),
      title:
        title || 'GoviDirect Notification',
      message:
        message || '',
      icon,
      type,
      data,
      recipient:
        resolvedRecipient,
      recipientUsername:
        recipientUsername || null,
      recipientAccountType:
        recipientAccountType || null,
      read: false,
      createdAt:
        new Date().toISOString()
    };

    const stored =
      getStoredNotifications();

    const updated = [
      notification,
      ...stored
    ].slice(
      0,
      MAX_NOTIFICATIONS
    );

    saveStoredNotifications(updated);

    const identities =
      getCurrentUserIdentities();

    if (
      notificationBelongsToIdentities(
        notification,
        identities
      )
    ) {
      showNativeNotification(
        notification
      );

      showNotificationPopup(
        notification
      );
    }

    updateBadge();
    renderNotifications();

    return notification;
  }

  function markAsRead(id) {
    const notifications =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    const updated =
      notifications.map(notification => {
        if (
          notification.id !== id
        ) {
          return notification;
        }

        if (
          !notificationBelongsToIdentities(
            notification,
            identities
          )
        ) {
          return notification;
        }

        return {
          ...notification,
          read: true
        };
      });

    saveStoredNotifications(updated);

    updateBadge();
    renderNotifications();
  }

  function markAllAsRead() {
    const notifications =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    const updated =
      notifications.map(notification => {
        if (
          !notificationBelongsToIdentities(
            notification,
            identities
          )
        ) {
          return notification;
        }

        return {
          ...notification,
          read: true
        };
      });

    saveStoredNotifications(updated);

    updateBadge();
    renderNotifications();
  }

  function deleteNotification(id) {
    const notifications =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    const updated =
      notifications.filter(notification => {
        if (
          notification.id !== id
        ) {
          return true;
        }

        return !notificationBelongsToIdentities(
          notification,
          identities
        );
      });

    saveStoredNotifications(updated);

    updateBadge();
    renderNotifications();
  }

  function clearNotifications() {
    saveNotifications([]);
    updateBadge();
    renderNotifications();
  }

  function getUnreadCount() {
    return getNotifications().filter(
      notification =>
        !notification.read
    ).length;
  }

  function formatTime(timestamp) {
    if (!timestamp) {
      return '';
    }

    const date =
      new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const seconds =
      Math.floor(
        difference / 1000
      );

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return (
        minutes +
        (minutes === 1
          ? ' minute ago'
          : ' minutes ago')
      );
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return (
        hours +
        (hours === 1
          ? ' hour ago'
          : ' hours ago')
      );
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return (
        days +
        (days === 1
          ? ' day ago'
          : ' days ago')
      );
    }

    return date.toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function injectStyles() {
    if (
      document.getElementById(
        'govi-notification-styles'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'govi-notification-styles';

    style.textContent = `
      .govi-notification-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .govi-notification-button {
        position: relative;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition:
          background-color 0.15s ease,
          transform 0.15s ease;
      }

      .govi-notification-button:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .govi-notification-button:active {
        transform: scale(0.94);
      }

      .govi-notification-badge {
        position: absolute;
        top: -2px;
        right: -3px;
        min-width: 17px;
        height: 17px;
        padding: 0 4px;
        border-radius: 999px;
        background: #d32f2f;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        line-height: 17px;
        text-align: center;
        border: 2px solid #ffffff;
        box-sizing: border-box;
      }

      .govi-notification-panel {
        position: fixed;
        top: 68px;
        right: 20px;
        width: min(390px, calc(100vw - 32px));
        max-height: 560px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow:
          0 18px 45px rgba(0, 0, 0, 0.15),
          0 4px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        z-index: 9999;
        display: none;
      }

      .govi-notification-panel.open {
        display: flex;
        flex-direction: column;
      }

      .govi-notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        background: #ffffff;
      }

      .govi-notification-header-title {
        margin: 0;
        color: #111827;
        font-size: 17px;
        font-weight: 700;
        white-space: nowrap;
      }

      .govi-notification-header-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .govi-notification-mark-read,
      .govi-notification-clear-all {
        border: 0;
        background: transparent;
        padding: 5px 0;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }

      .govi-notification-mark-read {
        color: #1b5e20;
      }

      .govi-notification-mark-read:hover {
        text-decoration: underline;
      }

      .govi-notification-clear-all {
        color: #b3261e;
      }

      .govi-notification-clear-all:hover {
        text-decoration: underline;
      }

      .govi-notification-list {
        overflow-y: auto;
        max-height: 490px;
      }

      .govi-notification-item {
        width: 100%;
        border: 0;
        border-bottom: 1px solid #f0f0f0;
        background: #ffffff;
        padding: 14px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        text-align: left;
        cursor: pointer;
        transition:
          background-color 0.15s ease;
      }

      .govi-notification-item:hover {
        background: #f8faf8;
      }

      .govi-notification-item:last-child {
        border-bottom: 0;
      }

      .govi-notification-item.unread {
        background: #f3f8f3;
      }

      .govi-notification-icon {
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: #e8f5e9;
        color: #1b5e20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .govi-notification-icon .material-symbols-outlined {
        font-size: 20px;
      }

      .govi-notification-content {
        min-width: 0;
        flex: 1;
      }

      .govi-notification-item-title {
        margin: 0 0 3px;
        color: #111827;
        font-size: 14px;
        font-weight: 700;
      }

      .govi-notification-message {
        margin: 0;
        color: #4b5563;
        font-size: 13px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .govi-notification-time {
        margin-top: 6px;
        color: #9ca3af;
        font-size: 11px;
      }

      .govi-notification-unread-dot {
        flex: 0 0 7px;
        width: 7px;
        height: 7px;
        margin-top: 7px;
        border-radius: 50%;
        background: #1b5e20;
      }

      .govi-notification-empty {
        padding: 42px 20px;
        text-align: center;
        color: #6b7280;
      }

      .govi-notification-empty-icon {
        margin-bottom: 8px;
        color: #9ca3af;
      }

      .govi-notification-empty-icon .material-symbols-outlined {
        font-size: 36px;
      }

      .govi-notification-empty-title {
        margin: 0 0 4px;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
      }

      .govi-notification-empty-message {
        margin: 0;
        font-size: 12px;
      }

      .govi-notification-toast {
        position: fixed;
        top: 82px;
        right: 20px;
        width: min(400px, calc(100vw - 32px));
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 15px;
        background: #ffffff;
        border: 1px solid #dfe5df;
        border-radius: 14px;
        box-shadow:
          0 16px 40px rgba(0, 0, 0, 0.16),
          0 4px 12px rgba(0, 0, 0, 0.08);
        z-index: 10000;
        opacity: 0;
        transform: translateY(-12px);
        pointer-events: none;
        transition:
          opacity 0.2s ease,
          transform 0.2s ease;
      }

      .govi-notification-toast.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .govi-notification-toast-icon {
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: #e8f5e9;
        color: #1b5e20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .govi-notification-toast-icon .material-symbols-outlined {
        font-size: 21px;
      }

      .govi-notification-toast-content {
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }

      .govi-notification-toast-title {
        margin: 0 0 3px;
        color: #111827;
        font-size: 14px;
        font-weight: 700;
      }

      .govi-notification-toast-message {
        margin: 0;
        color: #4b5563;
        font-size: 13px;
        line-height: 1.45;
      }

      .govi-notification-toast-action {
        margin-top: 7px;
        color: #1b5e20;
        font-size: 11px;
        font-weight: 600;
      }

      .govi-notification-toast-close {
        flex: 0 0 auto;
        width: 26px;
        height: 26px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .govi-notification-toast-close:hover {
        background: #f3f4f6;
      }

      .govi-notification-toast-close .material-symbols-outlined {
        font-size: 18px;
      }

      @media (max-width: 640px) {
        .govi-notification-panel {
          top: 60px;
          right: 10px;
          width: calc(100vw - 20px);
          max-height: calc(100vh - 80px);
        }

        .govi-notification-list {
          max-height: calc(100vh - 145px);
        }

        .govi-notification-header {
          padding: 13px;
        }

        .govi-notification-header-actions {
          gap: 6px;
        }

        .govi-notification-mark-read,
        .govi-notification-clear-all {
          font-size: 11px;
        }

        .govi-notification-toast {
          top: 70px;
          right: 10px;
          width: calc(100vw - 20px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createPanel() {
    let panel =
      document.getElementById(
        'govi-notification-panel'
      );

    if (panel) {
      return panel;
    }

    panel =
      document.createElement('div');

    panel.id =
      'govi-notification-panel';

    panel.className =
      'govi-notification-panel';

    panel.setAttribute(
      'aria-hidden',
      'true'
    );

    panel.innerHTML = `
      <div class="govi-notification-header">
        <h2 class="govi-notification-header-title">
          Notifications
        </h2>

        <div class="govi-notification-header-actions">
          <button
            id="govi-mark-all-notifications-read"
            class="govi-notification-mark-read"
            type="button"
          >
            Mark all as read
          </button>

          <button
            id="govi-clear-all-notifications"
            class="govi-notification-clear-all"
            type="button"
          >
            Clear all
          </button>
        </div>
      </div>

      <div
        id="govi-notification-list"
        class="govi-notification-list"
      ></div>
    `;

    document.body.appendChild(panel);

    const markAllButton =
      panel.querySelector(
        '#govi-mark-all-notifications-read'
      );

    if (markAllButton) {
      markAllButton.addEventListener(
        'click',
        event => {
          event.preventDefault();
          event.stopPropagation();

          markAllAsRead();
        }
      );
    }

    const clearAllButton =
      panel.querySelector(
        '#govi-clear-all-notifications'
      );

    if (clearAllButton) {
      clearAllButton.addEventListener(
        'click',
        event => {
          event.preventDefault();
          event.stopPropagation();

          clearNotifications();
        }
      );
    }

    return panel;
  }

  function renderNotifications() {
    const list =
      document.getElementById(
        'govi-notification-list'
      );

    if (!list) {
      return;
    }

    const notifications =
      getNotifications();

    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="govi-notification-empty">
          <div class="govi-notification-empty-icon">
            <span class="material-symbols-outlined">
              notifications_none
            </span>
          </div>

          <p class="govi-notification-empty-title">
            No notifications
          </p>

          <p class="govi-notification-empty-message">
            You're all caught up.
          </p>
        </div>
      `;

      return;
    }

    list.innerHTML =
      notifications
        .map(notification => {
          const unread =
            !notification.read;

          const icon =
            notification.icon ||
            'notifications';

          return `
            <button
              type="button"
              class="govi-notification-item ${
                unread ? 'unread' : ''
              }"
              data-notification-id="${escapeHTML(
                notification.id
              )}"
            >
              <div class="govi-notification-icon">
                <span class="material-symbols-outlined">
                  ${escapeHTML(icon)}
                </span>
              </div>

              <div class="govi-notification-content">
                <p class="govi-notification-item-title">
                  ${escapeHTML(
                    notification.title
                  )}
                </p>

                <p class="govi-notification-message">
                  ${escapeHTML(
                    notification.message
                  )}
                </p>

                <div class="govi-notification-time">
                  ${escapeHTML(
                    formatTime(
                      notification.createdAt
                    )
                  )}
                </div>
              </div>

              ${
                unread
                  ? `
                    <div
                      class="govi-notification-unread-dot"
                      aria-label="Unread"
                    ></div>
                  `
                  : ''
              }
            </button>
          `;
        })
        .join('');

    list
      .querySelectorAll(
        '.govi-notification-item'
      )
      .forEach(item => {
        item.addEventListener(
          'click',
          () => {
            const id =
              item.dataset.notificationId;

            if (!id) {
              return;
            }

            markAsRead(id);

            const panel =
              document.getElementById(
                'govi-notification-panel'
              );

            if (panel) {
              panel.classList.remove(
                'open'
              );

              panel.setAttribute(
                'aria-hidden',
                'true'
              );
            }
          }
        );
      });
  }

  function updateBadge() {
    const badge =
      document.getElementById(
        'govi-notification-badge'
      );

    if (!badge) {
      return;
    }

    const unreadCount =
      getUnreadCount();

    if (unreadCount <= 0) {
      badge.style.display = 'none';
      badge.textContent = '';
      return;
    }

    badge.style.display = 'block';

    badge.textContent =
      unreadCount > 99
        ? '99+'
        : String(unreadCount);
  }

  function togglePanel(force) {
    const panel =
      document.getElementById(
        'govi-notification-panel'
      );

    if (!panel) {
      return;
    }

    const button =
      document.getElementById(
        'govi-notification-button'
      );

    const shouldOpen =
      typeof force === 'boolean'
        ? force
        : !panel.classList.contains(
            'open'
          );

    if (shouldOpen) {
      renderNotifications();

      panel.classList.add('open');

      panel.setAttribute(
        'aria-hidden',
        'false'
      );

      if (button) {
        button.setAttribute(
          'aria-expanded',
          'true'
        );
      }
    } else {
      panel.classList.remove('open');

      panel.setAttribute(
        'aria-hidden',
        'true'
      );

      if (button) {
        button.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    }
  }

  function createButton() {
    const profileButton =
      document.getElementById(
        'profile-button'
      );

    if (!profileButton) {
      return null;
    }

    let wrapper =
      document.getElementById(
        'govi-notification-wrapper'
      );

    if (wrapper) {
      return wrapper;
    }

    wrapper =
      document.createElement('div');

    wrapper.id =
      'govi-notification-wrapper';

    wrapper.className =
      'govi-notification-wrapper';

    const button =
      document.createElement('button');

    button.id =
      'govi-notification-button';

    button.className =
      'govi-notification-button';

    button.type = 'button';

    button.setAttribute(
      'aria-label',
      'Notifications'
    );

    button.setAttribute(
      'aria-expanded',
      'false'
    );

    button.setAttribute(
      'aria-controls',
      'govi-notification-panel'
    );

    button.innerHTML = `
      <span class="material-symbols-outlined">
        notifications
      </span>

      <span
        id="govi-notification-badge"
        class="govi-notification-badge"
        style="display: none;"
      ></span>
    `;

    button.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        togglePanel();
      }
    );

    wrapper.appendChild(button);

    profileButton.parentNode.insertBefore(
      wrapper,
      profileButton
    );

    return wrapper;
  }

  function closeWhenClickingOutside(
    event
  ) {
    const panel =
      document.getElementById(
        'govi-notification-panel'
      );

    const button =
      document.getElementById(
        'govi-notification-button'
      );

    if (!panel || !button) {
      return;
    }

    if (
      !panel.classList.contains('open')
    ) {
      return;
    }

    if (
      panel.contains(event.target) ||
      button.contains(event.target)
    ) {
      return;
    }

    togglePanel(false);
  }

  function showNativeNotification(
    notification
  ) {
    if (!notification) {
      return;
    }

    const title =
      notification.title ||
      'GoviDirect';

    const message =
      notification.message || '';

    try {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.notify ===
          'function'
      ) {
        window.pywebview.api
          .notify(title, message)
          .catch?.(() => {});

        return;
      }
    } catch (error) {
      console.warn(
        'pywebview notification failed:',
        error
      );
    }

    try {
      if (
        window.Capacitor &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins
          .LocalNotifications
      ) {
        const localNotifications =
          window.Capacitor.Plugins
            .LocalNotifications;

        if (
          typeof localNotifications.schedule ===
          'function'
        ) {
          localNotifications.schedule({
            notifications: [
              {
                id:
                  Math.floor(
                    Math.random() *
                      2147483647
                  ),
                title,
                body: message
              }
            ]
          });

          return;
        }
      }
    } catch (error) {
      console.warn(
        'Capacitor notification failed:',
        error
      );
    }

    try {
      if (
        'Notification' in window &&
        Notification.permission ===
          'granted'
      ) {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.warn(
        'Browser notification failed:',
        error
      );
    }
  }

  async function requestPermission() {
    if (
      !('Notification' in window)
    ) {
      return 'unsupported';
    }

    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.warn(
        'Notification permission request failed:',
        error
      );

      return 'denied';
    }
  }

  function closeNotificationPopup() {
    const popup =
      document.getElementById(
        'govi-notification-toast'
      );

    if (popup) {
      popup.remove();
    }

    if (activePopupTimeout) {
      clearTimeout(
        activePopupTimeout
      );

      activePopupTimeout = null;
    }
  }

  function showNotificationPopup(
    notification
  ) {
    if (!notification) {
      return;
    }

    const identities =
      getCurrentUserIdentities();

    if (
      !notificationBelongsToIdentities(
        notification,
        identities
      )
    ) {
      return;
    }

    injectStyles();
    closeNotificationPopup();

    const popup =
      document.createElement('div');

    popup.id =
      'govi-notification-toast';

    popup.className =
      'govi-notification-toast';

    const icon =
      notification.icon ||
      'notifications';

    popup.innerHTML = `
      <div class="govi-notification-toast-icon">
        <span class="material-symbols-outlined">
          ${escapeHTML(icon)}
        </span>
      </div>

      <div class="govi-notification-toast-content">
        <p class="govi-notification-toast-title">
          ${escapeHTML(
            notification.title
          )}
        </p>

        <p class="govi-notification-toast-message">
          ${escapeHTML(
            notification.message
          )}
        </p>

        <div class="govi-notification-toast-action">
          Click to view notifications
        </div>
      </div>

      <button
        type="button"
        class="govi-notification-toast-close"
        aria-label="Close notification"
      >
        <span class="material-symbols-outlined">
          close
        </span>
      </button>
    `;

    document.body.appendChild(popup);

    const content =
      popup.querySelector(
        '.govi-notification-toast-content'
      );

    if (content) {
      content.addEventListener(
        'click',
        () => {
          markAsRead(
            notification.id
          );

          togglePanel(true);

          closeNotificationPopup();
        }
      );
    }

    const closeButton =
      popup.querySelector(
        '.govi-notification-toast-close'
      );

    if (closeButton) {
      closeButton.addEventListener(
        'click',
        event => {
          event.preventDefault();
          event.stopPropagation();

          closeNotificationPopup();
        }
      );
    }

    requestAnimationFrame(() => {
      popup.classList.add('visible');
    });

    activePopupTimeout =
      setTimeout(() => {
        closeNotificationPopup();
      }, POPUP_DURATION);
  }

  window.addEventListener(
    'storage',
    event => {
      if (
        event.key !== STORAGE_KEY
      ) {
        return;
      }

      if (!event.newValue) {
        updateBadge();
        renderNotifications();
        return;
      }

      let newNotifications = [];

      try {
        const parsed =
          JSON.parse(event.newValue);

        if (Array.isArray(parsed)) {
          newNotifications = parsed;
        }
      } catch (error) {
        console.warn(
          'Could not parse notification storage event:',
          error
        );
      }

      let previousNotifications = [];

      try {
        if (event.oldValue) {
          const parsed =
            JSON.parse(event.oldValue);

          if (Array.isArray(parsed)) {
            previousNotifications =
              parsed;
          }
        }
      } catch (error) {
        console.warn(
          'Could not parse previous notification storage:',
          error
        );
      }

      const previousIds =
        new Set(
          previousNotifications.map(
            notification =>
              notification.id
          )
        );

      const identities =
        getCurrentUserIdentities();

      const newlyAdded =
        newNotifications.filter(
          notification =>
            !previousIds.has(
              notification.id
            )
        );

      newlyAdded.forEach(
        notification => {
          if (
            notificationBelongsToIdentities(
              notification,
              identities
            )
          ) {
            showNotificationPopup(
              notification
            );
          }
        }
      );

      updateBadge();
      renderNotifications();
    }
  );

  function init() {
    const header =
      document.querySelector('header');

    const profileButton =
      document.getElementById(
        'profile-button'
      );

    if (!header || !profileButton) {
      return;
    }

    injectStyles();
    createPanel();
    createButton();
    updateBadge();
    renderNotifications();

    if (
      document.documentElement.dataset
        .goviNotificationsOutsideClick !==
      'true'
    ) {
      document.addEventListener(
        'click',
        closeWhenClickingOutside
      );

      document.documentElement.dataset
        .goviNotificationsOutsideClick =
        'true';
    }
  }

  window.GoviDirectNotifications = {
    add: addNotification,
    getAll: getNotifications,
    markAsRead,
    markAllAsRead,
    delete: deleteNotification,
    clear: clearNotifications,
    getUnreadCount,
    requestPermission
  };

  document.addEventListener(
    'pageLoaded',
    () => {
      setTimeout(() => {
        init();
      }, 0);
    }
  );

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();