import {readFileSync, readdirSync, writeFileSync} from 'node:fs';

writeFileSync(`./generated-html/infocom-logo.svg`, readFileSync('./infocom-logo.svg'));

const files = readdirSync('./scraped-json').filter(f => /\.json$/.test(f));

let index = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<title>Infocom Invisiclues Hints</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Hints for Infocom games, adapted (with permission) from Infocom's original Invisiclues hint books.">
<meta property="og:type" content="website">
<meta property="og:title" content="Infocom Invisiclues Hints">
<meta property="og:description" content="Hints for Infocom games, adapted (with permission) from Infocom's original Invisiclues hint books.">
<meta property="og:image" content="https://dfabulich.github.io/infocom-hints-html/infocom-logo.svg">
<style>
html {
  font-family: sans-serif;
}
img.logo {
    float: left;
    width: 20ch;
    height: auto;
    max-height: 20ch;
    aspect-ratio: 1;
    margin-right: 1em;
    margin-bottom: 1em;
}

img.coverart {
    width: 240px;
    max-width: 100%;
    height: auto;
    aspect-ratio: 1;
}
#games {
    clear: both;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, 20ch);
    gap: 1em;
}

@media (max-width: 60ch) {
    img.logo {
        float: none;
        margin-bottom: 0;
    }
    #games {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
    }
    .game {
        text-align: center;
    }
}
</style>
</head>
<body>

<img class="logo" src="infocom-logo.svg"> <h1>Infocom Invisiclues Hints</h1>
<p>Hints for Infocom games, adapted (with permission) from Infocom's original Invisiclues hint books. <a href="#about">About These Hints</a></p>
<div id="games">
`;

const replacementTitles = {
    'seastalk.json': "Seastalker",
    'hhgg.json': "The Hitchhiker's Guide to the Galaxy",
    'wishbrin.json': "Wishbringer",
}

const coverArt = {
  "amfv.json": "https://ifdb.org/coverart?id=4h62dvooeg9ajtfa&version=25",
  "arthur.json": "https://ifdb.org/coverart?id=zoohwv5nqye7up2t&version=15",
  "ballyhoo.json": "https://ifdb.org/coverart?id=b0i6bx7g4rkrekgg&version=13",
  "beyondzo.json": "https://ifdb.org/coverart?id=9h6o1charof548ii&version=15",
  "borderzo.json": "https://ifdb.org/coverart?id=7epwz167lgruvm0u&version=10",
  "bureaucr.json": "https://ifdb.org/coverart?id=zjyxds3s57pgis3x&version=13",
  "cutthroa.json": "https://ifdb.org/coverart?id=4ao65o1u0xuvj8jf&version=13",
  "deadline.json": "https://ifdb.org/coverart?id=p976o7x5ies9ltdh&version=20",
  "enchante.json": "https://ifdb.org/coverart?id=vu4xhul3abknifcr&version=15",
  "hhgg.json": "https://ifdb.org/coverart?id=ouv80gvsl32xlion&version=27",
  "hollywoo.json": "https://ifdb.org/coverart?id=jnfkbgdgopwfqist&version=13",
  "infidel.json": "https://ifdb.org/coverart?id=anu79a4n1jedg5mm&version=10",
  "lgop.json": "https://ifdb.org/coverart?id=3p9fdt4fxr2goctw&version=22",
  "lurking.json": "https://ifdb.org/coverart?id=jhbd0kja1t57uop&version=15",
  "moonmist.json": "https://ifdb.org/coverart?id=c66u816v8kx2jzm2&version=10",
  "nordandb.json": "https://ifdb.org/coverart?id=zxb8pq3qrkvdob4i&version=11",
  "planetfa.json": "https://ifdb.org/coverart?id=xe6kb3cuqwie2q38&version=14",
  "plundere.json": "https://ifdb.org/coverart?id=ddagftras22bnz8h&version=11",
  "seastalk.json": "https://ifdb.org/coverart?id=56wb8hflec2isvzm&version=9",
  "sherlock.json": "https://ifdb.org/coverart?id=j8lmspy4iz73mx26&version=19",
  "shogun.json": "https://ifdb.org/coverart?id=w3pz3v8wckaw1wgb&version=13",
  "sorcerer.json": "https://ifdb.org/coverart?id=lidg5nx9ig0bwk55&version=13",
  "spellbre.json": "https://ifdb.org/coverart?id=wqsmrahzozosu3r&version=10",
  "starcros.json": "https://ifdb.org/coverart?id=y42oje3ryqi6lohn&version=10",
  "stationf.json": "https://ifdb.org/coverart?id=9nlbhqnlyb169uge&version=8",
  "suspect.json": "https://ifdb.org/coverart?id=tdbss1ekrp4ua7h4&version=8",
  "suspende.json": "https://ifdb.org/coverart?id=t47hei9uq10xoar8&version=17",
  "trinity.json": "https://ifdb.org/coverart?id=j18kjz80hxjtyayw&version=17",
  "wishbrin.json": "https://ifdb.org/coverart?id=z02joykzh66wfhcl&version=15",
  "witness.json": "https://ifdb.org/coverart?id=6963a47vqgms8wi0&version=11",
  "zork0.json": "https://ifdb.org/coverart?id=17coplfu323xif76&version=12",
  "zork1.json": "https://ifdb.org/coverart?id=0dbnusxunq7fw5ro&version=35",
  "zork2.json": "https://ifdb.org/coverart?id=yzzm4puxyjakk8c4&version=27",
  "zork3.json": "https://ifdb.org/coverart?id=vrsot1zgy1wfcdru&version=20",
  "ztuu.json": "https://ifdb.org/coverart?id=40hswtkhap88gzvn&version=8"
}

for (const file of files) {
    const json = JSON.parse(readFileSync(`./scraped-json/${file}`));
    json.title = replacementTitles[file] ?? json.title;
    // remove the first two entries, which are always About and Credits
    json.children.shift();
    json.children.shift();
    const htmlTitle = `&quot;${json.title}&quot;`;
    const tuid = new URLSearchParams(new URL(coverArt[file]).search).get("id");
    let output = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<title>Invisiclues Hints for ${htmlTitle}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Hints for ${htmlTitle}, adapted (with permission) from Infocom's original Invisiclues hint books.">
<meta property="og:type" content="website">
<meta property="og:title" content="Invisiclues Hints for ${htmlTitle}">
<meta property="og:description" content="Hints for ${htmlTitle}, adapted (with permission) from Infocom's original Invisiclues hint books.">
<meta property="og:image" content="${coverArt[file]}">
<style>
html {
  font-family: sans-serif;
}
body {
    max-width: 70ch;
    padding: 0 2ch;
    margin: 0 auto;
}
.spoiler[aria-expanded="false"] {
  filter: blur(0.5em);
  cursor: pointer;
}
.spoiler[aria-expanded="false"]:hover {
  filter: blur(0.18em);
}
ol li {
  margin: 1em 0;
}
img.coverart {
    float: left;
    max-width: 30%;
    height: auto;
    aspect-ratio: 1;
    margin-right: 1em;
    margin-bottom: 1em;
}
hr {
    clear: both;
}
table {
    max-width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}
td, th {
    border: solid;
    padding: 0.5em 1ch;
}
</style>
</head>
<body>
<h1>Invisiclues Hints for ${htmlTitle}</h1>
<img width=200 height=200 class="coverart" src="${coverArt[file]}">
<p>Hints for ${htmlTitle}, adapted (with permission) from Infocom's original Invisiclues hint books.</p>
<p><a href="index.html">More Infocom Invisiclues Hints</a></p>
<p><a href="https://ifdb.org/viewgame?id=${tuid}">${htmlTitle} on IFDB</a></p>
<hr>
    `;
    let headerLevel = 1;
    function renderNode(node, title, path = "") {
        if (headerLevel > 1) output += `\n<h${headerLevel} id="${path}">${title}</h${headerLevel}>\n\n`;
        headerLevel++;
        if (node.type === 'menu') {
            if (node.children.length > 2) {
                output += `<nav>\n`;
                for (let i = 0; i < node.children.length; i++) {
                    const { title } = node.children[i];
                    const id = path ? `${path}.${i + 1}` : i + 1;
                    output += `<div><a href='#${id}'>${title}</a></div>`
                }
                output += `</nav>\n`;
            }
            for (let i = 0; i < node.children.length; i++) {
                const {child, title} = node.children[i];
                renderNode(child, title, path ? `${path}.${i+1}` : i+1);
            }
        } else if (node.type === 'page') {
            output += node.content + "\n\n";
        } else if (node.type === 'items') {
            node.content = node.content.replace(/<pre>([\s\S]+?)<\/pre>/g, (match,text) => {
                // console.log("***", file, text);
                const [headerLine, ...lines] = text.split('\n');
                let totalLine = null;
                if (/\btotal\b/i.test(lines.at(-1))) {
                    totalLine = lines.pop();
                }
                const headers = [];
                let mode = 'space';
                let start = 0;

                if (file === 'seastalk.json') {
                    for (let i = 0; i < lines.length; i++) {
                        lines[i] = lines[i].replace(/^  /, " &gt; ");
                    }
                } else if (file === 'cutthroa.json') {
                    for (let i = 0; i < lines.length; i++) {
                        lines[i] = lines[i].replace(/^The/, " &gt; The").replace(/^ &gt; There are no points/, "  There are no points");
                    }
                } else if (file === 'zork1.json') {
                    lines.shift();
                }

                if (file === 'hhgg.json' && /1 RELAX/.test(headerLine)) {
                    lines.unshift(headerLine);
                    headers.push(
                        { start: 2, name: "Footnote", end: 4 },
                        { start: 4, name: "Where to find it", end: null },
                    );
                } else if (file === 'hollywoo.json' && /big diamond/.test(headerLine)) {
                    lines.unshift(headerLine);
                    headers.push(
                        { start: 2, name: "Treasure", end: 37 },
                        { start: 37, name: "Where to find it", end: null },
                    );
                } else {
                    for (let i = 0; i < headerLine.length; i++) {
                        const char = headerLine[i];
                        if (mode === 'space') {
                            if (char === ' ') {
                                continue;
                            } else {
                                start = i;
                                mode = 'read';
                            }
                        } else if (mode === 'read') {
                            if (char === ' ') {
                                mode = 'ending?';
                            } else {
                                continue;
                            }
                        } else if (mode === 'ending?') {
                            if (char === ' ') {
                                mode = 'space';
                                const name = headerLine.substring(start, i - 1);
                                headers.push({ start, name })
                            } else {
                                mode = 'read';
                            }
                        }
                    }
                    headers.push({ start, name: headerLine.substring(start, headerLine.length), end: null });
    
                    for (let i = 1; i < headers.length; i++) {
                        headers[i - 1].end = headers[i].start;
                    }
                }

                if (file === 'cutthroa.json' && headers[0].name === 'Action') {
                    headers[0].end += 2;
                    headers[1].start += 2;
                } else if (file === 'hollywoo.json' && headers[0].name === 'Event') {
                    headers[0].end--;
                    headers[1].start--;
                } else if (file === 'lgop.json' && headers[0].name === 'Item') {
                    headers[0].start--;
                    headers[0].end--;
                    headers[1].start--;
                } else if (file === 'sorcerer.json' && headers[0].name === 'Potions') {
                    headers[0].start--;
                    headers[0].end--;
                    headers[1].start--;
                } else if (file === 'suspect.json' && headers[0].name === 'Evidence') {
                    headers[0].start--;
                    headers[0].end--;
                    headers[1].start--;
                } else if (file === 'trinity.json' && headers[0].name === 'Action') {
                    headers[0].start--;
                    headers[0].end--;
                    headers[1].start--;
                } else if (file === 'zork2.json' && headers[0].name === 'Treasure') {
                    headers[0].end++;
                    headers[1].start++;
                } else if (file === 'zork1.json') {
                    headers[1].name = "Value (touch)";
                    headers[2].name = "Value (case)";
                }

                const rows = [];
                for (let line of lines) {
                    if (/^ &gt; /.test(line)) {
                        line = line.replace(/^ &gt; /, "  ")
                        const cells = [];
                        for (const header of headers) {
                            const cell = line.substring(header.start, header.end ?? line.length).trim();
                            cells.push(cell);
                        }
                        rows.push(cells);
                    } else {
                        const previousRow = rows.at(-1);
                        for (let i = 0; i < headers.length; i++) {
                            const header = headers[i];
                            const cell = line.substring(header.start, header.end ?? line.length).trim();
                            if (cell !== "") {
                                previousRow[i] += " " + cell;
                            }
                        }
                    }
                }

                const totals = {
                    "bureaucr.json": ["<b>Total</b>", "21 (half of 42)"],
                    "cutthroa.json": ["<b>Total</b>", "250"],
                    "enchante.json": ["400", "<b>Total</b>"],
                    "hhgg.json": ["<b>Total</b>", "400"],
                    "hollywoo.json": ["<b>Total</b>", "150"],
                    "lgop.json": ["<b>Total</b>", "from 171 to 429 points"],
                    "seastalk.json": ["100", "<b>Total</b>"],
                    "stationf.json": ["80", "<b>Total</b>"],
                    "trinity.json": ["GRAND TOTAL", "100"],
                    "ztuu.json": ["100", "<b>Total</b>"],
                }
                if (totalLine) {
                    rows.push(totals[file]);
                }

                // console.log(file, JSON.stringify(rows.map(r => Object.fromEntries(headers.map(({name}, i) => [name, r[i]]))), null, 2));
                // console.log(file, headers.map(h => h.name));
                const result =
                    `<table><tr>${
                        headers.map(h => `<th>${h.name}</th>`).join('')
                    }</tr>\n${
                        rows.map(r => `<tr>${
                            r.map(c => `<td>${c}</td>`).join('')
                        }</tr>\n`).join('')
                    }</table>\n`
                return result;
            })
            output += `<div class="spoiler" role="button" tabindex="0" aria-expanded="false" aria-label="Reveal hint" aria-live="polite"><div aria=hidden="true">${node.content}</div></div>\n\n`;
        } else if (node.type === 'hints') {
            output += "<ol>\n";
            for (const hint of node.hints) {
                output += `
                    <li><span class="spoiler" role="button" tabindex="0" aria-expanded="false" aria-label="Reveal hint" aria-live="polite">
                      <span aria-hidden="true">${hint}</span>
                    </span></li>\n`;
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
    const outFile = json.title.toLowerCase().replaceAll(/[ :,]+/g, "-").replaceAll(/'/g, "") + ".html";
    writeFileSync(`./generated-html/${outFile}`, output, 'utf8');
    index += `<div class="game"><a href="${outFile}"><img class="coverart" src="${coverArt[file]}"><div>${json.title}</div></a></div>\n`;
}

index += `
</div>
<h2 id="about">About These Hints</h2>

<p>The <b>PRIZM</b> project (<b>P</b>retty <b>R</b>eliable <b>I</b>nvisiclues for <b>Z</b>-<b>M</b>achine) resulted from a collaboration between <b>Digby McWiggle</b> (digby_mcwiggle@hotmail.com) and <b>Steven Marsh</b> (marsh@netally.com), with the aim of making the genuine Infocom invisiclues available as Z-Code computer files. The project was endorsed by Activision, who now hold the copyright for Infocom's material.</p>

<p>Whenever possible we have stayed faithful to the original printed Invisiclues booklets. Where both in-game and printed versions were available we have used the printed clues, as these were generally more detailed. Printing errors have been corrected whenever possible. The files have been formatted to display correctly on any screen with a width of at least 80 characters.</p>

<p>View the source code for these hints on <a href="https://github.com/dfabulich/infocom-hints-html">Github</a>.</p>

<h3>Credits</h2>

<p>Originally compiled, edited, and z-coded by:</p>

<ul>
<li>Digby McWiggle (digby_mcwiggle@hotmail.com)</li>
<li>Steven Marsh (marsh@netally.com)</li>
</ul>

<p>from material supplied by:</p>

<ul><li>Graeme Cree</li>
<li>Paul David Doherty</li>
</ul>

<p>Dan Fabulich converted the Z-Machine hints to the HTML you see here.</p>

<p>Thanks also to:</p>
<ul>
<li>Brian Hall</li>
<li>L. Ross Raszewski</li>
<li>Graham Nelson</li>
</ul>
<p>All material Copyright 1993, 1999 Activision, Inc. Used with permission. </p>
<p>These hints are Copyright 1999 Digby McWiggle &amp; Steven Marsh. All game names are registered trade marks of Activision.</p>
`

writeFileSync(`./generated-html/index.html`, index, 'utf8');
