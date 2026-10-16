<script setup>
import Code from '../components/Code.vue'

const cs = `
public void Compose(IUmbracoBuilder builder)
{
    builder.Services.AddCors();
    builder.Services.AddSingleton<ICorsPolicyProvider,
        ExternalWebcomponentsCorsPolicyProvider>();

    builder.Services.Configure<UmbracoPipelineOptions>(o =>
        o.AddFilter(new CorsAllowAllPipelineFilter()));
}

// inside CorsAllowAllPipelineFilter:
PreRouting = app => app.UseCors(PolicyName);
`
</script>

<template>
  <div class="slide slide--sand code-scene">
    <div class="kicker">Who am I?</div>
    <Code
      class="block fade-in"
      :code="cs"
      :size="33"
      :focus="{ 1: [4, 5], 2: [7, 8, 12], 3: { lines: [8], token: 'CorsAllowAllPipelineFilter' } }"
      :callouts="{
        1: { line: 5, text: `We didn't add a CORS policy. We replaced the thing that hands them out.` },
        2: { line: 8, text: 'Umbraco-native middleware. Program.cs untouched.' },
      }"
    />
    <div class="fineprint">Abridged. The real thing has more ifs.</div>
  </div>
</template>

<style scoped>
.code-scene { padding: 90px 140px; gap: 36px; }
.block { position: relative; z-index: 2; }
</style>
