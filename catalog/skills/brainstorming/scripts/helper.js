// Page-side script of the brainstorm companion. The server injects it into every page it serves.
// It holds a WebSocket open to the server, sends the viewer's clicks as events, and reloads the page when the
// server says a screen was added or changed.
(() => {
  const FIRST_RETRY_MS = 500;
  const LONGEST_RETRY_MS = 30000;
  const NOTICE_AFTER_MS = 15000; // offline this long: cover the page with the "paused" notice

  // The wait that follows `current` in the retry sequence: double it, but never past `longest`.
  const nextReconnectDelay = (current, longest) => Math.min(longest, current * 2);

  // A unit test can load this file under Node; export the pure parts there.
  if (typeof module === 'object' && module && module.exports) {
    Object.assign(module.exports, {
      nextReconnectDelay,
      MIN_RECONNECT_MS: FIRST_RETRY_MS,
      MAX_RECONNECT_MS: LONGEST_RETRY_MS,
      TOMBSTONE_AFTER_MS: NOTICE_AFTER_MS
    });
  }

  // From here on the code needs a page.
  if (typeof document === 'undefined') return;

  const KEY_SLOT = 'brainstorm-session-key';

  const savedKey = () => {
    try {
      return sessionStorage.getItem(KEY_SLOT);
    } catch (err) {
      return null;
    }
  };

  // The text of the pill in the frame's header for each connection state. The frame's CSS colours it by the
  // data-state value set below.
  const PILL_LOOKS = {
    connecting: { label: 'Connecting…' },
    connected: { label: 'Connected' },
    reconnecting: { label: 'Reconnecting…' },
    disconnected: { label: 'Disconnected' }
  };
  const setPill = (state) => {
    const [pill] = document.querySelectorAll('.status');
    if (!pill) return; // a complete-document screen has no pill
    const look = PILL_LOOKS[state] || PILL_LOOKS.disconnected;
    pill.textContent = look.label;
    pill.dataset.state = PILL_LOOKS[state] ? state : 'disconnected';
  };

  // Covers the page. Built with inline styles so it looks the same on framed and complete-document screens.
  let pausedNotice = null;
  const showPausedNotice = () => {
    if (pausedNotice || !document.body) return;
    pausedNotice = document.createElement('div');
    pausedNotice.id = 'bs-tombstone';
    Object.assign(pausedNotice.style, {
      position: 'fixed', top: '0', right: '0', bottom: '0', left: '0', zIndex: '99999',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
      background: 'rgb(20 20 22 / 92%)', color: '#f5f5f7', fontFamily: 'system-ui,sans-serif'
    });
    const box = document.createElement('div');
    box.style.maxWidth = '480px';
    const title = document.createElement('h2');
    title.textContent = 'Companion is paused';
    title.style.cssText = 'margin:0 0 8px;font-weight:600';
    const note = document.createElement('p');
    note.textContent = 'The brainstorm server behind this page has stopped. ' +
      'Ask the coding agent to start it again; this page will find it and reconnect on its own.';
    note.style.cssText = 'margin:0;opacity:.85';
    box.append(title, note);
    pausedNotice.append(box);
    document.body.append(pausedNotice);
  };

  // One WebSocket plus the policy around it: queue events while offline, retry with growing waits.
  class Link {
    constructor() {
      this.socket = null;
      this.queue = [];
      this.wait = FIRST_RETRY_MS;
      this.timer = null;
      this.offlineSince = null;
      this.everOpened = false;
    }

    address() {
      const key = savedKey();
      return `ws://${location.host}${key ? `/?key=${encodeURIComponent(key)}` : ''}`;
    }

    start() {
      clearTimeout(this.timer);
      setPill(this.everOpened ? 'reconnecting' : 'connecting');
      const socket = new WebSocket(this.address());
      this.socket = socket;

      socket.onopen = () => {
        const wasPaused = pausedNotice !== null;
        this.everOpened = true;
        this.offlineSince = null;
        this.wait = FIRST_RETRY_MS;
        pausedNotice = null;
        setPill('connected');
        for (const event of this.queue.splice(0)) socket.send(JSON.stringify(event));
        if (wasPaused) this.reloadThroughKey();
      };

      socket.onmessage = (message) => {
        try {
          if (JSON.parse(message.data).type === 'reload') location.reload();
        } catch (err) {
          // not JSON, or no type: ignore
        }
      };

      socket.onclose = () => {
        this.socket = null;
        if (this.offlineSince === null) this.offlineSince = Date.now();
        const tooLong = Date.now() - this.offlineSince >= NOTICE_AFTER_MS;
        setPill(tooLong ? 'disconnected' : 'reconnecting');
        if (tooLong) showPausedNotice();
        this.timer = setTimeout(() => this.start(), this.wait);
        this.wait = nextReconnectDelay(this.wait, LONGEST_RETRY_MS);
      };

      // Every error is followed by a close, and the close handler does the retrying.
      socket.onerror = () => {
        try {
          socket.close();
        } catch (err) {
          // already closed
        }
      };
    }

    // After an outage, load the page again through the keyed address so the cookie is renewed.
    reloadThroughKey() {
      const key = savedKey();
      if (key) location.replace(`/?key=${encodeURIComponent(key)}`);
      else location.reload();
    }

    send(event) {
      const stamped = { ...event, timestamp: Date.now() };
      const live = this.socket !== null && this.socket.readyState === WebSocket.OPEN;
      if (live) this.socket.send(JSON.stringify(stamped));
      else this.queue.push(stamped);
    }
  }

  const link = new Link();

  // A click on (or inside) anything marked data-choice is reported as a "click" event.
  function reportClick(e) {
    const hit = e.target;
    const picked = hit instanceof Element ? hit.closest('[data-choice]') : null;
    if (!picked) return;
    link.send({
      type: 'click',
      text: picked.textContent.trim(),
      choice: picked.dataset.choice,
      id: picked.id || null
    });
  }
  document.addEventListener('click', reportClick);

  // Highlighting for the frame's .option and .card elements.
  window.selectedChoice = null;
  window.toggleSelect = (el) => {
    window.selectedChoice = el.dataset.choice;
    const group = el.closest('.options, .cards');
    const several = group !== null && group.dataset.multiselect !== undefined;
    if (!several && group !== null) {
      for (const sibling of group.querySelectorAll('.option, .card')) sibling.classList.remove('selected');
    }
    el.classList[several ? 'toggle' : 'add']('selected');
  };

  // For screens that want to report something besides a click.
  window.brainstorm = {
    send: (event) => link.send(event),
    choice: (value, extra = {}) => link.send(Object.assign({ type: 'choice', value }, extra))
  };

  link.start();
})();
