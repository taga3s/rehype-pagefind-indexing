import { unified } from "https://esm.sh/unified@11.0.5";
import remarkParse from "https://esm.sh/remark-parse@11.0.0";
import remarkRehype from "https://esm.sh/remark-rehype@11.1.2";
import rehypeStringify from "https://esm.sh/rehype-stringify@10.0.1";
import { rehypePagefindIndexing } from "./rehype-pagefind-indexing.ts";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

const fixture = async () => {
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

  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("./examples/basic/sample.md");
  const text = decoder.decode(data);

  const result = await process(text);

  return {
    result,
  };
};

Deno.test("rehype-pagefind-indexing", async (t) => {
  const { result } = await fixture();
  await assertSnapshot(t, result);
});
