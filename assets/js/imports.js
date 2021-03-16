const links = document.querySelectorAll('link[rel="import"]')

Array.prototype.forEach.call(links, (link) => {
    console.log(link);
    let template = link.import.querySelector('.task-template');
    let clone = document.importNode(template.content, true);

    document.querySelector('#app-container').appendChild(clone);
});