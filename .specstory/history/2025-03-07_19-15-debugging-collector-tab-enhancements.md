## SpecStory

## Debugging Collector Tab Enhancements (3/7/2025, 7:15:09 PM)

_**User**_



We're working on debugging the collector tab enhancements in our sampler plugin. Currently, it doesn't output any data to the table. The console reads as below. Familiarize yourself with the code and the project plan and design documents in /design as needed (and look at the chat history in /. specstory).

Console:
Collector component rendering with device: {id: 'kfKN9KfKy1', viewType: 'collector', variables: Array(0), collectorVariables: Array(8), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(8), collectorContext: {…}}
collector.tsx:225 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(8)}
collector.tsx:254 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:255 selectedDataContext: New Dataset
collector.tsx:273 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'kfKN9KfKy1', viewType: 'collector', variables: Array(0), collectorVariables: Array(8), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(8), collectorContext: {…}}
collector.tsx:225 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(8)}
collector.tsx:254 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:255 selectedDataContext: New Dataset
collector.tsx:273 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true

---

_**Assistant**_

I'll help you debug the collector tab enhancements in your sampler plugin. Let's start by understanding the current state of the code and the issue where the collector doesn't output any data to the table.

Let me first explore the project structure to get a better understanding of the codebase.

---

_****_

<details>
            <summary>Listed current directory • **34** results</summary>
        
| Name |
|-------|
| 📁 `.git` |
| 📁 `.specstory` |
| 📄 `.DS_Store` |
| 📁 `design` |
| 📁 `src` |
| 📄 `start-custom-port.js` |
| 📄 `tsconfig.json` |
| 📄 `sampler.code-workspace` |
| 📄 `scrolling_pr.md` |
| 📄 `pull_request.md` |
| 📄 `pull_request_about.md` |
| 📄 `package.json` |
| 📄 `pr_process.md` |
| 📄 `package-lock.json` |
| 📄 `merge_scrolling.sh` |
| 📄 `merge_pr.sh` |
| 📁 `context` |
| 📄 `.bash_profile` |
| 📄 `.gitignore` |
| 📄 `.eslintrc.js` |
| 📁 `node_modules` |
| 📄 `tslint-build.json` |
| 📄 `tslint.json` |
| 📄 `webpack.config.js` |
| 📄 `strings.json` |
| 📄 `postcss.config.js` |
| 📁 `__mocks__` |
| 📁 `cypress` |
| 📄 `cypress.config.ts` |
| 📄 `.eslintrc.style.js` |
| 📁 `.github` |
| 📄 `LICENSE` |
| 📄 `README.md` |
| 📄 `.eslintrc.build.js` |

</details>

---

_****_

Let's look at the design documents to understand the collector tab enhancements:

---

_****_

<details>
            <summary>Listed directory design • **24** results</summary>
        
| Name |
|-------|
| 📄 `.DS_Store` |
| 📁 `background` |
| 📄 `TODO.md` |
| 📄 `skip_animation_fastest_speed.md` |
| 📄 `collector_device_enhancements.md` |
| 📄 `__orange_team_20250304_201207.csv` |
| 📄 `feature_user_story_history` |
| 📄 `test-plan.md` |
| 📄 `ytgrab.sh` |
| 📄 `sampler-video-explanation.txt` |
| 📄 `scrolling_functionality.md` |
| 📄 `speed_slider_improvements.md` |
| 📄 `repeat_until_functionality.md` |
| 📄 `sampler-understanding.md` |
| 📄 `sampler-video-explanation.srt` |
| 📄 `hide_model_functionality.md` |
| 📄 `lock_model_password.md` |
| 📄 `project-plan.md` |
| 📄 `feature-summary.md` |
| 📄 `grab.sh` |
| 📄 `design_doc.md` |
| 📄 `device_name_input.md` |
| 📄 `commit-history.txt` |
| 📁 `codap.wiki` |

</details>

---

_****_

Let's look at the collector device enhancements document to understand what we're trying to implement:

---

_****_

Read file: undefined

---

_****_

Now, let's look at the collector component code to understand its structure and functionality:

---

_****_

<details>
            <summary>Searched codebase "collector.tsx" • **3** results</summary>
        
| File |
|------|
| `undefined` |
| `undefined` |
| `undefined` |

</details>

---

_****_

Let's examine the collector component:

---

_****_

Read file: undefined

---

_****_

Let's read the rest of the collector component:

---

_****_

Read file: undefined

---

_****_

Now, let's look at the Balls component that's used in the collector:

---

_****_

Read file: undefined

---

_****_

Let's also look at the Ball component:

---

_****_

Read file: undefined

---

_****_

Now, let's look at the output table component to understand how the data should be displayed:

---

_****_

<details>
            <summary>Searched codebase "output-table" • **0** results</summary>
        
No results found
</details>

---

_****_

Let's try a different search:

---

_****_

<details>
            <summary>Grep search for "OutputTable" • **0** files</summary>
        
No results found
</details>

---

_****_

Let's search for any table component:

---

_****_

<details>
            <summary>Grep search for "Table" • **24** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/helpers/codap-helpers.tsx` | L74 | `// the current @concord-consortium/codap-plugin-api createTable method does not have a way to pass width (or title) options so` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/helpers/codap-helpers.tsx` | L76 | `const createWideTable = async () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/helpers/codap-helpers.tsx` | L81 | `type: "caseTable",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/helpers/codap-helpers.tsx` | L137 | `const tableRes = await createWideTable();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/helpers/codap-helpers.tsx` | L138 | `if (tableRes.success) {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/types.tsx` | L174 | `editable?: boolean;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/measures/measures.tsx` | L161 | `You can however, create a new attribute in the Sampler Data Table at the Sample level to compute a measure for a sample.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/measures/measures.tsx` | L166 | `<a href="https://codap.concord.org/how-to/add-a-new-attribute-to-a-table/" target="_blank" rel="noopener noreferrer">` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/measures/measures.tsx` | L167 | `Add a New Attribute to a Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/measures/measures.test.tsx` | L212 | `expect(screen.getByText(/Add a New Attribute to a Table/i)).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/about/about.tsx` | L10 | `⟪ 151 characters skipped ⟫e Sampler will appear in a hierarchical table. The top level represents the experiment (one complete run of a simulation) and allows you to compute statistics about an entire experiment. The next level contains information about each sample` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.test.tsx` | L88 | `it("renders an editable input for regular columns", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.test.tsx` | L106 | `it("renders a non-editable div for collector columns when a dataset is selected", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.test.tsx` | L131 | `it("renders an editable input for collector columns when no dataset is selected", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.tsx` | L28 | `const isEditable = !hasCollectorDevice || !collectorContext;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.tsx` | L55 | `if (!isEditable) return;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.tsx` | L84 | `if (!isEditable) return;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/column-header.tsx` | L100 | `{isEditable ? (` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/device-views/collector.tsx` | L209 | `// Update the global state to ensure the output table is updated` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/scrolling.test.tsx` | L218 | `Object.defineProperty(modelContainer, 'scrollLeft', { value: 100, writable: true });` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/scrolling.test.tsx` | L219 | `Object.defineProperty(modelContainer, 'scrollTop', { value: 50, writable: true });` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/scrolling.test.tsx` | L249 | `Object.defineProperty(modelContainer, 'scrollLeft', { value: 100, writable: true });` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/scrolling.test.tsx` | L250 | `Object.defineProperty(modelContainer, 'scrollTop', { value: 50, writable: true });` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/components/model/scrolling.test.tsx` | L278 | `Object.defineProperty(modelContainer, 'scrollLeft', { value: 0, writable: true });` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.tsx` | L314 | `alert("Unable to setup CODAP table");` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/scrolling_pr.md` | L54 | `- Add touch event handlers for better mobile/tablet support` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/README.md` | L101 | `You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready fo` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/design_doc.md` | L166 | `- Editable fields for variable properties` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/test-plan.md` | L66 | `- Latest stable release` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/test-plan.md` | L133 | `⟪ 119 characters skipped ⟫password | Password should not be extractable from storage |` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.srt` | L242 | `repeated six times in addition a table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.srt` | L254 | `the form of a hierarchical table on the` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.srt` | L258 | `outermost level of the table I see that` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.srt` | L338 | `the table to calculate a measure that` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.srt` | L514 | `sampled and for the taped table to` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/scrolling_functionality.md` | L179 | `- Add touch event handlers for mobile/tablet support` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.txt` | L120 | `repeated six times in addition a table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.txt` | L126 | `the form of a hierarchical table on the` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.txt` | L128 | `outermost level of the table I see that` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.txt` | L168 | `the table to calculate a measure that` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-video-explanation.txt` | L256 | `sampled and for the taped table to` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/repeat_until_functionality.md` | L342 | `By following this design document, we will implement the feature in a structured and testable way, ensuring high quality and performance while maintaining backward compatibility with existing documents.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/sampler-understanding.md` | L41 | `- Results are organized in a hierarchical table:` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/lock_model_password.md` | L47 | `- Include a salt to prevent rainbow table attacks` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L67 | `⟪ 161 characters skipped ⟫es are added to the Sample level in the table.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L158 | `4. Press the second Sampler's **Start** button to get some simulation data. Notice that now in *both* case tables the **items** collection has just three additional attributes: `experiment`, `description` and `sample size`.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L167 | `* If you change the name of the `value` attribute in the second case table, the second Sampler will only output cases with blank values.",https://www.pivotaltracker.com/story/show/185864784,,,Doug Martin,,,"Note: this is a fat three.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L211 | `⟪ 232 characters skipped ⟫ Nov 2, 2023)","This is now demoable/testable on `main` in CODAP 2.  I'm still getting an error in CODAP 3 with the api call to evaluate the ""until formula"".  I'll add a bug in the CODAP v3 PT board.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L214 | `> This is now demoable/testable on main in CODAP 2. I'm still getting an error in CODAP 3 with the api call to evaluate the ""until formula"". I'll add a bug in the CODAP v3 PT board.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L222 | `⟪ 408 characters skipped ⟫Doug Martin,,,"	This is now demoable/testable on main in CODAP 2 and 3` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L232 | `* Above the mixer box  ""output"" is changed to the name of the chosen dataset. This name is no longer editable.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L233 | `⟪ 104 characters skipped ⟫tate with label as ""output"" and is editable.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L234 | `⟪ 138 characters skipped ⟫8848421,,,Doug Martin,,,"This is now testable using https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/ (Doug Martin - Feb 26, 2025)","	@dougmartin4  The collector itself seems to be behaving well with sending attributes names to the table.  However, We dont have the MEASURES tab set up to be able to quickly find measures of any of the attributes.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L237 | `⟪ 120 characters skipped ⟫ate a new attribute in the Sampler Data Table at the Sample level to compute a measure for a sample.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L239 | `Add a New Attribute to a Table (link to https://codap.concord.org/how-to/add-a-new-attribute-to-a-table/)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L255 | `⟪ 114 characters skipped ⟫6843797,,,Doug Martin,,,"This is now testable using https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/ (Doug Martin - Feb 26, 2025)","**Test (QA)** review set to **pass**` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L259 | `⟪ 125 characters skipped ⟫w/188940786,,,Doug Martin,,,"This is testable at https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L274 | `⟪ 107 characters skipped ⟫w/188940811,,,Doug Martin,,,"This is testable at https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/ (Doug Martin - Mar 3, 2025)","**Project Team** review set to **pass** (William Finzer -` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L280 | `⟪ 167 characters skipped ⟫w/188940805,,,Doug Martin,,,"This is testable at https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/ (Doug Martin - Mar 3, 2025)","**Project Team** review set to **pass**` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/__orange_team_20250304_201207.csv` | L287 | `⟪ 356 characters skipped ⟫w/188939113,,,Doug Martin,,,"This is testable at https://codap.concord.org/app/static/dg/en/cert/index.html?di=https://sampler.concord.org/branch/main/` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L45 | `"DG.plugin.Importer.no-table-error": "Could not find tabular data in a format that can be imported into CODAP",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L51 | `"DG.plugin.Importer.import-message": "Preparing to import %@ rows into \"%@\" from a table with %@ attributes: %@%@",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L151 | `⟪ 187 characters skipped ⟫e Sampler will appear in a hierarchical table. The top level represents the experiment (one complete run of a simulation) and allows you to compute statistics about an entire experiment. The next level contains information about each sample` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L216 | `"DG.plugin.Importer.no-table-error": "Es konnten keine tabellarischen Daten gefunden werden, die in CODAP importiert weren können",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L242 | `"DG.plugin.Importer.no-table-error": "CODAP으로 가져올 수 있는 형식의 테이블 형식 데이터를 찾을 수 없습니다.",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L410 | `"DG.plugin.Importer.no-table-error": "Nie znaleziono danych tabelarycznych w formacie, który można zaimportować do CODAP",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L567 | `"DG.plugin.Importer.no-table-error": "Não foi possível encontrar uma tabela de dados para importar no CODAP",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L592 | `"DG.plugin.Importer.no-table-error": "No se encontraron datos en formato tabular para importar en CODAP",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/strings.json` | L749 | `"DG.plugin.Importer.no-table-error": "CODAP'a yüklenebilecek bir formatta tablosal veri bulunamadı",` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1330 | `+   const isEditable = !hasCollectorDevice || !collectorContext;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1337 | `+     if (!isEditable) return;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1344 | `+     if (!isEditable) return;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1360 | `+       {isEditable ? (` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1516 | `+           You can however, create a new attribute in the Sampler Data Table at the Sample level to compute a measure for a sample.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1521 | `+             <a href="https://codap.concord.org/how-to/add-a-new-attribute-to-a-table/" target="_blank" rel="noopener noreferrer">` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L1522 | `+               Add a New Attribute to a Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2416 | `+   it("renders an editable input for regular columns", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2434 | `+   it("renders a non-editable div for collector columns when a dataset is selected", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2459 | `+   it("renders an editable input for collector columns when no dataset is selected", () => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2501 | `✓ renders an editable input for regular columns (19 ms)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2503 | `✓ renders a non-editable div for collector columns when a dataset is selected (5 ms)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L2504 | `✓ renders an editable input for collector columns when no dataset is selected (3 ms)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L3604 | `+       expect(screen.getByText("Add a New Attribute to a Table")).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L3819 | `-       expect(screen.getByText("Add a New Attribute to a Table")).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L3821 | `+       expect(screen.getByText(/Add a New Attribute to a Table/)).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L4082 | `-       expect(screen.getByText(/Add a New Attribute to a Table/)).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L4085 | `+     expect(screen.getByText(/Add a New Attribute to a Table/i)).toBeInTheDocument();` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9293 | `index.js:585 [webpack-dev-server] ERROR in ./src/components/case-table/case-table.tsx:40:42` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9297 | `39 |     // disable vertical auto-scroll of table (column headers can't scroll out of view)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9304 | `index.js:585 [webpack-dev-server] ERROR in ./src/components/case-table/case-table.tsx:40:43` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9307 | `39 |     // disable vertical auto-scroll of table (column headers can't scroll out of view)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9314 | `index.js:585 [webpack-dev-server] ERROR in ./src/components/case-table/case-table.tsx:40:52` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L9317 | `39 |     // disable vertical auto-scroll of table (column headers can't scroll out of view)` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L17497 | `2. There are issues with the `devices` property not existing on the `WritableDraft<IGlobalState>` type.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2384 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2385 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2386 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2413 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2414 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2415 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2442 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2443 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2444 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2471 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2472 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2473 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2495 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2496 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2497 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2512 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2513 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2514 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2542 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2543 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2544 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2565 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2566 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2567 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2582 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2583 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2584 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2625 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2626 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2627 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2649 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2650 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2651 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2706 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2707 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2708 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2736 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2737 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2738 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2759 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2760 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2761 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2796 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2797 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2798 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2833 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2834 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2835 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2857 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2858 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2859 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2874 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2875 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2876 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2917 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2918 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2919 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2940 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2941 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2942 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2957 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2958 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2959 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2987 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2988 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L2989 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3011 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3012 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3013 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3048 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3049 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3050 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3065 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3066 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3067 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3088 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3089 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3090 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3105 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3106 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3107 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3122 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3123 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3124 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3146 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3147 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3148 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3163 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3164 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3165 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3213 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3214 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3215 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3249 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3250 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3251 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3266 | `/A [<</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3267 | `/Headers []>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3268 | `/RowSpan 1>> <</O /Table` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/design/codap.wiki/CODAP-formula-syntax.pdf` | L3309 | `/A [<</O /Table` |

</details>

---

_****_

Let's look at the case-table component:

---

_****_

<details>
            <summary>Searched codebase "case-table" • **0** results</summary>
        
No results found
</details>

---

_****_

Let's look at the hooks/useAnimation.tsx file to understand how the data is sent to CODAP:

---

_****_

Read file: undefined

---

_****_

Let's look at the codap-helpers.tsx file to understand how data is sent to CODAP:

---

_****_

Read file: undefined

---

_****_

Let's read the rest of the codap-helpers.tsx file:

---

_****_

Read file: undefined

---

_****_

Now, let's look at the types.tsx file to understand the data structures:

---

_****_

Read file: undefined

---

_****_

Based on my analysis of the code and the console logs you provided, I can identify the issue with the collector tab not outputting any data to the table. Let me explain the problem and propose a solution.

## The Issue

The collector component is successfully fetching data from CODAP datasets and displaying the balls in the UI, but it's not properly sending the data to the output table. The key issue appears to be in the `fetchDatasetItems` function in the collector.tsx file.

Looking at the console logs:
1. The collector component is rendering with the device and has data contexts
2. It's selecting "New Dataset" as the dataset
3. The balls array is being populated
4. But the data isn't showing up in the output table

The main issue is in how the collector variables are being handled. When the collector fetches dataset items, it's updating the device's `collectorVariables` property, but it's also clearing the `variables` array to prevent mixer data from showing. However, the animation system that sends data to CODAP is likely looking at the `variables` array, not the `collectorVariables` array.

## The Solution

Let's modify the `fetchDatasetItems` function in the collector.tsx file to properly update both the `collectorVariables` and the `variables` arrays so that the data can be sent to the output table.

---

_****_

```diff
            }
            
-           // Clear any existing mixer data to ensure only collector data is shown
-           if (deviceToUpdate.variables) {
-             // Clear the variables array to prevent mixer data from showing
-             deviceToUpdate.variables = [];
-             console.log("Cleared device variables to prevent mixer data from showing");
+           // Instead of clearing the variables array, populate it with the first attribute values
+           // This ensures the data is sent to the output table
+           if (processedItems.length > 0) {
+             const firstKey = Object.keys(processedItems[0])[0];
+             const variableValues = processedItems.map(item => {
+               if (item && typeof item === 'object' && firstKey in item) {
+                 return item[firstKey].toString();
+               }
+               return '';
+             }).filter(Boolean);
+             
+             deviceToUpdate.variables = variableValues;
+             console.log("Updated device variables with first attribute values:", variableValues);
            }
          } else {
```

---

_****_

Now, let's also update the useEffect hook that updates the balls array to ensure it's properly syncing with the variables array:

---

_****_

```diff
          // Make sure the device has the correct collector variables
          const deviceToUpdate = draft.model.columns.flatMap(col => col.devices).find(d => d.id === deviceId);
-         if (deviceToUpdate && (!deviceToUpdate.collectorVariables || deviceToUpdate.collectorVariables.length === 0)) {
+         if (deviceToUpdate) {
+           if (!deviceToUpdate.collectorVariables || deviceToUpdate.collectorVariables.length === 0) {
              deviceToUpdate.collectorVariables = collectorVariables;
              console.log("Updated device collector variables in global state");
+           }
+           
+           // Also update the variables array to ensure data is sent to the output table
+           deviceToUpdate.variables = onlyFirstKeyValues;
+           console.log("Updated device variables with first attribute values:", onlyFirstKeyValues);
          }
        });
```

---

_****_

Let's also add some additional logging to help debug the issue:

---

_****_

```diff
        
        <div className="collector-view">
-         {Array.isArray(ballsArray) && ballsArray.length > 0 && (
+         {Array.isArray(ballsArray) && ballsArray.length > 0 ? (
+         <>
            <Balls
              ballsArray={ballsArray}
              handleSetEditingVarName={handleSetEditingVarName}
            />
+           <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
+             {`Loaded ${ballsArray.length} items from dataset. Click Start to sample.`}
+           </div>
+         </>
+         ) : (
+           <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
+             No items loaded from dataset.
+           </div>
          )}
        </div>
```

---

_****_

Now, let's also check the animation system to ensure it's properly handling the collector device:

---

_****_

<details>
            <summary>Grep search for "getAllExperimentSamples" • **5** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L57 | `// Mock the getAllExperimentSamples function` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L62 | `getAllExperimentSamples: jest.fn().mockResolvedValue({ results: [], animationResults: [] })` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L249 | `// Create a mock for getAllExperimentSamples` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L250 | `const mockGetAllExperimentSamples = jest.fn().mockResolvedValue({` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L256 | `const originalGetAllExperimentSamples = require('./useAnimation').getAllExperimentSamples;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L257 | `require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.test.tsx` | L272 | `require('./useAnimation').getAllExperimentSamples = originalGetAllExperimentSamples;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.tsx` | L156 | `const getAllExperimentSamples = async (experimentNum: number, startingSampleNumber: number, experimentHash: string) => {` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useAnimation.tsx` | L321 | `const { results, animationResults } = await getAllExperimentSamples(experimentNum, startingSampleNumber, experimentHash);` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L397 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L1301 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L3144 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L14843 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15171 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15244 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15317 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15390 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15598 | `1. The main issue is that in the test, `mockGlobalState.model` is defined, but it doesn't match the structure expected by the `getAllExperimentSamples` function. The function is trying to access `model.columns[0].devices[0]`, but in the test, the mock model structure might not be complete.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15664 | `Now, let's fix the test for the "handleStartRun" function to properly mock the getAllExperimentSamples function:` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15673 | `+       // Mock getAllExperimentSamples to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15674 | `+       const mockGetAllExperimentSamples = jest.fn().mockResolvedValue({` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15680 | `+       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15681 | `+         .mockImplementation(mockGetAllExperimentSamples);` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L15685 | `-       // Mock the getAllExperimentSamples function to return empty results` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16182 | `Property `getAllExperimentSamples` does not exist in the provided object` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16186 | `> 255 |       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16188 | `256 |         .mockImplementation(mockGetAllExperimentSamples);` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16229 | `1. The first issue is with the `getAllExperimentSamples` mock - we can't spy on a property that doesn't exist on the object prototype.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16242 | `-       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L16243 | `-         .mockImplementation(mockGetAllExperimentSamples);` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L18054 | `⟪ 119 characters skipped ⟫re that matches what's expected by the `getAllExperimentSamples` function. This prevented the "Cannot read properties of undefined (reading 'devices')" error.` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L18754 | `249:13  warning  'mockGetAllExperimentSamples' is assigned a value but never used                  @typesc` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L20193 | `256 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md` | L22132 | `258 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `file:///Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/.specstory/history/2025-03-07_07-56-project-progress-discussion.md` | L5243 | `258 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `untitled:Untitled-1` | L397 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `untitled:Untitled-1` | L1301 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `untitled:Untitled-1` | L3144 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `untitled:Untitled-1` | L14843 | `238 |       // Mock the getAllExperimentSamples function to return empty results` |
| `untitled:Untitled-1` | L15171 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `untitled:Untitled-1` | L15244 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `untitled:Untitled-1` | L15317 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `untitled:Untitled-1` | L15390 | `at getAllExperimentSamples (/Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler/src/hooks/useA` |
| `untitled:Untitled-1` | L15598 | `1. The main issue is that in the test, `mockGlobalState.model` is defined, but it doesn't match the structure expected by the `getAllExperimentSamples` function. The function is trying to access `model.columns[0].devices[0]`, but in the test, the mock model structure might not be complete.` |
| `untitled:Untitled-1` | L15664 | `Now, let's fix the test for the "handleStartRun" function to properly mock the getAllExperimentSamples function:` |
| `untitled:Untitled-1` | L15673 | `+       // Mock getAllExperimentSamples to return empty results` |
| `untitled:Untitled-1` | L15674 | `+       const mockGetAllExperimentSamples = jest.fn().mockResolvedValue({` |
| `untitled:Untitled-1` | L15680 | `+       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `untitled:Untitled-1` | L15681 | `+         .mockImplementation(mockGetAllExperimentSamples);` |
| `untitled:Untitled-1` | L15685 | `-       // Mock the getAllExperimentSamples function to return empty results` |
| `untitled:Untitled-1` | L16182 | `Property `getAllExperimentSamples` does not exist in the provided object` |
| `untitled:Untitled-1` | L16186 | `> 255 |       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `untitled:Untitled-1` | L16188 | `256 |         .mockImplementation(mockGetAllExperimentSamples);` |
| `untitled:Untitled-1` | L16229 | `1. The first issue is with the `getAllExperimentSamples` mock - we can't spy on a property that doesn't exist on the object prototype.` |
| `untitled:Untitled-1` | L16242 | `-       jest.spyOn(Object.getPrototypeOf({}), 'getAllExperimentSamples')` |
| `untitled:Untitled-1` | L16243 | `-         .mockImplementation(mockGetAllExperimentSamples);` |
| `untitled:Untitled-1` | L18054 | `⟪ 119 characters skipped ⟫re that matches what's expected by the `getAllExperimentSamples` function. This prevented the "Cannot read properties of undefined (reading 'devices')" error.` |
| `untitled:Untitled-1` | L18754 | `249:13  warning  'mockGetAllExperimentSamples' is assigned a value but never used                  @typesc` |
| `untitled:Untitled-1` | L20193 | `256 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `untitled:Untitled-1` | L22132 | `258 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |
| `untitled:Untitled-1` | L28657 | `258 |       require('./useAnimation').getAllExperimentSamples = mockGetAllExperimentSamples;` |

</details>

---

_****_

Let's look at the getAllExperimentSamples function:

---

_****_

Read file: undefined

---

_****_

Let's continue reading the getAllExperimentSamples function:

---

_****_

Read file: undefined

---

_****_

Let's look at the getExperimentSample function:

---

_****_

Read file: undefined

---

_****_

Now, let's modify the getExperimentSample function to handle the collector device properly:

---

_****_

```diff
  import { createContext, useContext, useEffect, useRef } from "react";
- import { AnimationCallback, AnimationStep, IAnimationContext, IAnimationRuntime, IAnimationStepSettings, IExperimentResults, IExperimentAnimationResults, IModel, ISampleResults, Speed, ISampleVariableIndexes, AvailableDeviceVariableIndexes } from "../types";
+ import { AnimationCallback, AnimationStep, IAnimationContext, IAnimationRuntime, IAnimationStepSettings, IExperimentResults, IExperimentAnimationResults, IModel, ISampleResults, Speed, ISampleVariableIndexes, AvailableDeviceVariableIndexes, ViewType } from "../types";
  import { createItems, selectCases } from "@concord-consortium/codap-plugin-api";
  import { kDataContextName } from "../contants";
  
      while (currentDevice) {
+       // Check if this is a collector device with collector variables
+       const isCollector = currentDevice.viewType === ViewType.Collector && 
+                           currentDevice.collectorVariables && 
+                           currentDevice.collectorVariables.length > 0;
+       
        const availableVariableIndexes = variableIndexes[currentDevice.id];
        if (availableVariableIndexes.length === 0) {
        const randomIndex = Math.floor(Math.random() * availableVariableIndexes.length);
        const selectedIndex = availableVariableIndexes[randomIndex];
-       const selectedVariable = currentDevice.variables[selectedIndex];
+       
+       // Handle collector device differently
+       let selectedVariable;
+       if (isCollector) {
+         // For collector, get the full item from collectorVariables
+         const collectorItem = currentDevice.collectorVariables[selectedIndex];
+         
+         // Use the first attribute as the main variable for animation
+         const firstKey = Object.keys(collectorItem)[0];
+         selectedVariable = collectorItem[firstKey].toString();
+         
+         // Add all attributes from the collector item to the outputs
+         for (const [key, value] of Object.entries(collectorItem)) {
+           outputs[key] = value;
+           previousOutputs[key] = value;
+         }
+       } else {
+         // Regular device handling
+         selectedVariable = currentDevice.variables[selectedIndex];
+       }
  
        if (!replacement) {
        }
  
-       if (columnName) {
+       if (columnName && !isCollector) {
+         // For regular devices, just add the selected variable
          outputs[columnName] = selectedVariable;
          previousOutputs[columnName] = selectedVariable;
-         outputsForAnimation[currentDevice.id] = selectedVariable;
-         resultsVariableIndex[currentDevice.id] = selectedIndex;
        }
+       
+       // Always update animation outputs
+       outputsForAnimation[currentDevice.id] = selectedVariable;
+       resultsVariableIndex[currentDevice.id] = selectedIndex;
  
        if (nextDeviceId) {
```

---

_****_

Let's also update the getAllExperimentSamples function to handle the collector device properly:

---

_****_

```diff
      const firstDevice = model.columns[0].devices[0];
      const endSampleNumber = startingSampleNumber + Number(numSamples);
-     const numItems = firstDevice.variables.length;
+     
+     // Check if this is a collector device
+     const isCollector = firstDevice.viewType === ViewType.Collector && 
+                         firstDevice.collectorVariables && 
+                         firstDevice.collectorVariables.length > 0;
+     
+     // Use the appropriate array for determining numItems
+     const numItems = isCollector ? firstDevice.collectorVariables.length : firstDevice.variables.length;
+     
+     console.log("getAllExperimentSamples running with:", {
+       experimentNum,
+       startingSampleNumber,
+       endSampleNumber,
+       numItems,
+       isCollector,
+       deviceType: firstDevice.viewType
+     });
      
      // Parse the repeat until condition if it exists
        const variableIndexes = model.columns.reduce<AvailableDeviceVariableIndexes>((acc, column) => {
          return column.devices.reduce<typeof acc>((acc2, device) => {
+           // For collector devices, use collectorVariables length if available
+           if (device.viewType === ViewType.Collector && device.collectorVariables && device.collectorVariables.length > 0) {
+             acc2[device.id] = device.collectorVariables.map((_, index) => index);
+           } else {
              acc2[device.id] = device.variables.map((_, index) => index);
+           }
            return acc2;
          }, acc);
        }
      }
+ 
+     console.log("getAllExperimentSamples completed with:", {
+       resultsLength: results.length,
+       animationResultsLength: animationResults.length
+     });
  
      return { results, animationResults };
```

---

_****_

Now let's run the application to see if our changes fixed the issue:

---

_****_

Cancelled

---

_****_



---

_**User**_

We're getting there. Now the collector read "monkey", an item in my table, when  it sampled, and it added data to the output table. However, the output column in the sample table remains empty:

@https://www.dropbox.com/scl/fi/hbgr2ba1ea4e4kc4yi9t5/Screenshot-2025-03-07-at-19.37.09.png?rlkey=gcsx4w23lw3mgowqpe16m19vo&dl=0 

Console

getAllExperimentSamples running with: {experimentNum: 1, startingSampleNumber: 1, endSampleNumber: 6, numItems: 7, isCollector: true, …}
useAnimation.tsx:270 getAllExperimentSamples completed with: {resultsLength: 5, animationResultsLength: 5}
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true
collector.tsx:19 Collector component rendering with device: {id: 'FwqoeeIQ4h', viewType: 'collector', variables: Array(7), collectorVariables: Array(7), formulas: {…}, …}
collector.tsx:36 Current state: {dataContexts: Array(1), selectedDataContext: 'New Dataset', isLoading: false, collectorVariables: Array(7), collectorContext: {…}}
collector.tsx:239 Rendering collector component with: {isLoading: false, dataContexts: Array(1), selectedDataContext: 'New Dataset', ballsArray: Array(7)}
collector.tsx:268 About to render with dataContexts: [{"name":"New Dataset","guid":3,"title":"Animal Ages","id":3}]
collector.tsx:269 selectedDataContext: New Dataset
collector.tsx:287 Rendering button: id=3, name=New Dataset, display=Animal Ages, selected=true

---

_**Assistant**_

I can see we're making progress! The collector component is now correctly reading the dataset and adding data to the output table, but the output column in the sample table remains empty as shown in your screenshot.

Let's examine the `getExperimentSample` function in more detail to see why the output column isn't being populated correctly. We need to make sure the collector's data is being properly mapped to the output.

---

_****_

Read file: undefined

---

_****_

Read file: undefined

---

_****_

Now I understand the issue. The problem is in the `getExperimentSample` function. When handling a collector device, it correctly adds all attributes from the collector item to the outputs, but it's not properly setting up the column name for the output table.

Let's modify the `getExperimentSample` function to ensure the collector data is properly displayed in the output column:

---

_****_

```diff
        const randomIndex = Math.floor(Math.random() * availableVariableIndexes.length);
        const selectedIndex = availableVariableIndexes[randomIndex];
+       
+       // Get the column name for this device
+       const columnName = model.columns.find(column => column.devices.find(device => device.id === currentDevice.id))?.name || "";
        
        // Handle collector device differently
            previousOutputs[key] = value;
          }
+         
+         // Also set the column name output for the collector
+         if (columnName) {
+           outputs[columnName] = selectedVariable;
+           previousOutputs[columnName] = selectedVariable;
+         }
+         
+         console.log("Collector sample:", { 
+           deviceId: currentDevice.id, 
+           columnName, 
+           selectedVariable, 
+           outputs 
+         });
        } else {
          // Regular device handling
  
        let nextDeviceId: string | null = null;
-       const columnName = model.columns.find(column => column.devices.find(device => device.id === currentDevice.id))?.name || "";
  
        for (const [deviceId, formula] of Object.entries(currentDevice.formulas)) {
```

---

_****_

Now let's run the application to see if our changes fixed the issue:

---

_****_

Cancelled

---

_****_



---

_**User**_

Excellent. Now this functions correctly. Add the files and commit.

---

_**Assistant**_

Great news! I'm glad to hear the collector component is now functioning correctly. Let's add the files and commit the changes.

---

_****_

```bash
cd /Users/chaddorsey/Dropbox/dev/ChatGPT-experiments/sampler && git status
```

```
On branch feature/collector-device-enhancements
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   .specstory/history/.what-is-this.md
        new file:   .specstory/history/2025-03-04_20-20-planning-for-sampler-too
l-codebase-duplication.md
        new file:   .specstory/history/2025-03-04_20-20-starting-a-new-discussio
n.md
        new file:   .specstory/history/2025-03-07_07-56-project-progress-discuss
ion.md
        modified:   design/.DS_Store
        modified:   design/__orange_team_20250304_201207.csv
        new file:   design/background/FourSeals-testing.csv
        new file:   design/feature_user_story_history
        modified:   src/components/measures/measures.scss
        modified:   src/components/measures/measures.test.tsx
        modified:   src/components/measures/measures.tsx
        new file:   src/components/model/column-header.test.tsx
        modified:   src/components/model/column-header.tsx
        new file:   src/components/model/device-column-header.scss
        modified:   src/components/model/device-footer.tsx
        new file:   src/components/model/device-views/collector.enhanced.test.ts
x
        new file:   src/components/model/device-views/collector.scss
        modified:   src/components/model/device-views/collector.tsx
        modified:   src/components/model/device-views/mixer.test.tsx
        modified:   src/components/model/device-views/shared/balls.tsx
        modified:   src/components/model/device.tsx

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/model/device-views/collector.tsx
        modified:   src/hooks/useAnimation.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .specstory/history/2025-03-07_19-15-debugging-collector-tab-enhancements
.md
        design/codap.wiki/


```

---

_****_

Now let's add the modified files and commit the changes:

---

_****_

```bash
git add src/components/model/device-views/collector.tsx src/hooks/useAnimation.tsx
```

```
(base) Chads-MacBook-Air-5774:sampler chaddorsey$ 

```

---

_****_

Now let's commit the changes with a descriptive message:

---

_****_

```bash
git commit -m "Fix collector component to properly display dataset items in output table"
```

```
(base) Chads-MacBook-Air-5774:sampler chaddorsey$ git commit -m "Fix collector component to properly display
 dataset items in output table"
[feature/collector-device-enhancements d19845b] Fix collector component to properly display dataset items in
 output table
 22 files changed, 58413 insertions(+), 401 deletions(-)
 create mode 100644 .specstory/history/.what-is-this.md
 create mode 100644 .specstory/history/2025-03-04_20-20-planning-for-sampler-tool-codebase-duplication.md
 create mode 100644 .specstory/history/2025-03-04_20-20-starting-a-new-discussion.md
 create mode 100644 .specstory/history/2025-03-07_07-56-project-progress-discussion.md
 create mode 100644 design/background/FourSeals-testing.csv
 create mode 100644 design/feature_user_story_history
 create mode 100644 src/components/model/column-header.test.tsx
 create mode 100644 src/components/model/device-column-header.scss
 create mode 100644 src/components/model/device-views/collector.enhanced.test.tsx
 create mode 100644 src/components/model/device-views/collector.scss
(base) Chads-MacBook-Air-5774:sampler chaddorsey$
```

---

_****_

Great! Let's check the status to make sure everything is committed:

---

_****_

```bash
git status
```

```
(base) Chads-MacBook-Air-5774:sampler chaddorsey$ git status
On branch feature/collector-device-enhancements
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .specstory/history/2025-03-07_19-15-debugging-collector-tab-enhancements.md
        design/codap.wiki/

nothing added to commit but untracked files present (use "git add" to track)
(base) Chads-MacBook-Air-5774:sampler chaddorsey$
```

---

_****_

Perfect! All our changes have been committed successfully. There are a couple of untracked files, but they appear to be documentation or history files that may not need to be included in the commit.

Let's summarize the changes we made to fix the collector component:

1. We identified that the collector component was not properly displaying dataset items in the output table.

2. We modified the `get

---



---

