(function () {
  if (typeof $ !== 'function') { throw Error('JQuery is not present.'); }
  let times = 2; let
    handler;
  const init = function () {
    const t = $(this);
    const p = t.parent();
    const v = p.next();
    const cs = v.next();
    const iw = v.children();

    handler = function (e) {
      const [w, h] = ['width', 'height'].map((x) => $.fn[x].call(t));
      const nw = w * times; const nh = h * times; const cw = w / times; const
        ch = h / times;

      const eventMap = {
        mousemove(e) {
          e = e.originalEvent;

          const x = e.layerX;
						 const y = e.layerY;
						 const rx = cw / 2;
						 const ry = ch / 2;
						 const cx = x - rx;
						 const cy = y - ry;
						 const canY = cy >= 0 && cy <= h - ch;
						 const canX = cx >= 0 && cx <= w - cw;

          cs.css({
            top: canY ? cy : cy < 0 ? 0 : h - ch,
            left: canX ? cx : cx < 0 ? 0 : w - cw,
          });

          iw.css({
            top: canY ? -cy / (h - ch) * (nh - h) : cy < 0 ? 0 : -(nh - h),
            left: canX ? -cx / (w - cw) * (nw - w) : cx < 0 ? 0 : -(nw - w),
          });
        },
      };

      p.width(w).height(h);
      cs.width(cw).height(ch);
      iw.width(nw).height(nh);

      for (const k in eventMap) { p.on(k, eventMap[k]); }
    };

    t.on('load', handler);
  };

  $.fn.extend({

    zoom(t) {
      times = t || times;

      for (const x of this) { init.call(x); }

      return this;
    },
    setZoom(t) {
      times = t || times;

      if (handler === void 0) { throw Error('Zoom not initialized.'); }

      handler();
    },

  });
}());
