/* GaadiPass home: the yellow lane line draws down the level as you scroll. Without JS it is simply fully painted. */
(function () {
  var level = document.querySelector('.level');
  if (!level || !window.requestAnimationFrame) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var queued = false;
  function update() {
    queued = false;
    var r = level.getBoundingClientRect();
    var p = (window.innerHeight * 0.62 - r.top) / r.height;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    level.style.setProperty('--p', p.toFixed(4));
    level.classList.toggle('lane-done', p >= 1);
    level.classList.toggle('lane-started', p > 0.02);
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  document.documentElement.classList.add('lane-live');
  update();
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
})();
