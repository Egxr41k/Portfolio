const user = "Egxr41k";

const render = async () => {
    const repos = await fetchRepos();
    const repoNames = repos.map(element => element.name);
    console.log(repoNames);
    const repoLinks = repos.map(element =>
        element.homepage !== null ?
            element.homepage : "");

    console.log(repoLinks);
    for (let i = 0; i < repoNames.length; i++) {
        try {
            const readmeUrl = await getREADMEUrlByRepoName(repoNames[i]);
            console.log(readmeUrl);
            const readme = await getAndDecodeREADME(readmeUrl);
            console.log(readme);
            const html = markdownToHTML(readme);
            console.log(html);
            const project = formatHTML(html)

            const githubLink = generateGHLink(repoNames[i])
            githubLink.classList.add("project-link")

            console.log(repoLinks[i])
            const linkElement = createLink(repoLinks[i] ?? "")

            renderProject({
                ...project,
                link: githubLink,
                homepage: linkElement,
            });

            console.log(i)
        } catch(e) {continue}
    }
};

const createLink = (repoLink) => {
    if (repoLink !== "") {
        const homepageLinkElement = document.createElement("a")
        homepageLinkElement.classList.add("homepage-link")
        homepageLinkElement.href = repoLink
        homepageLinkElement.innerHTML = "homepage";
        return homepageLinkElement;
    } else return null
}

const fetchRepos = async () => {
    const reposUrl = `https://api.github.com/users/${user}/repos`;
    const response = await fetch(reposUrl);
    return await response.json();
};

const getREADMEUrlByRepoName = async (repo) => {
    const masterUrl = `https://api.github.com/repos/${user}/${repo}/git/trees/master`;
    const response = await fetch(masterUrl);
    const data = await response.json();
    const files = data.tree;
    const readme = files.find(element =>
        element.path === "README.md");

    return readme.url;
};

const getAndDecodeREADME = async (readmeUrl) => {
    const readmeFile = await fetch(readmeUrl);
    const readmeData = await readmeFile.json();
    const decodedReadme = atob(readmeData.content);
    return decodedReadme;
}

const markdownToHTML = (markdownContent) =>
    marked.marked(markdownContent, { sanitize: true });

const formatHTML = (htmlContent) => {
    const imageElement = getImage(htmlContent);
    imageElement.classList.add("project-image");

    const titleElement = getTitle(htmlContent);
    titleElement.classList.add("project-title");

    const descriptionElement = getDescription(htmlContent);
    descriptionElement.classList.add("project-description");

    return {
        image: imageElement,
        title: titleElement,
        description: descriptionElement,
    }
};

const getImage = (htmlContent) => {
    const imgRegExp = /<img src="(.*?)" alt="(.*?)"/;
    const match = htmlContent.match(imgRegExp);
    if (match && match[1]) {
        const imageElement = document.createElement('img');
        imageElement.src = match[1];
        imageElement.alt = match[2];
        return imageElement;
    } else {
        throw new Error('Image not found in HTML content');
    }
};

const getTitle = (htmlContent) => {
    const titleElement = document.createElement('h1');
    const titleRegExp = /<h1>(.*?)<\/h1>/;
    const titleMatch = htmlContent.match(titleRegExp);
    if (titleMatch && titleMatch[1]) {
        titleElement.innerHTML = titleMatch[1];
    }
    return titleElement;
};

const getDescription = (htmlContent) => {
    const descriptionElement = document.createElement('p');
    const descriptionRegExp = /<p>([\s\S]*?<a[\s\S]*?>[\s\S]*?<\/a>[\s\S]*?)<\/p>/;
    const descMatch = htmlContent.match(descriptionRegExp);
    if (descMatch && descMatch[1]) {
        descriptionElement.innerHTML = descMatch[1];
    }
    return descriptionElement;
};

const generateGHLink = (repoName) => {
    const linkElement = document.createElement('a');
    linkElement.href = `https://github.com/${user}/${repoName}`;
    linkElement.innerHTML = "View on GitHub";
    return linkElement
};

const renderProject = ({ image, title, description, link, homepage }) => {
    const project = document.createElement('div');
    project.classList.add('project');

    const projectText = document.createElement('div');
    projectText.classList.add('project-text');

    projectText.append(title, description);

    const p = document.createElement("p");
    p.append(link);

    if (homepage) {
        p.append(" or visit ");
        p.append(homepage);
    }

    projectText.append(p);
    project.append(image, projectText);

    const container = document.querySelector('.project-list');
    container.appendChild(project);
};

render();