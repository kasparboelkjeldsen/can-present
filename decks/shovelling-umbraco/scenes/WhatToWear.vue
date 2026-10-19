<script setup>
import Code from '@engine/components/Code.vue'

const cs = `
[HttpGet]
public async Task<IActionResult> Get()
{
    var all = await _cache.GetOrCreateAsync(AllComponents, e =>
    {
        e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
        return _service.GetAllWebComponentsAsync();
    });

    var origin = Request.Headers.Origin.ToString();

    var component = all.FirstOrDefault(c =>
        c.IsActive && c.Origins.Split(',').Contains(origin));

    return component is null ? NotFound() : Ok(component);
}
`
</script>

<template>
  <div class="slide slide--sand code-scene">
    <div class="kicker">What do I wear?</div>
    <Code
      class="block fade-in"
      :code="cs"
      :size="27"
      :focus="{ 1: [10], 2: [12, 13], 3: [15], 4: [4, 5, 6, 7, 8] }"
      :callouts="{
        1: { line: 10, text: 'This is who it is.' },
        3: { line: 15, text: 'Ok(component) is the outfit.' },
      }"
    />
    <div class="fineprint">Abridged. The real thing has more ifs.</div>
  </div>
</template>

<style scoped>
.code-scene { padding: 80px 140px; gap: 30px; }
.block { position: relative; z-index: 2; }
</style>
