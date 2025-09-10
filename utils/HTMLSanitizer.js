export class HTMLSanitizer {
    constructor(config = {}) {
        this.config = {
            dangerousTags: ['script', 'style', 'iframe', 'embed', 'object', 'link'],
            tagReplacements: { b: 'strong', i: 'em' },
            allowedAttributes: {
                '*': ['class'],
                'img': ['src', 'alt', 'width', 'height'],
                'a': ['href', 'title'],
                'div': ['class'],
                'p': ['class']
            },
            blockWrapper: 'p',
            noBr: false,
            outputFormat: 'html',
            ...config
        };
    }

    sanitize(input) {
        const isDOM = input instanceof Node;
        const doc = isDOM ? input.ownerDocument : new DOMParser().parseFromString(input, 'text/html');

        this.processNode(doc.body);
        this.wrapInlineContent(doc.body);
        if (this.config.noBr) this.processBRs(doc.body);

        return this.config.outputFormat === 'dom' ? doc.body : doc.body.innerHTML;
    }

    processNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (this.config.dangerousTags.includes(node.tagName.toLowerCase())) {
                node.remove();
                return;
            }

            // Замена тегов
            const newTag = this.config.tagReplacements[node.tagName.toLowerCase()];
            if (newTag) {
                const newNode = node.ownerDocument.createElement(newTag);
                Array.from(node.attributes).forEach(attr => {
                    if (this.isAttributeAllowed(newTag, attr.name)) {
                        newNode.setAttribute(attr.name, attr.value);
                    }
                });
                while (node.firstChild) newNode.appendChild(node.firstChild);
                node.parentNode.replaceChild(newNode, node);
                node = newNode;
            }

            // Удаление запрещенных атрибутов
            Array.from(node.attributes).forEach(attr => {
                if (!this.isAttributeAllowed(node.tagName.toLowerCase(), attr.name)) {
                    node.removeAttribute(attr.name);
                }
            });

            // Рекурсивная обработка дочерних элементов
            Array.from(node.childNodes).forEach(child => this.processNode(child));
        }
    }

    isAttributeAllowed(tag, attribute) {
        const specific = this.config.allowedAttributes[tag];
        const global = this.config.allowedAttributes['*'] || [];
        return (specific && specific.includes(attribute)) || global.includes(attribute);
    }

    wrapInlineContent(container) {
        const blockTags = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
        const wrapper = this.config.blockWrapper;
        let currentWrapper = null;
        let needsWrapper = false;

        Array.from(container.childNodes).forEach(child => {
            const isBlock = child.nodeType === Node.ELEMENT_NODE &&
                blockTags.includes(child.tagName.toLowerCase());

            if (isBlock) {
                currentWrapper = null;
                needsWrapper = false;
            } else {
                needsWrapper = true;
                if (!currentWrapper) {
                    currentWrapper = document.createElement(wrapper);
                    child.before(currentWrapper);
                }
                currentWrapper.appendChild(child);
            }
        });

        // Удаляем пустые врапперы
        Array.from(container.querySelectorAll(wrapper)).forEach(w => {
            if (!w.innerHTML.trim()) w.remove();
        });
    }

    processBRs(container) {
        const brs = container.getElementsByTagName('br');
        while (brs.length) {
            const br = brs[0];
            const parent = br.parentNode;
            const next = br.nextSibling;
            const prev = br.previousSibling;

            br.remove();

            if (prev && !this.isBlockNode(prev)) {
                const wrapper = document.createElement(this.config.blockWrapper);
                prev.replaceWith(wrapper);
                wrapper.appendChild(prev);
            }

            if (next && !this.isBlockNode(next)) {
                const wrapper = document.createElement(this.config.blockWrapper);
                next.replaceWith(wrapper);
                wrapper.appendChild(next);
            }
        }
    }

    isBlockNode(node) {
        const blockTags = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        return node.nodeType === Node.ELEMENT_NODE &&
            blockTags.includes(node.tagName.toLowerCase());
    }
}

// Пример использования:
/*
const dirtyHTML = `
  <div>Some text<script>alert('xss')</script></div>
  <b>Important</b> <i>italic</i>
  <br>
  <img src="image.jpg" onclick="malicious()">
  <a href="#" style="color:red">Link</a>
`;

const sanitizer = new HTMLSanitizer({
  noBr: true,
  blockWrapper: 'p',
  outputFormat: 'html'
});
const cleanHTML = sanitizer.sanitize(dirtyHTML);
console.log(cleanHTML);
*/