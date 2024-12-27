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
    return normalizeHtml(document.querySelector('.BufferWindowInner').innerHTML).body.innerHTML;
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

    function removeClass(element) {
        element.removeAttribute("class");
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
    while (true) {
        const lastDiv = doc.querySelector('div:last-child');
        if (lastDiv?.getAttribute("class") === "BufferLine BlankPara") {
            lastDiv.remove();
        } else if (/^\[(Press any key|No more items|No more hints)\]$/.test(lastDiv?.innerText)) {
            lastDiv.remove();
        } else {
            break;
        }
    }
    doc.querySelectorAll('div[class="BufferLine Style_normal_par"]:has(+ div[class="BufferLine BlankPara"]').forEach(replaceTag('p'));
    doc.querySelectorAll('div[class="BufferLine Style_subheader_par"]:has(+ div[class="BufferLine BlankPara"]').forEach(replaceTag('p'));
    doc.querySelectorAll('div[class="BufferLine Style_normal_par"]').forEach(removeClass);
    doc.querySelectorAll('div[class="BufferLine Style_subheader_par"]').forEach(removeClass);
    doc.querySelectorAll('div[class="BufferLine BlankPara"]').forEach(x => {
        x.remove();
    });
    doc.querySelectorAll('p, div').forEach(el => {
        if (/^ > /.test(el.firstChild?.textContent)) {
            el.firstChild.textContent = el.firstChild.textContent.substring(3);
            replaceTag("li")(el);
        }
    });
    doc.querySelectorAll('pre + pre').forEach(pre2 => {
        const pre1 = pre2.previousElementSibling;
        pre1.append("\n", ...pre2.childNodes);
        pre2.remove();
    });
    if (/class=/.test(doc.body.innerHTML)) {
        console.log(doc.body.innerHTML);
        throw new Error("Failed to normalize HTML: " + doc.body.innerHTML);
    }
    return doc;
}

async function readHintPage() {
    const title = getTitle();
    while (true) {
        await pressKey(ENTER_CODE);
        if (getTitle() !== title) {
            await pressKey(ENTER_CODE);
            const doc = normalizeHtml(document.querySelector('.BufferWindowInner').innerHTML);
            doc.querySelectorAll("div, p").forEach(div => {
                if (/^\(\d+ hints? left\) > /.test(div.innerText)) {
                    div.firstChild.textContent = div.firstChild.textContent.replace(/^\(\d+ hints? left\) > /, "");
                    const li = doc.createElement("li");
                    li.append(...div.childNodes);
                    div.replaceWith(li);
                } else if (div.previousElementSibling?.localName === 'li') {
                    const li = div.previousElementSibling;
                    li.append(div);
                }
            });
            const trouble = doc.querySelector('body > *:not(li)');
            if (trouble) {
                console.error('non-li in hints');
                debugger;
                throw new Error('non-li in hints');
            }
            const hints = [...doc.querySelectorAll('body > li')].map(li => li.innerHTML);
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