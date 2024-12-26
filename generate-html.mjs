import {readFileSync, readdirSync, writeFileSync} from 'node:fs';

const files = readdirSync('./scraped-json').filter(f => /\.json$/.test(f));

let index = `<!DOCTYPE html>
<html>
<head>
<title>Infocom Hints</title>
</head>
<body>
`;

for (const file of files) {
    const json = JSON.parse(readFileSync(`./scraped-json/${file}`));
    let output = `<!DOCTYPE html>
<html>
<head>
<title>Invisiclues Hints for ${json.title}</title>
<style>
.spoiler[aria-expanded="false"] {
  filter: blur(0.5em);
  cursor: pointer;
}
.spoiler[aria-expanded="false"]:hover {
  filter: blur(0.18em);
}
</style>
</head>
<body>
    `;
    let headerLevel = 1;
    function renderNode(node, title) {
        output += `\n<h${headerLevel}>${title}</h${headerLevel}>\n\n`;
        headerLevel++;
        if (node.type === 'menu') {
            for (const child of node.children) {
                renderNode(child.child, child.title);
            }
        } else if (node.type === 'page') {
            output += node.content + "\n\n";
        } else if (node.type === 'items') {
            output += `<div class="spoiler" role="button" tabindex="0" aria-expanded="false" aria-label="Reveal hint" aria-live="polite"><div aria=hidden="true">${node.content}</div></div>\n\n`;
        } else if (node.type === 'hints') {
            output += "<ol>\n";
            for (const hint of node.hints) {
                output += `
                    <li><div class="spoiler" role="button" tabindex="0" aria-expanded="false" aria-label="Reveal hint" aria-live="polite">
                      <div aria-hidden="true">${hint}</div>
                    </div></li>\n`;
            }
            output += "</ol>\n";
        } else {
            throw new Error("invalid type " + JSON.stringify(node));
        }
        headerLevel--;
    }
    renderNode(json, json.title);
    output += `
<script>
document.querySelectorAll(".spoiler").forEach(s => {
    s.addEventListener('click', e => {
        const target = e.currentTarget;
        if (target.getAttribute("aria-expanded") === "false") {
            target.removeAttribute("aria-label");
            target.setAttribute("aria-expanded", "true");
            target.firstElementChild.removeAttribute("aria-hidden");
        } else {
            target.setAttribute("aria-label", "Reveal hint");
            target.setAttribute("aria-expanded", "false");
            target.firstElementChild.setAttribute("aria-hidden", "true");
        }
    });
    s.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            e.currentTarget.click();
        }
    });
})
</script>
`
    const outFile = file.replace("\.json", ".html");
    writeFileSync(`./generated-html/${outFile}`, output, 'utf8');
    index += `<div><a href="${outFile}">${json.title}</a></div>\n`;
}

writeFileSync(`./generated-html/index.html`, index, 'utf8');
