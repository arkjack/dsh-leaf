window.__ModuleLoader__.load({
  id: '@local/novel-player',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React;

    const NS = 'novel-player';
    const PREF_KEY = 'novel-player:prefs';
    const REC_KEY = 'novel-player:recent';
    const PROG_KEY = 'novel-player:progress:';

    const DICTS = {
      en: {
        open: 'Open novel', recent: 'Recent books', toc: 'Contents',
        fontDec: 'Smaller text', fontInc: 'Larger text', auto: 'Auto paging',
        prev: 'Previous page', next: 'Next page',
        empty1: 'No novel open', empty2: 'Pick a .txt file, or drop one onto this panel',
        emptyBtn: 'Choose a txt file', loading: 'Paginating…', resume: 'resumed',
        noRecent: 'No recent books yet', pageWord: 'Page',
        settings: 'Appearance', opacity: 'Opacity', close: 'Close reader',
        reopen: 'Novel', resetHint: 'Tip: drag the top bar to move; pull edges to resize; double-click the bar to dock back.',
        parsing: 'Parsing…', tooBig: 'File too large (max 32MB).',
      },
      zh: {
        open: '打开小说', recent: '最近书本', toc: '目录',
        fontDec: '缩小字号', fontInc: '放大字号', auto: '自动翻页',
        prev: '上一页', next: '下一页',
        empty1: '还没有打开小说', empty2: '点击选择 txt 文件，或把 txt 拖进这个面板',
        emptyBtn: '选择 txt 文件', loading: '分页中…', resume: '续读',
        noRecent: '暂无最近书本', pageWord: '页',
        settings: '外观', opacity: '透明度', close: '关闭阅读器',
        reopen: '小说', resetHint: '提示：拖拽顶栏移动位置；拉拽边框调整大小；双击顶栏回到默认停靠。',
        parsing: '解析中…', tooBig: '文件过大（最大支持 32MB）。',
      },
    };

    const CSS = [
      '.np-root{position:fixed;z-index:40;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;outline:none;',
      'transition:width .28s ease,opacity .22s ease,transform .28s ease;pointer-events:auto;',
      'font-family:inherit;color:var(--dsw-alias-label-primary,#e8e6e3);}',
      '.np-root{box-shadow:0 8px 32px rgba(0,0,0,.28);}',
      '.np-lowbg .np-page,.np-lowbg .np-bar,.np-lowbg .np-foot{text-shadow:0 1px 10px rgba(0,0,0,.5),0 0 2px rgba(0,0,0,.35);}',
      '.np-root.np-collapsed{width:0 !important;min-width:0;opacity:0;transform:translateX(-14px);pointer-events:none;border-width:0;}',
      '.np-bar{display:flex;gap:2px;align-items:center;padding:6px 8px 2px;flex:none;cursor:move;}',
      '.np-rz{position:absolute;z-index:4;}',
      '.np-rz-n{top:0;left:10px;right:10px;height:5px;cursor:ns-resize;}',
      '.np-rz-s{bottom:0;left:10px;right:10px;height:5px;cursor:ns-resize;}',
      '.np-rz-e{right:0;top:10px;bottom:10px;width:5px;cursor:ew-resize;}',
      '.np-rz-w{left:0;top:10px;bottom:10px;width:5px;cursor:ew-resize;}',
      '.np-rz-ne{top:0;right:0;width:10px;height:10px;cursor:nesw-resize;}',
      '.np-rz-nw{top:0;left:0;width:10px;height:10px;cursor:nwse-resize;}',
      '.np-rz-se{bottom:0;right:0;width:10px;height:10px;cursor:nwse-resize;}',
      '.np-rz-sw{bottom:0;left:0;width:10px;height:10px;cursor:nesw-resize;}',
      '.np-setrow{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-secondary,#b9b6b0);}',
      '.np-setrow input[type=range]{flex:1;accent-color:var(--dsw-alias-brand-primary,#4ea1ff);height:20px;margin:0;}',
      '.np-hint{padding:2px 10px 8px;font-size:11px;line-height:1.6;color:var(--dsw-alias-label-tertiary,#8b8880);}',
      '.np-reopen{appearance:none;border:1px solid var(--dsw-alias-border-l2,#4a4d55);background:transparent;',
      'color:var(--dsw-alias-label-secondary,#b9b6b0);border-radius:8px;height:28px;padding:0 10px;font-size:12px;cursor:pointer;font-family:inherit;}',
      '.np-reopen:hover{color:var(--dsw-alias-label-primary,#e8e6e3);background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));}',
      '.np-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#b9b6b0);',
      'border-radius:6px;height:24px;min-width:24px;padding:0 5px;font-size:12px;line-height:1;cursor:pointer;font-family:inherit;}',
      '.np-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));color:var(--dsw-alias-label-primary,#e8e6e3);}',
      '.np-btn[data-on="1"]{color:var(--dsw-alias-brand-primary,#4ea1ff);background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));}',
      '.np-btn:disabled{opacity:.35;cursor:default;}',
      '.np-btn:disabled:hover{background:transparent;color:var(--dsw-alias-label-secondary,#b9b6b0);}',
      '.np-title{flex:1;min-width:0;font-size:12px;color:var(--dsw-alias-label-tertiary,#8b8880);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px;}',
      '.np-page{flex:1;min-height:0;overflow:hidden;padding:10px 18px 6px;position:relative;line-height:1.95;letter-spacing:.01em;contain:layout paint;}',
      '.np-page::before,.np-page::after{position:absolute;top:50%;transform:translateY(-50%);font-size:24px;',
      'color:var(--dsw-alias-label-secondary,#b9b6b0);opacity:0;transition:opacity .15s;pointer-events:none;}',
      '.np-page::before{content:"\\2039";left:3px;}.np-page::after{content:"\\203A";right:3px;}',
      '.np-page:hover::before,.np-page:hover::after{opacity:.35;}',
      '.np-pg{margin:0 0 .9em;overflow-wrap:break-word;}',
      '.np-p{text-indent:2em;}',
      '.np-cont{text-indent:0;}',
      '.np-h{font-size:1.18em;font-weight:700;text-indent:0;margin:0 0 1.1em;color:var(--dsw-alias-label-primary,#e8e6e3);}',
      '.np-foot{display:flex;justify-content:space-between;gap:8px;padding:4px 12px 8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b8880);flex:none;}',
      '.np-foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.np-sizer{position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;line-height:1.95;letter-spacing:.01em;contain:layout paint style;}',
      '.np-sizer .np-pg{margin:0 0 .9em;overflow-wrap:break-word;}',
      '.np-sizer .np-p{text-indent:2em;}.np-sizer .np-cont{text-indent:0;}',
      '.np-sizer .np-h{font-size:1.18em;font-weight:700;text-indent:0;margin:0 0 1.1em;}',
      '.np-pop{position:absolute;top:34px;right:8px;width:min(240px,86%);max-height:62%;overflow:auto;',
      'background:var(--dsw-alias-bg-overlay,#1b1c20);border:1px solid var(--dsw-alias-border-l1,#33363c);',
      'border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);z-index:6;padding:4px;}',
      '.np-pop::-webkit-scrollbar{width:8px;}',
      '.np-pop::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l1,rgba(255,255,255,.14));border-radius:4px;}',
      '.np-item{display:block;width:100%;text-align:left;border:0;background:transparent;color:var(--dsw-alias-label-primary,#e8e6e3);',
      'padding:7px 10px;border-radius:7px;font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:inherit;}',
      '.np-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));}',
      '.np-item[data-cur="1"]{color:var(--dsw-alias-brand-primary,#4ea1ff);}',
      '.np-item small{color:var(--dsw-alias-label-tertiary,#8b8880);margin-left:6px;}',
      '.np-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;',
      'color:var(--dsw-alias-label-secondary,#b9b6b0);font-size:12px;text-align:center;padding:0 18px;}',
      '.np-empty b{font-size:13px;color:var(--dsw-alias-label-primary,#e8e6e3);font-weight:600;}',
      '.np-empty button{appearance:none;border:1px solid var(--dsw-alias-border-l2,#4a4d55);background:color-mix(in srgb, var(--dsw-alias-button-tool-bar-fill,rgba(255,255,255,.06)) 80%, transparent);',
      'color:var(--dsw-alias-label-primary,#e8e6e3);border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;}',
      '.np-empty button:hover{background:var(--dsw-alias-button-tool-bar-hover,rgba(255,255,255,.12));}',
    ].join('');

    /* ---------------- text pipeline ---------------- */
    const CHAPTER_RE = /^(第\s*[0-9一二三四五六七八九十百千万零两〇]+\s*[章节回卷集篇]|序[章幕]|楔子|引子|前言|尾声|番外|后记|prologue|chapter\s+\d+)/i;

    function parseBook(text) {
      const clean = String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
      const paras = [];
      for (const raw of clean.split('\n')) {
        const line = raw.trim();
        if (!line) continue;
        paras.push((CHAPTER_RE.test(line) && line.length <= 42) ? { t: line, k: 'h' } : { t: line, k: 'p' });
      }
      const toc = [];
      for (let i = 0; i < paras.length; i++) if (paras[i].k === 'h') toc.push({ title: paras[i].t, idx: i });
      return { paras, toc };
    }

    function decodeBytes(buf) {
      try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
      catch (e) { return new TextDecoder('gb18030').decode(buf); }
    }

    /* ---------------- storage ---------------- */
    const LS = {
      get(key, dflt) { try { const v = localStorage.getItem(key); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; } },
      set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } },
    };

    /* closed/open state shared between the player entry and the sidebar reopen entry */
    const PREFS0 = LS.get(PREF_KEY, {});
    const uiState = { closed: !!PREFS0.closed, listeners: new Set() };
    function setClosed(v) {
      if (uiState.closed === v) return;
      uiState.closed = v;
      const p = LS.get(PREF_KEY, {});
      p.closed = v;
      LS.set(PREF_KEY, p);
      uiState.listeners.forEach((f) => f());
    }
    function useClosed() {
      const [c, setC] = useState(uiState.closed);
      useEffect(() => {
        const f = () => setC(uiState.closed);
        uiState.listeners.add(f);
        return () => { uiState.listeners.delete(f); };
      }, []);
      return c;
    }

    function idbOpen() {
      return new Promise((resolve, reject) => {
        const rq = indexedDB.open('novel-player', 1);
        rq.onupgradeneeded = () => { rq.result.createObjectStore('books', { keyPath: 'id' }); };
        rq.onsuccess = () => resolve(rq.result);
        rq.onerror = () => reject(rq.error);
      });
    }
    async function idbPut(rec) {
      const db = await idbOpen();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite');
        tx.objectStore('books').put(rec);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    async function idbGet(id) {
      const db = await idbOpen();
      return new Promise((resolve) => {
        const rq = db.transaction('books', 'readonly').objectStore('books').get(id);
        rq.onsuccess = () => resolve(rq.result || null);
        rq.onerror = () => resolve(null);
      });
    }

    /* ---------------- frame geometry sensing ----------------
       No private host API exists for the right-sidebar state, so the panel
       observes the shell column geometry: the leftmost tall column is the
       session sidebar (its right edge anchors this panel, its top edge sets
       the panel top), and a tall column right of the widest column means the
       right sidebar is open -> the player collapses away. */
    function useFrameGeometry(ref) {
      const [geo, setGeo] = useState({ left: 264, top: 40, width: 300, height: 420, rightbarOpen: false, ready: false });
      useEffect(() => {
        let raf = 0;
        let ro = null;
        let mo = null;
        let moRoot = null;
        let observed = [];
        const resolve = () => {
          const node = ref.current;
          if (!node) return;
          let el = node;
          let container = null;
          let tall = [];
          while (el && el.parentElement && el.parentElement !== document.documentElement) {
            const parent = el.parentElement;
            const kids = [];
            for (const c of Array.from(parent.children)) {
              const r = c.getBoundingClientRect();
              if (r.height >= window.innerHeight * 0.6 && r.width >= 40 && r.width <= window.innerWidth * 0.75) kids.push({ c, r });
            }
            if (kids.length >= 2) { container = parent; tall = kids; break; }
            el = parent;
          }
          let left = 264;
          let top = 40;
          let mainW = Math.max(640, window.innerWidth - 264);
          let rightbarOpen = false;
          if (tall.length) {
            tall.sort((a, b) => a.r.left - b.r.left);
            const side = tall[0];
            let main = tall[0];
            for (const x of tall) if (x.r.width > main.r.width) main = x;
            let right = null;
            for (const x of tall) if (x.c !== side.c && x.c !== main.c && x.r.left >= main.r.right - 8) right = x;
            rightbarOpen = !!right && right.r.width > 120;
            left = side.r.right;
            top = Math.max(0, side.r.top);
            mainW = main.r.width;
          }
          let width = Math.max(230, Math.min(320, mainW - 380));
          if (mainW < 640) width = Math.max(200, Math.round(mainW * 0.4));
          const height = Math.max(220, Math.round(window.innerHeight * 0.5 - top));
          setGeo((g) => (g.ready && g.left === left && g.top === top && g.width === width && g.height === height && g.rightbarOpen === rightbarOpen)
            ? g
            : { left, top, width, height, rightbarOpen, ready: true });
          const cols = container ? tall.map((x) => x.c) : [];
          let sameSet = cols.length === observed.length;
          if (sameSet) for (let i = 0; i < cols.length; i++) if (cols[i] !== observed[i]) { sameSet = false; break; }
          if (!sameSet) {
            for (const c of observed) ro.unobserve(c);
            observed = cols;
            for (const c of observed) ro.observe(c);
          }
          if (moRoot !== container) {
            if (mo) { mo.disconnect(); mo = null; }
            moRoot = container;
            if (container) {
              mo = new MutationObserver(schedule);
              mo.observe(container, { childList: true });
            }
          }
        };
        const schedule = () => {
          if (raf) return;
          raf = requestAnimationFrame(() => { raf = 0; resolve(); });
        };
        ro = new ResizeObserver(schedule);
        resolve();
        window.addEventListener('resize', schedule);
        return () => {
          window.removeEventListener('resize', schedule);
          if (raf) cancelAnimationFrame(raf);
          if (ro) ro.disconnect();
          if (mo) mo.disconnect();
        };
      }, []);
      return geo;
    }

    const sameBound = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

    function NovelPlayer(props) {
      const t = props.t;
      const rootRef = useRef(null);
      const pageRef = useRef(null);
      const sizerRef = useRef(null);
      const fileRef = useRef(null);
      const geo = useFrameGeometry(rootRef);

      const [fontSize, setFontSize] = useState(Number(PREFS0.fontSize) >= 12 && Number(PREFS0.fontSize) <= 24 ? Number(PREFS0.fontSize) : 15);
      const [opacity, setOpacity] = useState(Number.isFinite(PREFS0.opacity) ? Math.max(0, Math.min(100, PREFS0.opacity)) : 62);
      const [autoSec, setAutoSec] = useState(Number(PREFS0.autoSec) > 0 ? Number(PREFS0.autoSec) : 0);
      const [pos, setPos] = useState(PREFS0.pos && Number.isFinite(PREFS0.pos.x) && Number.isFinite(PREFS0.pos.y) ? PREFS0.pos : null);
      const [size, setSize] = useState(PREFS0.size && Number.isFinite(PREFS0.size.w) && Number.isFinite(PREFS0.size.h) ? PREFS0.size : null);
      const closed = useClosed();
      const [, setTick] = useState(0);

      const [book, setBook] = useState(null);
      const [anchor, setAnchor] = useState(null);          // [paraIdx, charOff] of current page start
      const [view, setView] = useState(null);              // {start, end}
      const [pageIdx, setPageIdx] = useState(null);        // null while provisional
      const [total, setTotal] = useState(null);
      const [est, setEst] = useState(null);
      const [emaUi, setEmaUi] = useState(0);
      const [pop, setPop] = useState(null);
      const [recent, setRecent] = useState(() => LS.get(REC_KEY, []));
      const [busy, setBusy] = useState(false);
      const [err, setErr] = useState(null);

      const boundsRef = useRef([[0, 0]]);
      const cacheRef = useRef(new Map());
      const measureRef = useRef(null);
      const anchorRef = useRef(null);
      anchorRef.current = anchor;
      const pageIdxRef = useRef(null);
      pageIdxRef.current = pageIdx;

      useEffect(() => {
        const onR = () => setTick((v) => v + 1);
        window.addEventListener('resize', onR);
        return () => window.removeEventListener('resize', onR);
      }, []);

      useEffect(() => { LS.set(PREF_KEY, { fontSize, opacity, autoSec, pos, size, closed: uiState.closed }); }, [fontSize, opacity, autoSec, pos, size]);

      /* effective panel geometry: user position/size override the docked defaults */
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 800;
      const effW = Math.max(200, Math.min(size ? size.w : geo.width, vw - 8));
      const effH = Math.max(140, Math.min(size ? size.h : geo.height, vh - 8));
      const rawX = pos ? pos.x : geo.left;
      const rawY = pos ? pos.y : geo.top;
      const effX = Math.max(0, Math.min(rawX, vw - Math.min(effW, vw)));
      const effY = Math.max(0, Math.min(rawY, vh - Math.min(effH, vh)));

      /* measurer bound to current sizer geometry; layout effect so the first
         page is measured before paint (no "paginating" flash), re-bound when
         the panel remounts (closed -> reopened) */
      const contentH = Math.max(120, effH - 74);
      useLayoutEffect(() => {
        const sizer = sizerRef.current;
        if (!sizer || closed) { measureRef.current = null; return; }
        cacheRef.current = new Map();
        const pageEl = pageRef.current;
        const H = Math.max(96, (pageEl ? pageEl.clientHeight - 16 : contentH));
        sizer.style.width = Math.max(120, effW - 38) + 'px';
        sizer.style.fontSize = fontSize + 'px';
        measureRef.current = (paras, start) => {
          const key = start[0] + '|' + start[1];
          const hit = cacheRef.current.get(key);
          if (hit) return hit;
          const s = sizer;
          if (!s.isConnected) return null;
          s.textContent = '';
          const mk = (text, kind, cont) => {
            const d = document.createElement('div');
            d.className = 'np-pg ' + (kind === 'h' ? 'np-h' : 'np-p') + (cont ? ' np-cont' : '');
            d.textContent = text;
            s.appendChild(d);
            return d;
          };
          let p = start[0];
          let c = start[1];
          if (p >= paras.length) return null;
          const first = paras[p];
          const firstText = c > 0 ? first.t.slice(c) : first.t;
          const firstNode = mk(firstText, first.k, c > 0 && first.k === 'p');
          let end = null;
          if (s.scrollHeight > H) {
            let lo = 1; let hi = firstText.length; let best = 1;
            while (lo <= hi) {
              const mid = (lo + hi) >> 1;
              firstNode.textContent = firstText.slice(0, mid);
              if (s.scrollHeight <= H) { best = mid; lo = mid + 1; } else hi = mid - 1;
            }
            end = [p, c + best];
          } else {
            p += 1;
            while (p < paras.length && !end) {
              const limit = Math.min(p + 3, paras.length);
              const batch = [];
              for (let q = p; q < limit; q++) batch.push(mk(paras[q].t, paras[q].k, false));
              if (s.scrollHeight <= H) { p = limit; continue; }
              while (batch.length) batch.pop().remove();
              for (let q = p; q < limit && !end; q++) {
                const para = paras[q];
                const node = mk(para.t, para.k, false);
                if (s.scrollHeight <= H) { p = q + 1; continue; }
                let lo = 1; let hi = para.t.length; let best = 0;
                while (lo <= hi) {
                  const mid = (lo + hi) >> 1;
                  node.textContent = para.t.slice(0, mid);
                  if (s.scrollHeight <= H) { best = mid; lo = mid + 1; } else hi = mid - 1;
                }
                end = best > 0 ? [q, best] : [q, 0];
                if (best === 0) node.remove();
              }
            }
            if (!end) end = [paras.length, 0];
          }
          s.textContent = '';
          cacheRef.current.set(key, end);
          return end;
        };
      }, [effW, fontSize, contentH, closed]);

      const layoutKey = effW + 'x' + contentH + 'x' + fontSize;

      /* current page view from anchor; layout effect => ready before paint */
      useLayoutEffect(() => {
        if (!book || !anchor || !measureRef.current) { setView(null); return; }
        const end = measureRef.current(book.paras, anchor);
        setView(end ? { start: anchor, end } : null);
      }, [book, anchor, layoutKey]);

      /* Background pre-pagination: idle-paced, time-budgeted, and capped to a
         lookahead window around the current page so a 30k-page book never
         becomes sustained layout work. The sizer's CSS containment keeps each
         measurement inside its own subtree instead of relayouting the app. */
      useEffect(() => {
        if (!book) return;
        boundsRef.current = [[0, 0]];
        cacheRef.current = new Map();
        setTotal(null);
        setPageIdx(null);
        setEst(null);
        let stop = false;
        let timer = 0;
        let ema = 0;
        let lastEst = 0;
        let lastUi = 0;
        const hasIdle = typeof requestIdleCallback === 'function';
        const LOOKAHEAD = 300;
        const finish = () => {
          const bb = boundsRef.current;
          setTotal(bb.length - 1);
          if (pageIdxRef.current == null && anchorRef.current) {
            for (let i = 0; i < bb.length; i++) {
              if (sameBound(bb[i], anchorRef.current)) { setPageIdx(i); break; }
            }
          }
        };
        const step = (deadline) => {
          if (stop || !measureRef.current) return;
          const b = boundsRef.current;
          const cur = pageIdxRef.current;
          if (cur != null && b.length - 1 >= cur + LOOKAHEAD) { timer = setTimeout(scheduleNext, 1500); return; }
          const provisional = pageIdxRef.current == null;
          let budget;
          if (provisional) {
            /* catch-up mode: drive hard (rAF-paced) until the page index locks */
            budget = ema > 6 ? 8 : 20;
          } else {
            budget = deadline && deadline.timeRemaining ? deadline.timeRemaining() : 6;
            if (budget < 2) budget = 2;
            if (ema > 6) budget = 2;
            if (budget > 6) budget = 6;
          }
          const t0 = performance.now();
          let pushed = false;
          for (;;) {
            const last = b[b.length - 1];
            if (last[0] >= book.paras.length) { finish(); return; }
            const m0 = performance.now();
            const end = measureRef.current(book.paras, last);
            const dt = performance.now() - m0;
            ema = ema === 0 ? dt : ema * 0.8 + dt * 0.2;
            if (!end) { finish(); return; }
            b.push(end);
            pushed = true;
            if (sameBound(end, anchorRef.current)) setPageIdx((pi) => (pi == null ? b.length - 1 : pi));
            if (performance.now() - t0 >= budget) break;
            if (pageIdxRef.current != null && b.length - 1 >= pageIdxRef.current + LOOKAHEAD) break;
          }
          /* circuit breaker: if one measurement is this costly on this machine,
             stop background pagination entirely; the footer keeps its estimate */
          if (ema > 20) return;
          /* lock the page index once the frontier covers the anchor: snap the
             anchor onto the exact page boundary that contains it (saved progress
             from an older layout/font may sit mid-page) */
          if (pageIdxRef.current == null && anchorRef.current && b.length > 1) {
            const a = anchorRef.current;
            const tip = b[b.length - 1];
            if (tip[0] > a[0] || (tip[0] === a[0] && tip[1] >= a[1])) {
              for (let i = 0; i < b.length - 1; i++) {
                const curB = b[i];
                const nxt = b[i + 1];
                const okCur = curB[0] < a[0] || (curB[0] === a[0] && curB[1] <= a[1]);
                const okNxt = nxt[0] > a[0] || (nxt[0] === a[0] && nxt[1] > a[1]);
                if (okCur && okNxt) {
                  setPageIdx(i);
                  if (!sameBound(curB, a)) setAnchor(curB);
                  break;
                }
              }
            }
          }
          /* stable total-page estimate: rounded to 100s, refreshed at most 0.5Hz,
             and only when the rounded value actually changes (no footer flicker) */
          if (pushed && b.length > 24) {
            const now = performance.now();
            if (now - lastEst >= 2000) {
              lastEst = now;
              const avg = b[b.length - 1][0] / (b.length - 1);
              if (avg > 0) {
                const rounded = Math.max(b.length - 1, Math.round(book.paras.length / avg / 100) * 100);
                setEst((prev) => (prev === rounded ? prev : rounded));
              }
            }
            if (provisional && now - lastUi >= 1000) {
              lastUi = now;
              setEmaUi(Math.round(ema * 10) / 10);
            }
          }
          scheduleNext();
        };
        const scheduleNext = () => {
          if (stop) return;
          if (pageIdxRef.current == null) {
            timer = requestAnimationFrame(() => step(null));
            return;
          }
          const slow = ema > 6 ? 250 : 0;
          timer = hasIdle
            ? requestIdleCallback(step, { timeout: slow ? 250 : 1000 })
            : setTimeout(() => step(null), slow ? 250 : 120);
        };
        timer = requestAnimationFrame(() => step(null));
        return () => {
          stop = true;
          if (timer) {
            if (hasIdle) { try { cancelIdleCallback(timer); } catch (e) { /* ignore */ } }
            clearTimeout(timer);
            cancelAnimationFrame(timer);
          }
        };
      }, [book, layoutKey, closed]);

      /* Provisional page indices resolve inside the pre-pagination step (when it
         pushes the anchor boundary) and in finish()/jumpPara scans; no per-tick
         re-render is needed anymore. */

      /* progress persistence */
      useEffect(() => {
        if (!book || !anchor) return;
        const id = setTimeout(() => LS.set(PROG_KEY + book.id, { p: anchor[0], c: anchor[1], ts: Date.now() }), 400);
        return () => clearTimeout(id);
      }, [book, anchor]);

      const goNext = useCallback(() => {
        if (!view || !book) return;
        if (view.end[0] >= book.paras.length) return;
        setPageIdx((pi) => (pi == null ? null : pi + 1));
        setAnchor(view.end);
      }, [view, book]);

      const goPrev = useCallback(() => {
        if (!measureRef.current || !book) return;
        if (pageIdx != null) {
          if (pageIdx <= 0) return;
          setPageIdx(pageIdx - 1);
          setAnchor(boundsRef.current[pageIdx - 1]);
          return;
        }
        /* provisional (catch-up not finished): measure a backward window of
           ~300 paragraphs to derive the previous page boundary on demand */
        const a = anchorRef.current || (view ? view.start : null);
        if (!a) return;
        let W = Math.max(0, a[0] - 300);
        for (let attempt = 0; attempt < 3; attempt++) {
          const chain = [[W, 0]];
          for (;;) {
            const lastB = chain[chain.length - 1];
            const end = measureRef.current(book.paras, lastB);
            if (!end) break;
            chain.push(end);
            if (end[0] > a[0] || (end[0] === a[0] && end[1] >= a[1])) break;
            if (chain.length > 400) break;
          }
          let idxCur = chain.length - 1;
          while (idxCur > 0 && (chain[idxCur][0] > a[0] || (chain[idxCur][0] === a[0] && chain[idxCur][1] > a[1]))) idxCur--;
          if (idxCur >= 1) { setAnchor(chain[idxCur - 1]); return; }
          if (W === 0) return;
          W = Math.max(0, W - 300);
        }
      }, [pageIdx, book, view]);

      const jumpPara = useCallback((idx) => {
        const b = boundsRef.current;
        for (let i = 0; i < b.length - 1; i++) {
          if (b[i][0] === idx && b[i][1] === 0) { setPageIdx(i); setAnchor(b[i]); return; }
        }
        setAnchor([idx, 0]);
      }, []);

      /* auto paging */
      const nextRef = useRef(goNext);
      nextRef.current = goNext;
      useEffect(() => {
        if (!autoSec || geo.rightbarOpen) return;
        const id = setInterval(() => nextRef.current(), autoSec * 1000);
        return () => clearInterval(id);
      }, [autoSec, geo.rightbarOpen]);

      const openText = useCallback((id, name, text) => {
        const parsed = parseBook(text);
        if (!parsed.paras.length) return;
        const prog = LS.get(PROG_KEY + id, null);
        const start = prog && prog.p < parsed.paras.length ? [prog.p, prog.c | 0] : [0, 0];
        setBook({ id, name, paras: parsed.paras, toc: parsed.toc });
        setAnchor(start);
        setPop(null);
      }, []);

      const openFile = useCallback((file) => {
        if (!file) return;
        if (!/\.txt$/i.test(file.name) && file.type && !/text\//.test(file.type)) return;
        if (file.size > 32 * 1024 * 1024) { setErr(t('tooBig')); return; }
        setErr(null);
        setBusy(true);
        file.arrayBuffer().then((buf) => {
          const text = decodeBytes(buf);
          const id = file.name + ':' + file.size;
          /* let the "parsing" state paint before the heavy synchronous parse */
          setTimeout(() => {
            try {
              openText(id, file.name, text);
              idbPut({ id, name: file.name, size: file.size, text, added: Date.now() }).catch(() => {});
              const next = [{ id, name: file.name, size: file.size, last: Date.now() }]
                .concat(LS.get(REC_KEY, []).filter((r) => r.id !== id)).slice(0, 8);
              LS.set(REC_KEY, next);
              setRecent(next);
            } finally {
              setBusy(false);
            }
          }, 30);
        }).catch(() => setBusy(false));
      }, [openText, t]);

      const openRecent = useCallback((rec) => {
        idbGet(rec.id).then((stored) => {
          if (stored && stored.text) {
            setErr(null);
            setBusy(true);
            setTimeout(() => {
              try { openText(stored.id, stored.name, stored.text); } finally { setBusy(false); }
            }, 30);
          } else if (fileRef.current) fileRef.current.click();
          const next = [{ id: rec.id, name: rec.name, size: rec.size, last: Date.now() }]
            .concat(LS.get(REC_KEY, []).filter((r) => r.id !== rec.id)).slice(0, 8);
          LS.set(REC_KEY, next);
          setRecent(next);
        });
      }, [openText]);

      const onZoneClick = (e) => {
        if (e.target.closest('button, .np-pop, .np-bar, .np-foot, .np-empty')) return;
        const el = pageRef.current;
        if (!el || !view) return;
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left + r.width / 2) goPrev(); else goNext();
      };

      const onKeyDown = (e) => {
        if (e.target !== rootRef.current) return;
        if (geo.rightbarOpen) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      };

      const stop = (e) => e.stopPropagation();

      /* page nodes */
      let pageNodes = null;
      if (view && book) {
        pageNodes = [];
        const paras = book.paras;
        let p = view.start[0];
        let c = view.start[1];
        while (p < paras.length) {
          if (view.end && p === view.end[0] && view.end[1] === 0) break;
          const para = paras[p];
          let text = para.t;
          let cont = false;
          if (p === view.start[0] && c > 0) { text = text.slice(c); cont = para.k === 'p'; }
          let done = false;
          if (view.end && p === view.end[0]) { text = text.slice(0, view.end[1]); done = true; }
          pageNodes.push(h('div', { key: p + ':' + c, className: 'np-pg ' + (para.k === 'h' ? 'np-h' : 'np-p') + (cont ? ' np-cont' : '') }, text));
          if (done || p === view.end[0]) break;
          p += 1;
          c = 0;
        }
      }

      const curChapter = useMemo(() => {
        if (!book || !anchor) return -1;
        let idx = -1;
        for (let i = 0; i < book.toc.length; i++) if (book.toc[i].idx <= anchor[0]) idx = i;
        return idx;
      }, [book, anchor]);

      const armRoot = () => { if (rootRef.current) rootRef.current.focus({ preventScroll: true }); };
      const btn = (key, glyph, onClick, extra) => h('button', Object.assign({
        className: 'np-btn', type: 'button', title: t(key), 'aria-label': t(key),
        onClick: (e) => { onClick(e); armRoot(); },
      }, extra || {}), glyph);

      const autoLabel = autoSec ? autoSec + 's' : '⏵';

      const totalLabel = !book ? '…' : (total != null ? String(total) : (est != null ? '≈' + est : '…'));

      /* drag the whole panel by its top bar */
      const startDrag = (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        const el = e.currentTarget;
        const sx = e.clientX; const sy = e.clientY; const ox = effX; const oy = effY;
        const move = (ev) => setPos({
          x: Math.max(0, Math.min(ox + ev.clientX - sx, vw - 40)),
          y: Math.max(0, Math.min(oy + ev.clientY - sy, vh - 32)),
        });
        const up = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      };

      /* pull any edge or corner to resize */
      const startResize = (dir) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        const el = e.currentTarget;
        const sx = e.clientX; const sy = e.clientY;
        const st = { x: effX, y: effY, w: effW, h: effH };
        const move = (ev) => {
          const dx = ev.clientX - sx; const dy = ev.clientY - sy;
          let nw = st.w; let nh = st.h;
          if (dir.includes('e')) nw = st.w + dx;
          if (dir.includes('s')) nh = st.h + dy;
          if (dir.includes('w')) nw = st.w - dx;
          if (dir.includes('n')) nh = st.h - dy;
          nw = Math.max(200, Math.min(nw, vw - 8));
          nh = Math.max(140, Math.min(nh, vh - 8));
          let nx = st.x; let ny = st.y;
          if (dir.includes('w')) nx = st.x + st.w - nw;
          if (dir.includes('n')) ny = st.y + st.h - nh;
          nx = Math.max(0, Math.min(nx, vw - nw));
          ny = Math.max(0, Math.min(ny, vh - nh));
          setPos({ x: nx, y: ny });
          setSize({ w: nw, h: nh });
        };
        const up = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      };

      if (closed) return null;

      const blurPx = Math.round(2 + opacity * 0.16);
      return h('div', {
        ref: rootRef,
        className: 'np-root' + (opacity <= 12 ? ' np-lowbg' : '') + (geo.rightbarOpen ? ' np-collapsed' : ''),
        style: Object.assign({
          left: effX + 'px', top: effY + 'px', width: effW + 'px', height: effH + 'px', fontSize: fontSize + 'px',
        }, opacity > 0 ? {
          background: 'color-mix(in srgb, var(--dsw-alias-bg-overlay,#17181c) ' + opacity + '%, transparent)',
          backdropFilter: 'blur(' + blurPx + 'px) saturate(1.05)',
          WebkitBackdropFilter: 'blur(' + blurPx + 'px) saturate(1.05)',
          border: '1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#3a3d44) ' + Math.max(10, Math.round(opacity * 0.6)) + '%, transparent)',
        } : {
          background: 'transparent',
          border: '1px solid transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
        }),
        onClick: stop,
        onPointerDownCapture: (e) => {
          /* clicking anywhere in the reader arms it: take focus so Space/arrows
             page-flip; inputs (slider) keep their own focus */
          if (e.target.closest('input,textarea,select')) return;
          if (rootRef.current) rootRef.current.focus({ preventScroll: true });
        },
        onMouseDown: (e) => {
          stop(e);
          if (pop && !e.target.closest('.np-pop') && !e.target.closest('[data-pop]')) setPop(null);
        },
        onDragOver: (e) => { e.preventDefault(); },
        onDrop: (e) => { e.preventDefault(); openFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); },
        tabIndex: 0,
        onKeyDown,
        role: 'region',
        'aria-label': t('open'),
      },
      h('style', null, CSS),
      h('div', {
        className: 'np-bar',
        onPointerDown: startDrag,
        onDoubleClick: () => { setPos(null); setSize(null); },
        title: t('resetHint'),
      },
        btn('open', '⌸', () => { setPop(null); if (fileRef.current) fileRef.current.click(); }),
        btn('recent', '↺', () => setPop(pop === 'recent' ? null : 'recent'), { 'data-pop': 'recent' }),
        btn('toc', '☰', () => setPop(pop === 'toc' ? null : 'toc'), { 'data-pop': 'toc', disabled: !book || !book.toc.length }),
        h('span', { className: 'np-title' }, book ? book.name : ''),
        btn('fontDec', 'A-', () => setFontSize((v) => Math.max(12, v - 1))),
        btn('fontInc', 'A+', () => setFontSize((v) => Math.min(24, v + 1))),
        btn('auto', autoLabel, () => setAutoSec((v) => (v === 0 ? 30 : v === 30 ? 60 : v === 60 ? 15 : 0)), { 'data-on': autoSec ? '1' : '0', title: t('auto') + (autoSec ? ': ' + autoSec + 's' : '') }),
        btn('settings', '◐', () => setPop(pop === 'set' ? null : 'set'), { 'data-pop': 'set' }),
        btn('close', '✕', () => setClosed(true)),
      ),
      h('div', { className: 'np-page', ref: pageRef, onClick: onZoneClick },
        !book
          ? h('div', { className: 'np-empty' },
            h('b', null, err || t('empty1')),
            h('span', null, t('empty2')),
            h('button', { type: 'button', onClick: () => fileRef.current && fileRef.current.click() }, t('emptyBtn')))
          : busy || !view
            ? h('div', { className: 'np-empty' }, h('span', null, busy ? t('parsing') : t('loading')))
            : pageNodes),
      h('div', { className: 'np-foot' },
        h('span', null, err && book ? err : (pageIdx == null && book ? t('resume') + ' · ' + emaUi + 'ms' : '')),
        h('span', null, book ? (t('pageWord') + ' ' + (pageIdx == null ? '…' : pageIdx + 1) + ' / ' + totalLabel) : '')),
      h('div', { className: 'np-sizer', ref: sizerRef, 'aria-hidden': true }),
      ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => h('div', {
        key: d, className: 'np-rz np-rz-' + d, onPointerDown: startResize(d),
      })),
      pop === 'set' ? h('div', { className: 'np-pop' },
        h('div', { className: 'np-setrow' },
          h('span', null, t('opacity')),
          h('input', {
            type: 'range', min: 0, max: 100, step: 1, value: opacity,
            'aria-label': t('opacity'),
            onChange: (e) => setOpacity(Number(e.target.value)),
          }),
          h('span', null, opacity + '%')),
        h('div', { className: 'np-hint' }, t('resetHint'))) : null,
      pop === 'recent' ? h('div', { className: 'np-pop' },
        recent.length ? recent.map((r) => h('button', { key: r.id, type: 'button', className: 'np-item', onClick: () => { openRecent(r); armRoot(); } },
          r.name, h('small', null, Math.round((r.size || 0) / 1024) + 'KB')))
          : h('div', { className: 'np-item', style: { cursor: 'default' } }, t('noRecent'))) : null,
      pop === 'toc' && book ? h('div', { className: 'np-pop' },
        book.toc.map((c, i) => h('button', { key: c.idx, type: 'button', className: 'np-item', 'data-cur': i === curChapter ? '1' : '0', onClick: () => { jumpPara(c.idx); setPop(null); armRoot(); } }, c.title))) : null,
      h('input', {
        ref: fileRef, type: 'file', accept: '.txt,.text,text/plain', style: { display: 'none' },
        onChange: (e) => { openFile(e.target.files && e.target.files[0]); e.target.value = ''; },
      }));
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        return ctx.effect(() => {
          const disposes = [];
          for (const loc of Object.keys(DICTS)) disposes.push(ctx.locale.register(NS, loc, DICTS[loc]));
          const t = ctx.locale.bind(NS);
          disposes.push(ctx.slots.inject('shell.overlay', () => ctx.slots.register({
            name: 'shell.overlay', id: 'novel-player', order: 20, label: () => t('open'),
          }, function NovelPlayerEntry() {
            return h(NovelPlayer, { t });
          })));
          disposes.push(ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
            name: 'sidebar.footer.action', id: 'novel-player-reopen', order: 6, label: () => t('reopen'),
          }, function NovelPlayerReopen() {
            const isClosed = useClosed();
            if (!isClosed) return null;
            return h(React.Fragment, null,
              h('style', null, '.np-reopen{appearance:none;border:1px solid var(--dsw-alias-border-l2,#4a4d55);background:transparent;color:var(--dsw-alias-label-secondary,#b9b6b0);border-radius:8px;height:28px;padding:0 10px;font-size:12px;cursor:pointer;font-family:inherit;}.np-reopen:hover{color:var(--dsw-alias-label-primary,#e8e6e3);background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));}'),
              h('button', { type: 'button', className: 'np-reopen', onClick: () => setClosed(false), title: t('reopen') }, '📖 ' + t('reopen')));
          })));
          return () => { for (const d of disposes) { try { d(); } catch (e) { /* ignore */ } } };
        });
      },
    };
  },
});
