# Scene description: No dumb questions

## Overview
- Running time: self-paced explainer, ~37 cards (about 30–40 min if talked through)
- Audience: a mid/senior developer who uses Copilot every day but never looked under the hood, now sitting in a decision group about AI and agentic coding. Smart, not a specialist. Kurzgesagt register: we zoom in and out, and every layer gets asked "but what does that mean?".
- No speaker notes: this is read, not presented. Every card has to carry its own explanation, in sentences that would still fit on a slide.
- Arc: four words, one act each. **1 · The LLM**: it predicts the next token → but what does that mean? → tokens → inside the box (vectors, dot product, attention, weights) → training → recap ("a huge function that can only write text"). **2 · The model**: "how do you get DeepSeek into the machine?" → it's a file → how big (quantization) → the file needs a player (Ollama/LM Studio/vLLM) → our office box (4 × RTX PRO 6000, Ubuntu, running DeepSeek V4 Flash) → why GPUs / speed → what fits → run it yourself vs rent it (one card, two sides) → open vs closed weights. **3 · The harness**: the model can only write text, so who edits my files? → a chat app in 12 lines → tools → the agent loop in 10 lines → Copilot is a harness → Claude Code: same loop, plus a lot → the real job: the context window. **4 · The agent**: agentic = a model in a loop with tools and a goal → the loop is the product (the check) → autocomplete to background agent → spec-driven → this deck was built that way → honest expectations → good questions for the decision group. Finale: the four words, with every card orbiting them.
- Canvas layout: four rows, one act each, snaking down: act 1 left → right along the top, act 2 right → left under it, act 3 left → right, act 4 right → left. The finale sits in the middle of the canvas. Long flights (down a row) mark the act changes. Each act opener shows its act name in giant letters when seen from far away (overview). Three dives: into the LLM's "inside the box" diagram (two levels deep), into the office box's GPUs, and into the harness. Two of the dives ride a wire in.
- Recurring motifs: token chips (rounded pills, one colour per token) wherever text is shown as tokens; the pink "But what does that mean?" speech bubble as the last build before a dive.

## Assets needed
- none: everything is drawn in the deck

## Scenes

### 1. title – No dumb questions
- **Background:** dark
- **Position:** start of the path, top-left of the canvas (act 1 row)
- **On screen:** kicker "an explainer"; headline "No dumb questions"; lead "What an LLM actually is, how one gets into a machine, and what people mean by “agentic coding”."; fine print "→ to move on · O for the map". A few token chips drift on the right. Far away: "1 · THE LLM" in giant letters.
- **Animation:** text rises in; chips float in a slow loop
- **Builds:** none

### 2. four-words – Four words
- **Background:** light
- **Position:** right of title, tilted slightly left
- **On screen:** kicker "the map"; headline "Four words"; four cards. LLM: "The thing that guesses the next word." Model: "The file that holds it. You download it, or rent it." Harness: "The program around it that lets it do things." Agent: "A harness that keeps going until the job is done." Then the pink bubble "But what does that mean?" with "We'll zoom into each one and keep asking:"
- **Animation:** headline rises
- **Builds:** 1. LLM card 2. Model card 3. Harness card 4. Agent card 5. the bubble line

### 3. next-token – It predicts the next token
- **Background:** dark
- **Position:** right of four-words, tilted slightly right
- **On screen:** kicker "1 · the LLM"; headline "It predicts the next token"; lead "Give it text. It scores every possible next piece."; a code line `for (var i = 0; i < items.`; bars: Count 71%, Length 18%, Count() 6%, Length 2%, everything else 3%. Fine print "Numbers made up. The shape of it is real."
- **Animation:** headline rises
- **Builds:** 1. the bars grow 2. "Count" is picked: its chip lands on the end of the code line; caption "Append it. Ask again. One token at a time: that's the whole trick." 3. the bubble "But what does that mean?"

### 4. tokens – A token is a piece of text
- **Background:** light
- **Position:** right of next-token
- **On screen:** kicker "first: text → numbers"; headline "A token is a piece of text"; chips `items` `.` `Count` and `Un` `believ` `ably`
- **Animation:** chips pop in one after another
- **Builds:** 1. a number under each chip (illustrative IDs) 2. lead "The model never sees letters. Only these numbers. Its vocabulary is about 128,000 pieces (Llama 3). Rule of thumb: a token is about ¾ of a word."

### 5. inside – Inside the box
- **Background:** dark
- **Position:** right of tokens, bigger than normal
- **On screen:** kicker "inside the box"; headline "One token, start to finish"; diagram: Text ("…items.") → Tokens ("numbers") → Vectors ("each token → 8,192 numbers", holds a nested scene) → 80 layers ("each one refines the vectors", holds a nested scene) → Odds ("a score for every token") → Pick one ("“Count”"), and a wire from Pick one all the way back to Text: "append, repeat". Packets: "items." into Tokens, "Count" round the loop.
- **Animation:** builds itself on a timer
- **Builds:** none

### 6. vectors – Every token becomes a list of numbers
- **Background:** light
- **Position:** inside inside's Vectors box; reached by riding the Tokens → Vectors wire with a "Count" pill
- **On screen:** kicker "vectors"; headline "Each token becomes a list of numbers"; `Count → [0.12, −0.83, 0.40, 0.07, … ]` "8,192 of them (Llama 3 70B)"; a 2D map: Count, Length, Size close together; cat, dog, kitten close together; Tuesday off on its own. A dashed box "how close?" holds the next scene.
- **Animation:** none
- **Builds:** 1. the map, with "Think of the numbers as coordinates. Here in 2 dimensions." 2. "Similar meanings end up close together. Nobody programs that: it falls out of training."

### 7. dot-product – How close? Multiply, then add.
- **Background:** dark
- **Position:** inside vectors' "how close?" box
- **On screen:** kicker "a little math"; headline "How close? Multiply, then add."; Count = [3, 1], Length = [3, 2], Tuesday = [−1, 3]
- **Animation:** none
- **Builds:** 1. Count · Length = 3×3 + 1×2 = 11 → close 2. Count · Tuesday = 3×(−1) + 1×3 = 0 → unrelated 3. "That's a dot product. Real vectors have 8,192 numbers, not 2: the same sum, just longer. It's the most important sum in AI, and it's back in a minute."

### 8. layer – Each layer does two things
- **Background:** light
- **Position:** inside inside's 80 layers box
- **On screen:** kicker "one layer"; headline "Each layer does two things"; two boxes, each holding a nested scene: "1 · Attention: every token looks at the others and takes what it needs." "2 · Feed-forward: every token thinks on its own, through a big grid of weights." Under them: "Out come the same vectors, a little more informed. Then the next layer. 80 times."
- **Animation:** boxes rise
- **Builds:** none

### 9. attention – Which words matter to this one?
- **Background:** dark
- **Position:** inside layer's Attention box
- **On screen:** kicker "attention"; headline "Which words matter to “it”?"; the sentence as chips: "The trophy didn't fit in the suitcase because it was too big."
- **Animation:** none
- **Builds:** 1. "it" lights up; bars from it: trophy 62%, suitcase 21%, big 9%, fit 4%, the rest 4% 2. "Each score is a dot product: what “it” is looking for (a query) · what each word offers (a key)." 3. "Then “it” takes a blend: 62% trophy + 21% suitcase + … Its vector now means “the trophy”." 4. "big" becomes "small", the bars swap (suitcase 64%, trophy 19%): "Swap one word and “it” points at the suitcase. That's why it reads all the words together." Fine print: "Real models run dozens of these side by side (“heads”). Numbers illustrative."

### 10. weights – Where the knowledge lives
- **Background:** light
- **Position:** inside layer's Feed-forward box
- **On screen:** kicker "weights"; headline "Where the knowledge lives"; one "neuron": inputs [2, 1, 3], weights [0.5, −1, 0.5]
- **Animation:** none
- **Builds:** 1. 2×0.5 + 1×(−1) + 3×0.5 = 1.5 → "on, at strength 1.5" ("below zero would be off") 2. "Each of those w's is a weight. A layer has close to a billion. The whole model:" big number 70 billion, "That's the “70B” in Llama 3 70B." 3. "Training = nudging every weight a tiny bit, so the right next token gets a little more likely. Trillions of times."

### 11. training – Guess, check, nudge
- **Background:** dark
- **Position:** right of inside, back on the main path
- **On screen:** kicker "where the weights come from"; headline "Training: guess, check, nudge"; three cards. Pre-training: "Read a huge pile of text. At every token, guess the next one, check, nudge the weights. Llama 3 read 15 trillion tokens." Post-training: "Practise on good conversations, get rewarded for good answers. That turns an autocomplete into an assistant." Freeze: "Then the weights are fixed. Chatting doesn't teach it anything. Tomorrow it's the same file."
- **Animation:** headline rises
- **Builds:** 1. 2. 3. one card each

### 12. llm-recap – So an LLM is…
- **Background:** light
- **Position:** right of training, end of the act 1 row
- **On screen:** kicker "so, an LLM is…"; headline "A huge function. Text in, odds for the next token out."
- **Animation:** headline rises
- **Builds:** 1. "It knows what's in its weights (frozen at training), plus what's in the text you send right now: the context window." 2. "It writes what's likely, not what's true. That's where confident nonsense comes from." 3. "And it can't do anything. It can only write text." (accent)

### 13. act-model – How do you get DeepSeek into the machine?
- **Background:** accent
- **Position:** below llm-recap: the start of the act 2 row (long flight down). Far away: "2 · THE MODEL"
- **On screen:** kicker "2 · the model"; headline "How do you get DeepSeek into the machine?"
- **Animation:** headline rises
- **Builds:** 1. lead "You download it. A model is a file."

### 14. the-file – It's a folder of files
- **Background:** dark
- **Position:** left of act-model
- **On screen:** kicker "what's in the download"; headline "It's a folder of files"; two code panels. A listing of `Llama-3.3-70B-Instruct/` (config.json 1 KB, generation_config.json, tokenizer.json 9 MB, model-00001-of-00030.safetensors 4.6 GB … model-00030-of-00030.safetensors, LICENSE) and config.json abridged ("num_hidden_layers": 80, "hidden_size": 8192, "num_attention_heads": 64, "vocab_size": 128256, "torch_dtype": "bfloat16")
- **Animation:** fades in
- **Builds:** 1. config.json lit: "The shape. 80 layers, 8,192 numbers per vector, 128,256 tokens: act 1, as settings." 2. tokenizer.json: "The vocabulary." 3. the safetensors files: "The weights: 70 billion numbers in 30 files."

### 15. size-math – How big is a model?
- **Background:** light
- **Position:** left of the-file
- **On screen:** kicker "a little math"; headline "How big is a model?"; "weights × bytes per weight = size"; bars for 70 billion weights: 16-bit (2 bytes) 140 GB; 8-bit (1 byte) 70 GB; 4-bit (½ byte) ≈ 40 GB
- **Animation:** none
- **Builds:** 1. 16-bit 2. 8-bit 3. 4-bit 4. "Storing each weight in fewer bits is called quantization. Like saving a photo as a JPEG: much smaller, a little blurrier."

### 16. runners – The file needs a player
- **Background:** dark
- **Position:** left of size-math
- **On screen:** kicker "the players"; headline "The file needs a player"; lead "A model file is like an .mp4. You need something like VLC to play it." Cards: Ollama "Command line and a local API. `ollama run llama3.3` downloads it and starts serving." LM Studio "A desktop app: browse, download, chat. The easy way to try models." vLLM "The server-grade one. Many users at once, squeezes the most out of big GPUs."
- **Animation:** headline rises
- **Builds:** 1. 2. 3. one card each 4. "They all speak the same HTTP API, so your tools don't care which one is underneath."

### 17. the-box – The box in the office
- **Background:** light
- **Position:** left of runners, bigger than normal
- **On screen:** kicker "our box"; headline "The box in the office"; diagram inside a dashed frame labelled "the box · Ubuntu": Hugging Face ("download once", ghost, outside) → Disk ("the model files") → GPUs ("4 × RTX PRO 6000 · 96 GB each = 384 GB of GPU memory", holds a nested scene); Ollama / vLLM ("loads the files, runs them", accent) → GPUs; Your laptop ("VS Code, chat, scripts", outside) ↔ Ollama / vLLM. Packets: "v4-flash" downloading, "prompt" / "tokens" between laptop and runner.
- **Animation:** builds itself on a timer
- **Builds:** none

### 18. inference – Running it
- **Background:** dark
- **Position:** inside the-box's GPUs box; reached by riding the Disk → GPUs wire with a pill "160 GB of weights"
- **On screen:** kicker "running it = inference"; headline "Why GPUs? Why that speed?"; "Every token runs through every layer: billions of multiply-and-adds. A GPU does thousands of them at once."
- **Animation:** none
- **Builds:** 1. "The real limit is memory speed. For every token, every weight is read once." 2. "1.8 TB/s ÷ 70 GB ≈ 25 tokens a second" (memory speed of one RTX PRO 6000 ÷ a 70 GB model, Llama 3.3 70B at 8 bits) 3. "The trick: “mixture of experts”. DeepSeek V4 Flash has 284 billion weights but uses only 13 billion per token, so it runs far faster than its size suggests." Fine print: "An upper bound for one conversation. Serving many at once gets more out of it."

### 19. what-fits – So, can we run DeepSeek?
- **Background:** light
- **Position:** left of the-box
- **On screen:** kicker "what fits in 384 GB"; headline "So, can we run DeepSeek?"; bars against a 384 GB line: gpt-oss-120b ≈ 65 GB; Llama 3.3 70B, 8-bit ≈ 75 GB; DeepSeek V4 Flash (284B weights, as released) ≈ 160 GB, tagged "what the box runs"; DeepSeek V4.1 Flash (552B, as released) ≈ 510 GB; DeepSeek V4 Pro (1.6 trillion, at 4 bits) ≈ 800 GB; DeepSeek V4.1 Flash squeezed to ~1 bit ≈ 250 GB. Fine print "Approximate. Leave room: the conversation itself needs GPU memory too."
- **Animation:** none
- **Builds:** 1. gpt-oss and Llama 2. V4 Flash: fits, what the box runs 3. V4.1 Flash and V4 Pro: don't fit 4. V4.1 Flash squeezed: fits, with quality loss 5. "Careful with names: “Flash” went from 284B to 552B weights between V4 and V4.1, and DeepSeek's API quietly moved the old name to the new model. Same name, different model."

### 20. local – Run it yourself
- **Background:** dark
- **Position:** left of what-fits
- **On screen:** kicker "option A"; headline "Run it yourself"; pluses: "Your code never leaves the building", "Fixed cost: the box is paid for", "You pick the model, and it never changes under you"; minuses: "The very best models are closed, or don't fit", "You're the ops team: updates, uptime, many users at once". Fine print "→ turns the card over"
- **Animation:** none
- **Builds:** none

### 21. cloud – Rent it
- **Background:** light
- **Position:** back of local (the card turns over)
- **On screen:** kicker "option B"; headline "Rent it (an API)"; pluses: "Frontier models: Claude, GPT, Gemini", "Huge context, fast, no hardware", "Pay per token: cheap to start"; minuses: "Your code goes to someone else's servers. Read the terms (business plans usually don't train on it)", "Cost grows with use; models change and retire". Under it: "Either way, it's the same HTTP call: send messages, get text back."
- **Animation:** none
- **Builds:** none

### 22. open-closed – Can you download the file?
- **Background:** dark
- **Position:** left of local, end of the act 2 row
- **On screen:** kicker "open vs closed weights"; headline "Can you download the file?"; two columns. Open weights: "Yes. Llama, DeepSeek, Qwen, Mistral, gpt-oss. Run it anywhere, even train it further." Closed weights: "No. Claude, GPT, Gemini. The file never leaves the company. You get an API."
- **Animation:** headline rises
- **Builds:** 1. open 2. closed 3. "Open weights ≠ open source. You get the numbers, not the training data or the recipe. It's a compiled binary: you can run it, you can't rebuild it. And read the license."

### 23. act-harness – The model can only write text
- **Background:** accent
- **Position:** below open-closed: the start of the act 3 row. Far away: "3 · THE HARNESS"
- **On screen:** kicker "3 · the harness"; headline "The model can only write text."; lead "So how does Copilot edit my files?"
- **Animation:** headline rises
- **Builds:** 1. "Something around it does. That's the harness."

### 24. simple-chat – A chat app in 13 lines
- **Background:** light
- **Position:** right of act-harness
- **On screen:** kicker "the simplest harness"; headline "A chat app in 13 lines"; code:
  ```js
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
  ]

  while (true) {
    const question = await prompt('> ')
    messages.push({ role: 'user', content: question })

    const answer = await llm(messages) // one HTTP call
    messages.push({ role: 'assistant', content: answer })

    console.log(answer)
  }
  ```
- **Animation:** fades in
- **Builds:** 1. lines 1–3: "The whole conversation is an array." 2. line 10: "Every turn sends the WHOLE array again. The model remembers nothing between calls." 3. line 13: "That's every chat app. The rest is UI."

### 25. harness – Tools: the model asks, the harness does
- **Background:** dark
- **Position:** right of simple-chat, bigger than normal
- **On screen:** kicker "give it hands"; headline "The model asks. The harness does."; diagram: You ↔ Harness ("task"; accent, big, holds a nested scene); Harness ↔ Model ("local or cloud"): "asks"; Harness ↔ Tools ("read file · edit file · run command"): "does". Packets: "messages[]" and "read_file?" between harness and model, "read_file" and "file contents" between harness and tools.
- **Animation:** builds itself on a timer
- **Builds:** 1. "The model never touches your disk. It writes a request; the harness decides whether to run it."

### 26. agent-loop – An agent in 11 lines
- **Background:** light
- **Position:** inside harness's Harness box; reached by riding the Model → Harness wire with a pill "read_file('Cart.cs')"
- **On screen:** kicker "the agent loop"; headline "An agent in 11 lines"; code:
  ```js
  messages.push({ role: 'user', content: task })

  while (true) {
    const reply = await llm(messages, tools)
    messages.push(reply)

    if (!reply.toolCall) break // plain answer: done

    const result = await run(reply.toolCall) // the harness does it
    messages.push({ role: 'tool', content: result })
  }
  ```
- **Animation:** fades in
- **Builds:** 1. line 4: "Send the conversation, plus a menu of tools." 2. line 7: "No tool call? The model thinks it's done." 3. lines 9–10: "Otherwise: run it, paste the result back in, go again."

### 27. copilot – Copilot is a harness
- **Background:** light
- **Position:** right of harness
- **On screen:** kicker "so what is Copilot?"; headline "Copilot is a harness."; lead "The model is a dropdown. Same model in a different harness gives different results."
- **Animation:** headline rises
- **Builds:** 1. two rows of chips: harnesses (Copilot, Cursor, Claude Code, Codex) and models (GPT, Claude, Gemini, Qwen, …) with "pick one of each"

### 28. claude-code – Same loop, plus a lot
- **Background:** dark
- **Position:** right of copilot
- **On screen:** kicker "industrial strength: Claude Code"; headline "Same loop, plus a lot"; a table "our 10 lines" vs "Claude Code": Tools: read_file | a dozen-plus built in (read, edit, search, shell, web) and more plugged in (MCP). Instructions: one line | a long system prompt, plus your CLAUDE.md / AGENTS.md. Safety: none | asks before edits and commands; allow-lists. Memory: the array grows until it breaks | summarises old turns when full; reads only the files it needs. Help: none | sub-agents: fresh loops for side quests.
- **Animation:** headline rises
- **Builds:** 1. Tools 2. Instructions 3. Safety 4. Memory 5. Help

### 29. context – A harness decides what the model sees
- **Background:** light
- **Position:** right of claude-code, end of the act 3 row
- **On screen:** kicker "the real job"; headline "A harness decides what the model sees"; a bar "200,000 tokens" filling: system prompt; your rules (AGENTS.md); tool descriptions; files it read and command output; the conversation so far. Fine print "Rough proportions; every session differs."
- **Animation:** none
- **Builds:** 1. system prompt 2. your rules 3. tool menu 4. files and output 5. the conversation 6. "Too little and it guesses. Too much and it loses the thread. A good harness is mostly about this."

### 30. act-agent – Agentic coding
- **Background:** accent
- **Position:** below context: start of the act 4 row. Far away: "4 · THE AGENT"
- **On screen:** kicker "4 · the agent"; headline "Agentic coding"; the bubble "But what does that mean?"
- **Animation:** headline rises
- **Builds:** 1. "A model in a loop, with tools, working towards a goal until it decides it's done."

### 31. the-loop – The loop is the product
- **Background:** dark
- **Position:** left of act-agent
- **On screen:** kicker "the loop"; headline "The check is the secret"; a circle with four stations, Plan → Edit → Check → Read the result, a dot travelling round; lead "Not a smarter model: a check. A compiler, tests, a linter. Something that tells the agent it's wrong, so it can try again."
- **Animation:** the dot loops
- **Builds:** none

### 32. ladder – From autocomplete to agent
- **Background:** light
- **Position:** left of the-loop
- **On screen:** kicker "how far do you let go?"; headline "From autocomplete to agent"; a staircase: Autocomplete "Suggests the next lines. You accept or not." Chat "You ask, it answers, you paste." Agent in the editor "It reads, edits and runs things. You watch and approve." Background agent "Give it a ticket, get a pull request." Under it: "Every step up: you write less and review more."
- **Animation:** headline rises
- **Builds:** 1. Autocomplete 2. Chat 3. Agent in the editor 4. Background agent 5. the line under it

### 33. spec-driven – Write down the what
- **Background:** dark
- **Position:** left of ladder
- **On screen:** kicker "spec-driven"; headline "Write down the what. Let it do the how."; four steps: Spec "What, why, and how we'll know it's done." Plan "The agent proposes the how. You review it before any code exists." Tasks "Small steps, each with its own check." Build "The loop runs until the checks pass."
- **Animation:** headline rises
- **Builds:** 1. Spec 2. Plan 3. Tasks 4. Build 5. "Why: the agent forgets everything between sessions. A spec is memory that survives. And a page of intent is easier to review than 2,000 lines of diff."

### 34. this-deck – This explainer was built that way
- **Background:** light
- **Position:** left of spec-driven
- **On screen:** kicker "for example"; headline "This explainer was built that way"; a flow: scene-description.md (the spec) → an agent wrote the scenes → `npm run check` and a layout audit said what was wrong → it fixed them → a human read it.
- **Animation:** the flow rises step by step
- **Builds:** none

### 35. good-bad – Honest expectations
- **Background:** dark
- **Position:** left of this-deck
- **On screen:** kicker "honest expectations"; headline "Where it shines, where it doesn't"; two cards. Good at: boilerplate and glue; unfamiliar APIs and languages; refactors with tests behind them; reading a big codebase fast. Bad at: vague goals; work it can't check; rules that live in someone's head; knowing when it's wrong (confidently wrong, fast).
- **Animation:** headline rises
- **Builds:** 1. good 2. bad

### 36. questions – Good questions to ask
- **Background:** light
- **Position:** left of good-bad, end of the act 4 row
- **On screen:** kicker "for the decision group"; headline "Good questions to ask"; numbered: 1 "Where does our code go? The box, or a cloud API, and on what terms?" 2 "Model and harness are separate choices. Which of each, and can we swap?" 3 "How does the agent know it's done? Tests, builds, checks." 4 "What may it do without asking?" 5 "Who reviews what it makes?"
- **Animation:** headline rises
- **Builds:** 1. 2. 3. 4. 5. one question each

### 37. the-stack – Four words
- **Background:** accent
- **Position:** the middle of the canvas, between the act rows; finale: the other scenes gather round it as a slowly orbiting ring
- **On screen:** kicker "no dumb questions"; four big lines: LLM: guesses the next token. Model: the file that holds it. Harness: gives it hands. Agent: a harness in a loop, with a goal.
- **Animation:** lines rise
- **Builds:** none
