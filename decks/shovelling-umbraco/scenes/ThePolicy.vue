<script setup>
import Code from '@engine/components/Code.vue'

const cs = `
public async Task<CorsPolicy?> GetPolicyAsync(
    HttpContext context, string? policyName)
{
    if (policyName != PolicyName)
        return await _fallback.GetPolicyAsync(context, policyName);

    var origins = await GetAllowedOriginsAsync(); // cached, 30 min

    return new CorsPolicyBuilder()
        .WithOrigins(origins.ToArray())
        .AllowAnyMethod()
        .AllowAnyHeader()
        .Build();
}
`
</script>

<template>
  <div class="slide slide--dark code-scene">
    <div class="kicker">The policy, at runtime</div>
    <Code
      class="block fade-in"
      :code="cs"
      :size="31"
      :focus="{ 1: [1, 2], 2: [4, 5], 3: [7], 4: [9, 10, 11, 12, 13] }"
      :callouts="{
        1: { line: 2, text: 'ASP.NET Core asks us. Every request.' },
        2: { line: 5, text: 'Not our policy, not our problem.' },
        5: { line: 12, text: `Notice what's missing: .AllowCredentials()`, tone: 'green' },
      }"
    />
    <div class="fineprint">Abridged. The real thing has more ifs.</div>
  </div>
</template>

<style scoped>
.code-scene { padding: 90px 140px; gap: 36px; }
.block { position: relative; z-index: 2; }
</style>
