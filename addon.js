window.onload = loadFunction;

// get authors from authorsDom
function getAuthors(authorsDom) {
    const authors = [];
    for (const authorDom of authorsDom.getElementsByTagName("a")) {
        var name = authorDom.innerText;
        var href = authorDom.getAttribute("href");
        authors.push({ name, href });
    }
    return authors;
}

// get tags from tagsDom
function getTags(tagsDom) {
    const tags = [];
    for (const tagDom of tagsDom) {
        var name = tagDom.innerText;
        var full = tagDom.getAttribute("data-tooltip");
        if (full) {
            tags.push({ name, full });
        }
    }
    return tags;
}

// get listTitle from listTitleDom
function getListTitle(listTitleDom) {
    const found = listTitleDom.getElementsByTagName("a");

    const url = {};
    for (const a of found) {
        url[a.innerText] = a.getAttribute("href");
        if (a.innerText.startsWith("arXiv:")) {
            url["this"] = a.getAttribute("href");
        }
    }

    return url;
}

function loadFunction() {
    console.log("addon.js is working");

    // Get arxiv results
    const arxivResults = document.getElementsByClassName("arxiv-result");
    const tagCollection = {};

    // Collect necessary information
    const data = [];
    for (const result of arxivResults) {
        // Get title
        var title = result.getElementsByClassName("title")[0].innerText;

        // Get listTitle, the urls, from the listTitle line
        var url = getListTitle(result.getElementsByClassName("list-title")[0]);

        // getAuthors from the authors line
        var authors = getAuthors(result.getElementsByClassName("authors")[0]);

        // getTags from the tags line
        var tags = getTags(result.getElementsByClassName("tag"));

        data.push({ title, authors, tags, url });

        tags.map((tag) => {
            const { name, full } = tag;
            result.setAttribute(
                "class",
                result.getAttribute("class") + " " + name
            );
            tagCollection[name] = tagCollection[name]
                ? [tagCollection[name][0] + 1, tagCollection[name][1]]
                : [1, full];
        });
    }
    console.log(data[0]);
    console.log(tagCollection);

    // Ordered tag collection
    const orderedTagCollection = [];
    {
        for (const key in tagCollection) {
            const count = tagCollection[key][0];
            const full = tagCollection[key][1];
            orderedTagCollection.push({ key, full, count });
        }
        orderedTagCollection.sort((a, b) => b.count - a.count);
    }
    console.log(orderedTagCollection);

    // Add data into the html
    const dataLocation = (() => {
        const div = document.createElement("div");
        const content0 = document.getElementsByClassName("content")[0];
        const first = content0.childNodes[0];
        content0.insertBefore(div, first);
        return div;
    })();

    // Fill by tag
    {
        d3.select(dataLocation)
            .append("ol")
            .selectAll("li")
            .data(orderedTagCollection)
            .join("li")
            .text((d) => d.key + "(" + d.count + ")")
            .attr("class", "tag is-small is-grey tooltip is-tooltip-top")
            .attr("data-tooltip", (d) => d.full)
            .on("click", (e, d) => {
                console.log("Click", d.key, d, e);

                for (const result of arxivResults) {
                    result.style.display = "none";
                    if (result.className.includes(d.key)) {
                        result.style.display = "block";
                    }
                }
            });
    }

    // Fill by title
    // {
    //     d3.select(dataLocation)
    //         .append("ol")
    //         .selectAll("li")
    //         .data(data)
    //         .join("li")
    //         .text((d) => d.title);
    // }
}
