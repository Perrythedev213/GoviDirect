(() => {
  'use strict';

  const STORAGE_KEY = 'goviDirectNotifications';
  const MAX_NOTIFICATIONS = 100;

  /*
   * =========================================================
   * IDENTITY
   * =========================================================
   */

  const normalizeIdentity = value => {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  };

  const getCurrentUserIdentities = () => {
    const identities = new Set();

    const addIdentity = value => {
      const identity = normalizeIdentity(value);

      if (identity) {
        identities.add(identity);
      }
    };

    try {
      if (
        window.GoviDirectAuth &&
        typeof window.GoviDirectAuth.getCurrentUser === 'function'
      ) {
        const user =
          window.GoviDirectAuth.getCurrentUser();

        if (user) {
          addIdentity(user.username);
          addIdentity(user.userName);
          addIdentity(user.accountName);
          addIdentity(user.name);
          addIdentity(user.displayName);
          addIdentity(user.email);
        }
      }
    } catch (error) {
      console.error(
        'Failed to resolve current user:',
        error
      );
    }

    if (!identities.size) {
      try {
        const rawSession =
          localStorage.getItem(
            'goviDirectSession'
          );

        if (rawSession) {
          const session =
            JSON.parse(rawSession);

          if (session) {
            addIdentity(session.username);
            addIdentity(session.userName);
            addIdentity(session.accountName);
            addIdentity(session.name);
            addIdentity(session.displayName);
            addIdentity(session.email);
          }
        }
      } catch (error) {
        console.error(
          'Failed to resolve stored session:',
          error
        );
      }
    }

    return identities;
  };

  /*
   * =========================================================
   * STORAGE
   * =========================================================
   */

  const getStoredNotifications = () => {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      );

      return [];
    }
  };

  const saveStoredNotifications = notifications => {
    try {
      const limited =
        Array.isArray(notifications)
          ? notifications.slice(
              0,
              MAX_NOTIFICATIONS
            )
          : [];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(limited)
      );

      window.dispatchEvent(
        new CustomEvent(
          'goviDirectNotificationsUpdated'
        )
      );
    } catch (error) {
      console.error(
        'Failed to save notifications:',
        error
      );
    }
  };

  /*
   * =========================================================
   * RECIPIENT HANDLING
   * =========================================================
   */

  const getNotificationRecipients =
    notification => {
      if (!notification) {
        return [];
      }

      const recipients = [];

      if (
        notification.recipientUsername !==
          undefined &&
        notification.recipientUsername !==
          null &&
        notification.recipientUsername !== ''
      ) {
        recipients.push(
          notification.recipientUsername
        );
      }

      if (
        notification.recipient !==
          undefined &&
        notification.recipient !==
          null &&
        notification.recipient !== ''
      ) {
        if (
          Array.isArray(
            notification.recipient
          )
        ) {
          recipients.push(
            ...notification.recipient
          );
        } else {
          recipients.push(
            notification.recipient
          );
        }
      }

      return recipients;
    };

  const notificationBelongsToIdentities =
    (
      notification,
      identities
    ) => {
      if (!notification) {
        return false;
      }

      const recipients =
        getNotificationRecipients(
          notification
        );

      /*
       * No recipient means this is a
       * global notification.
       */
      if (!recipients.length) {
        return true;
      }

      return recipients.some(
        recipient => {
          const normalized =
            normalizeIdentity(
              recipient
            );

          return (
            normalized &&
            identities.has(
              normalized
            )
          );
        }
      );
    };

  const getNotifications = () => {
    const notifications =
      getStoredNotifications();

    const identities =
      getCurrentUserIdentities();

    /*
     * If nobody is logged in,
     * only display global notifications.
     */
    if (!identities.size) {
      return notifications.filter(
        notification =>
          getNotificationRecipients(
            notification
          ).length === 0
      );
    }

    return notifications.filter(
      notification =>
        notificationBelongsToIdentities(
          notification,
          identities
        )
    );
  };

  /*
   * Save notifications belonging to
   * the current account while preserving
   * other accounts' notifications.
   */
  const saveNotifications =
    notifications => {
      const stored =
        getStoredNotifications();

      const identities =
        getCurrentUserIdentities();

      /*
       * No identifiable account:
       * preserve legacy behaviour.
       */
      if (!identities.size) {
        saveStoredNotifications(
          notifications
        );

        return;
      }

      const otherNotifications =
        stored.filter(
          notification => {
            const recipients =
              getNotificationRecipients(
                notification
              );

            /*
             * Global notifications
             * are always preserved.
             */
            if (!recipients.length) {
              return true;
            }

            /*
             * Keep notifications belonging
             * to other accounts.
             */
            return !notificationBelongsToIdentities(
              notification,
              identities
            );
          }
        );

      saveStoredNotifications([
        ...notifications,
        ...otherNotifications
      ]);
    };

  /*
   * =========================================================
   * CREATION
   * =========================================================
   */

  const createId = () => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  };

  const addNotification = ({
    title,
    message,
    icon = 'notifications',
    type = 'general',
    data = null,
    recipient = null,
    recipientUsername = null,
    recipientAccountType = null
  } = {}) => {
    if (!title || !message) {
      return null;
    }

    const resolvedRecipient =
      recipientUsername ||
      recipient ||
      null;

    const notifications =
      getStoredNotifications();

    const notification = {
      id: createId(),

      title: String(title),

      message: String(message),

      icon: String(
        icon || 'notifications'
      ),

      type: String(
        type || 'general'
      ),

      data,

      recipient:
        resolvedRecipient,

      recipientUsername:
        recipientUsername ||
        null,

      recipientAccountType:
        recipientAccountType ||
        null,

      read: false,

      createdAt:
        new Date().toISOString()
    };

    notifications.unshift(
      notification
    );

    saveStoredNotifications(
      notifications
    );

    /*
     * Native notification only appears
     * if it belongs to the current account
     * or is global.
     */
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
    }

    return notification;
  };

  /*
   * =========================================================
   * CRUD
   * =========================================================
   */

  const markAsRead = id => {
    if (!id) {
      return;
    }

    const notifications =
      getNotifications();

    const updated =
      notifications.map(
        notification => {
          if (
            notification.id !== id
          ) {
            return notification;
          }

          return {
            ...notification,
            read: true
          };
        }
      );

    saveNotifications(
      updated
    );
  };

  const markAllAsRead = () => {
    const notifications =
      getNotifications();

    const updated =
      notifications.map(
        notification => ({
          ...notification,
          read: true
        })
      );

    saveNotifications(
      updated
    );
  };

  const deleteNotification = id => {
    if (!id) {
      return;
    }

    const notifications =
      getNotifications();

    const updated =
      notifications.filter(
        notification =>
          notification.id !== id
      );

    saveNotifications(
      updated
    );
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  const getUnreadCount = () => {
    return getNotifications().filter(
      notification =>
        !notification.read
    ).length;
  };

  /*
   * =========================================================
   * DISPLAY HELPERS
   * =========================================================
   */

  const formatTime = timestamp => {
    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    const difference =
      Date.now() -
      date.getTime();

    const minute =
      60 * 1000;

    const hour =
      60 * minute;

    const day =
      24 * hour;

    if (difference < minute) {
      return 'Just now';
    }

    if (difference < hour) {
      return `${Math.floor(
        difference / minute
      )}m ago`;
    }

    if (difference < day) {
      return `${Math.floor(
        difference / hour
      )}h ago`;
    }

    if (difference < 7 * day) {
      return `${Math.floor(
        difference / day
      )}d ago`;
    }

    return date.toLocaleDateString();
  };

  const escapeHTML = value => {
    const element =
      document.createElement(
        'div'
      );

    element.textContent =
      String(value ?? '');

    return element.innerHTML;
  };

  /*
   * =========================================================
   * STYLES
   * =========================================================
   */

  const injectStyles = () => {
    if (
      document.getElementById(
        'govi-direct-notification-styles'
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        'style'
      );

    style.id =
      'govi-direct-notification-styles';

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
        padding: 0;
        border-radius: 999px;
        background: transparent;
        color: #1b5e20;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          background 0.15s ease,
          transform 0.15s ease;
      }

      .govi-notification-button:hover {
        background: rgba(27, 94, 32, 0.08);
      }

      .govi-notification-button:active {
        transform: scale(0.94);
      }

      .govi-notification-button
        .material-symbols-outlined {
        font-size: 21px;
      }

      .govi-notification-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: #b3261e;
        color: white;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 9px;
        line-height: 16px;
        font-weight: 800;
        text-align: center;
        border: 2px solid white;
        box-sizing: content-box;
      }

      .govi-notification-badge.hidden {
        display: none;
      }

      .govi-notification-panel {
        position: fixed;
        top: calc(
          64px +
          env(
            safe-area-inset-top,
            0px
          )
        );
        right: 16px;
        width: min(
          380px,
          calc(100vw - 32px)
        );
        max-height: min(
          560px,
          calc(100vh - 96px)
        );
        background: white;
        border-radius: 18px;
        box-shadow:
          0 12px 40px
            rgba(0, 0, 0, 0.16),
          0 2px 8px
            rgba(0, 0, 0, 0.08);
        z-index: 9999;
        overflow: hidden;
        display: none;
        flex-direction: column;
      }

      .govi-notification-panel.open {
        display: flex;
      }

      .govi-notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid #eeeeee;
        flex-shrink: 0;
      }

      .govi-notification-title {
        margin: 0;
        color: #1b1b1b;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 17px;
        font-weight: 800;
      }

      .govi-notification-mark-read {
        border: 0;
        background: transparent;
        color: #1b5e20;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        padding: 5px;
      }

      .govi-notification-list {
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .govi-notification-item {
        width: 100%;
        border: 0;
        border-bottom: 1px solid #f1f1f1;
        background: white;
        padding: 14px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        text-align: left;
        cursor: pointer;
        transition:
          background 0.15s ease;
      }

      .govi-notification-item:hover {
        background: #f8faf8;
      }

      .govi-notification-item.unread {
        background: #f2f8f2;
      }

      .govi-notification-icon {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        border-radius: 12px;
        background:
          rgba(27, 94, 32, 0.10);
        color: #1b5e20;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .govi-notification-icon
        .material-symbols-outlined {
        font-size: 20px;
      }

      .govi-notification-content {
        min-width: 0;
        flex: 1;
      }

      .govi-notification-item-title {
        margin: 0 0 3px;
        color: #202020;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 13px;
        line-height: 18px;
        font-weight: 800;
      }

      .govi-notification-message {
        margin: 0;
        color: #686868;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 11px;
        line-height: 16px;
      }

      .govi-notification-time {
        display: block;
        margin-top: 5px;
        color: #929292;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
        font-size: 9px;
        font-weight: 600;
      }

      .govi-notification-unread-dot {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        margin-top: 5px;
        border-radius: 50%;
        background: #1b5e20;
      }

      .govi-notification-empty {
        padding: 50px 24px;
        text-align: center;
        color: #777;
        font-family:
          "Plus Jakarta Sans",
          sans-serif;
      }

      .govi-notification-empty
        .material-symbols-outlined {
        display: block;
        margin-bottom: 10px;
        font-size: 40px;
        color: #b5b5b5;
      }

      .govi-notification-empty-title {
        margin-bottom: 5px;
        color: #303030;
        font-size: 14px;
        font-weight: 800;
      }

      .govi-notification-empty-text {
        font-size: 11px;
        line-height: 16px;
      }

      @media (max-width: 640px) {
        .govi-notification-panel {
          top: calc(
            60px +
            env(
              safe-area-inset-top,
              0px
            )
          );
          right: 10px;
          width: calc(100vw - 20px);
          max-height: calc(
            100vh - 80px
          );
          border-radius: 16px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  };

  /*
   * =========================================================
   * PANEL
   * =========================================================
   */

  const createPanel = () => {
    let panel =
      document.getElementById(
        'govi-notification-panel'
      );

    if (panel) {
      return panel;
    }

    panel =
      document.createElement(
        'div'
      );

    panel.id =
      'govi-notification-panel';

    panel.className =
      'govi-notification-panel';

    panel.innerHTML = `
      <div class="govi-notification-header">

        <h2 class="govi-notification-title">
          Notifications
        </h2>

        <button
          type="button"
          class="govi-notification-mark-read"
          id="govi-mark-all-notifications-read"
        >
          Mark all as read
        </button>

      </div>

      <div
        class="govi-notification-list"
        id="govi-notification-list"
      ></div>
    `;

    document.body.appendChild(
      panel
    );

    const markReadButton =
      panel.querySelector(
        '#govi-mark-all-notifications-read'
      );

    if (markReadButton) {
      markReadButton.addEventListener(
        'click',
        event => {
          event.preventDefault();
          event.stopPropagation();

          markAllAsRead();
          renderNotifications();
        }
      );
    }

    return panel;
  };

  /*
   * =========================================================
   * RENDERING
   * =========================================================
   */

  const renderNotifications = () => {
    const list =
      document.getElementById(
        'govi-notification-list'
      );

    if (!list) {
      return;
    }

    const notifications =
      getNotifications();

    if (!notifications.length) {
      list.innerHTML = `
        <div class="govi-notification-empty">

          <span class="material-symbols-outlined">
            notifications_none
          </span>

          <div class="govi-notification-empty-title">
            No notifications yet
          </div>

          <div class="govi-notification-empty-text">
            We'll let you know when something
            important happens.
          </div>

        </div>
      `;

      return;
    }

    list.innerHTML =
      notifications
        .map(
          notification => {
            const id =
              escapeHTML(
                notification.id
              );

            const title =
              escapeHTML(
                notification.title
              );

            const message =
              escapeHTML(
                notification.message
              );

            const icon =
              escapeHTML(
                notification.icon ||
                  'notifications'
              );

            const time =
              escapeHTML(
                formatTime(
                  notification.createdAt
                )
              );

            const unreadClass =
              notification.read
                ? ''
                : 'unread';

            const unreadDot =
              notification.read
                ? ''
                : `
                    <span
                      class="govi-notification-unread-dot"
                    ></span>
                  `;

            return `
              <button
                type="button"
                class="
                  govi-notification-item
                  ${unreadClass}
                "
                data-notification-id="${id}"
              >

                <div class="govi-notification-icon">
                  <span class="material-symbols-outlined">
                    ${icon}
                  </span>
                </div>

                <div class="govi-notification-content">

                  <p class="govi-notification-item-title">
                    ${title}
                  </p>

                  <p class="govi-notification-message">
                    ${message}
                  </p>

                  <span class="govi-notification-time">
                    ${time}
                  </span>

                </div>

                ${unreadDot}

              </button>
            `;
          }
        )
        .join('');

    list
      .querySelectorAll(
        '.govi-notification-item'
      )
      .forEach(item => {
        item.addEventListener(
          'click',
          event => {
            event.preventDefault();
            event.stopPropagation();

            const id =
              item.dataset
                .notificationId;

            markAsRead(id);

            renderNotifications();
          }
        );
      });
  };

  /*
   * =========================================================
   * BADGE
   * =========================================================
   */

  const updateBadge = () => {
    const badge =
      document.getElementById(
        'govi-notification-badge'
      );

    if (!badge) {
      return;
    }

    const unread =
      getUnreadCount();

    if (!unread) {
      badge.classList.add(
        'hidden'
      );

      badge.textContent = '';

      return;
    }

    badge.classList.remove(
      'hidden'
    );

    badge.textContent =
      unread > 99
        ? '99+'
        : String(unread);
  };

  /*
   * =========================================================
   * PANEL OPEN / CLOSE
   * =========================================================
   */

  const togglePanel = force => {
    const panel =
      document.getElementById(
        'govi-notification-panel'
      );

    if (!panel) {
      return;
    }

    const shouldOpen =
      typeof force === 'boolean'
        ? force
        : !panel.classList.contains(
            'open'
          );

    panel.classList.toggle(
      'open',
      shouldOpen
    );

    const button =
      document.getElementById(
        'govi-notification-button'
      );

    if (button) {
      button.setAttribute(
        'aria-expanded',
        String(shouldOpen)
      );
    }

    if (shouldOpen) {
      renderNotifications();
    }
  };

  /*
   * =========================================================
   * BUTTON
   * =========================================================
   */

  const createButton = () => {
    const profileButton =
      document.getElementById(
        'profile-button'
      );

    if (!profileButton) {
      return;
    }

    const existingButton =
      document.getElementById(
        'govi-notification-button'
      );

    if (existingButton) {
      return;
    }

    const parent =
      profileButton.parentElement;

    if (!parent) {
      return;
    }

    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.className =
      'govi-notification-wrapper';

    wrapper.innerHTML = `
      <button
        type="button"
        id="govi-notification-button"
        class="govi-notification-button"
        aria-label="Notifications"
        aria-expanded="false"
      >

        <span class="material-symbols-outlined">
          notifications
        </span>

        <span
          id="govi-notification-badge"
          class="govi-notification-badge hidden"
        ></span>

      </button>
    `;

    parent.insertBefore(
      wrapper,
      profileButton
    );

    const button =
      document.getElementById(
        'govi-notification-button'
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        togglePanel();
      }
    );
  };

  /*
   * =========================================================
   * OUTSIDE CLICK
   * =========================================================
   */

  const closeWhenClickingOutside =
    event => {
      const panel =
        document.getElementById(
          'govi-notification-panel'
        );

      const button =
        document.getElementById(
          'govi-notification-button'
        );

      if (
        !panel ||
        !panel.classList.contains(
          'open'
        )
      ) {
        return;
      }

      if (
        panel.contains(
          event.target
        ) ||
        button?.contains(
          event.target
        )
      ) {
        return;
      }

      togglePanel(false);
    };

  /*
   * =========================================================
   * NATIVE NOTIFICATIONS
   * =========================================================
   */

  const showNativeNotification =
    notification => {
      /*
       * pywebview
       */
      try {
        if (
          window.pywebview &&
          window.pywebview.api &&
          typeof window.pywebview.api
            .notify === 'function'
        ) {
          const result =
            window.pywebview.api.notify(
              notification.title,
              notification.message
            );

          if (
            result &&
            typeof result.catch ===
              'function'
          ) {
            result.catch(() => {});
          }
        }
      } catch (error) {
        console.error(
          'pywebview notification failed:',
          error
        );
      }

      /*
       * Capacitor
       */
      try {
        if (
          window.Capacitor &&
          window.Capacitor.Plugins &&
          window.Capacitor.Plugins
            .LocalNotifications
        ) {
          const plugin =
            window.Capacitor.Plugins
              .LocalNotifications;

          const result =
            plugin.schedule({
              notifications: [
                {
                  id: Math.floor(
                    Date.now() %
                      2147483647
                  ),

                  title:
                    notification.title,

                  body:
                    notification.message,

                  extra:
                    notification.data ||
                    {}
                }
              ]
            });

          if (
            result &&
            typeof result.catch ===
              'function'
          ) {
            result.catch(
              error => {
                console.error(
                  'Capacitor notification failed:',
                  error
                );
              }
            );
          }
        }
      } catch (error) {
        console.error(
          'Capacitor notification failed:',
          error
        );
      }

      /*
       * Browser
       */
      try {
        if (
          'Notification' in window &&
          Notification.permission ===
            'granted'
        ) {
          new Notification(
            notification.title,
            {
              body:
                notification.message
            }
          );
        }
      } catch (error) {
        console.error(
          'Browser notification failed:',
          error
        );
      }
    };

  const requestPermission =
    async () => {
      if (
        !('Notification' in window)
      ) {
        return 'unsupported';
      }

      if (
        Notification.permission ===
        'granted'
      ) {
        return 'granted';
      }

      if (
        Notification.permission ===
        'denied'
      ) {
        return 'denied';
      }

      try {
        return await Notification.requestPermission();
      } catch (error) {
        console.error(
          'Notification permission failed:',
          error
        );

        return 'denied';
      }
    };

  /*
   * =========================================================
   * INITIALIZATION
   * =========================================================
   */

  const init = () => {
    const header =
      document.querySelector(
        'header'
      );

    const profileButton =
      document.getElementById(
        'profile-button'
      );

    /*
     * The notification system requires
     * a header/profile button.
     */
    if (
      !header ||
      !profileButton
    ) {
      return;
    }

    injectStyles();

    createPanel();

    createButton();

    updateBadge();

    renderNotifications();

    /*
     * Install outside-click handler
     * exactly once.
     */
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
  };

  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GoviDirectNotifications = {
    add:
      addNotification,

    getAll:
      getNotifications,

    markAsRead,

    markAllAsRead,

    delete:
      deleteNotification,

    clear:
      clearNotifications,

    getUnreadCount,

    requestPermission
  };

  /*
   * =========================================================
   * STORAGE UPDATE LISTENER
   * =========================================================
   */

  window.addEventListener(
    'goviDirectNotificationsUpdated',
    () => {
      updateBadge();
      renderNotifications();
    }
  );

  /*
   * =========================================================
   * SPA PAGE LOADING
   * =========================================================
   */

  document.addEventListener(
    'pageLoaded',
    () => {
      /*
       * Give the router time to replace
       * #app-content before rebuilding
       * the notification button.
       */
      setTimeout(
        () => {
          init();
        },
        0
      );
    }
  );

  /*
   * =========================================================
   * INITIAL PAGE
   * =========================================================
   */

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