const replacements = {
    "{wi}": "<i>",
    "{/wi}": "</i>",
    "{bc}": "; ",
}
const reReplacementPatterns = [
    // {a_link|WORD} -> WORD
    { pattern: /\{a_link\|([^}]+)}/g, replacement: "$1" },
    // {sx|large||} -> <b>large</b>
    { pattern: /\{sx\|([^|}]*)\|[^}]*}/g, replacement: "<b>$1</b>" },
    ]

export function MiramWebsterToHTML(text) {
    let result = text;

    // Apply simple replacements
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replaceAll(key, value);
    }

    // Apply regex-based replacements
    for (const { pattern, replacement } of reReplacementPatterns) {
        result = result.replace(pattern, replacement);
    }

    return result;
}