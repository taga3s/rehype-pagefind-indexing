import { unified } from "https://esm.sh/unified@11.0.5";
import remarkParse from "https://esm.sh/remark-parse@11.0.0";
import remarkRehype from "https://esm.sh/remark-rehype@11.1.2";
import rehypeStringify from "https://esm.sh/rehype-stringify@10.0.1";
import { rehypePagefindIndexing } from "../../src/mod.ts";

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
  const data = await Deno.readFile("./examples/basic/sample.md");
  const text = decoder.decode(data);

  const result = await process(text);

  console.log(result);
}
