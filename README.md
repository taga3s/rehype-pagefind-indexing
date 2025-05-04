# rehype-pagefind-indexing

[![JSR badge](https://jsr.io/badges/@taga3s/rehype-pagefind-indexing)](https://jsr.io/badges/@taga3s/rehype-pagefind-indexing)

A [rehype](https://github.com/rehypejs/rehype/tree/main) plugin that configures
indexing for [pagefind](https://github.com/CloudCannon/pagefind) (see
https://pagefind.app/docs/indexing/). Currently, this plugin is designed to work
with **pagefind v1.3.0**.

## example usage

```ts
import { unified } from "npm:unified@11.0.5";
import remarkParse from "npm:remark-parse@11.0.0";
import remarkRehype from "npm:remark-rehype@11.1.2";
import rehypeStringify from "npm:rehype-stringify@10.0.1";
import { rehypePagefindIndexing } from "../../mod.ts";

const process = async (text: string): Promise<string> => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePagefindIndexing, {
      ignoreIndividualElements: [{
        condition: {
          tagName: "code",
        },
        ignore: "all",
      }],
      addHTMLAttrs: [{
        condition: {
          tagName: "img",
        },
        attrs: ["alt", "title"],
      }],
    })
    .use(rehypeStringify)
    .process(text);

  return result.toString();
};

if (import.meta.main) {
  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("./sample.md");
  const text = decoder.decode(data);

  const result = await process(text);

  console.log(result);
}
```

## license

[MIT](https://github.com/taga3s/rehype-pagefind-indexing/blob/main/LICENSE)

## author

- [taga3s](https://github.com/taga3s)
