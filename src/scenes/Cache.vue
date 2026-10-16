<script setup>
import Code from '../components/Code.vue'
import Step from '../engine/Step.vue'

const cs = `
[HttpPut("{key:guid}")]
public async Task<IActionResult> Update(
    Guid key, ExternalWebComponentModel model)
{
    model.Key = key;
    if (!await _service.UpdateWebComponentAsync(model))
        return NotFound();

    _cache.Remove("ewcp:all-components");
    _cache.Remove("ewcp:cors-origins");

    return NoContent();
}
`
const warm = `
public Task StartAsync(CancellationToken ct) =>
    _corsOriginProvider.RefreshAsync(ct);
`
</script>

<template>
  <div class="slide slide--dark code-scene">
    <div class="kicker">Cached, but not stale</div>
    <Code class="block fade-in" :code="cs" :size="31" :focus="{ 1: [9, 10] }" />

    <Step :at="2" anim="up" class="warm">
      <Code :code="warm" :size="27" title="warmup (IHostedService)" />
    </Step>

    <Step :at="3" anim="pop" class="sticker">Commandment 4 compliant ✅</Step>
    <div class="fineprint">Abridged. The real thing has more ifs.</div>
  </div>
</template>

<style scoped>
.code-scene { padding: 90px 140px; gap: 36px; }
.block { position: relative; z-index: 2; width: 1250px; }
.warm { position: absolute; right: 120px; bottom: 140px; z-index: 3; }
.warm :deep(.code) { box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 3px var(--k-green); }
.sticker {
  position: absolute;
  top: 90px;
  right: 110px;
  z-index: 4;
  padding: 26px 36px;
  border-radius: 20px;
  background: var(--k-green);
  color: var(--k-dark);
  font: 700 40px var(--sans);
  rotate: 5deg;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}
</style>
