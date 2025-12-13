<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";
    import {PUBLIC_ADMIN_ROOT, PUBLIC_TITLE, PUBLIC_WORDS_JSON} from "$env/static/public";
    import {onMount} from "svelte";
    import {Datepicker} from "flowbite-svelte";
    // TODO: change the title to today's word, theme switcher
    let todayWord = "alacrity"
    let selectedDate = new Date();
    let words = {}
    let wordEntries = {}
    let entries = []
    let updateCounter = 0;

    function updateEntries() {
        entries = []
        if (wordEntries.def !== "" && wordEntries.def !== undefined) {
            entries.push(MiramWebsterToHTML(wordEntries.def))
        }
        if (wordEntries.extended_def !== "" && wordEntries.extended_def !== undefined) {
            entries.push(MiramWebsterToHTML(wordEntries.extended_def))
        }
        if (wordEntries.note !== "" && wordEntries.note !== undefined) {
            entries.push(wordEntries.note)
        }
        updateCounter += 1;
    }

    let stylesheet = null;

    onMount(async () => {
        fetch(`${PUBLIC_WORDS_JSON}`).then(res => res.json()).then(data => {
            console.log(data)
            words = data
            console.log("new words:", words)
            // set today to the latest date available
            let dates = Object.keys(words).sort((a, b) => new Date(b) - new Date(a));
            let [year, month, day] = dates[0].split("-")
            selectedDate = new Date(year, month - 1, day);
            todayWord = words[selectedDate.toLocaleDateString('en-CA')]?.word || ""


            wordEntries = {
                "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
                "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
                "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
            }
            updateEntries();
            makeCalendarStyles();
        });
        let nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() + 1);
        if (nextDate > new Date()) {
            document?.getElementById("next").setAttribute("disabled", true)
        } else {
            document?.getElementById("next").removeAttribute("disabled", false)
        }
    })

    function makeCalendarStyles() {
        if (stylesheet === null) {
            stylesheet = new CSSStyleSheet();
            // add to document
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
        }

        // Generate styles for the datepicker
        let css = ""
        for (const [date, dateEntry] of Object.entries(words)) {
            let [year, month, day] = date.split("-")
            let dateString = new Date(year, month - 1, day).toLocaleDateString("en-US", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            let content = "background-color: oklch(54.6% 0.245 262.881); color: white;"

            css += `#datepickerContainer > div > div > div > button[aria-label="${dateString}"] { ${content} }\n`
        }
        // Apply the styles
        stylesheet.replaceSync(css);
    }

    function onDateChange(date) {
        selectedDate = date;
        // console.log("chdate words: ", words)
        todayWord = words[selectedDate.toLocaleDateString('en-CA')]?.word || ""
        wordEntries = {
            "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
            "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
            "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
        }
        console.log("new entries: ", entries)
        updateEntries()
        let nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        if (nextDate > new Date()) {
            document?.getElementById("next").setAttribute("disabled", true)
        } else {
            document?.getElementById("next").removeAttribute("disabled", false)
        }
    }

    function handleDeltaDate(event) {
        selectedDate.setDate(selectedDate.getDate() + Number(event.currentTarget.dataset.deltaDate));
        onDateChange(selectedDate)
    }
</script>
<div class="w-full flex flex-col items-center dark:bg-gray-900 bg-slate-200 dark:text-white min-h-[100vh] pb-10">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4"><a
                class="hover:underline hover:decoration-dashed active:decoration-wavy active:decoration-1"
                href="https://{PUBLIC_TITLE}">{PUBLIC_TITLE}</a> Word of the Day<i
                class="text-xs relative bottom-[0.55rem] lg:bottom-[0.5rem]">*</i></h1>
    </div>
    <div class="w-[70%] mt-8">
        <div id="datepickerContainer" class="flex justify-between w-full">
            <button id="prev" on:click={handleDeltaDate} data-delta-date="-1"
                    class="text-2xl text-white bg-violet-800 py-1 rounded-2xl px-3 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
                ❮
            </button>
            <Datepicker onselect={onDateChange} color="violet" bind:value={selectedDate}>:</Datepicker>
            <!--                classes={{ polite: "hover:text-blue-700!", dayButton: "hover:text-blue-400", titleVariant: "text-blue-800", monthButton: "text-blue-700" }}-->
            <button id="next" on:click={handleDeltaDate} data-delta-date="1"
                    class="text-2xl text-white bg-violet-800 py-1 rounded-2xl px-3 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500 disabled:bg-gray-600 disabled:ring-0">
                ❯
            </button>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold italic text-center">{todayWord}</h1>
    </div>

    <div class="md:w-[60%] mt-8 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border { entries.length > 1 ? 'pt-3' : '' }">
        {#key updateCounter}
            {#each entries as entry, index}
                <div class="my-4 min-h-10">
                    {@html entry}
                </div>
                {#if index < entries.length - 1}
                    <hr class="border-slate-500 mx-auto" style="width: {3+2*index}0%;"/>
                {/if}
            {/each}
        {/key}

    </div>
    <div class="w-full text-center absolute bottom-2">
        <i>I understand and accept the implied absolute nerdship.</i>
        <br>
        *Not guaranteed to be a single word nor refreshed every single day.
    </div>
</div>
<style>
    @reference "tailwindcss";

    #detailsbox > h3 {
        @apply text-left mt-2;
    }

    :global(#datepickerContainer > div > div > input) {
        @apply text-lg;
    }
</style>