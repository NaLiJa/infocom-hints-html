// navigate to https://iplayif.com/?story=https%3A%2F%2Finfodoc.plover.net%2Fhints%2Fzork1.z5
// copy and paste this script into the Chrome Dev Tools console
// copy the resulting JSON and save it to a file

const ENTER_CODE = 13;
const N_CODE = 78;
const Q_CODE = 81;

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function pressKey(keyCode) {
    console.log('pressKey', keyCode);
    document.activeElement.dispatchEvent(new KeyboardEvent('keypress', { keyCode }));
    await sleep(1);
}

async function pressNavigationKey(keyCode) {
    console.log('pressNavigationKey', keyCode);
    const oldTitle = getTitle();
    await pressKey(keyCode);
    let count = 0;
    while (true) {
        if (getTitle() !== oldTitle) return;
        if (count > 100) throw new Error("Title didn't change: " + oldTitle);
        await sleep(10);
        count++;
    }
}

const parser = new DOMParser();

function readFullPage() {
    return normalizeHtml(document.querySelector('.BufferWindowInner').innerHTML);
}

function getTitle() {
    return document.querySelector('.GridLine').innerText.trim();
}

function normalizeHtml(html) {

    const doc = parser.parseFromString(html, 'text/html');
    
    /** replace an element with its child nodes*/
    function unwrap(element) {
        element.replaceWith(...element.childNodes);
    }

    /** replace an element with a different tag */
    function replaceTag(tagName) {
        return (element) => {
            const replacement = doc.createElement(tagName);
            replacement.append(...element.childNodes);
            element.replaceWith(replacement);
        }
    }

    doc.querySelectorAll('textarea').forEach(x => x.remove());
    doc.querySelectorAll('span[class="Style_normal"]').forEach(unwrap);
    doc.querySelectorAll('span[class="Style_emphasized"]').forEach(replaceTag('em'));
    doc.querySelectorAll('span[class="Style_subheader"]').forEach(replaceTag('b'));
    doc.querySelectorAll('div.BufferLine:has(> span[class="Style_user1 monospace"]').forEach(x => {
        x.querySelectorAll('span').forEach(unwrap);
        replaceTag('pre')(x);
    });
    doc.querySelectorAll('div.BufferLine:has(> span[class="Style_preformatted"]').forEach(x => {
        x.querySelectorAll('span').forEach(unwrap);
        replaceTag('pre')(x);
    });
    doc.querySelectorAll('div[class="BufferLine Style_normal_par"]').forEach(replaceTag('p'));
    doc.querySelectorAll('div[class="BufferLine Style_subheader_par"]').forEach(replaceTag('p'));
    doc.querySelectorAll('div[class="BufferLine BlankPara"]').forEach(x => {
        x.remove();
    });
    doc.querySelectorAll('p').forEach(pre => {
        if (/^ > /.test(pre.firstChild?.textContent)) {
            pre.firstChild.textContent = pre.firstChild.textContent.substring(3);
        }
    });
    doc.querySelectorAll('pre').forEach(pre => {
        if (/^ > /.test(pre.firstChild?.textContent)) {
            pre.firstChild.textContent = "  " + pre.firstChild.textContent.substring(3);
        }
    });
    doc.querySelectorAll('pre + pre').forEach(pre2 => {
        const pre1 = pre2.previousElementSibling;
        pre1.append("\n", ...pre2.childNodes);
        pre2.remove();
    })
    const lastParagraph = doc.querySelector('p:last-child');
    if (/^\[(Press any key|No more items)\]$/.test(lastParagraph?.innerText)) {
        lastParagraph.remove();
    }
    const result = doc.body.innerHTML;
    if (/class=/.test(result)) {
        console.log(result);
        throw new Error("Failed to normalize HTML: " + result);
    }
    return result;
}

async function readHintPage() {
    const title = getTitle();
    while (true) {
        await pressKey(ENTER_CODE);
        if (getTitle() !== title) {
            await pressKey(ENTER_CODE);
            const doc = parser.parseFromString(document.querySelector('.BufferWindowInner').innerHTML, 'text/html');
            const hints = [...doc.querySelectorAll('.BufferLine')].filter(x => /^\(\d+ hints? left\)/.test(x.innerText)).map(x => {
                const span = x.querySelector('span');
                let text = span.innerText;
                text = text.replace(/^\(\d+ hints? left\) > /, '');
                span.innerText = text;
                return normalizeHtml(x.innerHTML);
            });
            return hints;
        }
    }
}

async function readItemList() {
    const title = getTitle();
    while (true) {
        await pressKey(ENTER_CODE);
        if (getTitle() !== title) {
            await pressKey(ENTER_CODE);
            // TODO parse into items
            return readFullPage();
        }
    }
}

async function crawlMenu() {
    function gridLines() {
        return [...document.querySelectorAll('.GridLine')];
    }
    function getSelectedIndex() {
        return gridLines().findIndex(x => /^\s+>\s+/.test(x.innerText));
    }
    const children = [];
    const firstLine = getSelectedIndex();
    while (true) {
        const currentIndex = getSelectedIndex();
        let title = gridLines()[currentIndex].innerText.substring(3).trim();
        if (/^    /.test(gridLines()[currentIndex+1]?.innerText)) {
            title += " " + gridLines()[currentIndex + 1].innerText.substring(3).trim();
        }
        console.log('crawlMenu', title);
        await pressNavigationKey(ENTER_CODE);
        const child = await crawlNode();
        children.push({title, child});
        await pressNavigationKey(Q_CODE);
        await pressKey(N_CODE);
        const nextIndex = getSelectedIndex();
        if (nextIndex === firstLine) {
            return children;
        }
    }
}

async function crawlNode() {
    const title = getTitle();
    console.log('crawlNode', title);
    if (document.querySelectorAll('.GridLine').length === 1) {
        return {type: 'page', title, content: readFullPage()};
    } else {
        const instructions = document.querySelectorAll('.GridLine')[1].innerText;
        if (/N = next/.test(instructions)) {
            return {type: 'menu', title, children: await crawlMenu()};
        } else if (/ENTER = next hint/.test(instructions)) {
            return {type: 'hints', title, hints: await readHintPage()};
        } else if (/ENTER = next item/.test(instructions)) {
            return { type: 'items', title, content: await readItemList() };
        } else {
            throw new Error("Couldn't detect page type");
        }
    }
}

await crawlNode();