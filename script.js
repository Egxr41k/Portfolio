const user = "Egxr41k";

const render = async () => {
    const repos = await fetchRepos();
    const repoNames = repos.map(element => element.name);
    repoNames.forEach(async (name) => {
        const readmeUrl = await getREADMEUrlByRepoName(name);
        const readme = await getAndDecodeREADME(readmeUrl);
        const html = markdownToHTML(readme);
        console.log(html); 
    });
};

const fetchRepos = async () => {
    const reposUrl = `https://api.github.com/users/${user}/repos`
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


render();